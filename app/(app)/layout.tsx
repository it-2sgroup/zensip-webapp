"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { IconMenu } from "@/components/shell/icons";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/dashboard/san": "Vận hành sàn",
  "/dashboard/quang-cao": "Quảng cáo",
  "/dashboard/booking": "Booking KOC",
  "/tinh-loi-nhuan": "Tính lợi nhuận",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-dvh">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-h-dvh flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[57px] shrink-0 items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-page)]/82 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Mở menu"
            className="grid h-9 w-9 place-items-center rounded-[9px] border border-[var(--color-line-strong)] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-surface-2)] lg:hidden"
          >
            <IconMenu className="h-[18px] w-[18px]" />
          </button>

          <span className="truncate text-[13.5px] font-medium text-[var(--color-ink-2)] lg:hidden">
            {PAGE_TITLES[pathname] ?? "Zensip"}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* key theo đường dẫn → mỗi lần đổi trang nội dung mờ dần hiện lên,
            giúp người dùng nhận ra trang đã đổi thay vì nhảy đột ngột */}
        <main
          key={pathname}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
          style={{ animation: "zs-fade-up 260ms cubic-bezier(0.32,0.72,0,1) both" }}
        >
          {children}
        </main>

        <footer className="shrink-0 border-t border-[var(--color-line)] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="text-[11.5px] text-[var(--color-muted)]">
              <span className="font-medium text-[var(--color-ink-2)]">Zensip</span> · Hệ thống nội bộ SISMO
            </p>
            <p className="text-[11.5px] text-[var(--color-muted)]">
              Nguồn dữ liệu: TikTok Shop · Shopee · cập nhật tới 02/09/2026
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
