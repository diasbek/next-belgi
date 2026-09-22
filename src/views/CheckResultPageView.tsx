"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import {
  checkResumePath,
  loginWithNext,
} from "@/lib/navigation/safe-next";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { CheckForm } from "@/components/molecules/CheckForm";
import { TrademarkReportView } from "@/components/organisms/TrademarkReportView";
import {
  readStoredReport,
  readStoredReportPreview,
  readStoredCheckMeta,
  type StoredCheckMeta,
} from "@/lib/check/storage";
import { ConclusionPdfButton } from "@/components/pdf/conclusion/ConclusionPdfButton";
import type { ConclusionDocument } from "@/lib/conclusion";
import { section, sectionDense } from "@/styles/ui";

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
  const [report, setReport] = useState(() => readStoredReport());
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

  const resume = checkResumePath(
    locale,
    report.query || query,
    report.activity || activity,
    actionPath,
  );
  const loginHref = loginWithNext(locale, resume);
  const registerHref = `${localePath(locale, "/register/")}?next=${encodeURIComponent(resume)}`;

  const reportBody = (
    <TrademarkReportView
      locale={locale}
      report={report}
      headerActions={
        !preview && checkMeta?.conclusion ? (
          <ConclusionPdfButton
            locale={locale}
            conclusion={checkMeta.conclusion as ConclusionDocument}
          />
        ) : null
      }
    />
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
