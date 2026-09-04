import type { Metadata, Viewport } from "next";
import { ThemeScript } from "@/components/shell/ThemeToggle";
import "./globals.css";

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
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
