"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Label, TextField } from "@/components/ui/primitives";
import { IconLock, ZensipMark } from "@/components/shell/icons";

/**
 * Giao diện đăng nhập. Chưa nối xác thực thật —
 * sẽ gắn Supabase Auth ở bước bảo mật (xem tài liệu kiến trúc).
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          onSubmit={(e) => {
            e.preventDefault();
            // Sẽ thay bằng signInWithPassword của Supabase Auth
          }}
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

          <div className="mb-5">
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

          <Button type="submit" className="w-full py-2.5">
            Đăng nhập
          </Button>

          <p className="mt-4 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--color-muted)]">
            <IconLock className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              Không có đăng ký công khai. Liên hệ quản trị viên để được cấp tài
              khoản.
            </span>
          </p>
        </form>

        <p className="mt-5 text-center text-[12.5px] text-[var(--color-muted)]">
          Đang dựng giao diện —{" "}
          <Link
            href="/dashboard"
            className="font-medium text-[var(--color-brand)] underline underline-offset-2"
          >
            xem thử hệ thống
          </Link>
        </p>
      </div>
    </main>
  );
}
