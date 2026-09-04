"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePeriodPicker } from "@/components/dashboard/PeriodPicker";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader } from "@/components/ui/primitives";
import { AdPerformance, ChannelDonut } from "@/components/charts/DashboardCharts";
import { CHANNEL_MIX, LIVE_SESSIONS, RETURN_CANCEL_SUMMARY, seriesFor } from "@/lib/mock-data";
import { fmtCompact, fmtInt, fmtNum, fmtPct, fmtVnd } from "@/lib/format";

/**
 * Trang Vận hành sàn — theo mục 1 tài liệu "Tổng hợp chỉ số báo cáo dashboard SAIZA" (14/08/2026):
 * 1.1a Số liệu GMV Max, 1.1b Đơn hàng & doanh thu tổng sàn (hoàn/huỷ, kênh Live/Video/Thẻ).
 */
export default function SanVanHanhPage() {
  const { range, picker } = usePeriodPicker();
  const data = useMemo(() => seriesFor(range), [range]);

  const gmvMax = useMemo(() => {
    const cost = data.reduce((s, d) => s + d.adCost, 0);
    const revenue = data.reduce((s, d) => s + d.adRevenue, 0);
    // Đơn từ QC ước tính ~42% tổng đơn — dữ liệu mẫu, sẽ thay bằng
    // tiktok_ads_gmv_max_daily.orders khi nối Supabase thật.
    const orders = Math.round(data.reduce((s, d) => s + d.orders, 0) * 0.42);
    return {
      cost,
      revenue,
      orders,
      costPerOrder: orders ? cost / orders : 0,
      aov: orders ? revenue / orders : 0,
      roi: cost ? revenue / cost : 0,
    };
  }, [data]);

  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = data.reduce((s, d) => s + d.tiktok + d.shopee, 0);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-1 flex items-center gap-1.5 text-[12.5px] text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] hover:underline">
          Tổng quan
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink-2)]">Vận hành sàn</span>
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Vận hành sàn
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-muted)]">
            Quảng cáo GMV Max · đơn hàng · hoàn huỷ · doanh thu theo kênh
          </p>
        </div>
        {picker}
      </div>

      <Card className="mb-4">
        <CardHeader
          title="Quảng cáo GMV Max"
          hint="1.1a — số liệu kéo trực tiếp từ tiktok_ads_gmv_max_daily"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Doanh thu từ QC" value={fmtCompact(gmvMax.revenue)} />
          <StatTile label="Chi phí QC" value={fmtCompact(gmvMax.cost)} inverse />
          <StatTile label="Số đơn từ QC" value={fmtInt(gmvMax.orders)} />
          <StatTile label="Chi phí / đơn" value={fmtCompact(gmvMax.costPerOrder)} inverse />
          <StatTile label="AOV" value={fmtCompact(gmvMax.aov)} />
          <StatTile label="ROI" value={`${fmtNum(gmvMax.roi)} lần`} />
        </div>
      </Card>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Đơn hàng & doanh thu tổng sàn"
            hint="1.1b — số liệu tổng thể toàn sàn, không tách theo kênh"
          />
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-[12.5px] text-[var(--color-muted)]">Tổng doanh thu</dt>
              <dd className="tnum mt-1 text-[22px] font-semibold text-[var(--color-ink)]">
                {fmtCompact(totalRevenue)}
              </dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-[var(--color-muted)]">Tổng số đơn</dt>
              <dd className="tnum mt-1 text-[22px] font-semibold text-[var(--color-ink)]">
                {fmtInt(totalOrders)}
              </dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-[var(--color-muted)]">Đơn hoàn</dt>
              <dd className="mt-1 flex items-baseline gap-1.5">
                <span className="tnum text-[18px] font-semibold text-[var(--color-ink)]">
                  {fmtInt(RETURN_CANCEL_SUMMARY.returnedOrders)}
                </span>
                <span className="tnum text-[12.5px] text-[var(--color-critical)]">
                  {fmtPct(RETURN_CANCEL_SUMMARY.returnedRate)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-[var(--color-muted)]">Đơn huỷ</dt>
              <dd className="mt-1 flex items-baseline gap-1.5">
                <span className="tnum text-[18px] font-semibold text-[var(--color-ink)]">
                  {fmtInt(RETURN_CANCEL_SUMMARY.cancelledOrders)}
                </span>
                <span className="tnum text-[12.5px] text-[var(--color-critical)]">
                  {fmtPct(RETURN_CANCEL_SUMMARY.cancelledRate)}
                </span>
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-[var(--color-line)] pt-3 text-[11.5px] leading-relaxed text-[var(--color-muted)]">
            ⚠ Khi nối dữ liệu thật: gộp cả 2 dạng trạng thái tiếng Việt/Anh
            (<code className="tnum">Đã hủy</code> + <code className="tnum">CANCELLED</code>) —
            xem cạm bẫy đã ghi trong tài liệu kiến trúc, mục 4.
          </p>
        </Card>

        <ChannelDonut data={CHANNEL_MIX} />
      </div>

      <div className="mb-4">
        <AdPerformance data={data} />
      </div>

      <Card>
        <CardHeader
          title="Doanh thu theo phiên Live"
          hint="Live gần nhất — khớp bảng tiktok_lives"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-line-strong)]">
                <th scope="col" className="py-2 text-left text-[12px] font-semibold text-[var(--color-ink-2)]">Kênh</th>
                <th scope="col" className="py-2 text-left text-[12px] font-semibold text-[var(--color-ink-2)]">Ngày</th>
                <th scope="col" className="py-2 text-right text-[12px] font-semibold text-[var(--color-ink-2)]">Thời lượng</th>
                <th scope="col" className="py-2 text-right text-[12px] font-semibold text-[var(--color-ink-2)]">Đỉnh xem</th>
                <th scope="col" className="py-2 text-right text-[12px] font-semibold text-[var(--color-ink-2)]">Đơn</th>
                <th scope="col" className="py-2 text-right text-[12px] font-semibold text-[var(--color-ink-2)]">GMV</th>
              </tr>
            </thead>
            <tbody>
              {LIVE_SESSIONS.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="py-2.5 pr-3 text-[var(--color-ink)]">{s.channel}</td>
                  <td className="tnum py-2.5 pr-3 text-[var(--color-ink-2)]">{s.date}</td>
                  <td className="tnum py-2.5 pr-3 text-right text-[var(--color-ink-2)]">{s.durationMin} phút</td>
                  <td className="tnum py-2.5 pr-3 text-right text-[var(--color-ink-2)]">{fmtInt(s.peakViewers)}</td>
                  <td className="tnum py-2.5 pr-3 text-right text-[var(--color-ink-2)]">{fmtInt(s.orders)}</td>
                  <td className="tnum py-2.5 text-right font-medium text-[var(--color-ink)]">{fmtVnd(s.gmv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
