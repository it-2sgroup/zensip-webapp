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

function buildSeries(days: number): DayRow[] {
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

export const SERIES_30 = buildSeries(30);
export const SERIES_7 = SERIES_30.slice(-7);
export const SERIES_90 = buildSeries(90);

export function seriesFor(range: "7d" | "30d" | "90d"): DayRow[] {
  return range === "7d" ? SERIES_7 : range === "90d" ? SERIES_90 : SERIES_30;
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
