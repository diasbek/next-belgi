"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { getServicesCopy } from "@/data/services-catalog";
import { cn } from "@/lib/cn";

export function ReportServiceUpsell({
  locale,
  checkId,
  className,
}: {
  locale: Locale;
  checkId?: string | null;
  className?: string;
}) {
  const copy = getServicesCopy(locale).upsell;
  const q = checkId ? `?checkId=${encodeURIComponent(checkId)}` : "";

  const items = [
    {
      href: `${localePath(locale, "/services/nice-classes-fees/")}${q}`,
      label: copy.classes,
    },
    {
      href: `${localePath(locale, "/services/filing-package/")}${q}`,
      label: copy.filing,
    },
    {
      href: `${localePath(locale, "/services/attorney-match/")}${q}`,
      label: copy.attorney,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-ink/10 bg-surface-muted p-4 sm:p-5",
        className,
      )}
    >
      <h3 className="m-0 text-base font-semibold text-ink">{copy.title}</h3>
      <ul className="mt-3 m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-ink/10 transition hover:bg-lime/60"
            >
              {item.label} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
