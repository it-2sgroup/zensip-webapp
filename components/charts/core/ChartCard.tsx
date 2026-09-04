"use client";

import { useId, useState, type ReactNode } from "react";
import { cx } from "@/components/ui/primitives";

/**
 * Khung chung cho mọi biểu đồ.
 *
 * Ba thứ bắt buộc ở mọi thẻ biểu đồ:
 *  1. Tiêu đề nói rõ đang xem gì.
 *  2. Chế độ xem "Bảng" — để giá trị không bao giờ chỉ đọc được bằng màu/hover.
 *  3. Ô "điểm nhấn" (insight) — câu kết luận rút ra từ biểu đồ, viết sẵn bằng
 *     chữ. Sếp đọc một dòng là hiểu, không phải tự dò biểu đồ.
 */
export function ChartCard({
  title,
  hint,
  insight,
  insightTone = "neutral",
  legend,
  action,
  chart,
  table,
  className,
}: {
  title: string;
  hint?: string;
  insight?: ReactNode;
  insightTone?: "neutral" | "good" | "warning" | "critical";
  legend?: ReactNode;
  action?: ReactNode;
  chart: ReactNode;
  table: ReactNode;
  className?: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const id = useId();

  const tone = {
    neutral: "border-[var(--color-line)] bg-[var(--color-surface-2)] text-[var(--color-ink-2)]",
    good: "border-[var(--color-good)]/25 bg-[var(--color-good)]/8 text-[var(--color-ink-2)]",
    warning: "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/8 text-[var(--color-ink-2)]",
    critical: "border-[var(--color-critical)]/25 bg-[var(--color-critical)]/8 text-[var(--color-ink-2)]",
  }[insightTone];

  return (
    <section
      className={cx(
        "group/card rounded-[15px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5",
        "shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-shadow duration-200",
        "hover:shadow-[0_4px_18px_-6px_rgba(9,9,11,0.12)]",
        className,
      )}
    >
      <header className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.012em] text-[var(--color-ink)]">
            {title}
          </h2>
          {hint && (
            <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-muted)]">
              {hint}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {action}
          <div
            role="radiogroup"
            aria-label={`Cách xem ${title}`}
            className="inline-flex rounded-[8px] border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] p-[3px]"
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
                  "rounded-[5px] px-2.5 py-[3px] text-[12px] font-medium transition-all duration-150",
                  view === v
                    ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[0_1px_2px_rgba(9,9,11,0.09)]"
                    : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]",
                )}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </header>

      {legend && view === "chart" && <div className="mb-3">{legend}</div>}

      <div id={id}>
        {view === "chart" ? chart : <div className="max-h-[340px] overflow-auto">{table}</div>}
      </div>

      {insight && view === "chart" && (
        <p
          className={cx(
            "mt-3.5 rounded-[10px] border px-3 py-2 text-[12.5px] leading-relaxed",
            tone,
          )}
        >
          {insight}
        </p>
      )}
    </section>
  );
}
