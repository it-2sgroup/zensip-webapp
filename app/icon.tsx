import { ImageResponse } from "next/og";

/**
 * Favicon — Next.js tự nhận file này, sinh ảnh và gắn thẻ
 * <link rel="icon"> vào <head>, hiện ở tab trình duyệt.
 * Cùng một hình vẽ với ZensipMark (components/shell/icons.tsx) để logo
 * nhất quán giữa sidebar và tab trình duyệt.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg width={32} height={32} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8.5" fill="url(#g)" />
        <path
          d="M9.5 11.5H22M22 11.5 9.5 20.5M9.5 20.5H22"
          fill="none"
          stroke="#fff"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="11.5" r="1.9" fill="#fff" />
      </svg>
    ),
    { ...size },
  );
}
