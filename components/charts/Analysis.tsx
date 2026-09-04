"use client";

import { useMemo, useState } from "react";
import { linearScale, niceMax, niceTicks } from "@/lib/chart-utils";
import { cx } from "@/components/ui/primitives";
import { CHART_COLORS, FloatingTip, GridY } from "./core/Parts";
import { useChartWidth } from "./core/useChart";

/* ══════════════════════════════════════════════════════════
   Nhóm biểu đồ phân tích: tìm ra CÁI NÀO bất thường,
   thay vì chỉ hiển thị tổng thể.
   ══════════════════════════════════════════════════════════ */

export interface ScatterPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  /** kích thước bong bóng theo một chỉ số thứ ba */
  size: number;
}

const PAD = { top: 20, right: 20, bottom: 40, left: 56 };

/**
 * SCATTER 4 GÓC PHẦN TƯ — soi hiệu quả từng chiến dịch.
 *
 * Trục X = chi phí, trục Y = hiệu quả (ROI), bong bóng = quy mô doanh thu.
 * Hai đường mốc chia thành 4 vùng: "tiêu nhiều mà kém" là góc cần xử lý ngay,
 * và nó được tô đỏ + gọi tên sẵn thay vì bắt người xem tự suy.
 */
export function ScatterQuadrant({
  points,
  xRef,
  yRef,
  height = 320,
  formatX,
  formatY,
  formatSize,
  xLabel,
  yLabel,
  onSelect,
}: {
  points: ScatterPoint[];
  /** mốc chia dọc (ví dụ chi phí trung bình) */
  xRef: number;
  /** mốc chia ngang (ví dụ ROI mục tiêu) */
  yRef: number;
  height?: number;
  formatX: (v: number) => string;
  formatY: (v: number) => string;
  formatSize: (v: number) => string;
  xLabel: string;
  yLabel: string;
  onSelect?: (p: ScatterPoint) => void;
}) {
  const { ref, width } = useChartWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ p: ScatterPoint; x: number; y: number } | null>(null);

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;

  const xMax = niceMax(Math.max(...points.map((p) => p.x), xRef));
  const yMax = niceMax(Math.max(...points.map((p) => p.y), yRef));
  const sMax = Math.max(...points.map((p) => p.size)) || 1;

  const sx = useMemo(() => linearScale([0, xMax], [PAD.left, PAD.left + innerW]), [xMax, innerW]);
  const sy = useMemo(() => linearScale([0, yMax], [PAD.top + innerH, PAD.top]), [yMax, innerH]);
  // Bán kính theo CĂN BẬC HAI của giá trị — để DIỆN TÍCH tỉ lệ với số liệu.
  // Nếu map thẳng vào bán kính, mắt sẽ đọc phóng đại gấp bội.
  const sr = (v: number) => 6 + Math.sqrt(v / sMax) * 22;

  const yTicks = niceTicks(yMax);

  return (
    <div className="relative" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`${yLabel} theo ${xLabel}`}>
          <GridY
            ticks={yTicks}
            scale={sy}
            x0={PAD.left}
            x1={PAD.left + innerW}
            format={formatY}
          />

          {/* Vùng "tiêu nhiều mà hiệu quả kém" — góc cần xử lý */}
          <rect
            x={sx(xRef)}
            y={sy(yRef)}
            width={PAD.left + innerW - sx(xRef)}
            height={PAD.top + innerH - sy(yRef)}
            fill={CHART_COLORS.critical}
            opacity={0.05}
          />

          {/* Hai đường mốc */}
          <line
            x1={sx(xRef)} x2={sx(xRef)} y1={PAD.top} y2={PAD.top + innerH}
            stroke={CHART_COLORS.axis} strokeWidth={1.5} strokeOpacity={0.55}
          />
          <line
            x1={PAD.left} x2={PAD.left + innerW} y1={sy(yRef)} y2={sy(yRef)}
            stroke={CHART_COLORS.axis} strokeWidth={1.5} strokeOpacity={0.55}
          />
          <text
            x={PAD.left + innerW - 4} y={sy(yRef) - 6}
            textAnchor="end" fontSize={10.5} fontWeight={600} fill={CHART_COLORS.axis}
          >
            Mốc {formatY(yRef)}
          </text>
          <text
            x={PAD.left + innerW - 6} y={PAD.top + innerH - 8}
            textAnchor="end" fontSize={10.5} fontWeight={600}
            fill={CHART_COLORS.critical} opacity={0.75}
          >
            Tiêu nhiều · hiệu quả thấp
          </text>

          {/* Bong bóng — vẽ to trước, nhỏ sau để không che nhau */}
          {[...points]
            .sort((a, b) => b.size - a.size)
            .map((p) => {
              const under = p.y < yRef;
              const isHover = hover?.p.id === p.id;
              const color = under ? CHART_COLORS.critical : CHART_COLORS.s1;
              return (
                <g
                  key={p.id}
                  onPointerEnter={(e) => {
                    const r = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                    setHover({ p, x: e.clientX - r.left, y: e.clientY - r.top });
                  }}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onSelect?.(p)}
                  className={onSelect ? "cursor-pointer" : undefined}
                >
                  {/* vùng bắt chuột rộng hơn hình vẽ để dễ trỏ trúng */}
                  <circle cx={sx(p.x)} cy={sy(p.y)} r={Math.max(sr(p.size), 14)} fill="transparent" />
                  <circle
                    cx={sx(p.x)}
                    cy={sy(p.y)}
                    r={sr(p.size)}
                    fill={color}
                    fillOpacity={isHover ? 0.42 : 0.22}
                    stroke={color}
                    strokeWidth={isHover ? 2.5 : 1.75}
                    style={{ transition: "fill-opacity 130ms, stroke-width 130ms" }}
                  />
                </g>
              );
            })}

          {/* Nhãn trực tiếp cho các điểm dưới mốc — điểm nhấn có tên */}
          {points
            .filter((p) => p.y < yRef)
            .map((p) => (
              <text
                key={`lb-${p.id}`}
                x={sx(p.x)}
                y={sy(p.y) - sr(p.size) - 6}
                textAnchor="middle"
                fontSize={10.5}
                fontWeight={600}
                fill={CHART_COLORS.critical}
                stroke="var(--color-surface)"
                strokeWidth={3}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {p.label.length > 22 ? `${p.label.slice(0, 21)}…` : p.label}
              </text>
            ))}

          {/* Nhãn trục X */}
          {niceTicks(xMax, 4).map((t) => (
            <text
              key={t} x={sx(t)} y={height - 20} textAnchor="middle"
              fontSize={11} fill={CHART_COLORS.muted}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatX(t)}
            </text>
          ))}
          <text
            x={PAD.left + innerW / 2} y={height - 4} textAnchor="middle"
            fontSize={11} fontWeight={500} fill={CHART_COLORS.muted}
          >
            {xLabel} →
          </text>
        </svg>
      )}

      {hover && (
        <FloatingTip
          x={hover.x}
          y={hover.y}
          containerWidth={width}
          title={hover.p.label}
          rows={[
            { label: xLabel, value: formatX(hover.p.x) },
            { label: yLabel, value: formatY(hover.p.y) },
            { label: "Quy mô", value: formatSize(hover.p.size) },
          ]}
          footer={hover.p.y < yRef ? "⚠ Dưới mốc hiệu quả" : "Đạt mốc hiệu quả"}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */

export interface HeatCell {
  row: number;
  col: number;
  value: number;
}

/**
 * HEATMAP — nhìn ra quy luật theo chu kỳ (thứ trong tuần × tuần).
 *
 * Một hue duy nhất, đậm dần theo giá trị (không dùng cầu vồng — cầu vồng
 * làm mắt đọc sai thứ tự lớn nhỏ). Ô đậm nhất được viền để làm điểm nhấn.
 */
export function Heatmap({
  rowLabels,
  colLabels,
  cells,
  format,
  cellHeight = 26,
}: {
  rowLabels: string[];
  colLabels: string[];
  cells: HeatCell[];
  format: (v: number) => string;
  cellHeight?: number;
}) {
  const [hover, setHover] = useState<{ c: HeatCell; x: number; y: number } | null>(null);
  const { ref, width } = useChartWidth<HTMLDivElement>();

  const max = Math.max(...cells.map((c) => c.value)) || 1;
  const peak = cells.reduce((a, b) => (b.value > a.value ? b : a), cells[0]);

  const LABEL_W = 42;
  const gap = 3;
  const cellW = Math.max(
    6,
    (width - LABEL_W - gap * (colLabels.length - 1)) / colLabels.length,
  );

  return (
    <div className="relative" ref={ref}>
      {width > 0 && (
        <div>
          <div className="flex" style={{ marginLeft: LABEL_W, gap }}>
            {colLabels.map((c, i) => (
              <span
                key={i}
                className="tnum shrink-0 text-center text-[10px] text-[var(--color-muted)]"
                style={{ width: cellW }}
              >
                {i % 2 === 0 ? c : ""}
              </span>
            ))}
          </div>

          {rowLabels.map((rl, r) => (
            <div key={rl} className="mt-[3px] flex items-center" style={{ gap }}>
              <span
                className="shrink-0 pr-2 text-right text-[11px] text-[var(--color-muted)]"
                style={{ width: LABEL_W }}
              >
                {rl}
              </span>
              {colLabels.map((_, c) => {
                const cell = cells.find((x) => x.row === r && x.col === c);
                const v = cell?.value ?? 0;
                // Nền nhạt nhất vẫn phải phân biệt được với nền thẻ
                const t = max > 0 ? v / max : 0;
                const isPeak = peak && cell?.row === peak.row && cell?.col === peak.col;
                return (
                  <div
                    key={c}
                    onPointerEnter={(e) => {
                      if (!cell) return;
                      const box = ref.current!.getBoundingClientRect();
                      setHover({ c: cell, x: e.clientX - box.left, y: e.clientY - box.top });
                    }}
                    onPointerLeave={() => setHover(null)}
                    className={cx(
                      "shrink-0 rounded-[4px] transition-transform duration-100",
                      cell && "hover:scale-[1.14]",
                      isPeak && "ring-[1.5px] ring-[var(--color-ink)] ring-offset-1 ring-offset-[var(--color-surface)]",
                    )}
                    style={{
                      width: cellW,
                      height: cellHeight,
                      background: cell
                        ? `color-mix(in oklab, var(--color-s1) ${8 + t * 92}%, var(--color-surface-2))`
                        : "var(--color-surface-2)",
                    }}
                  />
                );
              })}
            </div>
          ))}

          {/* Thang màu */}
          <div className="mt-3 flex items-center gap-2" style={{ marginLeft: LABEL_W }}>
            <span className="text-[10.5px] text-[var(--color-muted)]">Thấp</span>
            <div
              className="h-2 w-24 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, color-mix(in oklab, var(--color-s1) 8%, var(--color-surface-2)), var(--color-s1))",
              }}
            />
            <span className="text-[10.5px] text-[var(--color-muted)]">
              Cao · {format(max)}
            </span>
          </div>
        </div>
      )}

      {hover && (
        <FloatingTip
          x={hover.x}
          y={hover.y}
          containerWidth={width}
          title={`${rowLabels[hover.c.row]} · ${colLabels[hover.c.col]}`}
          rows={[{ label: "Giá trị", value: format(hover.c.value) }]}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */

export interface SlopeRow {
  label: string;
  before: number;
  after: number;
}

/**
 * SLOPE CHART (Tufte) — so sánh hai kỳ cho nhiều hạng mục cùng lúc.
 *
 * Độ dốc của đường CHÍNH LÀ mức thay đổi: dốc lên là tăng, dốc xuống là giảm.
 * Đọc nhanh hơn hẳn hai cột cạnh nhau vì mắt bắt hướng nhanh hơn bắt chiều dài.
 */
export function SlopeChart({
  rows,
  beforeLabel,
  afterLabel,
  format,
  height = 300,
}: {
  rows: SlopeRow[];
  beforeLabel: string;
  afterLabel: string;
  format: (v: number) => string;
  height?: number;
}) {
  const { ref, width } = useChartWidth<HTMLDivElement>();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const top = 30;
  const bottom = height - 26;
  const max = Math.max(...rows.flatMap((r) => [r.before, r.after])) * 1.05 || 1;
  const y = (v: number) => bottom - (v / max) * (bottom - top);

  const xL = 132;
  const xR = Math.max(xL + 60, width - 132);

  return (
    <div className="relative" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`So sánh ${beforeLabel} và ${afterLabel}`}>
          <text x={xL} y={16} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={CHART_COLORS.muted}>
            {beforeLabel}
          </text>
          <text x={xR} y={16} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={CHART_COLORS.muted}>
            {afterLabel}
          </text>
          <line x1={xL} x2={xL} y1={top} y2={bottom} stroke={CHART_COLORS.grid} />
          <line x1={xR} x2={xR} y1={top} y2={bottom} stroke={CHART_COLORS.grid} />

          {rows.map((r, i) => {
            const up = r.after >= r.before;
            const color = up ? CHART_COLORS.good : CHART_COLORS.critical;
            const dim = hoverIdx != null && hoverIdx !== i;
            const y1 = y(r.before);
            const y2 = y(r.after);
            return (
              <g
                key={r.label}
                onPointerEnter={() => setHoverIdx(i)}
                onPointerLeave={() => setHoverIdx(null)}
                opacity={dim ? 0.22 : 1}
                style={{ transition: "opacity 140ms" }}
              >
                {/* vùng bắt chuột dày hơn đường vẽ */}
                <line x1={xL} x2={xR} y1={y1} y2={y2} stroke="transparent" strokeWidth={16} />
                <line
                  x1={xL} x2={xR} y1={y1} y2={y2}
                  stroke={color} strokeWidth={hoverIdx === i ? 2.75 : 2} strokeLinecap="round"
                />
                <circle cx={xL} cy={y1} r={4} fill={color} stroke="var(--color-surface)" strokeWidth={2} />
                <circle cx={xR} cy={y2} r={4} fill={color} stroke="var(--color-surface)" strokeWidth={2} />

                <text
                  x={xL - 10} y={y1} textAnchor="end" dominantBaseline="middle"
                  fontSize={11.5} fill="var(--color-ink-2)"
                >
                  <tspan fontWeight={500}>{r.label}</tspan>
                  <tspan fill={CHART_COLORS.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {"  "}{format(r.before)}
                  </tspan>
                </text>
                <text
                  x={xR + 10} y={y2} dominantBaseline="middle"
                  fontSize={11.5} style={{ fontVariantNumeric: "tabular-nums" }}
                  fill="var(--color-ink)" fontWeight={600}
                >
                  {format(r.after)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
