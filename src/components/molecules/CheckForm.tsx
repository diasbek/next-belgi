"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";
import { NiceActivityField } from "@/components/molecules/NiceActivityField";
import { NiceGoodsPicker } from "@/components/molecules/NiceGoodsPicker";
import { NiceClassesPreview } from "@/components/molecules/NiceClassesPreview";
import {
  customOptionValue,
  optionsToSelection,
  readNiceSelection,
  selectionToActivityString,
  storeNiceSelection,
  type ActivityOption,
} from "@/lib/nice";
import { fieldInput } from "@/styles/ui";
import { cn } from "@/lib/cn";

interface CheckFormProps {
  locale: Locale;
  brandPlaceholder: string;
  activityPlaceholder: string;
  submitLabel: string;
  className?: string;
  /** Single-row form (home / result). Default is multi-step stepper. */
  compact?: boolean;
  initialQuery?: string;
  initialActivity?: string;
  idPrefix?: string;
  /** Where to navigate after submit (default public /check/) */
  actionPath?: string;
}

type Step = 1 | 2 | 3;

function optionsFromSelectionOrActivity(
  initialActivity: string,
): ActivityOption[] {
  const stored = typeof window !== "undefined" ? readNiceSelection() : null;
  if (stored && (stored.terms.length > 0 || stored.customText)) {
    const opts: ActivityOption[] = stored.terms.map((t) => ({
      kind: "term" as const,
      value: t.id,
      label: t.term,
      classNumber: t.classNumber,
    }));
    if (stored.customText?.trim()) {
      opts.push({
        kind: "custom",
        value: customOptionValue(stored.customText.trim()),
        label: stored.customText.trim(),
      });
    }
    return opts;
  }
  if (!initialActivity.trim() || initialActivity.trim() === "general") {
    return [];
  }
  return [
    {
      kind: "custom",
      value: customOptionValue(initialActivity.trim()),
      label: initialActivity.trim(),
    },
  ];
}

function initialStep(query: string, options: ActivityOption[]): Step {
  if (query.trim() && options.length > 0) return 3;
  if (query.trim()) return 2;
  return 1;
}

