"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import type { TrademarkReport } from "@/lib/check/types";
import { createRequestId } from "@/lib/form/utils";
import { submitLead } from "@/lib/form/submitLead";
import {
  checkResumePath,
  loginWithNext,
} from "@/lib/navigation/safe-next";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { CheckForm } from "@/components/molecules/CheckForm";
import {
  readStoredReport,
  readStoredReportPreview,
  readStoredCheckMeta,
  type StoredCheckMeta,
} from "@/lib/check/storage";
import { ConclusionPdfButton } from "@/components/pdf/conclusion/ConclusionPdfButton";
import type { ConclusionDocument } from "@/lib/conclusion";
import {
  cardLime,
  gridSpanHalf,
  gridSpanQuarter,
  section,
  sectionDense,
  sectionGrid,
} from "@/styles/ui";
import { cn } from "@/lib/cn";

function lawyerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CheckResultPageView({
  locale,
  query,
  activity,
  embedded = false,
  actionPath = "/check/",
}: {
  locale: Locale;
  query: string;
  activity: string;
  embedded?: boolean;
  actionPath?: "/check/" | "/account/check/";
}) {
  const copy = getContent(locale);
  const appCopy = getAppCopy(locale);
  const reportKey = `${query}\0${activity}`;
  const [report, setReport] = useState<TrademarkReport | null>(() =>
    readStoredReport(),
  );
  const [preview, setPreview] = useState(() => readStoredReportPreview());
  const [checkMeta, setCheckMeta] = useState<StoredCheckMeta | null>(() =>
    readStoredCheckMeta(),
  );
  const [loadedKey, setLoadedKey] = useState(reportKey);
  if (loadedKey !== reportKey) {
    setLoadedKey(reportKey);
    setReport(readStoredReport());
    setPreview(readStoredReportPreview());
    setCheckMeta(readStoredCheckMeta());
  }
  const checkFormPath = actionPath;
  const resultEmptyHref = localePath(locale, actionPath);

  if (!report) {
    const empty = (
      <>
        <h1 className="m-0 mb-4 text-2xl font-semibold">
          {copy.check.errorTitle}
        </h1>
        <p className="mb-6 text-ink-muted">{copy.check.lead}</p>
        <Button href={resultEmptyHref}>{copy.ui.check}</Button>
      </>
    );
    if (embedded) {
      return <div className="py-6 text-center">{empty}</div>;
    }
    return (
      <section className={`${section} bg-white`}>
        <PageContainer measure="focus" innerClassName="text-center">
          {empty}
        </PageContainer>
      </section>
    );
  }

  const uzSource = report.sources.find((s) => s.id === "uz");
  const otherSources = report.sources.filter((s) => s.id !== "uz");
  const resume = checkResumePath(
    locale,
    report.query || query,
    report.activity || activity,
    actionPath,
  );
  const loginHref = loginWithNext(locale, resume);
  const registerHref = `${localePath(locale, "/register/")}?next=${encodeURIComponent(resume)}`;

  const reportBody = (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="m-0 text-sm text-ink-muted">
            {copy.report.markTypeLabel}
          </p>
          <h1 className="m-0 mt-1 break-words font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {report.query}
          </h1>
        </div>
        <div className="min-w-0 text-left text-sm sm:max-w-xs sm:text-right">
          <p className="m-0 text-ink-muted">{copy.report.classesLabel}</p>
          <p className="m-0 mt-1 break-words text-ink">
            {report.niceClasses.join(" ")}
          </p>
          <p className="m-0 mt-2 text-ink-muted">
            {copy.report.markTypeLabel}: {report.markType}
          </p>
          {!preview && checkMeta?.conclusion ? (
            <div className="mt-3 sm:flex sm:justify-end">
              <ConclusionPdfButton
                locale={locale}
                conclusion={checkMeta.conclusion as ConclusionDocument}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="m-0 mb-3 text-base font-semibold">
          {copy.report.registryUz}
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {(uzSource?.matches ?? []).map((match) => (
            <article
              key={match.id}
              className="grid gap-3 px-3 py-4 sm:px-4 sm:py-5 md:grid-cols-[1fr_1.2fr_auto] md:items-start"
            >
              <div className="flex items-start justify-between gap-3 md:block">
                <div className="min-w-0">
                  <p className="m-0 text-lg font-semibold">{match.name}</p>
                  {match.owner ? (
                    <p className="m-0 mt-2 break-words text-xs text-ink-muted">
                      {match.owner}
                    </p>
                  ) : null}
                  <p className="m-0 mt-1 text-xs text-ink-muted">
                    {[
                      match.registeredFrom
                        ? `Рег. ${match.registeredFrom}${match.registeredTo ? ` - ${match.registeredTo}` : ""}`
                        : null,
                      match.status ? `[${match.status}]` : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
                <p className="m-0 shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink md:hidden">
                  {match.similarity}%
                </p>
              </div>
              <div className="min-w-0">
                <p className="m-0 text-xs text-ink-muted">
                  {copy.report.classesLabel}
                </p>
                <p className="m-0 mt-1 break-words whitespace-pre-line text-sm leading-relaxed text-ink">
                  {match.classesText}
                </p>
              </div>
              <p className="m-0 hidden text-sm font-semibold text-ink md:block">
                {copy.report.similarityLabel} {match.similarity}%
              </p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-left text-xs text-ink-muted sm:text-right">
          {copy.report.nameSimilarity} {uzSource?.matches.length ?? 0}
        </p>
      </div>

      {otherSources.map((source) => (
        <div key={source.id} className="mb-8">
          <h2 className="m-0 mb-2 text-base font-semibold">{source.title}</h2>
          {source.empty ? (
            <p className="m-0 text-sm text-ink-muted">
              {source.emptyText || copy.report.noMatches}
            </p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {source.matches.map((match) => (
                <article
                  key={match.id}
                  className="flex items-center justify-between gap-4 px-3 py-4 sm:px-4"
                >
                  <p className="m-0 min-w-0 break-words font-semibold">
                    {match.name}
                  </p>
                  <p className="m-0 shrink-0 text-sm">
                    {copy.report.similarityLabel} {match.similarity}%
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className={cn(sectionGrid, gridSpanHalf, "mb-8")}>
        <div className={cardLime}>
          <h2 className="m-0 text-base font-semibold">
            {copy.report.conclusionTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            {copy.report.conclusionLead}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
            {report.classRisks.map((risk) => (
              <div
                key={risk.classNumber}
                className="flex h-20 w-[calc(50%-0.25rem)] max-w-28 flex-col justify-between rounded-xl bg-white p-2.5 sm:h-24 sm:w-28 sm:p-3"
              >
                <span className="text-xs text-ink-muted">
                  {risk.classNumber} класс
                </span>
                <span className="text-xl font-semibold sm:text-2xl">
                  {risk.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] bg-primary p-4 text-white sm:p-5 md:p-6">
          <h2 className="m-0 text-base font-semibold">
            {copy.report.recommendationsTitle}
          </h2>
          <p className="mt-4 text-sm text-white/75">
            {copy.report.replaceHint}
          </p>
          <p className="mt-2 break-words text-lg font-semibold">
            {report.recommendations.alternatives.join(" / ")}
          </p>
          <p className="mt-6 text-xs text-white/60">
            {copy.report.specialistHint}
          </p>
        </div>
      </div>

      <div className={cn(sectionGrid, gridSpanQuarter, "mb-6")}>
        {report.lawyers.map((lawyer) => (
          <article
            key={lawyer.id}
            className="rounded-2xl border border-border bg-white p-3 sm:p-4"
          >
            <div
              className={cn(
                "mb-2 flex h-16 items-center justify-center rounded-xl bg-surface-muted text-base font-semibold text-ink/50 sm:mb-3 sm:h-20 sm:text-xl",
              )}
              aria-hidden
            >
              {lawyerInitials(lawyer.name)}
            </div>
            <p className="m-0 text-xs text-ink-muted">{lawyer.role}</p>
            <p className="m-0 mt-1 text-sm font-semibold leading-snug">
              {lawyer.name}
            </p>
            <Button
              className="mt-3 w-full text-xs sm:mt-4"
              onClick={() => {
                void submitLead({
                  type: "lawyer",
                  locale,
                  requestId: createRequestId("lawyer"),
                  data: {
                    lawyerId: lawyer.id,
                    lawyerName: lawyer.name,
                    query: report.query,
                    activity: report.activity,
                  },
                  successTitle: copy.contacts.successTitle,
                  successText: copy.contacts.successText,
                  eventPrefix: "lawyer",
                });
              }}
            >
              {copy.ui.contactLawyer}
            </Button>
          </article>
        ))}
      </div>

      <p className="m-0 text-xs leading-relaxed text-ink-muted">
        {copy.report.disclaimer}{" "}
        <a
          href={localePath(locale, "/ai-disclaimer/")}
          className="font-medium text-ink underline underline-offset-2"
        >
          {locale === "ru"
            ? "Подробнее"
            : locale === "en"
              ? "Learn more"
              : "Batafsil"}
        </a>
      </p>
    </>
  );

  const content = (
    <>
      <CheckForm
        locale={locale}
        brandPlaceholder={copy.ui.brandPlaceholder}
        activityPlaceholder={copy.ui.activityPlaceholder}
        submitLabel={copy.ui.check}
        compact
        idPrefix={embedded ? "account-result-check" : "result-check"}
        actionPath={checkFormPath}
        initialQuery={report.query}
        initialActivity={report.activity || activity}
        className="mb-6 sm:mb-8"
      />

      {preview ? (
        <div className="relative">
          <div
            className="pointer-events-none max-h-[min(70vh,42rem)] overflow-hidden select-none"
            aria-hidden
          >
            <div className="blur-[7px] sm:blur-md">{reportBody}</div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/90 to-transparent"
              aria-hidden
            />
          </div>

          <div className="relative z-10 mx-auto -mt-28 max-w-md rounded-[1.5rem] border border-black/5 bg-white px-5 py-6 text-center shadow-md sm:-mt-32 sm:px-8 sm:py-8">
            <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {appCopy.checkGate.unlockTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted sm:text-base">
              {appCopy.checkGate.unlockLead}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href={loginHref} className="w-full sm:w-auto">
                {appCopy.checkGate.signIn}
              </Button>
              <Button
                href={registerHref}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {appCopy.checkGate.signUp}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        reportBody
      )}
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <section className={`${sectionDense} bg-white`}>
      <PageContainer>{content}</PageContainer>
    </section>
  );
}
