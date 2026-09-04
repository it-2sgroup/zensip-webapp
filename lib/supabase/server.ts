import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client phía server — dùng trong Server Component/Route Handler để đọc session hiện tại. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Gọi từ Server Component lúc render — bỏ qua an toàn,
            // middleware sẽ làm mới session ở request kế tiếp.
          }
        },
      },
    },
  );
}
