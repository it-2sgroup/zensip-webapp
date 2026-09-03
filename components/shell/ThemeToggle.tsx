"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./icons";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("zensip-theme", next);
    } catch {
      /* chế độ riêng tư chặn localStorage — bỏ qua, chỉ mất ghi nhớ lựa chọn */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
      className="grid h-9 w-9 place-items-center rounded-[9px] border border-[var(--color-line-strong)] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
    >
      {theme === "dark" ? (
        <IconSun className="h-[17px] w-[17px]" />
      ) : (
        <IconMoon className="h-[17px] w-[17px]" />
      )}
    </button>
  );
}

/**
 * Đặt class theme trước khi trang vẽ, tránh nhấp nháy nền trắng khi đang ở chế độ tối.
 * Chạy đồng bộ trong <head>.
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('zensip-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
