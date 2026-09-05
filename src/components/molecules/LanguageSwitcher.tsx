"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localeLabels, localeLabelsShort } from "@/i18n/config";
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
  const nextLocale = locale === "uz" ? "ru" : "uz";
  const search = searchParams.toString();
  const href = switchLocalePath(
    pathname,
    nextLocale,
    search ? `?${search}` : "",
  );

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] border border-black/10 bg-white/70 px-4 text-sm font-medium text-ink backdrop-blur transition-colors hover:bg-white",
        className,
      )}
    >
      <span className="sm:hidden">{localeLabelsShort[nextLocale]}</span>
      <span className="hidden sm:inline">{localeLabels[nextLocale]}</span>
    </Link>
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
