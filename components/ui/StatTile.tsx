import { cx } from "./primitives";
import { fmtPct } from "@/lib/format";

/**
 * Thẻ chỉ số. Con số là "biểu đồ" — không vẽ chart cho 1 giá trị đơn lẻ.
 * Biến động so kỳ trước luôn kèm mũi tên + chữ, không truyền đạt bằng màu đơn thuần.
 */
export function StatTile({
  label,
  value,
  delta,
  hint,
  /** true khi chỉ số tăng là xấu (ví dụ: tỷ lệ huỷ đơn, chi phí) */
  inverse = false,
  accent,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
  inverse?: boolean;
  accent?: string;
}) {
  const up = delta != null && delta > 0;
  const flat = delta != null && Math.abs(delta) < 0.05;
  const positive = inverse ? !up : up;

  return (
    <div className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_1px_2px_rgba(9,9,11,0.04)]">
      <div className="flex items-center gap-1.5">
        {accent && (
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: accent }}
          />
        )}
        <p className="truncate text-[12.5px] font-medium text-[var(--color-ink-2)]">
          {label}
        </p>
      </div>

      <p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.02em] text-[var(--color-ink)]">
        {value}
      </p>

      <div className="mt-2 flex min-h-[18px] items-center gap-1.5">
        {delta != null && (
          <span
            className={cx(
              "inline-flex items-center gap-0.5 text-[12px] font-medium",
              flat
                ? "text-[var(--color-muted)]"
                : positive
                  ? "text-[var(--color-good)]"
                  : "text-[var(--color-critical)]",
            )}
          >
            <span aria-hidden>{flat ? "→" : up ? "↑" : "↓"}</span>
            <span className="tnum">{fmtPct(Math.abs(delta))}</span>
          </span>
        )}
        {hint && (
          <span className="truncate text-[12px] text-[var(--color-muted)]">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
