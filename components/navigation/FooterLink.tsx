"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// The one piece of FooterNav that genuinely needs client JS (current-page
// awareness via usePathname()) -- pulled into its own leaf component so
// the rest of the footer (icons, static links, translated copy) can stay
// a Server Component instead of shipping as client JS just because a
// handful of links need active-state styling.
export function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className="group flex min-h-11 items-center gap-2 text-white/75 transition-colors hover:text-white"
    >
      <span
        aria-hidden="true"
        className="h-1 w-1 flex-none rounded-full transition-all group-hover:bg-[var(--color-gold)]"
        style={{ background: isActive ? "var(--color-gold)" : "transparent" }}
      />
      <span className={isActive ? "font-bold text-white" : ""}>{children}</span>
    </Link>
  );
}
