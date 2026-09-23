"use client";

import { Suspense, useId, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localeLabels, localeLabelsShort, locales } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";

const pill =
  "inline-flex h-11 min-h-11 items-center justify-center rounded-[var(--radius-pill)] text-sm font-semibold";

function LanguageSwitcherInner({
  locale,
  className,
  variant = "dropdown",
}: {
  locale: Locale;
  className?: string;
  variant?: "dropdown" | "inline";
}) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const listId = useId();
  const [open, setOpen] = useState(false);

  function hrefFor(nextLocale: Locale) {
    return switchLocalePath(pathname, nextLocale, search ? `?${search}` : "");
  }

  if (variant === "inline") {
    return (
      <div
        className={cn("flex items-center gap-2", className)}
        role="group"
        aria-label="Language"
      >
        {locales.map((nextLocale) => {
          const active = nextLocale === locale;
          return (
            <Link
              key={nextLocale}
              href={hrefFor(nextLocale)}
              hrefLang={nextLocale}
              aria-current={active ? "true" : undefined}
              className={cn(
                pill,
                "min-w-11 px-3.5",
                active
                  ? "bg-primary text-white"
                  : "border border-black/10 bg-white/70 text-ink hover:bg-white",
              )}
            >
              {localeLabelsShort[nextLocale]}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          pill,
          "border border-black/10 bg-white/70 px-4 text-ink backdrop-blur transition-colors hover:bg-white",
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        {localeLabelsShort[locale]}
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
            className="absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-lg"
          >
            {locales.map((nextLocale) => {
              const active = nextLocale === locale;
              return (
                <li key={nextLocale} role="option" aria-selected={active}>
                  <Link
                    href={hrefFor(nextLocale)}
                    className={cn(
                      "block px-4 py-2.5 text-sm font-medium text-ink hover:bg-dash-bg",
                      active && "bg-lime/40",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {localeLabels[nextLocale]}
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
  variant = "dropdown",
}: {
  locale: Locale;
  className?: string;
  variant?: "dropdown" | "inline";
}) {
  return (
    <Suspense
      fallback={
        <span
          className={cn(
            pill,
            "border border-black/10 bg-white/70 px-4 text-ink/50",
            className,
          )}
        >
          …
        </span>
      }
    >
      <LanguageSwitcherInner
        locale={locale}
        className={className}
        variant={variant}
      />
    </Suspense>
  );
}
