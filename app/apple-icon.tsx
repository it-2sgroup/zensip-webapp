import { ImageResponse } from "next/og";

/** Icon khi lưu trang ra màn hình chính iOS/Android — cùng thiết kế, phóng to. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width={180} height={180} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="url(#g)" />
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
