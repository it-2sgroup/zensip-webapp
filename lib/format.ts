/** Định dạng số theo chuẩn Việt Nam — dùng chung toàn app. */

export const fmtInt = (n: number) => Math.round(n).toLocaleString("vi-VN");

/** 1.234.567 đ */
export const fmtVnd = (n: number) => `${fmtInt(n)} đ`;

/** Rút gọn cho trục biểu đồ và thẻ chỉ số: 1,2 tỷ · 340 tr · 12 ng */
export function fmtCompact(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1_000_000_000)
    return `${sign}${(a / 1_000_000_000).toFixed(a >= 10_000_000_000 ? 0 : 1).replace(".", ",")} tỷ`;
  if (a >= 1_000_000)
    return `${sign}${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1).replace(".", ",")} tr`;
  if (a >= 1_000)
    return `${sign}${(a / 1_000).toFixed(a >= 10_000 ? 0 : 1).replace(".", ",")} ng`;
  return `${sign}${fmtInt(a)}`;
}

/** 12,3% — dấu phẩy thập phân kiểu Việt Nam */
export const fmtPct = (n: number, digits = 1) =>
  `${n.toFixed(digits).replace(".", ",")}%`;

export const fmtNum = (n: number, digits = 2) =>
  n.toFixed(digits).replace(".", ",");

/** Chỉ lấy chữ số từ chuỗi người dùng gõ vào ô tiền */
export const parseMoney = (s: string) =>
  Number(String(s).replace(/[^\d]/g, "")) || 0;

/** 04/09 */
export const fmtDayMonth = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** Biến động so với kỳ trước, trả về null khi kỳ trước bằng 0 */
export function delta(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
