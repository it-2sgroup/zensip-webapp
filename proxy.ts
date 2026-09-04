import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

let warnedOnce = false;

/**
 * Đổi từ middleware.ts sang proxy.ts theo quy ước mới của Next 16.
 * Chặn mọi route (trừ /login và tài nguyên tĩnh) khi chưa đăng nhập.
 * Hệ thống nội bộ, không có đăng ký công khai — xem KIEN-TRUC-ZENSIP-WEBAPP.md mục 2.
 *
 * GIAI ĐOẠN HIỆN TẠI: project Supabase Auth cho Zensip CHƯA được tạo (đang chờ
 * quyết định — xem mục 8 tài liệu kiến trúc). Khi thiếu biến môi trường, cố ý
 * "fail open" (cho qua, không chặn) kèm cảnh báo console, để giao diện vẫn xem
 * thử được trong lúc dựng UI. Ngay khi NEXT_PUBLIC_SUPABASE_URL được cấu hình,
 * hành vi tự động chuyển về "fail closed" (chặn khi chưa đăng nhập) — không cần
 * sửa code gì thêm.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    if (!warnedOnce) {
      warnedOnce = true;
      console.warn(
        "[zensip/proxy] Chưa cấu hình NEXT_PUBLIC_SUPABASE_URL/PUBLISHABLE_KEY — " +
          "BỎ QUA kiểm tra đăng nhập (chế độ dựng giao diện). " +
          "KHÔNG dùng cấu hình này khi đã có dữ liệu thật.",
      );
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() xác thực token với Supabase Auth server — không dùng getSession()
  // vì session đọc thẳng từ cookie có thể đã bị giả mạo/hết hạn phía client.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
