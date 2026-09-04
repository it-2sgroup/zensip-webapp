"use client";

import { useState } from "react";
import { cx } from "@/components/ui/primitives";
import { CHART_COLORS } from "./core/Parts";

/* ══════════════════════════════════════════════════════════
   Nhóm biểu đồ "thực tế so với mục tiêu".
   Đây là câu hỏi trung tâm của mọi báo cáo vận hành:
   đang ở đâu so với chỗ đáng lẽ phải tới?
   ══════════════════════════════════════════════════════════ */

export interface BulletRow {
  label: string;
  sub?: string;
  actual: number;
  target: number;
  /** màu thanh; mặc định tự chọn theo mức đạt mục tiêu */
  color?: string;
}

/**
 * BULLET CHART (Stephen Few, 2005) — chuẩn mực để thay đồng hồ đo.
 *
 * Mỗi dòng: thanh đặc = thực tế, vạch dọc đậm = mục tiêu, nền nhạt = thang đo.
 * Đọc được ngay "vượt hay hụt" mà không tốn diện tích như đồng hồ tròn,
 * và xếp chồng nhiều dòng vẫn so sánh được với nhau.
 */
export function BulletChart({
  rows,
  format,
  /** dòng cần làm nổi bật (điểm nhấn) */
  focusIndex,
  onSelect,
}: {
  rows: BulletRow[];
  format: (v: number) => string;
  focusIndex?: number;
  onSelect?: (i: number) => void;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  // Thang đo dùng chung để các dòng so sánh được với nhau
  const scaleMax = Math.max(...rows.flatMap((r) => [r.actual, r.target])) * 1.12 || 1;

  return (
    <ul className="space-y-3">
      {rows.map((r, i) => {
        const pct = r.target > 0 ? (r.actual / r.target) * 100 : 0;
        const hit = pct >= 100;
        const near = pct >= 80 && pct < 100;
        const color =
          r.color ??
          (hit ? CHART_COLORS.good : near ? CHART_COLORS.warning : CHART_COLORS.critical);
        const focus = focusIndex === i;
        const hovered = hoverIdx === i;

        return (
          <li
            key={r.label}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            onClick={() => onSelect?.(i)}
            className={cx(
              "rounded-[9px] px-2 py-1.5 transition-colors duration-150",
              onSelect && "cursor-pointer",
              (hovered || focus) && "bg-[var(--color-surface-2)]",
            )}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={cx(
                    "truncate text-[13px]",
                    focus
                      ? "font-semibold text-[var(--color-ink)]"
                      : "font-medium text-[var(--color-ink-2)]",
                  )}
                >
                  {r.label}
                </p>
                {r.sub && (
                  <p className="truncate text-[11px] text-[var(--color-muted)]">{r.sub}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="tnum text-[13px] font-semibold text-[var(--color-ink)]">
                  {format(r.actual)}
                </span>
                <span className="tnum ml-1.5 text-[11.5px] text-[var(--color-muted)]">
                  / {format(r.target)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative h-[13px] flex-1 overflow-hidden rounded-[4px] bg-[var(--color-surface-2)]">
                {/* Thang nền: 3 vùng chất lượng, đậm dần — giúp ước lượng mà không cần trục */}
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--color-line)]"
                  style={{ width: `${(r.target * 0.5 / scaleMax) * 100}%` }}
                />
                <div
                  className="absolute inset-y-0 bg-[var(--color-line)]/60"
                  style={{
                    left: `${(r.target * 0.5 / scaleMax) * 100}%`,
                    width: `${(r.target * 0.35 / scaleMax) * 100}%`,
                  }}
                />
                {/* Thanh thực tế */}
                <div
                  className="absolute inset-y-[3px] left-0 rounded-[3px] transition-[width] duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, (r.actual / scaleMax) * 100)}%`,
                    background: color,
                    opacity: hoverIdx != null && !hovered ? 0.5 : 1,
                  }}
                />
                {/* Vạch mục tiêu — dày 2px, màu mực, đọc được trên mọi nền */}
                <div
                  className="absolute inset-y-0 w-[2px] bg-[var(--color-ink)]"
                  style={{ left: `${(r.target / scaleMax) * 100}%` }}
                  title={`Mục tiêu ${format(r.target)}`}
                />
              </div>

              <span
                className="tnum w-[52px] shrink-0 text-right text-[12px] font-semibold"
                style={{ color }}
              >
                {pct.toFixed(0).replace(".", ",")}%
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────── */

export interface FunnelStage {
  label: string;
  value: number;
  color?: string;
}

/**
 * FUNNEL — theo dõi hao hụt qua từng bước của quy trình.
 *
 * Tỷ lệ chuyển đổi giữa hai bước liền nhau được ghi thẳng lên chỗ thắt,
 * vì đó mới là con số người vận hành cần, không phải chiều rộng hình thang.
 * Bước rớt mạnh nhất được tô đỏ làm điểm nhấn.
 */
export function FunnelChart({
  stages,
  format,
}: {
  stages: FunnelStage[];
  format: (v: number) => string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const max = stages[0]?.value || 1;

  // Bước hao hụt nặng nhất = điểm nghẽn cần chú ý
  let worstDrop = -1;
  let worstRate = 1;
  stages.forEach((s, i) => {
    if (i === 0) return;
    const rate = stages[i - 1].value > 0 ? s.value / stages[i - 1].value : 1;
    if (rate < worstRate) {
      worstRate = rate;
      worstDrop = i;
    }
  });

  return (
    <ul className="space-y-1">
      {stages.map((s, i) => {
        const w = (s.value / max) * 100;
        const prev = i > 0 ? stages[i - 1].value : null;
        const rate = prev && prev > 0 ? (s.value / prev) * 100 : null;
        const isWorst = i === worstDrop;
        const hovered = hoverIdx === i;

        return (
          <li key={s.label}>
            {rate != null && (
              <div className="flex items-center gap-2 py-0.5 pl-1">
                <span
                  aria-hidden
                  className="text-[10px]"
                  style={{ color: isWorst ? CHART_COLORS.critical : CHART_COLORS.muted }}
                >
                  ↓
                </span>
                <span
                  className={cx("tnum text-[11.5px]", isWorst ? "font-semibold" : "")}
                  style={{ color: isWorst ? CHART_COLORS.critical : CHART_COLORS.muted }}
                >
                  {rate.toFixed(1).replace(".", ",")}%
                  {isWorst && " · rớt mạnh nhất"}
                </span>
              </div>
            )}

            <div
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              className="flex items-center gap-3 rounded-[8px] px-1 py-1 transition-colors hover:bg-[var(--color-surface-2)]"
            >
              <div className="relative h-9 flex-1">
                <div
                  className="absolute inset-y-0 left-0 rounded-[6px] transition-all duration-500 ease-out"
                  style={{
                    width: `${w}%`,
                    background: s.color ?? CHART_COLORS.s1,
                    opacity: hoverIdx != null && !hovered ? 0.55 : isWorst ? 1 : 0.9,
                  }}
                />
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <span className="text-[12.5px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                    {s.label}
                  </span>
                </div>
              </div>
              <span className="tnum w-[74px] shrink-0 text-right text-[13.5px] font-semibold text-[var(--color-ink)]">
                {format(s.value)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────── */

export interface DivergingRow {
  label: string;
  /** chênh lệch so với mốc 0 — dương sang phải, âm sang trái */
  value: number;
}

/**
 * DIVERGING BAR — chênh lệch so với một mốc chuẩn.
 *
 * Mốc 0 nằm giữa, hai cực dùng hai màu đối lập (ấm/lạnh) để "hơn" và "kém"
 * đọc được tức thì mà không cần đọc dấu.
 */
export function DivergingBars({
  rows,
  format,
  positiveLabel = "Vượt",
  negativeLabel = "Hụt",
}: {
  rows: DivergingRow[];
  format: (v: number) => string;
  positiveLabel?: string;
  negativeLabel?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.value))) || 1;

  return (
    <div>
      <div className="mb-2 flex items-center justify-center gap-4 text-[11.5px] text-[var(--color-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: CHART_COLORS.critical }} />
          {negativeLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: CHART_COLORS.s1 }} />
          {positiveLabel}
        </span>
      </div>

      <ul className="space-y-1.5">
        {rows.map((r, i) => {
          const pos = r.value >= 0;
          const w = (Math.abs(r.value) / maxAbs) * 50;
          const hovered = hoverIdx === i;
          return (
            <li
              key={r.label}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              className="flex items-center gap-3 rounded-[8px] px-1 py-1 transition-colors hover:bg-[var(--color-surface-2)]"
            >
              <span className="w-[120px] shrink-0 truncate text-[12.5px] text-[var(--color-ink-2)]">
                {r.label}
              </span>
              <div className="relative h-[15px] flex-1">
                {/* trục 0 ở giữa */}
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--color-line-strong)]" />
                <div
                  className="absolute inset-y-[2px] rounded-[3px] transition-all duration-500 ease-out"
                  style={{
                    left: pos ? "50%" : `${50 - w}%`,
                    width: `${w}%`,
                    background: pos ? CHART_COLORS.s1 : CHART_COLORS.critical,
                    opacity: hoverIdx != null && !hovered ? 0.5 : 1,
                  }}
                />
              </div>
              <span
                className="tnum w-[74px] shrink-0 text-right text-[12.5px] font-semibold"
                style={{ color: pos ? CHART_COLORS.s1 : CHART_COLORS.critical }}
              >
                {pos ? "+" : "−"}
                {format(Math.abs(r.value))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
