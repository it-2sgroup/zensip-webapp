import { createBrowserClient } from "@supabase/ssr";

/** Client trình duyệt — dùng cho project Supabase Auth riêng của Zensip. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
