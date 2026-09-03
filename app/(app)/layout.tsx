"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { IconMenu } from "@/components/shell/icons";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[57px] items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-page)]/85 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Mở menu"
            className="grid h-9 w-9 place-items-center rounded-[9px] border border-[var(--color-line-strong)] text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)] lg:hidden"
          >
            <IconMenu className="h-[18px] w-[18px]" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
