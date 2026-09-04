"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader, cx } from "@/components/ui/primitives";
import { Drawer, DetailRow, DetailSection } from "@/components/ui/Drawer";
import { ChartCard } from "@/components/charts/core/ChartCard";
import { CHART_COLORS, DataTable } from "@/components/charts/core/Parts";
import { TimeSeriesChart } from "@/components/charts/TimeSeries";
import { BulletChart, DivergingBars } from "@/components/charts/Progress";
import { Heatmap, ScatterQuadrant } from "@/components/charts/Analysis";
import { usePeriodPicker } from "@/components/dashboard/PeriodPicker";
import {
  ADS_BLENDED_ROI,
  ADS_TOTAL,
  CAMPAIGNS,
  SHOPEE_ADS,
  SPEND_HEAT,
  WEEKDAYS,
  WEEK_COLS,
  type Campaign,
} from "@/lib/mock-ads";
import { seriesFor } from "@/lib/mock-data";
import { fmtCompact, fmtInt, fmtNum, fmtPct, fmtVnd } from "@/lib/format";

export default function QuangCaoPage() {
  const { range, picker } = usePeriodPicker();
  const data = useMemo(() => seriesFor(range), [range]);
  const [selected, setSelected] = useState<Campaign | null>(null);

  // Chiến dịch hụt mục tiêu nhiều nhất → câu chuyện chính của trang
  const worst = useMemo(
    () =>
      [...CAMPAIGNS].sort(
        (a, b) => a.roi / a.targetRoi - b.roi / b.targetRoi,
      )[0],
    [],
  );
  const underTarget = CAMPAIGNS.filter((c) => c.roi < c.targetRoi);
  // Nhóm "sát mục tiêu" (≥80%) khác hẳn nhóm thực sự có vấn đề — gộp chung
  // thành một con số sẽ che mất chiến dịch duy nhất đang hỏng.
  const critical = CAMPAIGNS.filter((c) => c.roi / c.targetRoi < 0.8);
  const nearTarget = underTarget.length - critical.length;

  // Vùng "tiêu nhiều mà hiệu quả thấp" trên biểu đồ phân tán — tính động,
  // không viết cứng, vì mốc thay đổi theo kỳ đang xem.
  const avgCost = ADS_TOTAL.cost / CAMPAIGNS.length;
  const dangerZone = CAMPAIGNS.filter(
    (c) => c.cost > avgCost && c.roi < ADS_BLENDED_ROI,
  );

  const bulletRows = useMemo(
    () =>
      [...CAMPAIGNS]
        .sort((a, b) => b.cost - a.cost)
        .map((c) => ({
          label: c.name,
          sub: `${fmtCompact(c.cost)} chi phí · ${fmtInt(c.orders)} đơn`,
          actual: c.roi,
          target: c.targetRoi,
        })),
    [],
  );

  const worstBulletIdx = bulletRows.findIndex((r) => r.label === worst.name);

  return (
    <div className="mx-auto max-w-[1400px]">
      <Breadcrumb current="Quảng cáo" />

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.022em] text-[var(--color-ink)]">
            Quảng cáo
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            TikTok GMV Max và Shopee Ads · {CAMPAIGNS.length} chiến dịch đang chạy
          </p>
        </div>
        {picker}
      </div>

      {/* Điểm nhấn lớn nhất của trang, đặt ngay đầu để không phải đi tìm */}
      <div className="mb-5 overflow-hidden rounded-[15px] border border-[var(--color-critical)]/25 bg-gradient-to-br from-[var(--color-critical)]/8 to-transparent">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--color-critical)]">
              Cần xử lý
            </p>
            <p className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
              {critical.length === 1
                ? `1 chiến dịch đang hỏng rõ rệt: ${worst.name}`
                : `${critical.length} chiến dịch đạt dưới 80% mục tiêu ROI`}
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-2)]">
              ROI {fmtNum(worst.roi)} lần trên mục tiêu {fmtNum(worst.targetRoi)} lần — chỉ đạt{" "}
              <strong className="font-semibold">{fmtPct((worst.roi / worst.targetRoi) * 100, 0)}</strong>.
              {nearTarget > 0 &&
                ` ${nearTarget} chiến dịch còn lại đều bám sát mục tiêu (trên 80%), chưa đáng lo.`}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[11.5px] text-[var(--color-muted)]">Chi phí của chiến dịch hỏng</p>
            <p className="tnum mt-0.5 text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-critical)]">
              {fmtCompact(critical.reduce((s, c) => s + c.cost, 0))}
            </p>
            <p className="tnum text-[11px] text-[var(--color-muted)]">
              {fmtPct((critical.reduce((s, c) => s + c.cost, 0) / ADS_TOTAL.cost) * 100)} tổng chi phí
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Tổng chi phí QC" value={fmtCompact(ADS_TOTAL.cost)} inverse delta={14.2} hint="so kỳ trước" />
        <StatTile label="Doanh thu từ QC" value={fmtCompact(ADS_TOTAL.revenue)} delta={9.8} hint="so kỳ trước" />
        <StatTile label="ROI tổng hợp" value={`${fmtNum(ADS_BLENDED_ROI)} lần`} delta={-3.1} accent={CHART_COLORS.s1} />
        <StatTile label="Đơn từ QC" value={fmtInt(ADS_TOTAL.orders)} delta={11.4} />
        <StatTile
          label="Chi phí / đơn"
          value={fmtCompact(ADS_TOTAL.cost / ADS_TOTAL.orders)}
          inverse
          delta={2.6}
        />
      </div>

      {/* Bullet: câu hỏi trung tâm — chiến dịch nào đạt mục tiêu? */}
      <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ChartCard
          title="ROI thực tế so với mục tiêu"
          hint="Vạch đen là mục tiêu đặt ra khi khởi chạy · bấm để xem chi tiết"
          insightTone="critical"
          insight={
            <>
              <strong className="font-semibold text-[var(--color-ink)]">{worst.name}</strong> chỉ đạt{" "}
              {fmtPct((worst.roi / worst.targetRoi) * 100, 0)} mục tiêu — thấp hơn hẳn phần còn lại.
              Chiến dịch này tiêu {fmtCompact(worst.cost)} và chỉ mang về {fmtInt(worst.orders)} đơn.
            </>
          }
          chart={
            <BulletChart
              rows={bulletRows}
              format={(v) => `${fmtNum(v)}×`}
              focusIndex={worstBulletIdx}
              onSelect={(i) => {
                const c = CAMPAIGNS.find((x) => x.name === bulletRows[i].label);
                if (c) setSelected(c);
              }}
            />
          }
          table={
            <DataTable
              head={["Chiến dịch", "ROI", "Mục tiêu", "Đạt", "Chi phí"]}
              rows={bulletRows.map((r) => {
                const c = CAMPAIGNS.find((x) => x.name === r.label)!;
                return [
                  r.label,
                  `${fmtNum(r.actual)}×`,
                  `${fmtNum(r.target)}×`,
                  fmtPct((r.actual / r.target) * 100, 0),
                  fmtVnd(c.cost),
                ];
              })}
              highlightRow={worstBulletIdx}
            />
          }
        />

        <ChartCard
          title="Chênh lệch ROI so với mục tiêu"
          hint="Dương là vượt, âm là hụt — tính theo số lần ROI"
          chart={
            <DivergingBars
              rows={[...CAMPAIGNS]
                .sort((a, b) => a.roi - a.targetRoi - (b.roi - b.targetRoi))
                .map((c) => ({
                  label: c.name.length > 20 ? `${c.name.slice(0, 19)}…` : c.name,
                  value: c.roi - c.targetRoi,
                }))}
              format={(v) => `${fmtNum(v)}×`}
              positiveLabel="Vượt mục tiêu"
              negativeLabel="Hụt mục tiêu"
            />
          }
          table={
            <DataTable
              head={["Chiến dịch", "ROI", "Mục tiêu", "Chênh lệch"]}
              rows={CAMPAIGNS.map((c) => [
                c.name,
                `${fmtNum(c.roi)}×`,
                `${fmtNum(c.targetRoi)}×`,
                `${c.roi >= c.targetRoi ? "+" : "−"}${fmtNum(Math.abs(c.roi - c.targetRoi))}×`,
              ])}
            />
          }
        />
      </div>

      {/* Scatter: tìm chiến dịch bất thường */}
      <div className="mb-4">
        <ChartCard
          title="Bản đồ hiệu quả chiến dịch"
          hint="Trục ngang: chi phí · trục dọc: ROI · độ lớn bong bóng: doanh thu"
          insightTone={dangerZone.length > 0 ? "warning" : "neutral"}
          insight={
            dangerZone.length > 0 ? (
              <>
                Vùng đỏ góc dưới bên phải là nơi nguy hiểm nhất — tiêu trên mức trung bình
                ({fmtCompact(avgCost)}) nhưng ROI dưới mốc {fmtNum(ADS_BLENDED_ROI)}×. Đang có{" "}
                <strong className="font-semibold text-[var(--color-ink)]">
                  {dangerZone.map((c) => c.name).join(", ")}
                </strong>{" "}
                rơi vào vùng này, tổng chi phí {fmtCompact(dangerZone.reduce((s, c) => s + c.cost, 0))}.
              </>
            ) : (
              <>
                Không có chiến dịch nào vừa tiêu trên mức trung bình vừa có ROI dưới mốc{" "}
                {fmtNum(ADS_BLENDED_ROI)}× — ngân sách đang tập trung đúng chỗ.
              </>
            )
          }
          chart={
            <ScatterQuadrant
              points={CAMPAIGNS.map((c) => ({
                id: c.id,
                label: c.name,
                x: c.cost,
                y: c.roi,
                size: c.revenue,
              }))}
              xRef={avgCost}
              yRef={ADS_BLENDED_ROI}
              formatX={(v) => fmtCompact(v)}
              formatY={(v) => `${fmtNum(v)}×`}
              formatSize={(v) => fmtVnd(v)}
              xLabel="Chi phí"
              yLabel="ROI"
              onSelect={(p) => {
                const c = CAMPAIGNS.find((x) => x.id === p.id);
                if (c) setSelected(c);
              }}
            />
          }
          table={
            <DataTable
              head={["Chiến dịch", "Chi phí", "ROI", "Doanh thu", "Đơn"]}
              rows={CAMPAIGNS.map((c) => [
                c.name,
                fmtVnd(c.cost),
                `${fmtNum(c.roi)}×`,
                fmtVnd(c.revenue),
                fmtInt(c.orders),
              ])}
            />
          }
        />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Chi phí và doanh thu quảng cáo"
          hint="Theo thời gian · rê chuột để xem từng mốc"
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
              peakOf="rev"
              peakLabel={(v, l) => `Đỉnh ${l} · ${fmtCompact(v)}`}
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

        <ChartCard
          title="Chi phí theo thứ trong tuần"
          hint="Ô càng đậm chi càng nhiều · ô viền đen là cao nhất"
          insight="Chi phí dồn vào cuối tuần — đúng với quy luật mua sắm trên sàn, nhưng cần đối chiếu ROI cuối tuần trước khi tăng thêm ngân sách."
          chart={
            <Heatmap
              rowLabels={WEEKDAYS}
              colLabels={WEEK_COLS}
              cells={SPEND_HEAT}
              format={fmtCompact}
            />
          }
          table={
            <DataTable
              head={["Thứ", ...WEEK_COLS]}
              rows={WEEKDAYS.map((d, r) => [
                d,
                ...WEEK_COLS.map((_, c) =>
                  fmtCompact(SPEND_HEAT.find((x) => x.row === r && x.col === c)?.value ?? 0),
                ),
              ])}
            />
          }
        />
      </div>

      <Card>
        <CardHeader
          title="Shopee Ads"
          hint="Chỉ số quảng cáo Shopee trong kỳ — nguồn shopee_ads_daily"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Lượt hiển thị" value={fmtCompact(SHOPEE_ADS.impression)} />
          <StatTile label="Lượt click" value={fmtCompact(SHOPEE_ADS.clicks)} hint={`CTR ${fmtPct(SHOPEE_ADS.ctr)}`} />
          <StatTile label="Chi phí" value={fmtCompact(SHOPEE_ADS.expense)} inverse />
          <StatTile label="GMV trực tiếp" value={fmtCompact(SHOPEE_ADS.directGmv)} hint={`ROAS ${fmtNum(SHOPEE_ADS.directRoas)}×`} />
          <StatTile label="GMV mở rộng" value={fmtCompact(SHOPEE_ADS.broadGmv)} hint={`ROAS ${fmtNum(SHOPEE_ADS.broadRoas)}×`} />
          <StatTile label="Chi phí / chuyển đổi" value={fmtCompact(SHOPEE_ADS.costPerConversion)} inverse />
        </div>
      </Card>

      {/* Chiều sâu: bấm chiến dịch nào cũng mở được chi tiết */}
      <Drawer
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle="Chiến dịch TikTok GMV Max"
      >
        {selected && (
          <>
            <div
              className={cx(
                "mb-5 rounded-[12px] border p-4",
                selected.roi >= selected.targetRoi
                  ? "border-[var(--color-good)]/25 bg-[var(--color-good)]/7"
                  : "border-[var(--color-critical)]/25 bg-[var(--color-critical)]/7",
              )}
            >
              <p className="text-[12px] text-[var(--color-muted)]">Mức đạt mục tiêu ROI</p>
              <p
                className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.025em]"
                style={{
                  color:
                    selected.roi >= selected.targetRoi
                      ? "var(--color-good)"
                      : "var(--color-critical)",
                }}
              >
                {fmtPct((selected.roi / selected.targetRoi) * 100, 0)}
              </p>
              <p className="mt-1.5 text-[12.5px] text-[var(--color-ink-2)]">
                ROI {fmtNum(selected.roi)}× trên mục tiêu {fmtNum(selected.targetRoi)}×
              </p>
            </div>

            <DetailSection title="Hiệu quả">
              <DetailRow label="Chi phí" value={fmtVnd(selected.cost)} />
              <DetailRow label="Doanh thu gộp" value={fmtVnd(selected.revenue)} />
              <DetailRow
                label="Lợi nhuận gộp trước phí sàn"
                value={fmtVnd(selected.revenue - selected.cost)}
                tone="good"
              />
              <DetailRow label="ROI thực tế" value={`${fmtNum(selected.roi)}×`} />
              <DetailRow
                label="ROI mục tiêu"
                value={`${fmtNum(selected.targetRoi)}×`}
              />
            </DetailSection>

            <DetailSection title="Đơn hàng">
              <DetailRow label="Tổng đơn" value={fmtInt(selected.orders)} />
              <DetailRow
                label="Chi phí mỗi đơn"
                value={fmtVnd(selected.cost / selected.orders)}
              />
              <DetailRow
                label="Doanh thu mỗi đơn"
                value={fmtVnd(selected.revenue / selected.orders)}
              />
              <DetailRow label="Số ngày chạy" value={`${selected.days} ngày`} />
              <DetailRow
                label="Chi phí bình quân / ngày"
                value={fmtVnd(selected.cost / selected.days)}
              />
            </DetailSection>

            <p className="rounded-[10px] border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--color-muted)]">
              {selected.roi >= selected.targetRoi
                ? "Chiến dịch đạt mục tiêu. Cân nhắc tăng ngân sách để mở rộng quy mô, theo dõi ROI có giữ được khi tăng chi."
                : "Chiến dịch chưa đạt mục tiêu. Rà lại giá thầu, nhóm sản phẩm và tệp khách trước khi tiếp tục chi thêm."}
            </p>
          </>
        )}
      </Drawer>
    </div>
  );
}

function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="mb-1 flex items-center gap-1.5 text-[12.5px] text-[var(--color-muted)]">
      <Link href="/dashboard" className="transition-colors hover:text-[var(--color-ink)]">
        Tổng quan
      </Link>
      <span aria-hidden>/</span>
      <span className="text-[var(--color-ink-2)]">{current}</span>
    </div>
  );
}
