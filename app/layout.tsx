import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeScript } from "@/components/shell/ThemeToggle";
import "./globals.css";

// Font chữ chính của Zensip. Claude.ai dùng font thương mại riêng (Styrene/Tiempos,
// bản quyền Commercial Type) — không nhúng lại được ở dự án khác. Inter là lựa chọn
// thay thế phổ biến nhất trong sản phẩm SaaS/AI hiện đại, miễn phí, đủ dấu tiếng Việt.
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zensip",
    template: "%s · Zensip",
  },
  description:
    "Hệ thống nội bộ quản lý dữ liệu thương mại điện tử và công cụ vận hành TikTok Shop.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
