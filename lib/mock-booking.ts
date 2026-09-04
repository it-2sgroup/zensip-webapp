/**
 * Dữ liệu Booking KOC.
 *
 * Toàn bộ con số dưới đây lấy nguyên văn từ tài liệu
 * "TỔNG HỢP CHỈ SỐ BÁO CÁO / DASHBOARD_SAIZA" — Phòng Vận hành Saiza,
 * cập nhật 14/08/2026, Phần 3 (Chỉ số Booking). Không tự bịa số, để khi
 * đối chiếu với báo cáo giấy của phòng vận hành là khớp.
 *
 * 4 sản phẩm: VSLG (vệ sinh lồng giặt), TQA (tẩy quần áo),
 *             XNB/XDN (xịt nhà bếp), MLS (miếng lau sàn).
 * 4 hình thức: FREECAST, MINICAST, CAST, CỘNG ĐỒNG.
 */

export const BUDGET = {
  /** Ngân sách booking cả tháng, đã gồm dự phòng */
  total: 60_000_000,
  byProduct: [
    { code: "TQA", name: "Tẩy quần áo", spent: 22_241_000 },
    { code: "VSLG", name: "Vệ sinh lồng giặt", spent: 6_750_000 },
    { code: "XNB", name: "Xịt nhà bếp", spent: 2_990_000 },
    { code: "MLS", name: "Miếng lau sàn", spent: 0 },
  ],
};

export const BUDGET_SPENT = BUDGET.byProduct.reduce((s, p) => s + p.spent, 0); // 31.981.000
export const BUDGET_PCT = (BUDGET_SPENT / BUDGET.total) * 100; // ≈ 53%

/* ── KPI hành động theo chiến dịch ──────────────────────────
   3 chỉ số: số lượng KOC · số video chốt hợp tác · số video đã đăng (air).
   "—" trong tài liệu nghĩa là hình thức đó không đặt kế hoạch trước
   (Freecast và Cộng đồng chạy theo cơ hội, không giao chỉ tiêu).        */

export interface CampaignKpi {
  product: string;
  format: string;
  /** Kế hoạch: số KOC / số video chốt. null = không giao chỉ tiêu */
  planKoc: number | null;
  planVideo: number | null;
  actualKoc: number;
  actualVideoClosed: number;
  actualVideoAired: number;
}

export const CAMPAIGN_KPI: CampaignKpi[] = [
  { product: "VSLG", format: "Freecast", planKoc: null, planVideo: null, actualKoc: 30, actualVideoClosed: 135, actualVideoAired: 85 },
  { product: "VSLG", format: "Minicast + Cast", planKoc: 36, planVideo: 172, actualKoc: 13, actualVideoClosed: 47, actualVideoAired: 42 },
  { product: "VSLG", format: "Cộng đồng", planKoc: null, planVideo: null, actualKoc: 31, actualVideoClosed: 155, actualVideoAired: 130 },
  { product: "TQA", format: "Freecast", planKoc: null, planVideo: null, actualKoc: 16, actualVideoClosed: 79, actualVideoAired: 63 },
  { product: "TQA", format: "Minicast", planKoc: 17, planVideo: 85, actualKoc: 16, actualVideoClosed: 207, actualVideoAired: 181 },
  { product: "TQA", format: "Cộng đồng", planKoc: null, planVideo: null, actualKoc: 19, actualVideoClosed: 93, actualVideoAired: 65 },
  { product: "XNB", format: "Freecast", planKoc: null, planVideo: null, actualKoc: 35, actualVideoClosed: 160, actualVideoAired: 120 },
  { product: "XNB", format: "Minicast", planKoc: 15, planVideo: 75, actualKoc: 12, actualVideoClosed: 68, actualVideoAired: 47 },
  { product: "XNB", format: "Cộng đồng", planKoc: null, planVideo: null, actualKoc: 34, actualVideoClosed: 163, actualVideoAired: 115 },
];

