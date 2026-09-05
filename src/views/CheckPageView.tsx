"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import type { CheckResponse } from "@/lib/check/types";
import { storeReport } from "@/lib/check/storage";
import { trackEvent } from "@/lib/analytics/events";
import {
  checkResumePath,
  loginWithNext,
} from "@/lib/navigation/safe-next";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { CheckForm } from "@/components/molecules/CheckForm";
import { section, sectionTitle } from "@/styles/ui";

export function CheckPageView({
  locale,
  query,
  activity,
  embedded = false,
  actionPath = "/check/",
}: {
  locale: Locale;
  query: string;
  activity: string;
  /** Render without public page chrome (for AppShell) */
  embedded?: boolean;
  actionPath?: "/check/" | "/account/check/";
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
            body: JSON.stringify({ query, activity, locale, actionPath }),
          }),
          minDelay,
        ]);
        const json = (await res.json()) as CheckResponse & {
          error?: string;
          redirect?: string;
        };
        if (cancelled) return;
        const resume = checkResumePath(locale, query, activity, actionPath);
        if (res.status === 401) {
          router.replace(loginWithNext(locale, resume));
          return;
        }
        if (res.status === 402 || res.status === 503) {
          router.replace(
            `${localePath(locale, "/account/billing/")}?next=${encodeURIComponent(resume)}`,
          );
          return;
        }
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
  }, [query, activity, locale, router, actionPath]);

  const form = (
    <>
      <h1 className={sectionTitle}>{copy.check.title}</h1>
      <p className={embedded ? "mb-6 text-ink-muted" : "mb-8 text-ink-muted"}>
        {copy.check.lead}
      </p>
      <CheckForm
        locale={locale}
        brandPlaceholder={copy.ui.brandPlaceholder}
        activityPlaceholder={copy.ui.activityPlaceholder}
        submitLabel={copy.ui.check}
        compact
        idPrefix={embedded ? "account-check" : "check-page"}
        actionPath={actionPath}
        initialQuery={query}
        initialActivity={activity}
      />
    </>
  );

  if (!query || !activity) {
    if (embedded) return <div>{form}</div>;
    return (
      <section className={`${section} bg-white`}>
        <PageContainer measure="band">{form}</PageContainer>
      </section>
    );
  }

  if (error) {
    const retryHref = `${localePath(locale, actionPath)}?${new URLSearchParams({ q: query, activity }).toString()}`;
    const body = (
      <>
        <h1 className={sectionTitle}>{copy.check.errorTitle}</h1>
        <p className="mb-6 text-ink-muted">{copy.check.errorText}</p>
        <Button href={retryHref}>{copy.check.retry}</Button>
      </>
    );
    if (embedded) return <div className="text-center">{body}</div>;
    return (
      <section className={`${section} bg-white`}>
        <PageContainer measure="focus" innerClassName="text-center">
          {body}
        </PageContainer>
      </section>
    );
  }

  if (running) {
    const body = (
      <>
        <div className="mx-auto mb-8 h-14 w-14 animate-spin rounded-full border-4 border-lime border-t-primary sm:h-16 sm:w-16" />
        <ul className="m-0 list-none space-y-3 p-0 text-left text-sm text-ink sm:space-y-4 sm:text-base md:text-lg">
          {copy.check.searchingItems.map((item) => (
            <li
              key={item}
              className="rounded-2xl bg-surface-muted px-4 py-3.5 sm:px-5 sm:py-4"
            >
              {item}
            </li>
          ))}
        </ul>
      </>
    );
    if (embedded) {
      return <div className="mx-auto max-w-lg py-8 text-center">{body}</div>;
    }
    return (
      <section className="flex min-h-[70vh] items-center bg-white py-10">
        <PageContainer measure="focus" innerClassName="text-center">
          {body}
        </PageContainer>
      </section>
    );
  }

  return null;
}
