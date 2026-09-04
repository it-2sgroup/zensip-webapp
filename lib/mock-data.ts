/**
 * DỮ LIỆU MẪU — chỉ dùng để dựng giao diện.
 *
 * Quy mô các con số được đặt bám theo dữ liệu thật đã khảo sát trong Supabase
 * project SOVA (jjarzdxyarwobruzdqbg) ngày 04/09/2026, để bố cục không vỡ khi
 * nối dữ liệu thật:
 *   - tiktok_orders   492.187 đơn · ~19,7 tỷ (Đã hoàn tất) + 17,7 tỷ (COMPLETED)
 *   - shopee_orders   128.654 đơn · ~12,1 tỷ (COMPLETED)
 *   - dữ liệu tới 02/09/2026
 *
 * Sinh số bằng bộ sinh tất định (không dùng Math.random) để kết quả trên máy chủ
 * và trên trình duyệt giống hệt nhau, tránh lỗi lệch hydration.
 */

/** mulberry32 — bộ sinh số giả ngẫu nhiên tất định theo hạt giống */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const LAST_DAY = "2026-09-02";

export interface DayRow {
  date: string;
  /** Nhãn hiển thị trên trục/bảng — đã định dạng sẵn theo đúng cấp độ thời gian (ngày/tuần/tháng) */
  label: string;
  /** Doanh thu TikTok Shop (đ) */
  tiktok: number;
  /** Doanh thu Shopee (đ) */
  shopee: number;
  /** Doanh thu cùng kỳ trước đó (đ) — để so sánh */
  prev: number;
  orders: number;
  adCost: number;
  adRevenue: number;
}

