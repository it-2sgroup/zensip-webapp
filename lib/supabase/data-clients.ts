import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client đọc dữ liệu kinh doanh — KHÔNG phải project auth của Zensip.
 *
 * Dùng service_role vì hai project này (SAIZA, SISMO khách hàng) không cấp
 * anon key cho Zensip — Zensip chỉ đọc dữ liệu tổng hợp qua RPC, không cho
 * người dùng cuối truy vấn bảng thô trực tiếp từ trình duyệt.
 *
 * CHỈ import file này trong Server Component / Route Handler / Server Action.
 * `server-only` sẽ làm build lỗi nếu lỡ import vào code chạy ở client.
 */

let saizaClient: ReturnType<typeof createSupabaseClient> | null = null;
let sismoClient: ReturnType<typeof createSupabaseClient> | null = null;

/** Project SOVA (jjarzdxyarwobruzdqbg) — đơn hàng chi tiết TikTok + Shopee của SAIZA/SU. */
export function getSaizaClient() {
  if (!saizaClient) {
    saizaClient = createSupabaseClient(
      process.env.SAIZA_SUPABASE_URL!,
      process.env.SAIZA_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return saizaClient;
}

/** Project "SISMO - KHACH HANG" (cnlsipzreupurxptvbxt) — metrics tổng hợp đa khách, không có đơn chi tiết. */
export function getSismoClient() {
  if (!sismoClient) {
    sismoClient = createSupabaseClient(
      process.env.SISMO_SUPABASE_URL!,
      process.env.SISMO_SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return sismoClient;
}

/** UUID brand cố định trong project SOVA — xem docs/sql/0002_seed_brands.sql */
export const SAIZA_BRAND_ID = "00000000-0000-0000-0000-000000000010";
export const SU_BRAND_ID = "00000000-0000-0000-0000-000000000011";
