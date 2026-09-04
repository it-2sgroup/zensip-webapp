"use client";

import { useMemo, useState } from "react";
import {
  areaPath,
  argMax,
  bandScale,
  barPath,
  linearScale,
  niceMax,
  niceTicks,
  smoothPath,
} from "@/lib/chart-utils";
import {
  Annotation,
  AxisX,
  CHART_COLORS,
  Crosshair,
  FloatingTip,
  GridY,
  Legend,
  ReferenceLine,
  type LegendItem,
  type TipRow,
} from "./core/Parts";
import { useChartWidth, useMountedOnce, useNearestHover } from "./core/useChart";

export interface Serie {
  key: string;
  label: string;
  color: string;
  values: number[];
  /** cột chồng ('bar') hay đường/vùng ('line' | 'area') */
  type?: "bar" | "line" | "area";
}

const PAD = { top: 18, right: 14, bottom: 26, left: 54 };

/**
 * Biểu đồ chuỗi thời gian — cột chồng, đường, hoặc vùng.
 *
 * Toàn bộ vùng vẽ là một hit target: người đọc rê chuột tới đâu, biểu đồ tìm
 * mốc thời gian gần nhất và hiện MỘT tooltip liệt kê TẤT CẢ series tại mốc đó.
 * Không phải nhắm trúng đường 2px mới có số. Bàn phím (← →) cho kết quả y hệt.
 */
