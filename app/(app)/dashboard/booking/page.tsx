"use client";

import { useState } from "react";
import Link from "next/link";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader, Segmented, cx } from "@/components/ui/primitives";
import { Drawer, DetailRow, DetailSection } from "@/components/ui/Drawer";
import { ChartCard } from "@/components/charts/core/ChartCard";
import { CHART_COLORS, DataTable } from "@/components/charts/core/Parts";
import { BulletChart, FunnelChart } from "@/components/charts/Progress";
import { SlopeChart } from "@/components/charts/Analysis";
import {
  BUDGET,
  BUDGET_PCT,
  BUDGET_SPENT,
  CAMPAIGN_KPI,
  GMV_TARGETS,
  GMV_TOTAL_TARGET,
  KOC_FUNNEL,
  KPI_TOTAL,
  STAFF_DETAIL,
  STAFF_SUMMARY,
} from "@/lib/mock-booking";
import { fmtCompact, fmtInt, fmtNum, fmtPct, fmtVnd } from "@/lib/format";

type KpiMetric = "koc" | "closed" | "aired";

export default function BookingPage() {
  const [metric, setMetric] = useState<KpiMetric>("aired");
  const [staffOpen, setStaffOpen] = useState<string | null>(null);

  const gmvActual = GMV_TARGETS.reduce((s, r) => s + r.actual, 0);
  const airRate = (KPI_TOTAL.actualVideoAired / KPI_TOTAL.actualVideoClosed) * 100;

  // Chiến dịch có tỉ lệ lên sóng thấp nhất — video chốt rồi nhưng không đăng
  const worstAir = [...CAMPAIGN_KPI].sort(
    (a, b) =>
      a.actualVideoAired / a.actualVideoClosed - b.actualVideoAired / b.actualVideoClosed,
  )[0];

  const staffDetail = staffOpen
    ? STAFF_DETAIL.filter((r) => r.staff === staffOpen)
    : [];
  const staffSum = STAFF_SUMMARY.find((s) => s.staff === staffOpen);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-1 flex items-center gap-1.5 text-[12.5px] text-[var(--color-muted)]">
        <Link href="/dashboard" className="transition-colors hover:text-[var(--color-ink)]">
          Tổng quan
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-ink-2)]">Booking KOC</span>
      </div>

      <div className="mb-5">
        <h1 className="text-[22px] font-semibold tracking-[-0.022em] text-[var(--color-ink)]">
          Booking KOC
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">
          Ngân sách · KPI hành động · tiến độ nhân sự · GMV mục tiêu — theo tài liệu
          chỉ số Phòng Vận hành 14/08/2026
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile
          label="Ngân sách đã dùng"
          value={fmtCompact(BUDGET_SPENT)}
          hint={`${fmtPct(BUDGET_PCT, 0)} của ${fmtCompact(BUDGET.total)}`}
          inverse
        />
        <StatTile label="KOC đã hợp tác" value={fmtInt(KPI_TOTAL.actualKoc)} hint={`KH ${KPI_TOTAL.planKoc}`} delta={22.4} />
        <StatTile label="Video chốt" value={fmtInt(KPI_TOTAL.actualVideoClosed)} hint={`KH ${KPI_TOTAL.planVideo}`} delta={31.8} />
        <StatTile label="Video đã đăng" value={fmtInt(KPI_TOTAL.actualVideoAired)} hint={`${fmtPct(airRate, 0)} số video chốt`} delta={18.2} accent={CHART_COLORS.s2} />
        <StatTile label="GMV mang về" value={fmtCompact(gmvActual)} hint={`Mục tiêu ${fmtCompact(GMV_TOTAL_TARGET)}`} delta={12.6} />
      </div>

      {/* Ngân sách — câu hỏi đầu tiên của sếp mỗi tháng */}
      <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader
            title="Ngân sách booking tháng"
            hint="Đã bao gồm ngân sách dự phòng"
          />

          <div className="mb-4">
            <div className="flex items-baseline justify-between">
              <span className="tnum text-[30px] font-semibold leading-none tracking-[-0.025em] text-[var(--color-ink)]">
                {fmtVnd(BUDGET_SPENT)}
              </span>
              <span className="tnum text-[13px] text-[var(--color-muted)]">
                / {fmtVnd(BUDGET.total)}
              </span>
            </div>

            {/* Thanh đo: phần đã dùng + mốc "hết tháng nên ở đâu" */}
            <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--color-s1)] transition-[width] duration-700 ease-out"
                style={{ width: `${BUDGET_PCT}%` }}
              />
            </div>
            <p className="mt-2 text-[12.5px] text-[var(--color-ink-2)]">
              Đã dùng <strong className="font-semibold">{fmtPct(BUDGET_PCT, 0)}</strong> ngân sách ·
              còn lại {fmtVnd(BUDGET.total - BUDGET_SPENT)}
            </p>
          </div>

          <div className="space-y-2 border-t border-[var(--color-line)] pt-3">
            {BUDGET.byProduct.map((p) => {
              const pct = (p.spent / BUDGET_SPENT) * 100 || 0;
              return (
                <div key={p.code} className="flex items-center gap-3">
                  <span className="w-[46px] shrink-0 text-[12px] font-semibold text-[var(--color-ink-2)]">
                    {p.code}
                  </span>
                  <div className="h-[9px] flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: p.spent > 0 ? CHART_COLORS.s1 : "transparent",
                      }}
                    />
                  </div>
                  <span className="tnum w-[86px] shrink-0 text-right text-[12.5px] font-medium text-[var(--color-ink)]">
                    {p.spent > 0 ? fmtVnd(p.spent) : "chưa chi"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <ChartCard
          title="GMV thực tế so với mục tiêu"
          hint="Theo từng SKU chạy booking trong tháng"
          insightTone={gmvActual >= GMV_TOTAL_TARGET ? "good" : "warning"}
          insight={
            <>
              Tổng GMV đạt <strong className="font-semibold text-[var(--color-ink)]">
                {fmtPct((gmvActual / GMV_TOTAL_TARGET) * 100, 0)}
              </strong>{" "}
              mục tiêu. Combo tẩy mốc quần áo đã vượt xa kế hoạch, nhưng combo VSLG —
              SKU có mục tiêu lớn nhất — mới đạt{" "}
              {fmtPct((GMV_TARGETS[0].actual / GMV_TARGETS[0].target) * 100, 0)}, đây là chỗ
              quyết định có hoàn thành mục tiêu chung hay không.
            </>
          }
          chart={
            <BulletChart
              rows={GMV_TARGETS.map((r) => ({
                label: r.sku,
                actual: r.actual,
                target: r.target,
              }))}
              format={fmtCompact}
              focusIndex={0}
            />
          }
          table={
            <DataTable
              head={["SKU", "Thực tế", "Mục tiêu", "Tiến độ"]}
              rows={GMV_TARGETS.map((r) => [
                r.sku,
                fmtVnd(r.actual),
                fmtVnd(r.target),
                fmtPct((r.actual / r.target) * 100, 0),
              ])}
            />
          }
        />
      </div>

      {/* Phễu + KPI hành động */}
      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Phễu tìm kiếm và chốt KOC"
          hint="Báo cáo tuần · từ tiếp cận đến video lên sóng"
          insightTone="warning"
          insight={
            <>
              Hao hụt lớn nhất nằm ở bước từ <strong className="font-semibold text-[var(--color-ink)]">phản hồi
              sang chốt hợp tác</strong> — chỉ {fmtPct((KOC_FUNNEL[2].value / KOC_FUNNEL[1].value) * 100)} KOC
              đã phản hồi đi tới hợp tác. Cải thiện khâu thương lượng ở bước này cho hiệu quả
              cao hơn là tăng số lượng tiếp cận đầu phễu.
            </>
          }
          chart={<FunnelChart stages={KOC_FUNNEL} format={fmtInt} />}
          table={
            <DataTable
              head={["Bước", "Số lượng", "Tỉ lệ chuyển"]}
              rows={KOC_FUNNEL.map((s, i) => [
                s.label,
                fmtInt(s.value),
                i === 0
                  ? "—"
                  : fmtPct((s.value / KOC_FUNNEL[i - 1].value) * 100),
              ])}
            />
          }
        />

        <ChartCard
          title="Tiến độ KPI hành động"
          hint="Theo sản phẩm và hình thức chiến dịch"
          action={
            <Segmented<KpiMetric>
              ariaLabel="Chọn chỉ số KPI"
              value={metric}
              onChange={setMetric}
              options={[
                { value: "koc", label: "KOC" },
                { value: "closed", label: "Chốt" },
                { value: "aired", label: "Air" },
              ]}
            />
          }
          insight={
            <>
              <strong className="font-semibold text-[var(--color-ink)]">
                {worstAir.product} · {worstAir.format}
              </strong>{" "}
              có tỉ lệ lên sóng thấp nhất —{" "}
              {fmtPct((worstAir.actualVideoAired / worstAir.actualVideoClosed) * 100, 0)} số video
              đã chốt. Video chốt rồi mà không đăng là tiền đã chi nhưng chưa sinh doanh thu.
            </>
          }
          chart={
            <div className="space-y-2.5">
              {CAMPAIGN_KPI.map((r) => {
                const val =
                  metric === "koc"
                    ? r.actualKoc
                    : metric === "closed"
                      ? r.actualVideoClosed
                      : r.actualVideoAired;
                const plan = metric === "koc" ? r.planKoc : r.planVideo;
                const max = Math.max(
                  ...CAMPAIGN_KPI.map((x) =>
                    metric === "koc"
                      ? x.actualKoc
                      : metric === "closed"
                        ? x.actualVideoClosed
                        : x.actualVideoAired,
                  ),
                );
                const isWorst =
                  metric === "aired" &&
                  r.product === worstAir.product &&
                  r.format === worstAir.format;
                return (
                  <div key={`${r.product}-${r.format}`} className="flex items-center gap-3">
                    <span className="w-[136px] shrink-0 truncate text-[12.5px] text-[var(--color-ink-2)]">
                      <strong className="font-semibold text-[var(--color-ink)]">{r.product}</strong>
                      <span className="text-[var(--color-muted)]"> · {r.format}</span>
                    </span>
                    <div className="relative h-[15px] flex-1 overflow-hidden rounded-[4px] bg-[var(--color-surface-2)]">
                      <div
                        className="h-full rounded-[4px] transition-[width] duration-500 ease-out"
                        style={{
                          width: `${(val / max) * 100}%`,
                          background: isWorst ? CHART_COLORS.critical : CHART_COLORS.s1,
                        }}
                      />
                      {plan != null && (
                        <div
                          className="absolute inset-y-0 w-[2px] bg-[var(--color-ink)]"
                          style={{ left: `${Math.min(100, (plan / max) * 100)}%` }}
                          title={`Kế hoạch ${plan}`}
                        />
                      )}
                    </div>
                    <span className="tnum w-[62px] shrink-0 text-right text-[12.5px] font-semibold text-[var(--color-ink)]">
                      {fmtInt(val)}
                      {plan != null && (
                        <span className="ml-1 text-[10.5px] font-normal text-[var(--color-muted)]">
                          /{plan}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
              <p className="pt-1 text-[11px] text-[var(--color-muted)]">
                Vạch đen là kế hoạch. Freecast và Cộng đồng không giao chỉ tiêu trước nên không có vạch.
              </p>
            </div>
          }
          table={
            <DataTable
              head={["Sản phẩm", "Hình thức", "KOC", "Chốt", "Air", "Tỉ lệ air"]}
              rows={CAMPAIGN_KPI.map((r) => [
                r.product,
                r.format,
                fmtInt(r.actualKoc),
                fmtInt(r.actualVideoClosed),
                fmtInt(r.actualVideoAired),
                fmtPct((r.actualVideoAired / r.actualVideoClosed) * 100, 0),
              ])}
            />
          }
        />
      </div>

      {/* Nhân sự */}
      <ChartCard
        className="mb-4"
        title="Tiến độ theo nhân sự"
        hint="Số video đã đăng · kỳ trước so với kỳ này · bấm tên để xem chi tiết"
        insight={
          <>
            Cả hai nhân sự đều tăng so với kỳ trước. Chênh lệch khối lượng giữa hai người
            không lớn, cho thấy việc phân bổ đang tương đối đều.
          </>
        }
        chart={
          <div>
            <SlopeChart
              rows={STAFF_SUMMARY.map((s) => ({
                label: s.staff,
                before: s.prevVideoAired,
                after: s.videoAired,
              }))}
              beforeLabel="Kỳ trước"
              afterLabel="Kỳ này"
              format={fmtInt}
              height={190}
            />
            <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-line)] pt-3">
              {STAFF_SUMMARY.map((s) => (
                <button
                  key={s.staff}
                  type="button"
                  onClick={() => setStaffOpen(s.staff)}
                  className={cx(
                    "flex items-center gap-2 rounded-[9px] border border-[var(--color-line-strong)] px-3 py-1.5",
                    "text-[12.5px] font-medium text-[var(--color-ink-2)] transition-colors",
                    "hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]",
                  )}
                >
                  {s.staff}
                  <span className="tnum text-[var(--color-muted)]">
                    {fmtInt(s.videoAired)} video
                  </span>
                  <span aria-hidden className="text-[var(--color-muted)]">→</span>
                </button>
              ))}
            </div>
          </div>
        }
        table={
          <DataTable
            head={["Nhân sự", "KOC", "Video chốt", "Video air", "Air kỳ trước"]}
            rows={STAFF_SUMMARY.map((s) => [
              s.staff,
              fmtInt(s.koc),
              fmtInt(s.videoClosed),
              fmtInt(s.videoAired),
              fmtInt(s.prevVideoAired),
            ])}
          />
        }
      />

      <p className="mt-6 text-[12px] leading-relaxed text-[var(--color-muted)]">
        Số liệu ngân sách, KPI và GMV lấy từ tài liệu chỉ số Phòng Vận hành Saiza
        (14/08/2026). Các chỉ số này hiện <strong className="font-medium">chưa có trong Supabase</strong> —
        đang nằm ở Lark, cần đưa sang trước khi tự động hoá.
      </p>

      <Drawer
        open={staffOpen != null}
        onClose={() => setStaffOpen(null)}
        title={staffOpen ?? ""}
        subtitle="Nhân sự booking · chi tiết theo sản phẩm và hình thức"
      >
        {staffSum && (
          <>
            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                ["KOC", staffSum.koc],
                ["Video chốt", staffSum.videoClosed],
                ["Video air", staffSum.videoAired],
              ].map(([lb, v]) => (
                <div
                  key={lb as string}
                  className="rounded-[11px] border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3"
                >
                  <p className="text-[11.5px] text-[var(--color-muted)]">{lb}</p>
                  <p className="tnum mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                    {fmtInt(v as number)}
                  </p>
                </div>
              ))}
            </div>

            <DetailSection title="So với kỳ trước">
              <DetailRow
                label="Video air kỳ trước"
                value={fmtInt(staffSum.prevVideoAired)}
              />
              <DetailRow
                label="Thay đổi"
                value={`${staffSum.videoAired >= staffSum.prevVideoAired ? "+" : "−"}${fmtPct(
                  Math.abs(
                    ((staffSum.videoAired - staffSum.prevVideoAired) /
                      staffSum.prevVideoAired) *
                      100,
                  ),
                )}`}
                tone={staffSum.videoAired >= staffSum.prevVideoAired ? "good" : "critical"}
              />
              <DetailRow
                label="Tỉ lệ lên sóng"
                value={fmtPct((staffSum.videoAired / staffSum.videoClosed) * 100, 0)}
              />
            </DetailSection>

            {staffDetail.length > 0 && (
              <DetailSection title="Theo sản phẩm và hình thức">
                <DataTable
                  head={["Sản phẩm", "Hình thức", "KOC", "Chốt", "Air"]}
                  rows={staffDetail.map((r) => [
                    r.product,
                    r.format,
                    fmtInt(r.koc),
                    fmtInt(r.videoClosed),
                    fmtInt(r.videoAired),
                  ])}
                />
              </DetailSection>
            )}

            {staffDetail.length === 0 && (
              <p className="rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--color-muted)]">
                Tài liệu chỉ số 14/08/2026 chỉ đưa bảng chi tiết mẫu cho Lê Thu Hằng.
                Số tổng của nhân sự này được suy ra từ tổng chung trừ đi phần đã biết —
                cần bổ sung bảng chi tiết thật khi nối dữ liệu.
              </p>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
