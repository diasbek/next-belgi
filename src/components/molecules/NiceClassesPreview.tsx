"use client";

import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { affectedClassSummaries } from "@/lib/nice";

export function NiceClassesPreview({
  locale,
  classNumbers,
  title,
  empty,
  chipLabel,
  className,
}: {
  locale: Locale;
  classNumbers: number[];
  title: string;
  empty: string;
  chipLabel: string;
  className?: string;
}) {
  const items = affectedClassSummaries(classNumbers, locale);

  return (
    <div className={cn("rounded-2xl border border-black/5 bg-[#eceee8]/px-4 py-3", className)}>
      <p className="m-0 text-xs font-medium tracking-wide text-ink-muted uppercase">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 m-0 text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-2 m-0 flex list-none flex-wrap gap-2 p-0">
          {items.map((item) => (
            <li
              key={item.classNumber}
              className="max-w-full rounded-xl border border-[#b8d96a]/bg-[#f4fbe6] px-2.5 py-1.5 text-sm text-ink"
            >
              <span className="font-semibold">
                {chipLabel.replace("{n}", String(item.classNumber))}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-muted line-clamp-2">
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
