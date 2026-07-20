"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { searchSite } from "@/lib/search-index";

export function SearchBar() {
  const t = useTranslations("Search");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchSite(query);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={t("open")}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-[var(--color-fg)] transition-colors hover:bg-[var(--color-surface)]"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--color-bg)] p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
              <svg aria-hidden="true" className="flex-none text-[var(--color-muted)]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 bg-transparent text-base text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
              />
              <button
                type="button"
                aria-label={t("close")}
                onClick={() => setOpen(false)}
                className="flex-none text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ul className="mt-3 flex max-h-80 flex-col gap-1 overflow-y-auto">
              {query.trim() && results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-[var(--color-muted)]">{t("noResults")}</li>
              ) : null}
              {results.map((result, index) => (
                <li key={`${result.href}-${result.title}-${index}`}>
                  <Link
                    href={`/${locale}${result.href}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--color-surface)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wide text-[var(--color-coral-text)] uppercase">
                        {result.category}
                      </span>
                      <span className="font-semibold text-[var(--color-fg)]">{result.title}</span>
                    </span>
                    {result.excerpt ? (
                      <span className="mt-0.5 block text-sm text-[var(--color-muted)]">{result.excerpt}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