export function TimeSeriesChart({
  labels,
  series,
  height = 260,
  format,
  formatAxis,
  /** đánh dấu đỉnh của series này (theo key) làm điểm nhấn */
  peakOf,
  peakLabel,
  /** đường mốc tham chiếu ngang */
  reference,
  stacked = true,
  onSelect,
}: {
  labels: string[];
  series: Serie[];
  height?: number;
  format: (v: number) => string;
  formatAxis: (v: number) => string;
  peakOf?: string;
  peakLabel?: (v: number, label: string) => string;
  reference?: { value: number; label: string; color?: string };
  stacked?: boolean;
  onSelect?: (index: number) => void;
}) {
  const { ref, width } = useChartWidth<HTMLDivElement>();
  const mounted = useMountedOnce();
  const [isolated, setIsolated] = useState<string | null>(null);

  const n = labels.length;
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;

  const band = useMemo(
    () => bandScale(n, [PAD.left, PAD.left + innerW], 0.3),
    [n, innerW],
  );

  const shown = isolated ? series.filter((s) => s.label === isolated) : series;

  const maxV = useMemo(() => {
    if (!n) return 1;
    let m = 0;
    for (let i = 0; i < n; i++) {
      if (stacked) {
        const barSum = shown
          .filter((s) => (s.type ?? "bar") === "bar")
          .reduce((a, s) => a + (s.values[i] ?? 0), 0);
        const others = shown
          .filter((s) => (s.type ?? "bar") !== "bar")
          .map((s) => s.values[i] ?? 0);
        m = Math.max(m, barSum, ...others);
      } else {
        m = Math.max(m, ...shown.map((s) => s.values[i] ?? 0));
      }
    }
    if (reference) m = Math.max(m, reference.value);
    return m || 1;
  }, [shown, n, stacked, reference]);

  const yMax = niceMax(maxV);
  const y = useMemo(
    () => linearScale([0, yMax], [PAD.top + innerH, PAD.top]),
    [yMax, innerH],
  );
  const ticks = useMemo(() => niceTicks(yMax), [yMax]);

  const { hover, onPointerMove, onPointerLeave, onKeyDown, onBlur } =
    useNearestHover(n, (px) => band.nearest(px));

  const cx0 = (i: number) => band(i) + band.bandwidth / 2;

  // Điểm nhấn: đỉnh của series được chỉ định
  const peakSerie = peakOf ? series.find((s) => s.key === peakOf) : undefined;
  const peakIdx = peakSerie ? argMax(peakSerie.values, (v) => v) : -1;

  const legendItems: LegendItem[] = series.map((s) => ({
    color: s.color,
    label: s.label,
    shape: (s.type ?? "bar") === "bar" ? "rect" : "line",
    value: format(s.values.reduce((a, b) => a + b, 0)),
  }));

  const tipRows: TipRow[] =
    hover.index != null
      ? series.map((s) => ({
          color: s.color,
          label: s.label,
          value: format(s.values[hover.index!] ?? 0),
        }))
      : [];

  const tipTotal =
    hover.index != null
      ? series
          .filter((s) => (s.type ?? "bar") === "bar")
          .reduce((a, s) => a + (s.values[hover.index!] ?? 0), 0)
      : 0;

  return (
    <div className="relative" ref={ref}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Biểu đồ theo thời gian. Dùng phím mũi tên trái phải để đọc từng mốc."
          tabIndex={0}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onClick={() => hover.index != null && onSelect?.(hover.index)}
          className={cxSvg(onSelect)}
          style={{ touchAction: "pan-y" }}
        >
          <GridY ticks={ticks} scale={y} x0={PAD.left} x1={PAD.left + innerW} format={formatAxis} />

          {/* Dải nền làm nổi mốc đang trỏ tới */}
          {hover.index != null && (
            <rect
              x={band(hover.index)}
              y={PAD.top}
              width={band.bandwidth}
              height={innerH}
              fill="var(--color-surface-2)"
              opacity={0.75}
              pointerEvents="none"
              rx={4}
            />
          )}

          {reference && (
            <ReferenceLine
              y={y(reference.value)}
              x0={PAD.left}
              x1={PAD.left + innerW}
              label={reference.label}
              color={reference.color ?? CHART_COLORS.axis}
            />
          )}

          {/* Cột chồng — khe hở 2px màu nền tách các lớp, không dùng viền */}
          {stacked &&
            labels.map((_, i) => {
              let acc = 0;
              const bars = series.filter((s) => (s.type ?? "bar") === "bar");
              return (
                <g key={i}>
                  {bars.map((s, si) => {
                    const v = s.values[i] ?? 0;
                    if (v <= 0) return null;
                    const y0 = y(acc);
                    const y1 = y(acc + v);
                    acc += v;
                    const h = Math.max(0, y0 - y1 - (si < bars.length - 1 ? 0 : 0));
                    const isTop = si === bars.length - 1;
                    const dim = isolated != null && isolated !== s.label;
                    return (
                      <path
                        key={s.key}
                        d={barPath(band(i), y1, band.bandwidth, h, isTop ? 4 : 0)}
                        fill={s.color}
                        opacity={dim ? 0.16 : hover.index == null || hover.index === i ? 1 : 0.42}
                        style={{
                          transition: "opacity 140ms ease-out",
                          transform: mounted ? "none" : `scaleY(0)`,
                          transformOrigin: `0 ${PAD.top + innerH}px`,
                        }}
                        stroke="var(--color-surface)"
                        strokeWidth={1}
                      />
                    );
                  })}
                </g>
              );
            })}

          {/* Đường và vùng */}
          {series
            .filter((s) => (s.type ?? "bar") !== "bar")
            .map((s) => {
              const pts = s.values.map((v, i) => ({ x: cx0(i), y: y(v) }));
              const dim = isolated != null && isolated !== s.label;
              return (
                <g key={s.key} opacity={dim ? 0.18 : 1} style={{ transition: "opacity 140ms" }}>
                  {s.type === "area" && (
                    <path d={areaPath(pts, PAD.top + innerH)} fill={s.color} opacity={0.1} />
                  )}
                  <path
                    d={smoothPath(pts)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: mounted ? undefined : 2000,
                      strokeDashoffset: mounted ? 0 : 2000,
                      transition: "stroke-dashoffset 700ms ease-out",
                    }}
                  />
                </g>
              );
            })}

          {/* Crosshair + chấm tại mốc đang trỏ (vòng viền màu nền để nổi trên đường) */}
          {hover.index != null && (
            <>
              <Crosshair x={cx0(hover.index)} y0={PAD.top} y1={PAD.top + innerH} />
              {series
                .filter((s) => (s.type ?? "bar") !== "bar")
                .map((s) => (
                  <circle
                    key={s.key}
                    cx={cx0(hover.index!)}
                    cy={y(s.values[hover.index!] ?? 0)}
                    r={4.5}
                    fill={s.color}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                ))}
            </>
          )}

          {/* Điểm nhấn: đỉnh cao nhất được gọi tên */}
          {peakSerie && peakIdx >= 0 && hover.index == null && (
            <Annotation
              x={cx0(peakIdx)}
              y={y(peakSerie.values[peakIdx])}
              text={
                peakLabel
                  ? peakLabel(peakSerie.values[peakIdx], labels[peakIdx])
                  : `Đỉnh ${labels[peakIdx]}`
              }
            />
          )}

          <AxisX
            labels={labels}
            xOf={cx0}
            y={height - 6}
            highlightIndex={hover.index}
          />
        </svg>
      )}

      {hover.index != null && (
        <FloatingTip
          x={hover.x}
          y={hover.y}
          containerWidth={width}
          title={labels[hover.index]}
          rows={tipRows}
          footer={tipRows.length > 1 && tipTotal > 0 ? `Tổng ${format(tipTotal)}` : undefined}
        />
      )}

      {series.length > 1 && (
        <div className="mt-3">
          <Legend items={legendItems} isolated={isolated} onIsolate={setIsolated} />
        </div>
      )}
    </div>
  );
}

function cxSvg(onSelect?: (i: number) => void) {
  return onSelect
    ? "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded-lg"
    : "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded-lg";
}