const dayMonth = (d: Date) =>
  `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

/** Chuỗi ngày liên tục — nguồn DUY NHẤT cho mọi cấp độ thời gian, để số nhất quán giữa các chế độ xem */
function buildDailyBase(days: number): DayRow[] {
  const r = rng(20260902);
  const end = new Date(`${LAST_DAY}T00:00:00Z`);
  const out: DayRow[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const dow = d.getUTCDay();

    // Cuối tuần bán tốt hơn; ngày đôi (9/9, 8/8...) là đỉnh chiến dịch sàn
    const weekend = dow === 0 || dow === 6 ? 1.22 : 1;
    const dom = d.getUTCDate();
    const campaign = dom === d.getUTCMonth() + 1 ? 1.9 : dom === 15 ? 1.35 : 1;
    const noise = 0.82 + r() * 0.36;

    const tiktok = Math.round(78_000_000 * weekend * campaign * noise);
    const shopee = Math.round(31_000_000 * weekend * campaign * (0.85 + r() * 0.3));
    const prev = Math.round((tiktok + shopee) * (0.79 + r() * 0.22));
    const orders = Math.round((tiktok + shopee) / (95_000 + r() * 25_000));
    const adCost = Math.round(tiktok * (0.11 + r() * 0.05));
    const adRevenue = Math.round(adCost * (2.6 + r() * 1.9));

    out.push({
      date: d.toISOString().slice(0, 10),
      label: dayMonth(d),
      tiktok,
      shopee,
      prev,
      orders,
      adCost,
      adRevenue,
    });
  }
  return out;
}

/** 13 tháng dữ liệu nền — đủ cho mọi cấp độ xem (ngày/tuần/tháng) từ cùng một nguồn */
const BASE = buildDailyBase(400);

function sumRows(rows: DayRow[], date: string, label: string): DayRow {
  return rows.reduce(
    (acc, r) => ({
      date,
      label,
      tiktok: acc.tiktok + r.tiktok,
      shopee: acc.shopee + r.shopee,
      prev: acc.prev + r.prev,
      orders: acc.orders + r.orders,
      adCost: acc.adCost + r.adCost,
      adRevenue: acc.adRevenue + r.adRevenue,
    }),
    { date, label, tiktok: 0, shopee: 0, prev: 0, orders: 0, adCost: 0, adRevenue: 0 },
  );
}

/** Gộp theo tuần (7 ngày/nhóm, tính lùi từ ngày cuối) — nhãn là ngày đầu tuần */
function aggregateWeekly(weeks: number): DayRow[] {
  const days = weeks * 7;
  const slice = BASE.slice(-days);
  const out: DayRow[] = [];
  for (let i = 0; i < slice.length; i += 7) {
    const chunk = slice.slice(i, i + 7);
    if (!chunk.length) continue;
    const start = new Date(`${chunk[0].date}T00:00:00Z`);
    out.push(sumRows(chunk, chunk[0].date, `Tuần ${dayMonth(start)}`));
  }
  return out;
}

/** Gộp theo tháng dương lịch */
function aggregateMonthly(months: number): DayRow[] {
  const byMonth = new Map<string, DayRow[]>();
  for (const row of BASE) {
    const key = row.date.slice(0, 7); // YYYY-MM
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(row);
  }
  const keys = Array.from(byMonth.keys()).sort().slice(-months);
  return keys.map((key) => {
    const [y, m] = key.split("-");
    return sumRows(byMonth.get(key)!, `${key}-01`, `Th${Number(m)}/${y}`);
  });
}

export const SERIES_7 = BASE.slice(-7);
export const SERIES_30 = BASE.slice(-30);
export const SERIES_90 = BASE.slice(-90);
export const SERIES_12W = aggregateWeekly(12);
export const SERIES_12M = aggregateMonthly(12);

export type RangeKey = "7d" | "30d" | "90d" | "12w" | "12m";

export function seriesFor(range: RangeKey): DayRow[] {
  switch (range) {
    case "7d":
      return SERIES_7;
    case "90d":
      return SERIES_90;
    case "12w":
      return SERIES_12W;
    case "12m":
      return SERIES_12M;
    default:
      return SERIES_30;
  }
}

/** Cơ cấu GMV theo kênh bán — khớp cột gmv_live / gmv_video / gmv_card */
export const CHANNEL_MIX = [
  { key: "video", label: "Video", value: 1_284_000_000 },
  { key: "live", label: "Livestream", value: 742_000_000 },
  { key: "card", label: "Thẻ sản phẩm", value: 396_000_000 },
  { key: "other", label: "Khác", value: 118_000_000 },
];

export interface ProductRow {
  sku: string;
  name: string;
  revenue: number;
  orders: number;
  /** Số lượng đã bán */
  qty: number;
  /** Biến động doanh thu so kỳ trước (%) */
  delta: number;
}

export const TOP_PRODUCTS: ProductRow[] = [
  { sku: "VSLG-C3", name: "Combo 3 gói bột vệ sinh lồng giặt Saiza", revenue: 486_200_000, orders: 5_142, qty: 15_426, delta: 18.4 },
  { sku: "TQA-C2", name: "Combo 2 tẩy mốc quần áo Saiza", revenue: 312_800_000, orders: 3_908, qty: 7_816, delta: 9.1 },
  { sku: "XNB-01", name: "Xịt nhà bếp Saiza 500ml", revenue: 208_450_000, orders: 2_874, qty: 5_748, delta: -4.6 },
  { sku: "MLS-10", name: "Miếng lau sàn Saiza (hộp 10)", revenue: 154_300_000, orders: 2_310, qty: 4_620, delta: 26.7 },
  { sku: "VSLG-C1", name: "Bột vệ sinh lồng giặt Saiza gói lẻ", revenue: 98_700_000, orders: 1_962, qty: 1_962, delta: -12.3 },
  { sku: "TQA-01", name: "Tẩy mốc quần áo Saiza 250ml", revenue: 76_400_000, orders: 1_528, qty: 1_528, delta: 3.8 },
];

/** Trạng thái đồng bộ dữ liệu — bám bảng sync_logs / data_health */
export const SYNC_STATUS = [
  { source: "TikTok · Đơn hàng", at: "02/09 01:12", ok: true },
  { source: "TikTok · Quảng cáo GMV Max", at: "02/09 01:20", ok: true },
  { source: "Shopee · Đơn hàng", at: "02/09 01:15", ok: true },
  { source: "Shopee · Đối soát escrow", at: "01/09 01:15", ok: false },
];

export interface LiveSessionRow {
  id: string;
  channel: string;
  date: string;
  durationMin: number;
  peakViewers: number;
  orders: number;
  gmv: number;
}

/** Phiên Live gần nhất — khớp cột tiktok_lives (peak_viewers, orders, gmv, duration_minutes) */
export const LIVE_SESSIONS: LiveSessionRow[] = [
  { id: "L-0912", channel: "SAIZA.VN chính", date: "02/09", durationMin: 186, peakViewers: 3_240, orders: 412, gmv: 68_400_000 },
  { id: "L-0910", channel: "SAIZA.VN chính", date: "31/08", durationMin: 154, peakViewers: 2_680, orders: 356, gmv: 54_100_000 },
  { id: "L-0908", channel: "SU Việt Nam", date: "29/08", durationMin: 120, peakViewers: 1_450, orders: 187, gmv: 26_800_000 },
  { id: "L-0905", channel: "SAIZA.VN chính", date: "27/08", durationMin: 210, peakViewers: 4_120, orders: 528, gmv: 81_900_000 },
  { id: "L-0902", channel: "SAIZA.VN chính", date: "24/08", durationMin: 167, peakViewers: 2_910, orders: 371, gmv: 59_600_000 },
];

/** Đơn hoàn/huỷ tổng sàn trong kỳ — bám tiktok_returns.return_status / tiktok_cancellations.cancel_status */
export const RETURN_CANCEL_SUMMARY = {
  returnedOrders: 1_284,
  returnedRate: 3.2,
  cancelledOrders: 2_356,
  cancelledRate: 5.9,
};
