"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui/primitives";
import {
  IconAds,
  IconCalculator,
  IconClose,
  IconDashboard,
  IconStore,
  IconUsers,
  IconVideo,
  ZensipMark,
} from "./icons";
import { UserMenu } from "./UserMenu";

type Item = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  soon?: boolean;
};

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Phân tích",
    items: [
      { href: "/dashboard", label: "Tổng quan", icon: IconDashboard },
      { href: "/dashboard/san", label: "Vận hành sàn", icon: IconStore },
      { href: "/dashboard/quang-cao", label: "Quảng cáo", icon: IconAds, soon: true },
      { href: "/dashboard/booking", label: "Booking KOC", icon: IconUsers, soon: true },
    ],
  },
  {
    title: "Công cụ",
    items: [
      { href: "/tinh-loi-nhuan", label: "Tính lợi nhuận", icon: IconCalculator },
      { href: "/phan-tich-video", label: "Phân tích video", icon: IconVideo, soon: true },
    ],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Lớp phủ khi mở menu trên màn hình nhỏ */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden"
          aria-hidden
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-[var(--color-line)] bg-[var(--color-surface)]",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[57px] shrink-0 items-center justify-between gap-2 border-b border-[var(--color-line)] px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <ZensipMark className="h-[26px] w-[26px]" />
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
              Zensip
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)] lg:hidden"
          >
            <IconClose className="h-[18px] w-[18px]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((g) => (
            <div key={g.title} className="mb-5 last:mb-0">
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-muted)]">
                {g.title}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const active =
                    pathname === it.href ||
                    (it.href !== "/dashboard" && pathname.startsWith(it.href));
                  const Icon = it.icon;

                  if (it.soon) {
                    return (
                      <li key={it.href}>
                        <span
                          aria-disabled
                          title="Sắp có"
                          className="flex cursor-not-allowed items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13.5px] text-[var(--color-muted)] opacity-70"
                        >
                          <Icon className="h-[17px] w-[17px] shrink-0" />
                          <span className="truncate">{it.label}</span>
                          <span className="ml-auto shrink-0 rounded-full border border-[var(--color-line-strong)] px-1.5 py-px text-[10px] font-medium">
                            sắp có
                          </span>
                        </span>
                      </li>
                    );
                  }

                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13.5px] font-medium transition-colors",
                          active
                            ? "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                            : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]",
                        )}
                      >
                        <Icon className="h-[17px] w-[17px] shrink-0" />
                        <span className="truncate">{it.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-[var(--color-line)] p-3">
          <UserMenu />
        </div>
      </aside>
    </>
  );
}
