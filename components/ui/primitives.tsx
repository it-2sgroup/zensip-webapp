import type { ReactNode } from "react";

export function cx(...v: (string | false | null | undefined)[]) {
  return v.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cx(
        "rounded-[14px] border border-[var(--color-line)] bg-[var(--color-surface)]",
        "shadow-[0_1px_2px_rgba(9,9,11,0.04)]",
        padded && "p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-start justify-between gap-4">
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
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/** Nhãn nhỏ phía trên ô nhập */
export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-ink-2)]"
    >
      {children}
      {hint && (
        <span className="ml-1.5 font-normal text-[var(--color-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

const fieldBase =
  "w-full rounded-[9px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] " +
  "px-3 py-2 text-[14px] text-[var(--color-ink)] transition-colors " +
  "placeholder:text-[var(--color-muted)] " +
  "hover:border-[var(--color-brand)]/40 focus:border-[var(--color-brand)] focus:outline-none " +
  "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-1";

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={cx(fieldBase, className)} />;
}

export function SelectField(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className, children, ...rest } = props;
  return (
    <select
      {...rest}
      className={cx(
        fieldBase,
        "appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-9",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

/** Công tắc bật/tắt — dùng cho các chương trình khuyến mãi của sàn */
export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-150",
        checked
          ? "bg-[var(--color-brand)]"
          : "bg-[var(--color-line-strong)] hover:bg-[var(--color-axis)]",
      )}
    >
      <span
        className={cx(
          "absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150",
          checked ? "translate-x-[19px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

/** Nhóm nút chọn 1 trong N */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-[9px] border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] p-[3px]"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx(
              "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-colors",
              active
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      {...rest}
      className={cx(
        "rounded-[9px] px-3.5 py-2 text-[13.5px] font-medium transition-colors disabled:opacity-50",
        variant === "primary" &&
          "bg-[var(--color-brand)] text-[var(--color-on-brand)] hover:bg-[var(--color-brand-hover)]",
        variant === "ghost" &&
          "border border-[var(--color-line-strong)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Nhãn trạng thái — luôn kèm chữ, không bao giờ chỉ dùng màu */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "critical" | "warning";
}) {
  const tones = {
    neutral:
      "border-[var(--color-line-strong)] text-[var(--color-ink-2)] bg-[var(--color-surface-2)]",
    good: "border-[var(--color-good)]/30 text-[var(--color-good)] bg-[var(--color-good)]/8",
    warning:
      "border-[var(--color-warning)]/40 text-[#8a6100] dark:text-[var(--color-warning)] bg-[var(--color-warning)]/10",
    critical:
      "border-[var(--color-critical)]/30 text-[var(--color-critical)] bg-[var(--color-critical)]/8",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11.5px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
