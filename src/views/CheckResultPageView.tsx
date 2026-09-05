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
import { cardLime, section } from "@/styles/ui";

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
        <PageContainer className="max-w-xl text-center">
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
      <PageContainer className="max-w-4xl">
        <CheckForm
          locale={locale}
          brandPlaceholder={copy.ui.brandPlaceholder}
          activityPlaceholder={copy.ui.activityPlaceholder}
          submitLabel={copy.ui.check}
          compact
          initialQuery={report.query}
          initialActivity={report.activity || activity}
          className="mb-10"
        />

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="m-0 text-sm text-ink-muted">
              {copy.report.markTypeLabel}
            </p>
            <h1 className="m-0 mt-1 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              {report.query}
            </h1>
          </div>
          <div className="text-right text-sm">
            <p className="m-0 text-ink-muted">{copy.report.classesLabel}</p>
            <p className="m-0 mt-1 max-w-xs text-ink">
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
          <div className="divide-y divide-border rounded-2xl border border-border">
            {(uzSource?.matches ?? []).map((match) => (
              <article
                key={match.id}
                className="grid gap-3 px-4 py-5 md:grid-cols-[1fr_1.2fr_auto] md:items-start"
              >
                <div>
                  <p className="m-0 text-lg font-semibold">{match.name}</p>
                  {match.owner ? (
                    <p className="m-0 mt-2 text-xs text-ink-muted">
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
                <div>
                  <p className="m-0 text-xs text-ink-muted">
                    {copy.report.classesLabel}
                  </p>
                  <p className="m-0 mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">
                    {match.classesText}
                  </p>
                </div>
                <p className="m-0 text-sm font-semibold text-ink">
                  {copy.report.similarityLabel} {match.similarity}%
                </p>
              </article>
            ))}
          </div>
          <p className="mt-3 text-right text-xs text-ink-muted">
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
              <div className="divide-y divide-border rounded-2xl border border-border">
                {source.matches.map((match) => (
                  <article
                    key={match.id}
                    className="flex items-center justify-between gap-4 px-4 py-4"
                  >
                    <p className="m-0 font-semibold">{match.name}</p>
                    <p className="m-0 text-sm">
                      {copy.report.similarityLabel} {match.similarity}%
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mb-10 grid gap-4 lg:grid-cols-2">
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
                  className="flex h-28 w-28 flex-col justify-between rounded-xl bg-white p-3"
                >
                  <span className="text-xs text-ink-muted">
                    {risk.classNumber} класс
                  </span>
                  <span className="text-2xl font-semibold">{risk.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] bg-primary p-5 text-white md:p-6">
            <h2 className="m-0 text-base font-semibold">
              {copy.report.recommendationsTitle}
            </h2>
            <p className="mt-4 text-sm text-white/75">
              {copy.report.replaceHint}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {report.recommendations.alternatives.join(" / ")}
            </p>
            <p className="mt-6 text-xs text-white/60">
              {copy.report.specialistHint}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {report.lawyers.map((lawyer) => (
            <article
              key={lawyer.id}
              className="rounded-2xl border border-border bg-white p-4"
            >
              <div className="mb-3 flex h-28 items-end justify-center rounded-xl bg-surface-muted text-4xl">
                👤
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
          {copy.report.disclaimer}
        </p>
      </PageContainer>
    </section>
  );
}
