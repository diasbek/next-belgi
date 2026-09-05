"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import type { TrademarkReport } from "@/lib/check/types";
import { createRequestId } from "@/lib/form/utils";
import { submitLead } from "@/lib/form/submitLead";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { CheckForm } from "@/components/molecules/CheckForm";
import { readStoredReport } from "@/lib/check/storage";
import { cardLime, section, sectionGrid } from "@/styles/ui";
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
}: {
  locale: Locale;
  query: string;
  activity: string;
}) {
  const copy = getContent(locale);
  const [report, setReport] = useState<TrademarkReport | null>(null);

  useEffect(() => {
    const stored = readStoredReport();
    if (stored) {
      setReport(stored);
      return;
    }
    setReport(null);
  }, [query, activity]);

  if (!report) {
    return (
      <section className={`${section} bg-white`}>
        <PageContainer measure="focus" innerClassName="text-center">
          <h1 className="m-0 mb-4 text-2xl font-semibold">
            {copy.check.errorTitle}
          </h1>
          <p className="mb-6 text-ink-muted">{copy.check.lead}</p>
          <Button href={localePath(locale, "/check/")}>{copy.ui.check}</Button>
        </PageContainer>
      </section>
    );
  }

  const uzSource = report.sources.find((s) => s.id === "uz");
  const otherSources = report.sources.filter((s) => s.id !== "uz");

  return (
    <section className={`${section} bg-white`}>
      <PageContainer>
        <CheckForm
          locale={locale}
          brandPlaceholder={copy.ui.brandPlaceholder}
          activityPlaceholder={copy.ui.activityPlaceholder}
          submitLabel={copy.ui.check}
          compact
          idPrefix="result-check"
          initialQuery={report.query}
          initialActivity={report.activity || activity}
          className="mb-8 sm:mb-10"
        />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
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
          </div>
        </div>

        <div className="mb-10">
          <h2 className="m-0 mb-4 text-base font-semibold">
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

        <div
          className={cn(
            sectionGrid,
            "mb-10 [&>*]:col-span-4 lg:[&>*]:col-span-6",
          )}
        >
          <div className={cardLime}>
            <h2 className="m-0 text-base font-semibold">
              {copy.report.conclusionTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              {copy.report.conclusionLead}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {report.classRisks.map((risk) => (
                <div
                  key={risk.classNumber}
                  className="flex h-24 w-[calc(50%-0.375rem)] max-w-28 flex-col justify-between rounded-xl bg-white p-3 sm:h-28 sm:w-28"
                >
                  <span className="text-xs text-ink-muted">
                    {risk.classNumber} класс
                  </span>
                  <span className="text-2xl font-semibold">{risk.percent}%</span>
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

        <div
          className={cn(
            sectionGrid,
            "mb-8 [&>*]:col-span-4 sm:[&>*]:col-span-4 lg:[&>*]:col-span-3",
          )}
        >
          {report.lawyers.map((lawyer) => (
            <article
              key={lawyer.id}
              className="rounded-2xl border border-border bg-white p-4"
            >
              <div
                className={cn(
                  "mb-3 flex h-24 items-center justify-center rounded-xl bg-surface-muted text-xl font-semibold text-ink/50 sm:h-28",
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
                className="mt-4 w-full text-xs"
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
            href={locale === "ru" ? "/ru/ai-disclaimer/" : "/ai-disclaimer/"}
            className="font-medium text-ink underline underline-offset-2"
          >
            {locale === "ru" ? "Подробнее" : "Batafsil"}
          </a>
        </p>
      </PageContainer>
    </section>
  );
}
