"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Đo bề rộng thật của khung chứa để SVG co giãn theo màn hình. */
export function useChartWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
    });
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

export interface HoverState {
  /** Chỉ số điểm dữ liệu đang được trỏ tới, null khi con trỏ rời biểu đồ */
  index: number | null;
  /** Toạ độ con trỏ trong hệ toạ độ của khung biểu đồ (px) */
  x: number;
  y: number;
}

/**
 * Lớp bám con trỏ cho biểu đồ theo trục thời gian.
 *
 * Nguyên tắc: người đọc nhắm vào MỘT MỐC THỜI GIAN, không nhắm vào đường 2px.
 * Vì vậy toàn bộ vùng vẽ là một hit target lớn, và ta tự tìm điểm gần nhất
 * theo trục X. Bàn phím (mũi tên trái/phải) cho kết quả y hệt chuột.
 */
export function useNearestHover(
  count: number,
  toIndex: (localX: number) => number,
) {
  const [hover, setHover] = useState<HoverState>({ index: null, x: 0, y: 0 });

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setHover({ index: toIndex(x), x, y });
    },
    [toIndex],
  );

  const onPointerLeave = useCallback(() => {
    setHover((h) => (h.index === null ? h : { ...h, index: null }));
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGSVGElement>) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      setHover((h) => {
        const cur = h.index ?? 0;
        const next = e.key === "ArrowLeft" ? cur - 1 : cur + 1;
        return { ...h, index: Math.max(0, Math.min(count - 1, next)) };
      });
    },
    [count],
  );

  const onBlur = useCallback(() => setHover((h) => ({ ...h, index: null })), []);

  return { hover, setHover, onPointerMove, onPointerLeave, onKeyDown, onBlur };
}

/** Đóng khi bấm Esc — dùng cho drawer/modal */
export function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, onClose]);
}

/** Khoá cuộn nền khi lớp phủ đang mở */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

/**
 * Hoãn bật hiệu ứng cho tới sau lần vẽ đầu tiên.
 * Nhờ vậy biểu đồ "mọc lên" khi mới hiện, nhưng khi đổi bộ lọc thì
 * cập nhật tức thì — không bắt người xem chờ hoạt ảnh chạy lại.
 */
export function useMountedOnce() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return mounted;
}
