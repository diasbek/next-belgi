"use client";

import { Suspense, useId, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localeLabels, localeLabelsShort, locales } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";

function LanguageSwitcherInner({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const listId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] border border-black/10 bg-white/70 px-4 text-sm font-medium text-ink backdrop-blur transition-colors hover:bg-white"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sm:hidden">{localeLabelsShort[locale]}</span>
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <ul
            id={listId}
            role="listbox"
            className="absolute right-0 z-50 mt-2 min-w-[9.5rem] overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-lg"
          >
            {locales.map((nextLocale) => {
              const href = switchLocalePath(
                pathname,
                nextLocale,
                search ? `?${search}` : "",
              );
              const active = nextLocale === locale;
              return (
                <li key={nextLocale} role="option" aria-selected={active}>
                  <Link
                    href={href}
                    className={cn(
                      "block px-4 py-2.5 text-sm font-medium text-ink hover:bg-[#f3f4f1]",
                      active && "bg-lime/40",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span className="sm:hidden">
                      {localeLabelsShort[nextLocale]}
                    </span>
                    <span className="hidden sm:inline">
                      {localeLabels[nextLocale]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export function LanguageSwitcher({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <span
          className={cn(
            "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] border border-black/10 bg-white/70 px-4 text-sm font-medium text-ink/50",
            className,
          )}
        >
          …
        </span>
      }
    >
      <LanguageSwitcherInner locale={locale} className={className} />
    </Suspense>
  );
}
