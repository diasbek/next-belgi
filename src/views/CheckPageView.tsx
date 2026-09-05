"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import type { CheckResponse } from "@/lib/check/types";
import { storeReport } from "@/lib/check/storage";
import { trackEvent } from "@/lib/analytics/events";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { CheckForm } from "@/components/molecules/CheckForm";
import { section, sectionTitle } from "@/styles/ui";

export function CheckPageView({
  locale,
  query,
  activity,
}: {
  locale: Locale;
  query: string;
  activity: string;
}) {
  const copy = getContent(locale);
  const router = useRouter();
  const [error, setError] = useState(false);
  const [running, setRunning] = useState(Boolean(query && activity));

  useEffect(() => {
    if (!query || !activity) {
      setRunning(false);
      return;
    }

    let cancelled = false;
    setRunning(true);
    setError(false);
    trackEvent("check_start");

    const minDelay = new Promise((resolve) => setTimeout(resolve, 1800));

    (async () => {
      try {
        const [res] = await Promise.all([
          fetch("/api/check/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, activity, locale }),
          }),
          minDelay,
        ]);
        const json = (await res.json()) as CheckResponse;
        if (cancelled) return;
        if (!res.ok || !json.ok || !json.report) {
          setError(true);
          setRunning(false);
          trackEvent("check_error");
          return;
        }
        storeReport(json.report);
        trackEvent("check_success", { source: json.source });
        const params = new URLSearchParams({ q: query, activity });
        router.replace(
          `${localePath(locale, "/check/result/")}?${params.toString()}`,
        );
      } catch {
        if (!cancelled) {
          setError(true);
          setRunning(false);
          trackEvent("check_error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, activity, locale, router]);

  if (!query || !activity) {
    return (
      <section className={`${section} bg-white`}>
        <PageContainer className="max-w-3xl">
          <h1 className={sectionTitle}>{copy.check.title}</h1>
          <p className="mb-8 text-ink-muted">{copy.check.lead}</p>
          <CheckForm
            locale={locale}
            brandPlaceholder={copy.ui.brandPlaceholder}
            activityPlaceholder={copy.ui.activityPlaceholder}
            submitLabel={copy.ui.check}
            compact
          />
        </PageContainer>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`${section} bg-white`}>
        <PageContainer className="max-w-xl text-center">
          <h1 className={sectionTitle}>{copy.check.errorTitle}</h1>
          <p className="mb-6 text-ink-muted">{copy.check.errorText}</p>
          <Button
            href={`${localePath(locale, "/check/")}?${new URLSearchParams({ q: query, activity }).toString()}`}
          >
            {copy.check.retry}
          </Button>
        </PageContainer>
      </section>
    );
  }

  if (running) {
    return (
      <section className="flex min-h-[70vh] items-center bg-white">
        <PageContainer className="max-w-lg text-center">
          <div className="mx-auto mb-8 h-16 w-16 animate-spin rounded-full border-4 border-lime border-t-primary" />
          <ul className="m-0 list-none space-y-4 p-0 text-left text-base text-ink md:text-lg">
            {copy.check.searchingItems.map((item) => (
              <li key={item} className="rounded-2xl bg-surface-muted px-5 py-4">
                {item}
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>
    );
  }

  return null;
}
