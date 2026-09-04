"use client";

import type { ReactNode } from "react";
import { cx } from "@/components/ui/primitives";

/* ══════════════════════════════════════════════════════════
   Các mảnh dùng lại cho mọi biểu đồ: trục, lưới, chú giải,
   tooltip nổi, nhãn chú thích điểm nhấn.
   ══════════════════════════════════════════════════════════ */

export const CHART_COLORS = {
  s1: "var(--color-s1)",
  s2: "var(--color-s2)",
  s3: "var(--color-s3)",
  s4: "var(--color-s4)",
  s5: "var(--color-s5)",
  s6: "var(--color-s6)",
  s7: "var(--color-s7)",
  s8: "var(--color-s8)",
  grid: "var(--color-grid)",
  axis: "var(--color-axis)",
  surface: "var(--color-surface)",
  muted: "var(--color-muted)",
  good: "var(--color-good)",
  warning: "var(--color-warning)",
  critical: "var(--color-critical)",
} as const;

/** Lưới ngang mảnh + nhãn trục Y. Lưới luôn là nét liền, lùi về sau dữ liệu. */
export function GridY({
  ticks,
  scale,
  x0,
  x1,
  format,
}: {
  ticks: number[];
  scale: (v: number) => number;
  x0: number;
  x1: number;
  format: (v: number) => string;
}) {
  return (
    <g aria-hidden>
      {ticks.map((t) => {
        const y = scale(t);
        return (
          <g key={t}>
            <line
              x1={x0}
              x2={x1}
              y1={y}
              y2={y}
              stroke={CHART_COLORS.grid}
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
            <text
              x={x0 - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
              fill={CHART_COLORS.muted}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {format(t)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Nhãn trục X — tự thưa bớt để không chồng chữ lên nhau. */
export function AxisX({
  labels,
  xOf,
  y,
  maxLabels = 8,
  highlightIndex,
}: {
  labels: string[];
  xOf: (i: number) => number;
  y: number;
  maxLabels?: number;
  highlightIndex?: number | null;
}) {
  const stride = Math.max(1, Math.ceil(labels.length / maxLabels));
  return (
    <g aria-hidden>
      {labels.map((lb, i) => {
        const show = i % stride === 0 || i === labels.length - 1;
        const active = highlightIndex === i;
        if (!show && !active) return null;
        return (
          <text
            key={i}
            x={xOf(i)}
            y={y}
            textAnchor="middle"
            fontSize={11}
            fill={active ? "var(--color-ink)" : CHART_COLORS.muted}
            fontWeight={active ? 600 : 400}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {lb}
          </text>
        );
      })}
    </g>
  );
}

/** Vạch dọc bám con trỏ. */
export function Crosshair({
  x,
  y0,
  y1,
}: {
  x: number;
  y0: number;
  y1: number;
}) {
  return (
    <line
      x1={x}
      x2={x}
      y1={y0}
      y2={y1}
      stroke={CHART_COLORS.axis}
      strokeWidth={1}
      pointerEvents="none"
      shapeRendering="crispEdges"
    />
  );
}

/**
 * Đường mốc tham chiếu (mục tiêu, trung bình…) — luôn kèm nhãn chữ,
 * vì một đường không tên thì người đọc phải đoán nó là gì.
 */
export function ReferenceLine({
  y,
  x0,
  x1,
  label,
  color = CHART_COLORS.axis,
}: {
  y: number;
  x0: number;
  x1: number;
  label: string;
  color?: string;
}) {
  return (
    <g pointerEvents="none">
      <line x1={x0} x2={x1} y1={y} y2={y} stroke={color} strokeWidth={1.5} strokeOpacity={0.65} />
      <text
        x={x1 - 4}
        y={y - 5}
        textAnchor="end"
        fontSize={10.5}
        fontWeight={600}
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * Chú thích điểm nhấn — mũi tên + chữ trỏ vào một điểm cụ thể.
 * Đây là thứ biến biểu đồ "có số" thành biểu đồ "có thông điệp":
 * sếp nhìn vào là thấy ngay điều đáng chú ý mà không cần dò.
 */
export function Annotation({
  x,
  y,
  text,
  align = "above",
  color = "var(--color-ink)",
}: {
  x: number;
  y: number;
  text: string;
  align?: "above" | "below";
  color?: string;
}) {
  const dy = align === "above" ? -1 : 1;
  const textY = y + dy * 26;
  return (
    <g pointerEvents="none">
      <line
        x1={x}
        x2={x}
        y1={y + dy * 9}
        y2={y + dy * 20}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.5}
      />
      <text
        x={x}
        y={textY}
        textAnchor="middle"
        dominantBaseline={align === "above" ? "auto" : "hanging"}
        fontSize={11}
        fontWeight={600}
        fill={color}
        stroke="var(--color-surface)"
        strokeWidth={3.5}
        paintOrder="stroke"
        style={{ letterSpacing: "-0.01em" }}
      >
        {text}
      </text>
    </g>
  );
}

/* ── Tooltip nổi ─────────────────────────────────────────── */

export interface TipRow {
  color?: string;
  label: string;
  value: string;
  /** dòng phụ nhỏ dưới giá trị */
  sub?: string;
}

/**
 * Hộp chú thích bám con trỏ.
 *
 * Đặc tả: GIÁ TRỊ là thứ đậm nhất (người đọc đã biết series, họ cần con số),
 * tên series đi kèm một vạch màu ngắn. Tooltip không bao giờ là cách DUY NHẤT
 * đọc được số — mọi biểu đồ đều có chế độ xem Bảng.
 */
export function FloatingTip({
  x,
  y,
  containerWidth,
  title,
  rows,
  footer,
}: {
  x: number;
  y: number;
  containerWidth: number;
  title: string;
  rows: TipRow[];
  footer?: string;
}) {
  const W = 210;
  // Lật sang trái khi sắp tràn mép phải
  const flip = x + W + 18 > containerWidth;
  const left = flip ? x - W - 14 : x + 14;

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 rounded-[11px] border border-[var(--color-line-strong)] bg-[var(--color-surface)]/97 px-3 py-2.5 shadow-[0_10px_34px_-8px_rgba(9,9,11,0.28)] backdrop-blur-sm"
      style={{
        left: Math.max(4, left),
        top: Math.max(4, y - 14),
        width: W,
        transition: "left 90ms ease-out, top 90ms ease-out",
      }}
    >
      <p className="mb-2 text-[11.5px] font-medium tracking-[0.01em] text-[var(--color-muted)]">
        {title}
      </p>
      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <li key={i} className="flex items-baseline gap-2">
            {r.color && (
              <span
                aria-hidden
                className="mt-[5px] h-[3px] w-3 shrink-0 rounded-full"
                style={{ background: r.color }}
              />
            )}
            <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--color-ink-2)]">
              {r.label}
            </span>
            <span className="shrink-0 text-right">
              <span className="tnum block text-[13px] font-semibold leading-tight text-[var(--color-ink)]">
                {r.value}
              </span>
              {r.sub && (
                <span className="tnum block text-[10.5px] leading-tight text-[var(--color-muted)]">
                  {r.sub}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {footer && (
        <p className="mt-2 border-t border-[var(--color-line)] pt-1.5 text-[11px] text-[var(--color-muted)]">
          {footer}
        </p>
      )}
    </div>
  );
}

/* ── Chú giải ────────────────────────────────────────────── */

export interface LegendItem {
  color: string;
  label: string;
  value?: string;
  /** kiểu mark: đường cho biểu đồ đường, ô cho cột/vùng */
  shape?: "line" | "rect";
}

/**
 * Chú giải — bắt buộc khi có từ 2 series. Bấm vào để tách riêng series
 * (làm mờ các series còn lại), bấm lại để bỏ chọn.
 */
export function Legend({
  items,
  isolated,
  onIsolate,
}: {
  items: LegendItem[];
  isolated?: string | null;
  onIsolate?: (label: string | null) => void;
}) {
  const interactive = Boolean(onIsolate);
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => {
        const dim = isolated != null && isolated !== it.label;
        const content = (
          <>
            <span
              aria-hidden
              className={cx(
                "shrink-0",
                it.shape === "line"
                  ? "h-[3px] w-3.5 rounded-full"
                  : "h-2.5 w-2.5 rounded-[3px]",
              )}
              style={{ background: it.color }}
            />
            <span className="text-[12.5px] text-[var(--color-ink-2)]">{it.label}</span>
            {it.value && (
              <span className="tnum text-[12.5px] font-semibold text-[var(--color-ink)]">
                {it.value}
              </span>
            )}
          </>
        );

        return (
          <li key={it.label}>
            {interactive ? (
              <button
                type="button"
                onClick={() => onIsolate?.(isolated === it.label ? null : it.label)}
                aria-pressed={isolated === it.label}
                className={cx(
                  "flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-opacity duration-150",
                  "hover:bg-[var(--color-surface-2)]",
                  dim && "opacity-38",
                )}
              >
                {content}
              </button>
            ) : (
              <span className="flex items-center gap-1.5">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Bảng dữ liệu — bản sao WCAG-sạch của mọi biểu đồ */
export function DataTable({
  head,
  rows,
  highlightRow,
}: {
  head: string[];
  rows: (string | ReactNode)[][];
  highlightRow?: number;
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
                "whitespace-nowrap border-b border-[var(--color-line-strong)] py-2 text-[12px] font-semibold text-[var(--color-ink-2)]",
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
          <tr
            key={ri}
            className={cx(
              "border-b border-[var(--color-line)] last:border-0",
              highlightRow === ri && "bg-[var(--color-brand-soft)]",
            )}
          >
            {r.map((c, ci) => (
              <td
                key={ci}
                className={cx(
                  "py-[7px]",
                  ci === 0
                    ? "text-left text-[var(--color-ink)]"
                    : "tnum whitespace-nowrap text-right text-[var(--color-ink-2)]",
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
