import { createBrowserClient } from "@supabase/ssr";

/**
 * Client trình duyệt — dùng cho project Supabase Auth riêng của Zensip.
 *
 * Trả về `null` khi chưa cấu hình biến môi trường (project Auth chưa được tạo —
 * xem KIEN-TRUC-ZENSIP-WEBAPP.md mục 8). `createBrowserClient` ném lỗi đồng bộ
 * ngay khi thiếu URL/key, nên PHẢI kiểm tra trước khi gọi — không được để lỗi
 * này lọt lên component, vì Sidebar gọi hàm này trên mọi trang.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
