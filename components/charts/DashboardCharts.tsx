"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame, DataTable, Legend, TooltipBox } from "./ChartFrame";
import { fmtCompact, fmtInt, fmtNum, fmtPct, fmtVnd } from "@/lib/format";
import type { DayRow, ProductRow } from "@/lib/mock-data";

/* Màu lấy qua biến CSS nên tự đổi theo giao diện sáng/tối, không cần vẽ lại. */
const S1 = "var(--color-s1)";
const S2 = "var(--color-s2)";
const S5 = "var(--color-s5)";
const S3 = "var(--color-s3)";
const GRID = "var(--color-grid)";
const AXIS = "var(--color-axis)";
const SURFACE = "var(--color-surface)";
const MUTED = "var(--color-muted)";

const axisProps = {
  stroke: AXIS,
  tickLine: false,
  axisLine: false,
  tick: { fill: MUTED, fontSize: 11.5 },
} as const;

/* ────────────────────────────────────────────────────────────
   1. Doanh thu theo ngày — cột chồng, tách theo sàn
   Hai chuỗi cùng đơn vị (đồng) nên dùng chung một trục.
   ──────────────────────────────────────────────────────────── */
export function RevenueByDay({ data }: { data: DayRow[] }) {
  const totalTiktok = data.reduce((s, d) => s + d.tiktok, 0);
  const totalShopee = data.reduce((s, d) => s + d.shopee, 0);

  return (
    <ChartFrame
      title="Doanh thu theo ngày"
      hint={`Tách theo sàn · ${data.length} kỳ gần nhất`}
      height={264}
      legend={
        <Legend
          items={[
            { color: S1, label: "TikTok Shop", value: fmtCompact(totalTiktok) },
            { color: S2, label: "Shopee", value: fmtCompact(totalShopee) },
          ]}
        />
      }
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barCategoryGap="22%">
            <CartesianGrid stroke={GRID} strokeWidth={1} vertical={false} />
            <XAxis dataKey="label" {...axisProps} minTickGap={28} />
            <YAxis {...axisProps} tickFormatter={(v) => fmtCompact(v as number)} width={52} />
            <Tooltip
              cursor={{ fill: "var(--color-surface-2)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const tk = (payload.find((p) => p.dataKey === "tiktok")?.value as number) ?? 0;
                const sp = (payload.find((p) => p.dataKey === "shopee")?.value as number) ?? 0;
                return (
                  <TooltipBox
                    title={String(label)}
                    rows={[
                      { color: S1, label: "TikTok Shop", value: fmtVnd(tk) },
                      { color: S2, label: "Shopee", value: fmtVnd(sp) },
                    ]}
                    footer={`Tổng ${fmtVnd(tk + sp)}`}
                  />
                );
              }}
            />
            {/* stroke màu nền tạo khe hở 2px giữa hai lớp chồng */}
            <Bar isAnimationActive={false} dataKey="tiktok" stackId="rev" fill={S1} stroke={SURFACE} strokeWidth={1} />
            <Bar
              isAnimationActive={false}
              dataKey="shopee"
              stackId="rev"
              fill={S2}
              stroke={SURFACE}
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      }
      table={
        <DataTable
          head={["Kỳ", "TikTok Shop", "Shopee", "Tổng"]}
          rows={data.map((d) => [
            d.label,
            fmtVnd(d.tiktok),
            fmtVnd(d.shopee),
            fmtVnd(d.tiktok + d.shopee),
          ])}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   2. So sánh với kỳ trước — cùng chỉ số, cùng đơn vị, một trục
   ──────────────────────────────────────────────────────────── */
export function CompareWithPrevious({ data }: { data: DayRow[] }) {
  const rows = data.map((d) => ({
    date: d.date,
    label: d.label,
    now: d.tiktok + d.shopee,
    prev: d.prev,
  }));
  const sumNow = rows.reduce((s, d) => s + d.now, 0);
  const sumPrev = rows.reduce((s, d) => s + d.prev, 0);

  return (
    <ChartFrame
      title="So với kỳ trước"
      hint="Tổng doanh thu hai sàn, đối chiếu cùng độ dài kỳ liền trước"
      height={264}
      legend={
        <Legend
          items={[
            { color: S5, label: "Kỳ này", value: fmtCompact(sumNow) },
            { color: AXIS, label: "Kỳ trước", value: fmtCompact(sumPrev) },
          ]}
        />
      }
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
            <CartesianGrid stroke={GRID} strokeWidth={1} vertical={false} />
            <XAxis dataKey="label" {...axisProps} minTickGap={28} />
            <YAxis {...axisProps} tickFormatter={(v) => fmtCompact(v as number)} width={52} />
            <Tooltip
              cursor={{ stroke: AXIS, strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const now = (payload.find((p) => p.dataKey === "now")?.value as number) ?? 0;
                const prev = (payload.find((p) => p.dataKey === "prev")?.value as number) ?? 0;
                const diff = prev ? ((now - prev) / prev) * 100 : null;
                return (
                  <TooltipBox
                    title={String(label)}
                    rows={[
                      { color: S5, label: "Kỳ này", value: fmtVnd(now) },
                      { color: AXIS, label: "Kỳ trước", value: fmtVnd(prev) },
                    ]}
                    footer={
                      diff == null
                        ? undefined
                        : `${diff >= 0 ? "Tăng" : "Giảm"} ${fmtPct(Math.abs(diff))}`
                    }
                  />
                );
              }}
            />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="prev"
              stroke={AXIS}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
            />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="now"
              stroke={S5}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: SURFACE }}
            />
          </LineChart>
        </ResponsiveContainer>
      }
      table={
        <DataTable
          head={["Ngày", "Kỳ này", "Kỳ trước", "Chênh lệch"]}
          rows={rows.map((d) => {
            const diff = d.prev ? ((d.now - d.prev) / d.prev) * 100 : null;
            return [
              d.label,
              fmtVnd(d.now),
              fmtVnd(d.prev),
              diff == null ? "—" : `${diff >= 0 ? "+" : "−"}${fmtPct(Math.abs(diff))}`,
            ];
          })}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   3. Cơ cấu GMV theo kênh — 4 phần, xem tỉ trọng trong nháy mắt
   ──────────────────────────────────────────────────────────── */
const CHANNEL_COLORS = [S1, S2, S3, AXIS];

export function ChannelDonut({
  data,
}: {
  data: { key: string; label: string; value: number }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartFrame
      title="Cơ cấu GMV theo kênh"
      hint="Nguồn: gmv_live · gmv_video · gmv_card"
      height={228}
      chart={
        <div className="flex h-full items-center gap-4">
          <div className="relative h-full w-[190px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
              isAnimationActive={false}
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="94%"
                  paddingAngle={2}
                  stroke={SURFACE}
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((d, i) => (
                    <Cell key={d.key} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0];
                    const v = p.value as number;
                    return (
                      <TooltipBox
                        title={String(p.name)}
                        rows={[{ label: "GMV", value: fmtVnd(v) }]}
                        footer={`Chiếm ${fmtPct((v / total) * 100)} tổng GMV`}
                      />
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-[11.5px] text-[var(--color-muted)]">Tổng GMV</p>
                <p className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                  {fmtCompact(total)}
                </p>
              </div>
            </div>
          </div>

          {/* Nhãn trực tiếp kèm số — không để giá trị chỉ đọc được qua màu */}
          <ul className="min-w-0 flex-1 space-y-2">
            {data.map((d, i) => (
              <li key={d.key} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }}
                />
                <span className="truncate text-[12.5px] text-[var(--color-ink-2)]">
                  {d.label}
                </span>
                <span className="tnum ml-auto shrink-0 text-[12.5px] font-medium text-[var(--color-ink)]">
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
          rows={data.map((d) => [
            d.label,
            fmtVnd(d.value),
            fmtPct((d.value / total) * 100),
          ])}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   4. Quảng cáo GMV Max — chi phí và doanh thu cùng đơn vị (đồng)
   Cố ý KHÔNG vẽ ROI chung trục với tiền: hai thang đo khác nhau
   trên một đồ thị sẽ tạo ra tương quan không có thật.
   ──────────────────────────────────────────────────────────── */
export function AdPerformance({ data }: { data: DayRow[] }) {
  const cost = data.reduce((s, d) => s + d.adCost, 0);
  const rev = data.reduce((s, d) => s + d.adRevenue, 0);

  return (
    <ChartFrame
      title="Quảng cáo GMV Max"
      hint={`ROI kỳ này ${fmtNum(rev / cost)} lần · doanh thu chia chi phí`}
      height={228}
      legend={
        <Legend
          items={[
            { color: S3, label: "Chi phí", value: fmtCompact(cost) },
            { color: S1, label: "Doanh thu QC", value: fmtCompact(rev) },
          ]}
        />
      }
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="adRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={S1} stopOpacity={0.22} />
                <stop offset="100%" stopColor={S1} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="adCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={S3} stopOpacity={0.22} />
                <stop offset="100%" stopColor={S3} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeWidth={1} vertical={false} />
            <XAxis dataKey="label" {...axisProps} minTickGap={28} />
            <YAxis {...axisProps} tickFormatter={(v) => fmtCompact(v as number)} width={52} />
            <Tooltip
              cursor={{ stroke: AXIS, strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const c = (payload.find((p) => p.dataKey === "adCost")?.value as number) ?? 0;
                const r = (payload.find((p) => p.dataKey === "adRevenue")?.value as number) ?? 0;
                return (
                  <TooltipBox
                    title={String(label)}
                    rows={[
                      { color: S1, label: "Doanh thu QC", value: fmtVnd(r) },
                      { color: S3, label: "Chi phí", value: fmtVnd(c) },
                    ]}
                    footer={c ? `ROI ${fmtNum(r / c)} lần` : undefined}
                  />
                );
              }}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="adRevenue"
              stroke={S1}
              strokeWidth={2}
              fill="url(#adRev)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="adCost"
              stroke={S3}
              strokeWidth={2}
              fill="url(#adCost)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
            />
          </AreaChart>
        </ResponsiveContainer>
      }
      table={
        <DataTable
          head={["Kỳ", "Chi phí", "Doanh thu QC", "ROI"]}
          rows={data.map((d) => [
            d.label,
            fmtVnd(d.adCost),
            fmtVnd(d.adRevenue),
            d.adCost ? `${fmtNum(d.adRevenue / d.adCost)} lần` : "—",
          ])}
        />
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────
   5. Xếp hạng sản phẩm — thanh ngang, một màu cho một chuỗi
   ──────────────────────────────────────────────────────────── */
export function TopProducts({ rows }: { rows: ProductRow[] }) {
  const max = Math.max(...rows.map((r) => r.revenue));

  return (
    <section className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
      <header className="mb-4">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
          Sản phẩm bán chạy
        </h2>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-muted)]">
          Xếp theo doanh thu trong kỳ
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[var(--color-line-strong)]">
              <th scope="col" className="py-2 text-left text-[12px] font-semibold text-[var(--color-ink-2)]">
                Sản phẩm
              </th>
              <th scope="col" className="py-2 text-right text-[12px] font-semibold text-[var(--color-ink-2)]">
                Doanh thu
              </th>
              <th scope="col" className="w-[150px] py-2 text-left text-[12px] font-semibold text-[var(--color-ink-2)]">
                Tỉ trọng
              </th>
              <th scope="col" className="py-2 text-right text-[12px] font-semibold text-[var(--color-ink-2)]">
                Đơn
              </th>
              <th scope="col" className="py-2 text-right text-[12px] font-semibold text-[var(--color-ink-2)]">
                So kỳ trước
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="border-b border-[var(--color-line)] last:border-0">
                <td className="py-2.5 pr-3">
                  <p className="truncate font-medium text-[var(--color-ink)]">{r.name}</p>
                  <p className="tnum text-[11.5px] text-[var(--color-muted)]">{r.sku}</p>
                </td>
                <td className="tnum whitespace-nowrap py-2.5 pr-3 text-right font-medium text-[var(--color-ink)]">
                  {fmtVnd(r.revenue)}
                </td>
                <td className="py-2.5 pr-3">
                  <div
                    className="h-[7px] w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]"
                    role="img"
                    aria-label={`Chiếm ${fmtPct((r.revenue / max) * 100)} so với sản phẩm đứng đầu`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(r.revenue / max) * 100}%`,
                        background: S1,
                      }}
                    />
                  </div>
                </td>
                <td className="tnum whitespace-nowrap py-2.5 pr-3 text-right text-[var(--color-ink-2)]">
                  {fmtInt(r.orders)}
                </td>
                <td className="whitespace-nowrap py-2.5 text-right">
                  <span
                    className="tnum text-[12.5px] font-medium"
                    style={{
                      color:
                        r.delta >= 0 ? "var(--color-good)" : "var(--color-critical)",
                    }}
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
