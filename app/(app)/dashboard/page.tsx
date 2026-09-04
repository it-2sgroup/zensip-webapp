"use client";

import { useMemo } from "react";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/primitives";
import { usePeriodPicker } from "@/components/dashboard/PeriodPicker";
import {
  AdPerformance,
  ChannelDonut,
  CompareWithPrevious,
  RevenueByDay,
  TopProducts,
} from "@/components/charts/DashboardCharts";
import { CHANNEL_MIX, SYNC_STATUS, TOP_PRODUCTS, seriesFor } from "@/lib/mock-data";
import { delta, fmtCompact, fmtInt, fmtNum, fmtPct } from "@/lib/format";

export default function DashboardPage() {
  const { range, picker } = usePeriodPicker();
  const data = useMemo(() => seriesFor(range), [range]);

  const kpi = useMemo(() => {
    const revenue = data.reduce((s, d) => s + d.tiktok + d.shopee, 0);
    const prev = data.reduce((s, d) => s + d.prev, 0);
    const orders = data.reduce((s, d) => s + d.orders, 0);
    const adCost = data.reduce((s, d) => s + d.adCost, 0);
    const adRevenue = data.reduce((s, d) => s + d.adRevenue, 0);
    return {
      revenue,
      revenueDelta: delta(revenue, prev),
      orders,
      ordersDelta: 8.6,
      aov: orders ? revenue / orders : 0,
      aovDelta: 2.4,
      adCost,
      adCostDelta: 14.2,
      roi: adCost ? adRevenue / adCost : 0,
      roiDelta: -3.1,
      cancelRate: 6.8,
      cancelDelta: -1.4,
    };
  }, [data]);

  const failedSync = SYNC_STATUS.filter((s) => !s.ok);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Tổng quan
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            Dữ liệu TikTok Shop và Shopee · cập nhật tới 02/09/2026
          </p>
        </div>

        {picker}
      </div>

      {failedSync.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[12px] border border-[var(--color-warning)]/35 bg-[var(--color-warning)]/8 px-4 py-3">
          <Badge tone="warning">⚠ Đồng bộ trễ</Badge>
          <p className="text-[13px] text-[var(--color-ink-2)]">
            {failedSync.map((s) => s.source).join(", ")} chưa chạy lại từ{" "}
            {failedSync[0].at} — số liệu liên quan có thể thiếu.
          </p>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="Doanh thu"
          value={fmtCompact(kpi.revenue)}
          delta={kpi.revenueDelta}
          hint="so kỳ trước"
        />
        <StatTile
          label="Đơn hàng"
          value={fmtInt(kpi.orders)}
          delta={kpi.ordersDelta}
          hint="so kỳ trước"
        />
        <StatTile
          label="Giá trị đơn TB"
          value={fmtCompact(kpi.aov)}
          delta={kpi.aovDelta}
          hint="AOV"
        />
        <StatTile
          label="Chi phí quảng cáo"
          value={fmtCompact(kpi.adCost)}
          delta={kpi.adCostDelta}
          inverse
          hint="GMV Max"
        />
        <StatTile label="ROI quảng cáo" value={`${fmtNum(kpi.roi)} lần`} delta={kpi.roiDelta} />
        <StatTile
          label="Tỷ lệ huỷ đơn"
          value={fmtPct(kpi.cancelRate)}
          delta={kpi.cancelDelta}
          inverse
        />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <RevenueByDay data={data} />
        <CompareWithPrevious data={data} />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <ChannelDonut data={CHANNEL_MIX} />
        <AdPerformance data={data} />
      </div>

      <TopProducts rows={TOP_PRODUCTS} />

      <p className="mt-6 text-[12px] text-[var(--color-muted)]">
        Đang hiển thị <strong className="font-medium">dữ liệu mẫu</strong> để
        dựng giao diện. Bước tiếp theo là nối vào Supabase thật.
      </p>
    </div>
  );
}
