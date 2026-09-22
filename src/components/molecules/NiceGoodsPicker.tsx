"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import {
  customOptionValue,
  searchNiceTerms,
  type ActivityOption,
} from "@/lib/nice";
import { fieldInput } from "@/styles/ui";
import { cn } from "@/lib/cn";
import { IconSearch } from "@/components/atoms/DashIcons";

function classLabel(n: number, template: string) {
  return template.replace("{n}", String(n));
}

export function NiceGoodsPicker({
  locale,
  value,
  onChange,
  inputId,
}: {
  locale: Locale;
  value: ActivityOption[];
  onChange: (next: ActivityOption[]) => void;
  inputId?: string;
}) {
  const copy = getContent(locale);
  const s = copy.check.stepper;
  const autoId = useId();
  const id = inputId || autoId;
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ActivityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedIds = new Set(value.map((o) => o.value));

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void searchNiceTerms(locale, query, 40).then((terms) => {
        setHits(
          terms.map((t) => ({
            kind: "term" as const,
            value: t.id,
            label: t.label,
            classNumber: t.classNumber,
          })),
        );
        setLoading(false);
      });
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, locale]);

  function toggle(opt: ActivityOption) {
    if (selectedIds.has(opt.value)) {
      onChange(value.filter((o) => o.value !== opt.value));
      return;
    }
    onChange([...value, opt]);
  }

  function addCustom() {
    const label = q.trim();
    if (label.length < 2) return;
    const custom: ActivityOption = {
      kind: "custom",
      value: customOptionValue(label),
      label,
    };
    if (selectedIds.has(custom.value)) return;
    onChange([...value, custom]);
    setQ("");
  }

  const showCreate =
    q.trim().length >= 2 &&
    !hits.some((h) => h.label.toLowerCase() === q.trim().toLowerCase()) &&
    !value.some((o) => o.label.toLowerCase() === q.trim().toLowerCase());

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">
          <IconSearch />
        </span>
        <input
          id={id}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (hits[0]) toggle(hits[0]);
              else if (showCreate) addCustom();
            }
          }}
          placeholder={copy.ui.activitySearchHint}
          className={cn(fieldInput, "pl-10 pr-10")}
          autoComplete="off"
          autoFocus
        />
        {q ? (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute inset-y-0 right-2 flex items-center rounded-full px-2 text-lg leading-none text-ink-muted hover:text-ink"
            aria-label="Clear"
          >
            ×
          </button>
        ) : null}
      </div>

      {q.trim().length >= 2 ? (
        <div className="mt-4">
          <p className="m-0 mb-2 text-xs font-medium text-ink-muted">
            {s.searchResults}
            {loading ? "…" : null}
          </p>
          <ul className="m-0 max-h-[min(22rem,50vh)] list-none space-y-0.5 overflow-y-auto overscroll-contain p-0">
            {hits.map((opt) => {
              const checked = selectedIds.has(opt.value);
              return (
                <li key={opt.value}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                      checked ? "bg-[#f4fbe6]" : "hover:bg-[#f8f9f6]",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(opt)}
                      className="size-4 shrink-0 accent-[var(--color-lime,#dfff9e)]"
                    />
                    <span className="min-w-0 flex-1 text-sm text-ink">
                      {opt.label}
                    </span>
                    {opt.kind === "term" && opt.classNumber ? (
                      <span className="shrink-0 text-xs text-ink-muted">
                        {classLabel(opt.classNumber, s.classRow)}
                      </span>
                    ) : null}
                  </label>
                </li>
              );
            })}
            {showCreate ? (
              <li>
                <button
                  type="button"
                  onClick={addCustom}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-[#f8f9f6]"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded border border-black/15 text-[0.65rem]">
                    +
                  </span>
                  <span>
                    {copy.ui.activityCreateLabel.replace("{input}", q.trim())}
                  </span>
                </button>
              </li>
            ) : null}
            {!loading && hits.length === 0 && !showCreate ? (
              <li className="px-3 py-2 text-sm text-ink-muted">
                {copy.ui.activityNoOptions}
              </li>
            ) : null}
          </ul>
        </div>
      ) : (
        <p className="m-0 mt-3 text-xs text-ink-muted">
          {copy.ui.activitySearchHint}
        </p>
      )}

      {value.length > 0 && q.trim().length < 2 ? (
        <ul className="m-0 mt-4 list-none space-y-0.5 p-0">
          {value.map((opt) => (
            <li key={opt.value}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f4fbe6] px-3 py-2.5">
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggle(opt)}
                  className="size-4 shrink-0 accent-[var(--color-lime,#dfff9e)]"
                />
                <span className="min-w-0 flex-1 text-sm text-ink">
                  {opt.label}
                </span>
                {opt.kind === "term" && opt.classNumber ? (
                  <span className="shrink-0 text-xs text-ink-muted">
                    {classLabel(locale, opt.classNumber, s.classRow)}
                  </span>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
