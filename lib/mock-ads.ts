/**
 * Dữ liệu quảng cáo.
 *
 * KHÁC với các file mock khác: phần chiến dịch GMV Max dưới đây là SỐ THẬT,
 * truy vấn từ Supabase project SOVA (jjarzdxyarwobruzdqbg), bảng
 * `tiktok_ads_gmv_max_daily`, khoảng 01/08–02/09/2026. Giữ nguyên tên chiến
 * dịch gốc (kể cả khoảng trắng thừa) để khi nối API thật khớp được ngay.
 */

export interface Campaign {
  id: string;
  name: string;
  /** Tổng chi phí trong kỳ (đ) */
  cost: number;
  /** Doanh thu gộp quy về chiến dịch (đ) */
  revenue: number;
  /** ROI thực tế (lần) */
  roi: number;
  /** ROI mục tiêu đặt ra khi chạy (lần) */
  targetRoi: number;
  orders: number;
  /** Số ngày có dữ liệu */
  days: number;
}

export const CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "1705 - TQA", cost: 969_513_918, revenue: 6_737_792_998, roi: 6.95, targetRoi: 7.0, orders: 72_199, days: 34 },
  { id: "c2", name: "1705 - VSLG", cost: 221_690_573, revenue: 1_468_344_067, roi: 6.62, targetRoi: 6.8, orders: 15_871, days: 34 },
  { id: "c3", name: "1705 nhóm vslg 2 3", cost: 49_835_608, revenue: 332_923_408, roi: 6.64, targetRoi: 7.5, orders: 5_058, days: 34 },
  { id: "c4", name: "1705 - VSLG 6 tặng 4 và 4 tặng 2", cost: 35_929_043, revenue: 239_970_444, roi: 6.68, targetRoi: 7.0, orders: 1_506, days: 34 },
  { id: "c5", name: "15/12 - TDN", cost: 35_270_202, revenue: 271_685_527, roi: 7.69, targetRoi: 8.0, orders: 2_489, days: 34 },
  { id: "c6", name: "LIVE GMV Max · SAIZA.VN 01/08", cost: 24_206_675, revenue: 200_862_375, roi: 8.18, targetRoi: 10.0, orders: 1_549, days: 34 },
  { id: "c7", name: "SAIZAVN1705", cost: 20_850_529, revenue: 176_333_376, roi: 8.23, targetRoi: 10.26, orders: 1_481, days: 34 },
  { id: "c8", name: "2905 - XNB", cost: 14_646_157, revenue: 111_237_600, roi: 7.54, targetRoi: 8.0, orders: 1_057, days: 34 },
  { id: "c9", name: "TQA - LIVE GMV Max · SAIZA.VN 05/08", cost: 12_272_673, revenue: 88_788_123, roi: 7.23, targetRoi: 10.0, orders: 917, days: 29 },
  { id: "c10", name: "1307 - MLSAN", cost: 2_036_852, revenue: 6_749_388, roi: 3.31, targetRoi: 6.0, orders: 103, days: 33 },
];

export const ADS_TOTAL = {
  cost: CAMPAIGNS.reduce((s, c) => s + c.cost, 0),
  revenue: CAMPAIGNS.reduce((s, c) => s + c.revenue, 0),
  orders: CAMPAIGNS.reduce((s, c) => s + c.orders, 0),
};

/** ROI trung bình có trọng số — KHÔNG lấy trung bình cộng các ROI, vì như vậy
 *  chiến dịch tiêu 2 triệu sẽ có tiếng nói ngang chiến dịch tiêu 969 triệu. */
export const ADS_BLENDED_ROI = ADS_TOTAL.revenue / ADS_TOTAL.cost;

/* ── Chi phí quảng cáo theo thứ trong tuần × tuần (heatmap) ── */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export const WEEK_COLS = ["W27", "W28", "W29", "W30", "W31", "W32", "W33", "W34", "W35"];

/** Chi phí theo ngày — cuối tuần và ngày đôi chi mạnh hơn */
export const SPEND_HEAT = (() => {
  const r = rng(880902);
  const out: { row: number; col: number; value: number }[] = [];
  for (let row = 0; row < WEEKDAYS.length; row++) {
    for (let col = 0; col < WEEK_COLS.length; col++) {
      const weekend = row >= 5 ? 1.35 : 1;
      const ramp = 0.7 + (col / WEEK_COLS.length) * 0.6;
      out.push({
        row,
        col,
        value: Math.round(28_000_000 * weekend * ramp * (0.75 + r() * 0.5)),
      });
    }
  }
  return out;
})();

/* ── Shopee Ads ── */

export const SHOPEE_ADS = {
  impression: 4_284_500,
  clicks: 128_540,
  ctr: 3.0,
  directOrder: 3_842,
  directGmv: 412_800_000,
  directRoas: 5.4,
  broadOrder: 6_120,
  broadGmv: 684_200_000,
  broadRoas: 8.9,
  expense: 76_400_000,
  costPerConversion: 19_886,
};
