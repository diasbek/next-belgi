"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localeLabels } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const nextLocale = locale === "uz" ? "ru" : "uz";
  const href = switchLocalePath(pathname, nextLocale);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] border border-black/10 bg-white/70 px-4 text-sm font-medium text-ink backdrop-blur transition-colors hover:bg-white",
        className,
      )}
    >
      {localeLabels[nextLocale]}
    </Link>
  );
}