/** Tổng theo tài liệu: KH 68 KOC / 332 video · TT 206 KOC / 1.107 chốt / 848 air */
export const KPI_TOTAL = {
  planKoc: 68,
  planVideo: 332,
  actualKoc: CAMPAIGN_KPI.reduce((s, r) => s + r.actualKoc, 0),
  actualVideoClosed: CAMPAIGN_KPI.reduce((s, r) => s + r.actualVideoClosed, 0),
  actualVideoAired: CAMPAIGN_KPI.reduce((s, r) => s + r.actualVideoAired, 0),
};

/* ── Tiến độ theo nhân sự ───────────────────────────────────
   Phòng booking hiện có 2 nhân sự. Số của Lê Thu Hằng lấy nguyên
   bảng ví dụ trong tài liệu; phần còn lại của tổng suy ra cho
   Nguyễn Thị Phương Ánh.                                              */

export interface StaffRow {
  staff: string;
  product: string;
  format: string;
  koc: number;
  videoClosed: number;
  videoAired: number;
}

export const STAFF_DETAIL: StaffRow[] = [
  { staff: "Lê Thu Hằng", product: "VSLG", format: "Freecast", koc: 20, videoClosed: 86, videoAired: 50 },
  { staff: "Lê Thu Hằng", product: "VSLG", format: "Minicast", koc: 6, videoClosed: 22, videoAired: 17 },
  { staff: "Lê Thu Hằng", product: "VSLG", format: "Cộng đồng", koc: 15, videoClosed: 75, videoAired: 75 },
  { staff: "Lê Thu Hằng", product: "TQA", format: "Freecast", koc: 12, videoClosed: 66, videoAired: 60 },
  { staff: "Lê Thu Hằng", product: "TQA", format: "Minicast", koc: 6, videoClosed: 38, videoAired: 28 },
  { staff: "Lê Thu Hằng", product: "TQA", format: "Cộng đồng", koc: 9, videoClosed: 45, videoAired: 35 },
  { staff: "Lê Thu Hằng", product: "XNB", format: "Freecast", koc: 22, videoClosed: 105, videoAired: 95 },
  { staff: "Lê Thu Hằng", product: "XNB", format: "Minicast", koc: 7, videoClosed: 35, videoAired: 27 },
  { staff: "Lê Thu Hằng", product: "XNB", format: "Cộng đồng", koc: 8, videoClosed: 40, videoAired: 35 },
];

export const STAFF_SUMMARY = [
  { staff: "Lê Thu Hằng", koc: 105, videoClosed: 512, videoAired: 422, prevKoc: 88, prevVideoAired: 351 },
  {
    staff: "Nguyễn Thị Phương Ánh",
    koc: KPI_TOTAL.actualKoc - 105,
    videoClosed: KPI_TOTAL.actualVideoClosed - 512,
    videoAired: KPI_TOTAL.actualVideoAired - 422,
    prevKoc: 112,
    prevVideoAired: 466,
  },
];

/* ── KPI doanh thu theo SKU ─────────────────────────────────── */

export const GMV_TARGETS = [
  { sku: "Combo 3 gói bột VSLG Saiza", target: 700_000_000, actual: 486_200_000 },
  { sku: "Combo 2 tẩy mốc quần áo Saiza", target: 200_000_000, actual: 312_800_000 },
  { sku: "Xịt nhà bếp Saiza", target: 200_000_000, actual: 208_450_000 },
];

export const GMV_TOTAL_TARGET = GMV_TARGETS.reduce((s, r) => s + r.target, 0); // 1,1 tỷ

/* ── Phễu tìm kiếm & chốt KOC (báo cáo tuần) ───────────────── */

export const KOC_FUNNEL = [
  { label: "KOC tiếp cận trong tuần", value: 412 },
  { label: "KOC phản hồi", value: 268 },
  { label: "KOC chốt hợp tác", value: 96 },
  { label: "Đã gửi mẫu / duyệt mẫu", value: 74 },
  { label: "Video đã đăng", value: 58 },
];
