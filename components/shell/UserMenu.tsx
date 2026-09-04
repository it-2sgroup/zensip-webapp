"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function initialsOf(email: string) {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2.5 rounded-[9px] px-2 py-1.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[12px] font-semibold text-[var(--color-brand)]">
        {email ? initialsOf(email) : "…"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">
          {email ?? "Đang tải…"}
        </p>
        <p className="truncate text-[11.5px] text-[var(--color-muted)]">
          Nội bộ SISMO
        </p>
      </div>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        title="Đăng xuất"
        aria-label="Đăng xuất"
        className="shrink-0 rounded-[7px] p-1.5 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-critical)] disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3" />
          <path d="M16 15.5 20.5 12 16 8.5" />
          <path d="M20.5 12h-11" />
        </svg>
      </button>
    </div>
  );
}
