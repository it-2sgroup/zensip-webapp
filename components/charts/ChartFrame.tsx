"use client";

import { useId, useState, type ReactNode } from "react";
import { cx } from "@/components/ui/primitives";

/**
 * Khung chung cho mọi biểu đồ.
 *
 * Bắt buộc theo quy tắc trực quan hoá: mỗi biểu đồ phải có "bản sao dạng bảng"
 * để giá trị không bao giờ chỉ đọc được bằng màu hoặc bằng tooltip.
 */
export function ChartFrame({
  title,
  hint,
  legend,
  chart,
  table,
  height = 260,
}: {
  title: string;
  hint?: string;
  legend?: ReactNode;
  chart: ReactNode;
  table: ReactNode;
  height?: number;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const id = useId();

  return (
    <section className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
            {title}
          </h2>
          {hint && (
            <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-muted)]">
              {hint}
            </p>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label={`Cách xem ${title}`}
          className="inline-flex shrink-0 rounded-[8px] border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] p-[3px]"
        >
          {(
            [
              ["chart", "Biểu đồ"],
              ["table", "Bảng"],
            ] as const
          ).map(([v, lbl]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={view === v}
              aria-controls={id}
              onClick={() => setView(v)}
              className={cx(
                "rounded-[5px] px-2.5 py-[3px] text-[12px] font-medium transition-colors",
                view === v
                  ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                  : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]",
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
      </header>

      {legend && view === "chart" && <div className="mb-3">{legend}</div>}

      <div id={id}>
        {view === "chart" ? (
          <div style={{ height }}>{chart}</div>
        ) : (
          <div className="max-h-[320px] overflow-auto">{table}</div>
        )}
      </div>
    </section>
  );
}

/** Chú giải — luôn hiện khi có từ 2 chuỗi trở lên, để danh tính không phụ thuộc màu */
export function Legend({
  items,
}: {
  items: { color: string; label: string; value?: string }[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
            style={{ background: it.color }}
          />
          <span className="text-[12.5px] text-[var(--color-ink-2)]">
            {it.label}
          </span>
          {it.value && (
            <span className="tnum text-[12.5px] font-medium text-[var(--color-ink)]">
              {it.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Hộp chú thích khi rê chuột — dùng chung cho mọi biểu đồ */
export function TooltipBox({
  title,
  rows,
  footer,
}: {
  title: string;
  rows: { color?: string; label: string; value: string }[];
  footer?: string;
}) {
  return (
    <div className="pointer-events-none rounded-[10px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 shadow-[0_6px_20px_rgba(9,9,11,0.13)]">
      <p className="mb-1.5 text-[12px] font-semibold text-[var(--color-ink)]">
        {title}
      </p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2 text-[12px]">
            {r.color && (
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ background: r.color }}
              />
            )}
            <span className="text-[var(--color-ink-2)]">{r.label}</span>
            <span className="tnum ml-auto font-medium text-[var(--color-ink)]">
              {r.value}
            </span>
          </li>
        ))}
      </ul>
      {footer && (
        <p className="mt-1.5 border-t border-[var(--color-line)] pt-1.5 text-[11.5px] text-[var(--color-muted)]">
          {footer}
        </p>
      )}
    </div>
  );
}

/** Bảng dữ liệu dùng chung cho chế độ xem "Bảng" */
export function DataTable({
  head,
  rows,
}: {
  head: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead className="sticky top-0 bg-[var(--color-surface)]">
        <tr>
          {head.map((h, i) => (
            <th
              key={h}
              scope="col"
              className={cx(
                "border-b border-[var(--color-line-strong)] py-2 text-[12px] font-semibold text-[var(--color-ink-2)]",
                i === 0 ? "text-left" : "text-right",
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri} className="border-b border-[var(--color-line)] last:border-0">
            {r.map((c, ci) => (
              <td
                key={ci}
                className={cx(
                  "py-[7px]",
                  ci === 0
                    ? "text-left text-[var(--color-ink)]"
                    : "tnum text-right text-[var(--color-ink-2)]",
                )}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
