"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, Label, TextField } from "@/components/ui/primitives";
import { IconLock, ZensipMark } from "@/components/shell/icons";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      setError("Hệ thống đăng nhập chưa được cấu hình. Liên hệ quản trị viên.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng."
          : "Có lỗi khi đăng nhập. Thử lại sau.",
      );
      return;
    }

    router.replace(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <ZensipMark className="h-11 w-11" />
          <h1 className="mt-4 text-[21px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Đăng nhập Zensip
          </h1>
          <p className="mt-1.5 text-[13px] text-[var(--color-muted)]">
            Hệ thống nội bộ — chỉ dành cho tài khoản được cấp
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[0_1px_3px_rgba(9,9,11,0.05)]"
        >
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <TextField
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ban@sismo.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <TextField
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="mb-3 text-[12.5px] text-[var(--color-critical)]">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-3 w-full py-2.5">
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>

          <p className="mt-4 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--color-muted)]">
            <IconLock className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              Không có đăng ký công khai. Liên hệ quản trị viên để được cấp tài
              khoản.
            </span>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
