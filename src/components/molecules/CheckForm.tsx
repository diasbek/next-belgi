"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/atoms/Button";
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
}: CheckFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activity, setActivity] = useState(initialActivity);
  const [pending, setPending] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    const a = activity.trim();
    if (!q || !a) return;
    setPending(true);
    trackEvent("check_form_submit");
    const params = new URLSearchParams({ q, activity: a });
    router.push(`${localePath(locale, "/check/")}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "grid gap-3",
        compact
          ? "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_auto]"
          : "w-full max-w-3xl",
        className,
      )}
    >
      <label className="sr-only" htmlFor="brand-name">
        {brandPlaceholder}
      </label>
      <input
        id="brand-name"
        name="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={brandPlaceholder}
        className={fieldInput}
        required
        autoComplete="off"
      />
      <label className="sr-only" htmlFor="activity">
        {activityPlaceholder}
      </label>
      <input
        id="activity"
        name="activity"
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        placeholder={activityPlaceholder}
        className={fieldInput}
        required
        autoComplete="off"
      />
      <Button type="submit" disabled={pending} className="min-w-[9rem]">
        {submitLabel}
      </Button>
    </form>
  );
}
