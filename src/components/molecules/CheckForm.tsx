"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";
import { NiceActivityField } from "@/components/molecules/NiceActivityField";
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
  compact?: boolean;
  initialQuery?: string;
  initialActivity?: string;
  idPrefix?: string;
  /** Where to navigate after submit (default public /check/) */
  actionPath?: string;
}

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

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
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

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={onSubmit}
        className={cn(
          "grid w-full gap-[var(--grid-gap)]",
          compact &&
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