function StepperHeader({
  locale,
  step,
}: {
  locale: Locale;
  step: Step;
}) {
  const s = getContent(locale).check.stepper;
  const items: { n: Step; label: string }[] = [
    { n: 1, label: s.stepBrand },
    { n: 2, label: s.stepGoods },
    { n: 3, label: s.stepConfirm },
  ];

  return (
    <ol className="m-0 flex list-none items-start justify-between gap-2 p-0 sm:gap-4">
      {items.map((item, i) => {
        const done = step > item.n;
        const active = step === item.n;
        return (
          <li
            key={item.n}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center text-center",
              i < items.length - 1 &&
                "after:absolute after:top-4 after:left-[calc(50%+1.25rem)] after:right-[calc(-50%+1.25rem)] after:h-0.5 after:content-['']",
              i < items.length - 1 &&
                (done || active ? "after:bg-lime" : "after:bg-black/10"),
            )}
          >
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                done && "bg-lime text-ink",
                active && "bg-lime text-ink ring-4 ring-lime/30",
                !done && !active && "bg-[#eceee8] text-ink-muted",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : item.n}
            </span>
            <span
              className={cn(
                "mt-2 max-w-[7.5rem] text-[0.7rem] font-medium leading-snug sm:text-xs",
                active || done ? "text-ink" : "text-ink-muted",
              )}
            >
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SummaryPanel({
  locale,
  query,
  options,
  classNumbers,
  onEditBrand,
}: {
  locale: Locale;
  query: string;
  options: ActivityOption[];
  classNumbers: number[];
  onEditBrand: () => void;
}) {
  const s = getContent(locale).check.stepper;
  return (
    <aside className="rounded-2xl bg-[#f3f4f1] p-4 sm:p-5">
      <p className="m-0 text-sm font-semibold text-ink">{s.yourCheck}</p>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-2">
          <p className="m-0 text-xs text-ink-muted">{s.brandLabel}</p>
          <button
            type="button"
            onClick={onEditBrand}
            className="shrink-0 text-xs font-medium text-ink-muted underline-offset-2 hover:underline"
          >
            {s.change}
          </button>
        </div>
        <p className="m-0 mt-1 break-words text-base font-semibold text-ink">
          {query.trim() || "—"}
        </p>
      </div>

      <div className="mt-4">
        <p className="m-0 text-xs text-ink-muted">
          {s.selectedCount.replace("{n}", String(options.length))}
        </p>
        {options.length ? (
          <ul className="mt-2 space-y-1.5">
            {options.map((o) => (
              <li
                key={o.value}
                className="flex gap-2 text-sm text-ink before:mt-2 before:size-1 before:shrink-0 before:rounded-full before:bg-ink/40 before:content-['']"
              >
                <span className="min-w-0 break-words">{o.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 mt-1 text-sm text-ink-muted">—</p>
        )}
      </div>

      {classNumbers.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {classNumbers.map((n) => (
            <span
              key={n}
              className="inline-flex rounded-full bg-lime px-2.5 py-1 text-xs font-semibold text-ink"
            >
              {s.niceChip.replace("{n}", String(n))}
            </span>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

export function CheckForm({
  locale,
  brandPlaceholder,
  activityPlaceholder,
  submitLabel,
  className,
  compact,
  initialQuery = "",
  initialActivity = "",
  idPrefix = "check",
  actionPath = "/check/",
}: CheckFormProps) {
  const copy = getContent(locale);
  const s = copy.check.stepper;
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activityOptions, setActivityOptions] = useState<ActivityOption[]>(() =>
    optionsFromSelectionOrActivity(initialActivity),
  );
  const [activitySeed, setActivitySeed] = useState(initialActivity);
  if (initialActivity !== activitySeed) {
    setActivitySeed(initialActivity);
    setActivityOptions(optionsFromSelectionOrActivity(initialActivity));
  }
  const [querySeed, setQuerySeed] = useState(initialQuery);
  if (initialQuery !== querySeed) {
    setQuerySeed(initialQuery);
    setQuery(initialQuery);
  }
  const [step, setStep] = useState<Step>(() =>
    initialStep(initialQuery, optionsFromSelectionOrActivity(initialActivity)),
  );
  const [pending, setPending] = useState(false);
  const brandId = `${idPrefix}-brand`;
  const activityId = `${idPrefix}-activity`;

  useEffect(() => {
    void import("@/lib/nice").then((m) => m.loadNiceTerms(locale));
  }, [locale]);

  const selection = useMemo(
    () => optionsToSelection(activityOptions),
    [activityOptions],
  );
  const activityText = selectionToActivityString(selection, locale);

  function submitCheck() {
    const q = query.trim();
    const a = activityText.trim();
    if (!q || !a) return;
    setPending(true);
    trackEvent("check_form_submit");
    storeNiceSelection(selection);
    const params = new URLSearchParams({ q, activity: a });
    if (selection.classNumbers.length) {
      params.set("nc", selection.classNumbers.join(","));
    }
    router.push(`${localePath(locale, actionPath)}?${params.toString()}`);
  }

  function onSubmitCompact(event: React.FormEvent) {
    event.preventDefault();
    submitCheck();
  }

  const lead =
    step === 1 ? s.leadBrand : step === 2 ? s.leadGoods : s.leadConfirm;

  if (compact) {
    return (
      <div className={cn("w-full", className)}>
        <form
          onSubmit={onSubmitCompact}
          className={cn(
            "grid w-full gap-[var(--grid-gap)]",
            "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] lg:items-start",
          )}
        >
          <label className="sr-only" htmlFor={brandId}>
            {brandPlaceholder}
          </label>
          <input
            id={brandId}
            name="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={brandPlaceholder}
            className={fieldInput}
            required
            autoComplete="off"
          />

          <div className="min-w-0">
            <label className="sr-only" htmlFor={activityId}>
              {activityPlaceholder}
            </label>
            <NiceActivityField
              locale={locale}
              value={activityOptions}
              onChange={setActivityOptions}
              placeholder={copy.ui.activitySearchHint}
              createLabel={copy.ui.activityCreateLabel}
              noOptionsMessage={copy.ui.activityNoOptions}
              loadingMessage={copy.ui.activityLoading}
              inputId={activityId}
              instanceId={`${idPrefix}-nice`}
            />
          </div>

          <Button
            type="submit"
            disabled={pending || !activityText.trim()}
            className="w-full min-w-0 lg:min-w-[9rem]"
          >
            {submitLabel}
          </Button>
        </form>

        <NiceClassesPreview
          locale={locale}
          classNumbers={selection.classNumbers}
          title={copy.ui.affectedClassesTitle}
          empty={copy.ui.affectedClassesEmpty}
          chipLabel={copy.ui.affectedClassChip}
          className="mt-3"
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-6 flex flex-col gap-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="m-0 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {s.title}
          </h1>
          <p className="m-0 mt-1.5 max-w-xl text-sm text-ink-muted sm:text-base">
            {lead}
          </p>
        </div>
      </div>

      <div className="mb-5 sm:mb-6">
        <StepperHeader locale={locale} step={step} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgb(26_28_24/0.04)]">
        <div className="p-4 sm:p-6">
          {step === 1 ? (
            <div className="mx-auto max-w-lg py-2 sm:py-4">
              <label
                htmlFor={brandId}
                className="mb-2 block text-sm font-medium text-ink"
              >
                {s.brandLabel}
              </label>
              <input
                id={brandId}
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={brandPlaceholder}
                className={cn(fieldInput, "text-lg")}
                required
                autoComplete="off"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (query.trim()) setStep(2);
                  }
                }}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,17rem)] lg:items-start">
              <div className="min-w-0">
                <h2 className="m-0 text-lg font-semibold text-ink">
                  {s.selectGoodsTitle}
                </h2>
                <div className="mt-4">
                  <label className="sr-only" htmlFor={activityId}>
                    {activityPlaceholder}
                  </label>
                  <NiceGoodsPicker
                    locale={locale}
                    value={activityOptions}
                    onChange={setActivityOptions}
                    inputId={activityId}
                  />
                </div>
                <p className="m-0 mt-3 text-xs text-ink-muted">{s.multiHint}</p>
              </div>
              <SummaryPanel
                locale={locale}
                query={query}
                options={activityOptions}
                classNumbers={selection.classNumbers}
                onEditBrand={() => setStep(1)}
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mx-auto max-w-lg space-y-5 py-2">
              <div className="rounded-2xl border border-black/5 bg-[#f8f9f6] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-xs text-ink-muted">{s.brandLabel}</p>
                    <p className="m-0 mt-1 text-xl font-semibold text-ink">
                      {query.trim()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-medium text-ink-muted underline-offset-2 hover:underline"
                  >
                    {s.change}
                  </button>
                </div>

                <div className="mt-4 border-t border-black/5 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="m-0 text-xs text-ink-muted">{s.confirmGoods}</p>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-medium text-ink-muted underline-offset-2 hover:underline"
                    >
                      {s.change}
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {activityOptions.map((o) => (
                      <li key={o.value} className="text-sm text-ink">
                        {o.label}
                        {o.kind === "term" && o.classNumber ? (
                          <span className="ml-2 text-xs text-ink-muted">
                            · {s.niceChip.replace("{n}", String(o.classNumber))}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>

                {selection.classNumbers.length ? (
                  <div className="mt-4 border-t border-black/5 pt-4">
                    <p className="m-0 text-xs text-ink-muted">
                      {s.confirmClasses}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selection.classNumbers.map((n) => (
                        <span
                          key={n}
                          className="inline-flex rounded-full bg-lime px-2.5 py-1 text-xs font-semibold text-ink"
                        >
                          {s.niceChip.replace("{n}", String(n))}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="m-0 flex items-start gap-2 text-xs text-ink-muted">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-black/15 text-[0.65rem] font-semibold"
                >
                  i
                </span>
                {s.creditNote}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-4 py-4 sm:px-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((step - 1) as Step)}
            >
              ← {s.back}
            </Button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button
              type="button"
              disabled={
                (step === 1 && !query.trim()) ||
                (step === 2 && !activityText.trim())
              }
              onClick={() => setStep((step + 1) as Step)}
            >
              {s.continue} →
            </Button>
          ) : (
            <Button
              type="button"
              disabled={pending || !query.trim() || !activityText.trim()}
              onClick={() => submitCheck()}
            >
              {pending ? "…" : s.startCheck}
            </Button>
          )}
        </div>
      </div>

      {step === 1 ? (
        <p className="m-0 mt-4 text-center text-xs text-ink-muted">
          {s.nextGoodsHint}
        </p>
      ) : null}
      {step === 2 ? (
        <p className="m-0 mt-4 text-center text-xs text-ink-muted">
          {s.nextConfirmHint}
        </p>
      ) : null}
      {step === 3 ? (
        <p className="m-0 mt-4 text-center text-xs text-ink-muted">
          {s.nextRunHint}
        </p>
      ) : null}
    </div>
  );
}
