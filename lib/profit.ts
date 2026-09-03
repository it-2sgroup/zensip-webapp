/**
 * Công thức tính lợi nhuận TikTok Shop.
 *
 * Trích ngược từ công cụ đang chạy thật tại
 * https://sismo.vn/tools/tinh-loi-nhuan-tiktok.html (04/09/2026)
 * — giữ nguyên từng phép tính để số ra khớp bản cũ.
 *
 * Bảng phí ngành hàng: lib/fee-tree.json
 *   FEE_TREE[cấp1][cấp2][cấp3] = [phí_shop_thường %, phí_shop_mall %]
 *   Nguồn: TikTok Shop VN Seller University.
 *   Áp dụng: shop thường từ 03/07/2026, shop Mall từ 03/08/2026.
 */

import feeTreeRaw from "./fee-tree.json";

export type FeeTree = Record<
  string,
  Record<string, Record<string, [number, number]>>
>;

// JSON được suy kiểu thành number[]; ép qua unknown để lấy đúng tuple [thường, mall]
export const FEE_TREE = feeTreeRaw as unknown as FeeTree;

export type ShopType = "std" | "mall";

/** Phí mặc định khi chưa chọn tới ngành cấp 3 */
export const DEFAULT_RATE: Record<ShopType, number> = { std: 14.0, mall: 16.0 };

/** Voucher Xtra bị chặn trần 50.000đ/sản phẩm */
export const VXP_CAP = 50_000;

export interface ProfitInput {
  /** Giá bán (đ) */
  price: number;
  /** Vốn sản phẩm (đ) */
  cost: number;
  /** Chi phí vận hành (đ) */
  ops: number;
  /** Chi phí marketing (đ) */
  mkt: number;

  /** % hoa hồng nền tảng — đã bao gồm ưu đãi shop mới nếu có */
  commRate: number;
  /** % phí giao dịch (mặc định 6) */
  txnRate: number;
  /** Phí xử lý đơn cố định (đ, mặc định 3.000) */
  orderFee: number;

  /** % Freeship Xtra (chỉ tính khi bật) */
  freeshipRate: number;
  freeshipOn: boolean;
  /** % Voucher Xtra (chỉ tính khi bật, trần 50.000đ) */
  vxpRate: number;
  vxpOn: boolean;
  /** % phí dịch vụ Flash Sale (chỉ tính khi bật) */
  flashRate: number;
  flashOn: boolean;
  /** % hoa hồng Affiliate/KOC */
  affRate: number;
}

export interface ProfitResult {
  price: number;
  commFee: number;
  txnFee: number;
  orderFee: number;
  freeFee: number;
  vxpFee: number;
  flashFee: number;
  affFee: number;
  /** Tổng phí trả cho sàn */
  platformFee: number;
  /** Vốn + vận hành + marketing + phí sàn */
  totalCost: number;
  /** Giá bán − tổng chi phí */
  profit: number;
  /** Biên lợi nhuận (%) */
  margin: number;
  /** Tiền nhận về từ sàn sau khi trừ phí sàn (chưa trừ chi phí shop) */
  netFromPlatform: number;
  /** Trần chi marketing để hoà vốn */
  breakevenMkt: number;
  /** ROAS tối thiểu để không lỗ — null khi không tính được */
  roas: number | null;
}

/** Phí gốc theo ngành đã chọn, chưa áp ưu đãi shop mới */
export function baseRate(
  shopType: ShopType,
  cat1: string,
  cat2: string,
  cat3: string,
): { rate: number; picked: boolean } {
  const leaf = FEE_TREE[cat1]?.[cat2]?.[cat3];
  if (cat1 && cat2 && cat3 && leaf) {
    return { rate: shopType === "mall" ? leaf[1] : leaf[0], picked: true };
  }
  return { rate: DEFAULT_RATE[shopType], picked: false };
}

/**
 * Ưu đãi shop mới: giảm 50% hoa hồng nhưng tối đa 3 điểm %.
 * Ví dụ phí 14% → giảm min(7, 3) = 3 → còn 11%.
 */
export function applyNewSellerDiscount(rate: number, on: boolean): number {
  if (!on) return rate;
  return Math.max(0, rate - Math.min(rate * 0.5, 3));
}

export function calcProfit(i: ProfitInput): ProfitResult {
  const P = i.price;

  const comm = (i.commRate || 0) / 100;
  const txn = (i.txnRate || 0) / 100;
  const orderFee = i.orderFee || 0;
  const freeship = i.freeshipOn ? (i.freeshipRate || 0) / 100 : 0;
  const vxp = i.vxpOn ? (i.vxpRate || 0) / 100 : 0;
  const flash = i.flashOn ? (i.flashRate || 0) / 100 : 0;
  const aff = (i.affRate || 0) / 100;

  const commFee = P * comm;
  const txnFee = P * txn;
  const freeFee = P * freeship;
  const vxpFee = vxp > 0 ? Math.min(P * vxp, VXP_CAP) : 0;
  const flashFee = P * flash;
  const affFee = P * aff;

  const platformFee =
    commFee + txnFee + orderFee + freeFee + vxpFee + flashFee + affFee;

  const totalCost = i.cost + i.ops + i.mkt + platformFee;
  const profit = P - totalCost;
  const margin = P > 0 ? (profit / P) * 100 : 0;
  const netFromPlatform = P - platformFee;

  const breakevenMkt = P - i.cost - i.ops - platformFee;
  const roas = P > 0 && breakevenMkt > 0 ? P / breakevenMkt : null;

  return {
    price: P,
    commFee,
    txnFee,
    orderFee,
    freeFee,
    vxpFee,
    flashFee,
    affFee,
    platformFee,
    totalCost,
    profit,
    margin,
    netFromPlatform,
    breakevenMkt,
    roas,
  };
}

export const DEFAULT_INPUT: ProfitInput = {
  price: 0,
  cost: 0,
  ops: 0,
  mkt: 0,
  commRate: DEFAULT_RATE.std,
  txnRate: 6,
  orderFee: 3000,
  freeshipRate: 5,
  freeshipOn: false,
  vxpRate: 4,
  vxpOn: false,
  flashRate: 3,
  flashOn: false,
  affRate: 0,
};
