"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "./primitives";
import { useEscape, useScrollLock } from "@/components/charts/core/useChart";

/**
 * Bảng trượt bên phải — nơi xem chi tiết khi bấm vào một mark trên biểu đồ.
 *
 * Vì sao là drawer chứ không phải trang mới: người xem đang so sánh nhiều
 * hạng mục trên cùng một biểu đồ; chuyển trang làm mất ngữ cảnh đó. Drawer
 * giữ nguyên biểu đồ phía sau, đóng lại là quay về đúng chỗ đang nhìn.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEscape(open, onClose);
  useScrollLock(open);

  // Đưa tiêu điểm vào bảng khi mở, để người dùng bàn phím không bị "lạc"
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cx(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-[3px] transition-opacity duration-250",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx(
          "fixed inset-y-0 right-0 z-50 flex max-w-[92vw] flex-col border-l border-[var(--color-line)]",
          "bg-[var(--color-surface)] shadow-[-16px_0_48px_-16px_rgba(9,9,11,0.28)] outline-none",
          "transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width }}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold leading-snug tracking-[-0.015em] text-[var(--color-ink)]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-[12.5px] text-[var(--color-muted)]">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t border-[var(--color-line)] px-5 py-3">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}

/** Hàng nhãn — giá trị, dùng bên trong Drawer */
export function DetailRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "good" | "critical";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-line)] py-2 last:border-0">
      <span className="text-[12.5px] text-[var(--color-muted)]">{label}</span>
      <span
        className={cx(
          "tnum text-[13.5px] font-semibold",
          tone === "good"
            ? "text-[var(--color-good)]"
            : tone === "critical"
              ? "text-[var(--color-critical)]"
              : "text-[var(--color-ink)]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Tiêu đề nhóm bên trong Drawer */
export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
