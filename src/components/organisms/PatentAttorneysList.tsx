"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { PatentAttorney } from "@/data/patent-attorneys";
import type { Locale } from "@/i18n/config";
import { AttachAttorneyButton } from "@/components/organisms/AttachAttorneyButton";
import { fieldInput } from "@/styles/ui";
import { cn } from "@/lib/cn";

type Labels = {
  searchPlaceholder: string;
  empty: string;
  count: string;
  columns: {
    name: string;
    contacts: string;
    location: string;
    services: string;
  };
};

export function PatentAttorneysList({
  attorneys,
  labels,
  locale,
  orderId,
  showAttach,
}: {
  attorneys: PatentAttorney[];
  labels: Labels;
  locale?: Locale;
  orderId?: string | null;
  showAttach?: boolean;
}) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!deferred) return attorneys;
    return attorneys.filter((a) => {
      const hay = [
        a.name,
        a.email,
        a.phone,
        a.region,
        a.district,
        ...a.services,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(deferred);
    });
  }, [attorneys, deferred]);

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="m-0 text-sm text-ink-muted">
          {labels.count.replace("{count}", String(filtered.length))}
        </p>
        <label className="block w-full sm:max-w-sm">
          <span className="sr-only">{labels.searchPlaceholder}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className={cn(fieldInput, "min-h-12")}
            autoComplete="off"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="m-0 rounded-2xl bg-surface-muted px-5 py-8 text-ink-muted">
          {labels.empty}
        </p>
      ) : (
        <div className="max-h-[min(28rem,55dvh)] overflow-auto rounded-2xl border border-border sm:max-h-[min(36rem,60dvh)]">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{labels.columns.name}</th>
                <th className="px-4 py-3 font-medium">
                  {labels.columns.contacts}
                </th>
                <th className="px-4 py-3 font-medium">
                  {labels.columns.location}
                </th>
                <th className="px-4 py-3 font-medium">
                  {labels.columns.services}
                </th>
                {showAttach && locale ? (
                  <th className="px-4 py-3 font-medium"> </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((attorney) => (
                <tr
                  key={attorney.id}
                  className="border-t border-border align-top"
                >
                  <td className="px-4 py-3">
                    <p className="m-0 font-semibold leading-snug text-ink">
                      {attorney.name}
                    </p>
                    <p className="m-0 mt-1 text-xs text-ink-muted">
                      № {attorney.number}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {attorney.email ? (
                      <a
                        href={`mailto:${attorney.email}`}
                        className="block text-ink underline-offset-2 hover:underline"
                      >
                        {attorney.email}
                      </a>
                    ) : null}
                    {attorney.phone ? (
                      <a
                        href={`tel:${attorney.phone.replace(/[^\d+]/g, "")}`}
                        className="mt-1 block text-ink-muted underline-offset-2 hover:underline"
                      >
                        {attorney.phone}
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    <p className="m-0">{attorney.region}</p>
                    <p className="m-0 mt-1 text-ink-muted">
                      {attorney.district}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink/75">
                    {attorney.services.join(", ")}
                  </td>
                  {showAttach && locale ? (
                    <td className="px-4 py-3">
                      <AttachAttorneyButton
                        locale={locale}
                        attorneyId={attorney.id}
                        orderId={orderId}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
