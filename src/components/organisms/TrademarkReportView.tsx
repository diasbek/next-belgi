"use client";

import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import type { TrademarkReport } from "@/lib/check/types";
import { createRequestId } from "@/lib/form/utils";
import { submitLead } from "@/lib/form/submitLead";
import { mapRiskToChance } from "@/lib/conclusion";
import { Button } from "@/components/atoms/Button";
import { ReportServiceUpsell } from "@/components/organisms/ReportServiceUpsell";
import {
  cardLime,
  gridSpanHalf,
  gridSpanQuarter,
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

/**
 * Shared check-result body — used on /check/result and admin checks detail.
 */
export function TrademarkReportView({
  locale,
  report,
  headerActions,
  density = "page",
  showLawyers = true,
  checkId,
}: {
  locale: Locale;
  report: TrademarkReport;
  headerActions?: React.ReactNode;
  density?: "page" | "drawer";
  showLawyers?: boolean;
  checkId?: string | null;
}) {
  const copy = getContent(locale);
  const uzSource = report.sources.find((s) => s.id === "uz");
  const otherSources = report.sources.filter((s) => s.id !== "uz");
  const drawer = density === "drawer";

  return (
    <div className={cn(drawer && "text-[0.9375rem]")}>
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between",
          drawer ? "mb-5" : "mb-6 sm:mb-8",
        )}
      >
        <div className="min-w-0">
          <p className="m-0 text-sm text-ink-muted">
            {copy.report.markTypeLabel}
          </p>
          <h2
            className={cn(
              "m-0 mt-1 break-words font-display font-semibold tracking-tight text-ink",
              drawer
                ? "text-2xl sm:text-3xl"
                : "text-3xl sm:text-4xl md:text-5xl",
            )}
          >
            {report.query}
          </h2>
        </div>
        <div
          className={cn(
            "min-w-0 text-left text-sm",
            !drawer && "sm:max-w-xs sm:text-right",
          )}
        >
          <p className="m-0 text-ink-muted">{copy.report.classesLabel}</p>
          <p className="m-0 mt-1 break-words text-ink">
            {(report.niceClasses || []).join(" ") || "—"}
          </p>
          <p className="m-0 mt-2 text-ink-muted">
            {copy.report.markTypeLabel}: {report.markType}
          </p>
          {headerActions ? (
            <div className={cn("mt-3", !drawer && "sm:flex sm:justify-end")}>
              {headerActions}
            </div>
          ) : null}
        </div>
      </div>

      <div className={cn(drawer ? "mb-5" : "mb-8")}>
        <h3 className="m-0 mb-3 text-base font-semibold">
          {copy.report.registryUz}
        </h3>
        {(uzSource?.matches?.length ?? 0) === 0 ? (
          <p className="m-0 text-sm text-ink-muted">
            {uzSource?.emptyText || copy.report.noMatches}
          </p>
        ) : (
          <>
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {(uzSource?.matches ?? []).map((match) => (
                <article
                  key={match.id}
                  className={cn(
                    "grid gap-3 px-3 py-4 sm:px-4 sm:py-5",
                    !drawer && "md:grid-cols-[1fr_1.2fr_auto] md:items-start",
                  )}
                >
                  <div className="flex items-start justify-between gap-3 md:block">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        {match.imageUrl ? (
                          <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={match.imageUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          </span>
                        ) : null}
                        <div className="min-w-0">
                          <p className="m-0 text-lg font-semibold">
                            {match.name}
                          </p>
                          {match.owner ? (
                            <p className="m-0 mt-2 break-words text-xs text-ink-muted">
                              {match.owner}
                            </p>
                          ) : null}
                          <p className="m-0 mt-1 text-xs text-ink-muted">
                            {[
                              match.registeredFrom
                                ? `${copy.report.registeredPrefix} ${match.registeredFrom}${match.registeredTo ? ` - ${match.registeredTo}` : ""}`
                                : null,
                              match.status ? `[${match.status}]` : null,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                        </div>
                      </div>
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
                  <p
                    className={cn(
                      "m-0 text-sm font-semibold text-ink",
                      drawer ? "block" : "hidden md:block",
                    )}
                  >
                    {copy.report.similarityLabel} {match.similarity}%
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-3 text-left text-xs text-ink-muted sm:text-right">
              {copy.report.nameSimilarity} {uzSource?.matches.length ?? 0}
            </p>
          </>
        )}
      </div>

      {otherSources.map((source) => (
        <div key={source.id} className={cn(drawer ? "mb-5" : "mb-8")}>
          <h3 className="m-0 mb-2 text-base font-semibold">{source.title}</h3>
          {source.asOf ? (
            <p className="m-0 mb-2 text-xs text-ink-muted">
              {copy.report.asOfPrefix || "As of"}{" "}
              {new Date(source.asOf).toLocaleDateString(locale)}
            </p>
          ) : null}
          {source.unavailable ? (
            <p className="m-0 text-sm text-ink-muted">
              {source.unavailableText || copy.report.sourceUnavailable}
            </p>
          ) : source.empty || source.matches.length === 0 ? (
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
                  <div className="min-w-0">
                    <p className="m-0 break-words font-semibold">{match.name}</p>
                    {match.owner ? (
                      <p className="m-0 mt-1 text-xs text-ink-muted">
                        {match.owner}
                      </p>
                    ) : null}
                  </div>
                  <p className="m-0 shrink-0 text-sm">
                    {copy.report.similarityLabel} {match.similarity}%
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className={cn(sectionGrid, gridSpanHalf, drawer ? "mb-5" : "mb-8")}>
        <div className={cardLime}>
          <h3 className="m-0 text-base font-semibold">
            {copy.report.conclusionTitle}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            {report.conclusion?.lead ||
              (report.conclusion?.positive
                ? copy.report.conclusionLeadPositive
                : copy.report.conclusionLeadNegative) ||
              copy.report.conclusionLead}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
            {(report.classRisks || []).map((risk) => {
              const chance = mapRiskToChance(risk);
              const mid = Math.round(
                (chance.chanceMin + chance.chanceMax) / 2,
              );
              return (
                <div
                  key={risk.classNumber}
                  className="flex h-20 w-[calc(50%-0.25rem)] max-w-28 flex-col justify-between rounded-xl bg-white p-2.5 sm:h-24 sm:w-28 sm:p-3"
                >
                  <span className="text-xs text-ink-muted">
                    {risk.classNumber > 0
                      ? `${risk.classNumber} ${copy.report.classSuffix}`
                      : copy.report.classSuffix}
                  </span>
                  <span className="text-xl font-semibold sm:text-2xl">
                    {mid}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] bg-primary p-4 text-white sm:p-5 md:p-6">
          <h3 className="m-0 text-base font-semibold">
            {copy.report.recommendationsTitle}
          </h3>
          <p className="mt-4 text-sm text-white/75">
            {report.conclusion?.positive
              ? copy.report.keepHint
              : report.recommendations?.replaceHint || copy.report.replaceHint}
          </p>
          <p className="mt-2 break-words text-lg font-semibold">
            {(report.recommendations?.alternatives || []).join(" / ") || "—"}
          </p>
          <p className="mt-6 text-xs text-white/60">
            {copy.report.specialistHint}
          </p>
        </div>
      </div>

      {density === "page" ? (
        <ReportServiceUpsell
          locale={locale}
          checkId={checkId}
          className={drawer ? "mb-5" : "mb-8"}
        />
      ) : null}

      {showLawyers && report.lawyers?.length ? (
        <div
          className={cn(sectionGrid, gridSpanQuarter, drawer ? "mb-4" : "mb-6")}
        >
          {report.lawyers.map((lawyer) => (
            <article
              key={lawyer.id}
              className="rounded-2xl border border-border bg-white p-3 sm:p-4"
            >
              <div
                className="mb-2 flex h-16 items-center justify-center rounded-xl bg-surface-muted text-base font-semibold text-ink/50 sm:mb-3 sm:h-20 sm:text-xl"
                aria-hidden
              >
                {lawyerInitials(lawyer.name)}
              </div>
              <p className="m-0 text-xs text-ink-muted">{lawyer.role}</p>
              <p className="m-0 mt-1 text-sm font-semibold leading-snug">
                {lawyer.name}
              </p>
              {!drawer ? (
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
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <p className="m-0 text-xs leading-relaxed text-ink-muted">
        {report.disclaimer || copy.report.disclaimer}{" "}
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
    </div>
  );
}
