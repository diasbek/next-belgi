"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getServicesCopy } from "@/data/services-catalog";
import {
  JURISDICTION_CODES,
  type JurisdictionCode,
} from "@/lib/check/jurisdictions";
import {
  estimateFees,
  FEE_AS_OF,
  type FeeLine,
} from "@/lib/services/fee-estimate";
import { cn } from "@/lib/cn";

const JURISDICTION_LABELS: Record<Locale, Record<JurisdictionCode, string>> = {
  uz: {
    uz: "Oʻzbekiston",
    wipo: "Madrid (WIPO)",
    eu: "Yevropa Ittifoqi",
    us: "AQSh",
    au: "Avstraliya",
    kz: "Qozogʻiston",
  },
  ru: {
    uz: "Узбекистан",
    wipo: "Мадрид (WIPO)",
    eu: "Евросоюз",
    us: "США",
    au: "Австралия",
    kz: "Казахстан",
  },
  en: {
    uz: "Uzbekistan",
    wipo: "Madrid (WIPO)",
    eu: "European Union",
    us: "United States",
    au: "Australia",
    kz: "Kazakhstan",
  },
};

function formatMoney(amount: number, currency: string, locale: Locale) {
  try {
    return new Intl.NumberFormat(
      locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US",
      { style: "currency", currency, maximumFractionDigits: 0 },
    ).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function FeeCalculator({ locale }: { locale: Locale }) {
  const copy = getServicesCopy(locale).fees;
  const labels = JURISDICTION_LABELS[locale];
  const [classCount, setClassCount] = useState(1);
  const [selected, setSelected] = useState<JurisdictionCode[]>(["uz"]);

  const lines: FeeLine[] = useMemo(
    () => estimateFees(selected, Math.max(1, classCount)),
    [selected, classCount],
  );

  const byCurrency = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of lines) {
      map.set(line.currency, (map.get(line.currency) ?? 0) + line.amount);
    }
    return [...map.entries()];
  }, [lines]);

  function toggle(code: JurisdictionCode) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  return (
    <div id="tool" className="scroll-mt-24 rounded-2xl bg-surface-muted p-5 sm:p-6">
      <h2 className="m-0 font-display text-xl font-semibold text-ink sm:text-2xl">
        {copy.title}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{copy.lead}</p>

      <label className="mt-5 block text-sm font-medium text-ink">
        {copy.classesLabel}
        <input
          type="number"
          min={1}
          max={45}
          value={classCount}
          onChange={(e) => setClassCount(Number(e.target.value) || 1)}
          className="mt-1.5 w-full max-w-[8rem] rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink"
        />
      </label>

      <fieldset className="mt-5 m-0 border-0 p-0">
        <legend className="text-sm font-medium text-ink">
          {copy.jurisdictionsLabel}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {JURISDICTION_CODES.map((code) => {
            const on = selected.includes(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggle(code)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  on
                    ? "bg-ink text-white"
                    : "bg-white text-ink ring-1 ring-ink/15 hover:bg-lime/40",
                )}
              >
                {labels[code]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <h3 className="m-0 text-base font-semibold text-ink">
          {copy.estimateTitle}
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          {copy.asOf}: {FEE_AS_OF}
        </p>

        {lines.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">{copy.empty}</p>
        ) : (
          <ul className="mt-3 m-0 list-none space-y-2 p-0">
            {lines.map((line) => (
              <li
                key={`${line.jurisdiction}-${line.feeType}-${line.label}`}
                className="flex justify-between gap-3 text-sm text-ink"
              >
                <span>
                  {labels[line.jurisdiction]} — {line.label}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatMoney(line.amount, line.currency, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {byCurrency.length > 0 && (
          <p className="mt-4 border-t border-ink/10 pt-3 text-sm font-semibold text-ink">
            {copy.totalLabel}:{" "}
            {byCurrency
              .map(([cur, sum]) => formatMoney(sum, cur, locale))
              .join(" · ")}
          </p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          {copy.disclaimer}
        </p>
      </div>
    </div>
  );
}
