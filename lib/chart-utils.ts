/**
 * Nền tảng toán học cho bộ biểu đồ tự viết.
 *
 * Vì sao không dùng Recharts: bản v3 trong dự án có lỗi tooltip không hiện
 * (đã xác minh: `.recharts-tooltip-wrapper` luôn `visibility: hidden`, không
 * sinh cursor). Tự vẽ SVG cho phép kiểm soát hoàn toàn lớp tương tác —
 * crosshair bám điểm gần nhất, hover nâng mark, làm mờ series không chọn,
 * click mở chi tiết — đúng những thứ biểu đồ dashboard cần.
 */

export interface Scale {
  (v: number): number;
  invert: (px: number) => number;
  domain: [number, number];
  range: [number, number];
}

/** Thang tuyến tính giá trị → toạ độ pixel */
export function linearScale(
  domain: [number, number],
  range: [number, number],
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const fn = ((v: number) => r0 + ((v - d0) / span) * (r1 - r0)) as Scale;
  fn.invert = (px: number) => d0 + ((px - r0) / (r1 - r0 || 1)) * span;
  fn.domain = domain;
  fn.range = range;
  return fn;
}

export interface BandScale {
  (i: number): number;
  bandwidth: number;
  step: number;
  /** Chỉ số của dải gần toạ độ px nhất — dùng cho crosshair bám điểm */
  nearest: (px: number) => number;
}

/** Thang dải cho trục hạng mục (cột, heatmap) */
export function bandScale(
  count: number,
  range: [number, number],
  paddingRatio = 0.22,
): BandScale {
  const [r0, r1] = range;
  const total = r1 - r0;
  const step = count > 0 ? total / count : total;
  const bandwidth = step * (1 - paddingRatio);
  const pad = (step - bandwidth) / 2;
  const fn = ((i: number) => r0 + i * step + pad) as BandScale;
  fn.bandwidth = bandwidth;
  fn.step = step;
  fn.nearest = (px: number) => {
    if (count <= 0) return 0;
    const i = Math.floor((px - r0) / step);
    return Math.max(0, Math.min(count - 1, i));
  };
  return fn;
}

/**
 * Mốc trục "đẹp" — làm tròn về 1/2/2.5/5 × 10^n.
 * Trục có số lẻ (7.343.211) khiến người đọc phải giải mã thay vì đọc.
 */
export function niceTicks(max: number, count = 4): number[] {
  if (!isFinite(max) || max <= 0) return [0];
  const rough = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const stepNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  const step = stepNorm * mag;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

/** Trần trục: mốc đẹp đầu tiên vượt giá trị lớn nhất, chừa 8% khoảng thở phía trên */
export function niceMax(max: number, count = 4): number {
  const ticks = niceTicks(max * 1.08, count);
  return ticks.length ? Math.max(ticks[ticks.length - 1], max) : max || 1;
}

/** Đường gấp khúc qua các điểm */
export function linePath(pts: { x: number; y: number }[]): string {
  if (!pts.length) return "";
  return pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
}

/**
 * Đường cong trơn (Catmull-Rom → Bezier), kẹp độ căng để không "vọt lố"
 * tạo ra đỉnh giả không có trong dữ liệu.
 */
export function smoothPath(pts: { x: number; y: number }[], tension = 0.18): string {
  if (pts.length < 2) return linePath(pts);
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/** Vùng tô dưới đường, đóng xuống đáy */
export function areaPath(
  pts: { x: number; y: number }[],
  baseY: number,
  smooth = true,
): string {
  if (!pts.length) return "";
  const top = smooth ? smoothPath(pts) : linePath(pts);
  return `${top} L${pts[pts.length - 1].x.toFixed(2)} ${baseY.toFixed(2)} L${pts[0].x.toFixed(2)} ${baseY.toFixed(2)} Z`;
}

/** Chữ nhật bo góc chỉ ở đầu dữ liệu, vuông ở chân — theo đặc tả mark */
export function barPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r = 4,
  horizontal = false,
): string {
  if (h <= 0 || w <= 0) return "";
  const rad = Math.max(0, Math.min(r, horizontal ? w / 2 : h / 2, horizontal ? h / 2 : w / 2));
  if (horizontal) {
    // bo góc bên phải (đầu thanh)
    return `M${x} ${y} H${x + w - rad} A${rad} ${rad} 0 0 1 ${x + w} ${y + rad} V${y + h - rad} A${rad} ${rad} 0 0 1 ${x + w - rad} ${y + h} H${x} Z`;
  }
  // bo góc phía trên (đỉnh cột)
  return `M${x} ${y + h} V${y + rad} A${rad} ${rad} 0 0 1 ${x + rad} ${y} H${x + w - rad} A${rad} ${rad} 0 0 1 ${x + w} ${y + rad} V${y + h} Z`;
}

/** Chỉ số phần tử có giá trị lớn nhất — dùng để đánh dấu đỉnh (điểm nhấn) */
export function argMax<T>(arr: T[], get: (v: T) => number): number {
  let best = 0;
  let bestV = -Infinity;
  arr.forEach((v, i) => {
    const n = get(v);
    if (n > bestV) {
      bestV = n;
      best = i;
    }
  });
  return best;
}

export function argMin<T>(arr: T[], get: (v: T) => number): number {
  return argMax(arr, (v) => -get(v));
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
