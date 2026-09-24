"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import type { CheckResponse } from "@/lib/check/types";
import {
  storeReport,
  storeCheckMeta,
} from "@/lib/check/storage";
import {
  isPreviewSafeReport,
  toPreviewReport,
} from "@/lib/check/preview-report";
import { trackEvent } from "@/lib/analytics/events";
import {
  checkResumePath,
} from "@/lib/navigation/safe-next";
import { readNiceSelection } from "@/lib/nice";
import { readJurisdictions } from "@/lib/check/jurisdiction-storage";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { CheckForm } from "@/components/molecules/CheckForm";
import { section, sectionTitle, sectionViewportCenter } from "@/styles/ui";

/** Minimum time the analysis UI stays visible, even if the API is instant. */
const CHECK_MIN_LOADING_MS = 30_000;

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
  const [activeStep, setActiveStep] = useState(0);
  const canRun = Boolean(query && activity);
  const pipelineSteps =
    copy.check.searchingItems.length > 0
      ? copy.check.searchingItems
      : copy.home.analysisSteps.map((s) => s.title);

  useEffect(() => {
    if (!canRun || !running || error) return;
    const stepCount = Math.max(1, pipelineSteps.length);
    const tickMs = CHECK_MIN_LOADING_MS / stepCount;
    const id = window.setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, stepCount - 1));
    }, tickMs);
    return () => window.clearInterval(id);
  }, [canRun, running, error, pipelineSteps.length]);

  useEffect(() => {
    if (!canRun) return;

    let cancelled = false;
    const boot = window.setTimeout(() => {
      if (cancelled) return;
      setActiveStep(0);
      setRunning(true);
      setError(false);
    }, 0);
    trackEvent("check_start");

    const minDelay = new Promise((resolve) =>
      setTimeout(resolve, CHECK_MIN_LOADING_MS),
    );

    (async () => {
      const niceSelection = readNiceSelection() ?? undefined;
      const jurisdictions = readJurisdictions();
      const request = fetch("/api/check/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          activity,
          locale,
          actionPath,
          niceSelection,
          jurisdictions,
        }),
      })
        .then(async (res) => {
          const json = (await res.json()) as CheckResponse & {
            error?: string;
            redirect?: string;
            preview?: boolean;
            checkId?: string | null;
            verificationCode?: string | null;
            conclusion?: import("@/lib/conclusion").ConclusionDocument | null;
          };
          return { ok: true as const, res, json };
        })
        .catch(() => ({ ok: false as const }));

      const [outcome] = await Promise.all([request, minDelay]);
      if (cancelled) return;

      if (!outcome.ok) {
        setError(true);
        setRunning(false);
        trackEvent("check_error");
        return;
      }

      const { res, json } = outcome;
      const resume = checkResumePath(locale, query, activity, actionPath);
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
      const isPreview = Boolean(json.preview);
      const report =
        isPreview && !isPreviewSafeReport(json.report)
          ? toPreviewReport(json.report, locale)
          : json.report;
      storeReport(report, isPreview);
      storeCheckMeta({
        checkId: isPreview ? null : (json.checkId ?? null),
        verificationCode: isPreview ? null : (json.verificationCode ?? null),
        conclusion: isPreview ? null : (json.conclusion ?? null),
      });
      trackEvent("check_success", {
        source: json.source,
        preview: isPreview,
      });
      const params = new URLSearchParams({ q: query, activity });
      if (!isPreview && json.checkId) params.set("checkId", json.checkId);
      const resultPath =
        actionPath === "/account/check/"
          ? "/account/check/result/"
          : "/check/result/";
      router.replace(
        `${localePath(locale, resultPath)}?${params.toString()}`,
      );
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(boot);
    };
  }, [canRun, query, activity, locale, router, actionPath]);

  const form = (
    <CheckForm
      locale={locale}
      brandPlaceholder={copy.ui.brandPlaceholder}
      activityPlaceholder={copy.ui.activityPlaceholder}
      submitLabel={copy.ui.check}
      idPrefix={embedded ? "account-check" : "check-page"}
      actionPath={actionPath}
      initialQuery={query}
      initialActivity={activity}
      hideTitle={embedded}
    />
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
    const stepLabel = pipelineSteps[activeStep] ?? pipelineSteps[0] ?? "";
    const stepNo = String(activeStep + 1).padStart(2, "0");
    const totalNo = String(pipelineSteps.length).padStart(2, "0");
    const body = (
      <>
        <div
          className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-lime border-t-primary sm:mb-8 sm:h-16 sm:w-16"
          aria-hidden
        />
        <p className="m-0 mb-8 text-base font-medium text-ink sm:mb-10 sm:text-lg">
          {copy.check.searchingTitle}
        </p>
        <div
          className="mx-auto w-full max-w-md"
          aria-busy="true"
          aria-live="polite"
        >
          <div
            key={activeStep}
            className="rounded-2xl bg-lime/50 px-5 py-4 text-left sm:px-6 sm:py-5"
          >
            <p className="m-0 text-xs font-semibold tabular-nums text-ink/50">
              {stepNo} / {totalNo}
            </p>
            <p className="m-0 mt-2 text-base font-semibold leading-snug text-ink sm:text-lg">
              {stepLabel}
            </p>
          </div>
        </div>
      </>
    );
    if (embedded) {
      return <div className="mx-auto max-w-lg py-8 text-center">{body}</div>;
    }
    return (
      <section className={`${sectionViewportCenter} bg-white`}>
        <PageContainer measure="focus" innerClassName="text-center">
          {body}
        </PageContainer>
      </section>
    );
  }

  return null;
}
