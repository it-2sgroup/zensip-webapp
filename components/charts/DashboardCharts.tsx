"use client";

import { useState } from "react";
import { ChartCard } from "./core/ChartCard";
import { CHART_COLORS, DataTable, FloatingTip, Legend } from "./core/Parts";
import { TimeSeriesChart } from "./TimeSeries";
import { useChartWidth } from "./core/useChart";
import { cx } from "@/components/ui/primitives";
import { fmtCompact, fmtInt, fmtNum, fmtPct, fmtVnd } from "@/lib/format";
import type { DayRow, ProductRow } from "@/lib/mock-data";
import { argMax } from "@/lib/chart-utils";

/* Toàn bộ biểu đồ dưới đây dùng lớp SVG tự viết trong components/charts/.
   Recharts đã bị gỡ bỏ vì tooltip v3 không hoạt động (visibility luôn hidden). */

/* ────────────────────────────────────────────────────────────
   1. Doanh thu theo kỳ — cột chồng, tách theo sàn
   ──────────────────────────────────────────────────────────── */
export function RevenueByDay({ data }: { data: DayRow[] }) {
  const peakIdx = argMax(data, (d) => d.tiktok + d.shopee);
  const peak = data[peakIdx];
  const avg = data.reduce((s, d) => s + d.tiktok + d.shopee, 0) / (data.length || 1);

  return (
    <ChartCard
      title="Doanh thu theo kỳ"
      hint={`Tách theo sàn · ${data.length} kỳ gần nhất`}
      insight={
        <>
          Kỳ cao nhất là <strong className="font-semibold text-[var(--color-ink)]">{peak?.label}</strong> với{" "}
          {fmtCompact((peak?.tiktok ?? 0) + (peak?.shopee ?? 0))} — gấp{" "}
          {fmtNum(((peak?.tiktok ?? 0) + (peak?.shopee ?? 0)) / avg)} lần mức trung bình.
          TikTok Shop chiếm phần lớn doanh thu ở hầu hết các kỳ.
        </>
      }
      chart={
        <TimeSeriesChart
          labels={data.map((d) => d.label)}
          series={[
            { key: "tiktok", label: "TikTok Shop", color: CHART_COLORS.s1, values: data.map((d) => d.tiktok), type: "bar" },
            { key: "shopee", label: "Shopee", color: CHART_COLORS.s2, values: data.map((d) => d.shopee), type: "bar" },
          ]}
          format={fmtVnd}
          formatAxis={fmtCompact}
          reference={{ value: avg, label: `TB ${fmtCompact(avg)}` }}
        />
      }
      table={
        <DataTable
          head={["Kỳ", "TikTok Shop", "Shopee", "Tổng"]}
          rows={data.map((d) => [d.label, fmtVnd(d.tiktok), fmtVnd(d.shopee), fmtVnd(d.tiktok + d.shopee)])}
          highlightRow={peakIdx}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   2. So sánh với kỳ trước
   ──────────────────────────────────────────────────────────── */
export function CompareWithPrevious({ data }: { data: DayRow[] }) {
  const now = data.reduce((s, d) => s + d.tiktok + d.shopee, 0);
  const prev = data.reduce((s, d) => s + d.prev, 0);
  const diff = prev ? ((now - prev) / prev) * 100 : 0;

  return (
    <ChartCard
      title="So với kỳ trước"
      hint="Tổng doanh thu hai sàn, đối chiếu cùng độ dài kỳ liền trước"
      insightTone={diff >= 0 ? "good" : "critical"}
      insight={
        <>
          Kỳ này {diff >= 0 ? "tăng" : "giảm"}{" "}
          <strong className="font-semibold text-[var(--color-ink)]">{fmtPct(Math.abs(diff))}</strong>{" "}
          so với kỳ trước ({fmtCompact(now)} so với {fmtCompact(prev)}).
        </>
      }
      chart={
        <TimeSeriesChart
          labels={data.map((d) => d.label)}
          series={[
            { key: "now", label: "Kỳ này", color: CHART_COLORS.s5, values: data.map((d) => d.tiktok + d.shopee), type: "area" },
            { key: "prev", label: "Kỳ trước", color: CHART_COLORS.axis, values: data.map((d) => d.prev), type: "line" },
          ]}
          stacked={false}
          format={fmtVnd}
          formatAxis={fmtCompact}
          peakOf="now"
          peakLabel={(v, l) => `Đỉnh ${l}`}
        />
      }
      table={
        <DataTable
          head={["Kỳ", "Kỳ này", "Kỳ trước", "Chênh lệch"]}
          rows={data.map((d) => {
            const n = d.tiktok + d.shopee;
            const p = d.prev ? ((n - d.prev) / d.prev) * 100 : null;
            return [
              d.label,
              fmtVnd(n),
              fmtVnd(d.prev),
              p == null ? "—" : `${p >= 0 ? "+" : "−"}${fmtPct(Math.abs(p))}`,
            ];
          })}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   3. Cơ cấu GMV theo kênh — vành khuyên
   ──────────────────────────────────────────────────────────── */
const CH_COLORS = [CHART_COLORS.s1, CHART_COLORS.s2, CHART_COLORS.s3, CHART_COLORS.axis];

export function ChannelDonut({
  data,
}: {
  data: { key: string; label: string; value: number }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const { ref, width } = useChartWidth<HTMLDivElement>();
  const total = data.reduce((s, d) => s + d.value, 0);
  const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);

  const SIZE = 190;
  const R = 78;
  const STROKE = 26;
  const C = 2 * Math.PI * R;
  const GAP = 3; // khe hở giữa các cung, tính bằng px chu vi

  let offset = 0;

  return (
    <ChartCard
      title="Cơ cấu GMV theo kênh"
      hint="Nguồn: gmv_live · gmv_video · gmv_card"
      insight={
        <>
          <strong className="font-semibold text-[var(--color-ink)]">{top?.label}</strong> chiếm{" "}
          {fmtPct(((top?.value ?? 0) / total) * 100)} tổng GMV — kênh quyết định doanh thu.
        </>
      }
      chart={
        <div className="relative flex items-center gap-5" ref={ref}>
          <svg width={SIZE} height={SIZE} className="shrink-0" role="img" aria-label="Cơ cấu GMV theo kênh">
            <g transform={`translate(${SIZE / 2} ${SIZE / 2}) rotate(-90)`}>
              {data.map((d, i) => {
                const frac = d.value / total;
                const len = Math.max(0, C * frac - GAP);
                const dash = `${len} ${C - len}`;
                const dashOffset = -offset;
                offset += C * frac;
                const dim = hover != null && hover !== i;
                return (
                  <circle
                    key={d.key}
                    r={R}
                    fill="none"
                    stroke={CH_COLORS[i % CH_COLORS.length]}
                    strokeWidth={hover === i ? STROKE + 5 : STROKE}
                    strokeDasharray={dash}
                    strokeDashoffset={dashOffset}
                    opacity={dim ? 0.32 : 1}
                    style={{ transition: "stroke-width 140ms, opacity 140ms" }}
                    onPointerEnter={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    className="cursor-pointer"
                  />
                );
              })}
            </g>
            <text
              x={SIZE / 2} y={SIZE / 2 - 8} textAnchor="middle"
              fontSize={11.5} fill={CHART_COLORS.muted}
            >
              {hover != null ? data[hover].label : "Tổng GMV"}
            </text>
            <text
              x={SIZE / 2} y={SIZE / 2 + 14} textAnchor="middle"
              fontSize={19} fontWeight={600} fill="var(--color-ink)"
              style={{ letterSpacing: "-0.02em" }}
            >
              {hover != null ? fmtCompact(data[hover].value) : fmtCompact(total)}
            </text>
          </svg>

          <ul className="min-w-0 flex-1 space-y-2">
            {data.map((d, i) => (
              <li
                key={d.key}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                className={cx(
                  "flex items-center gap-2 rounded-[7px] px-1.5 py-1 transition-colors",
                  hover === i && "bg-[var(--color-surface-2)]",
                )}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: CH_COLORS[i % CH_COLORS.length] }}
                />
                <span className="truncate text-[12.5px] text-[var(--color-ink-2)]">{d.label}</span>
                <span className="tnum ml-auto shrink-0 text-[12.5px] text-[var(--color-muted)]">
                  {fmtCompact(d.value)}
                </span>
                <span className="tnum w-[46px] shrink-0 text-right text-[12.5px] font-semibold text-[var(--color-ink)]">
                  {fmtPct((d.value / total) * 100)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      }
      table={
        <DataTable
          head={["Kênh", "GMV", "Tỉ trọng"]}
          rows={data.map((d) => [d.label, fmtVnd(d.value), fmtPct((d.value / total) * 100)])}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   4. Quảng cáo GMV Max
   ──────────────────────────────────────────────────────────── */
export function AdPerformance({ data }: { data: DayRow[] }) {
  const cost = data.reduce((s, d) => s + d.adCost, 0);
  const rev = data.reduce((s, d) => s + d.adRevenue, 0);
  const roi = cost ? rev / cost : 0;

  return (
    <ChartCard
      title="Quảng cáo GMV Max"
      hint={`ROI kỳ này ${fmtNum(roi)} lần · doanh thu chia chi phí`}
      insight={
        <>
          Mỗi đồng chi cho quảng cáo mang về{" "}
          <strong className="font-semibold text-[var(--color-ink)]">{fmtNum(roi)} đồng</strong> doanh thu gộp.
          Đây là doanh thu trước phí sàn — xem trang Quảng cáo để biết chiến dịch nào đang kéo tụt chỉ số này.
        </>
      }
      chart={
        <TimeSeriesChart
          labels={data.map((d) => d.label)}
          series={[
            { key: "rev", label: "Doanh thu QC", color: CHART_COLORS.s1, values: data.map((d) => d.adRevenue), type: "area" },
            { key: "cost", label: "Chi phí", color: CHART_COLORS.s3, values: data.map((d) => d.adCost), type: "line" },
          ]}
          stacked={false}
          format={fmtVnd}
          formatAxis={fmtCompact}
        />
      }
      table={
        <DataTable
          head={["Kỳ", "Chi phí", "Doanh thu QC", "ROI"]}
          rows={data.map((d) => [
            d.label,
            fmtVnd(d.adCost),
            fmtVnd(d.adRevenue),
            d.adCost ? `${fmtNum(d.adRevenue / d.adCost)}×` : "—",
          ])}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   5. Sản phẩm bán chạy
   ──────────────────────────────────────────────────────────── */
export function TopProducts({ rows }: { rows: ProductRow[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...rows.map((r) => r.revenue));
  const total = rows.reduce((s, r) => s + r.revenue, 0);

  return (
    <section className="rounded-[15px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_18px_-6px_rgba(9,9,11,0.12)]">
      <header className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.012em] text-[var(--color-ink)]">
          Sản phẩm bán chạy
        </h2>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-muted)]">
          Xếp theo doanh thu · {rows[0]?.name.split(" ").slice(0, 4).join(" ")} chiếm{" "}
          {fmtPct((rows[0].revenue / total) * 100)} nhóm dẫn đầu
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-line-strong)]">
              {["Sản phẩm", "Doanh thu", "Tỉ trọng", "Đơn", "So kỳ trước"].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={cx(
                    "py-2 text-[12px] font-semibold text-[var(--color-ink-2)]",
                    i === 0 || i === 2 ? "text-left" : "text-right",
                    i === 2 && "w-[160px]",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.sku}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                className={cx(
                  "border-b border-[var(--color-line)] transition-colors last:border-0",
                  hover === i && "bg-[var(--color-surface-2)]",
                )}
              >
                <td className="py-2.5 pr-3">
                  <p className="truncate font-medium text-[var(--color-ink)]">{r.name}</p>
                  <p className="tnum text-[11.5px] text-[var(--color-muted)]">{r.sku}</p>
                </td>
                <td className="tnum whitespace-nowrap py-2.5 pr-3 text-right font-medium text-[var(--color-ink)]">
                  {fmtVnd(r.revenue)}
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(r.revenue / max) * 100}%`,
                          background: i === 0 ? CHART_COLORS.s1 : "var(--color-axis)",
                          opacity: hover != null && hover !== i ? 0.5 : 1,
                        }}
                      />
                    </div>
                    <span className="tnum w-[38px] shrink-0 text-right text-[11.5px] text-[var(--color-muted)]">
                      {fmtPct((r.revenue / total) * 100, 0)}
                    </span>
                  </div>
                </td>
                <td className="tnum whitespace-nowrap py-2.5 pr-3 text-right text-[var(--color-ink-2)]">
                  {fmtInt(r.orders)}
                </td>
                <td className="whitespace-nowrap py-2.5 text-right">
                  <span
                    className="tnum text-[12.5px] font-medium"
                    style={{ color: r.delta >= 0 ? "var(--color-good)" : "var(--color-critical)" }}
                  >
                    {r.delta >= 0 ? "↑" : "↓"} {fmtPct(Math.abs(r.delta))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
