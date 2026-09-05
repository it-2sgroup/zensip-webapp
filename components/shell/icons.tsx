/** Bộ icon nét mảnh, vẽ tay bằng SVG — không phụ thuộc thư viện ngoài. */

type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const IconDashboard = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="7.5" height="9" rx="1.6" />
    <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6" />
    <rect x="13.5" y="12" width="7.5" height="9" rx="1.6" />
    <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.6" />
  </svg>
);

export const IconCalculator = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.4" />
    <path d="M8 6.5h8" />
    <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 18.5h.01M12 18.5h.01M15.5 18.5h.01" />
  </svg>
);

export const IconVideo = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="5" width="14" height="14" rx="2.4" />
    <path d="m16.5 10 5-2.8v9.6l-5-2.8" />
  </svg>
);

export const IconStore = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3.5 9.5V19a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5" />
    <path d="M2.5 7.2 4.3 3.9A1.5 1.5 0 0 1 5.6 3h12.8a1.5 1.5 0 0 1 1.3.9l1.8 3.3a2.6 2.6 0 0 1-4.75 2.1 2.6 2.6 0 0 1-4.75 0 2.6 2.6 0 0 1-4.75 0A2.6 2.6 0 0 1 2.5 7.2Z" />
  </svg>
);

export const IconAds = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 10.5v3a1.5 1.5 0 0 0 1.5 1.5H7l5.5 4V5L7 9H4.5A1.5 1.5 0 0 0 3 10.5Z" />
    <path d="M17 9.2a4 4 0 0 1 0 5.6" />
    <path d="M19.6 6.6a7.5 7.5 0 0 1 0 10.8" />
  </svg>
);

export const IconUsers = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 20a6.4 6.4 0 0 1 12.4 0" />
    <path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.4" />
    <path d="M18.4 14.6A6.4 6.4 0 0 1 21.6 20" />
  </svg>
);

export const IconSun = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
);

export const IconMoon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
  </svg>
);

export const IconMenu = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
  </svg>
);

export const IconClose = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconLock = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

/**
 * Dấu hiệu nhận diện Zensip.
 *
 * Chữ "Z" cách điệu thành một đường xu hướng đi lên — nét ngang trên, chéo
 * xuống, ngang dưới, giống hệt hình chữ Z thật nên vẫn đọc được ngay là chữ
 * cái đầu thương hiệu. Điểm khác biệt: đầu mút trên cùng có một chấm tròn đặc
 * — đúng mô-típ "điểm dữ liệu" đang dùng ở mọi biểu đồ trong app (viền màu
 * nền quanh chấm cuối đường, xem components/charts/TimeSeries.tsx). Nhờ vậy
 * logo không chỉ là chữ cái, mà còn ngầm nói sản phẩm này là dashboard dữ liệu.
 */
export const ZensipMark = ({ className }: P) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <defs>
      <linearGradient id="zs-mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8.5" fill="url(#zs-mark)" />
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
);
