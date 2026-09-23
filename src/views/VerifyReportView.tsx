"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import type { VerifyResponse } from "@/lib/conclusion/types";
import { ConclusionPdfButton } from "@/components/pdf/conclusion/ConclusionPdfButton";
import { cn } from "@/lib/cn";

export function VerifyReportView({
  locale,
  code,
}: {
  locale: Locale;
  code: string;
}) {
  const copy = getConclusionCopy(locale);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(code)}/`);
        const json = (await res.json()) as VerifyResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ ok: false, status: "not_found" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const status = data?.status ?? "not_found";
  const statusLabel =
    status === "valid"
      ? copy.verifyValid
      : status === "revoked"
        ? copy.verifyRevoked
        : copy.verifyNotFound;

  return (
    <div className="mx-auto max-w-lg">
      <p className="m-0 text-sm font-medium text-ink-muted">{copy.agencyName}</p>
      <h1 className="m-0 mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {copy.verifyPageTitle}
      </h1>
      <p className="mt-2 font-mono text-sm tracking-wider text-ink-muted">
        {code.toUpperCase()}
      </p>

      {loading ? (
        <p className="mt-8 text-ink-muted" aria-live="polite">
          {copy.verifyPageTitle}…
        </p>
      ) : (
        <div
          className={cn(
            "mt-8 rounded-2xl border px-5 py-5",
            status === "valid"
              ? "border-lime bg-row-selected"
              : "border-border bg-surface-muted",
          )}
        >
          <p
            className={cn(
              "m-0 text-lg font-semibold",
              status === "valid" ? "text-ink" : "text-ink-muted",
            )}
          >
            {statusLabel}
          </p>

          {status === "valid" && data ? (
            <dl className="mt-4 space-y-3 text-sm">
              {data.docNumber ? (
                <div>
                  <dt className="text-ink-muted">{copy.verifyDocNumber}</dt>
                  <dd className="m-0 mt-0.5 font-medium text-ink">
                    {data.docNumber}
                  </dd>
                </div>
              ) : null}
              {data.subject?.mark ? (
                <div>
                  <dt className="text-ink-muted">{copy.markLabel}</dt>
                  <dd className="m-0 mt-0.5 font-medium text-ink">
                    {data.subject.mark}
                    {data.subject.niceClasses?.length
                      ? ` · ${copy.classLabel} ${data.subject.niceClasses.join(", ")}`
                      : null}
                  </dd>
                </div>
              ) : null}
              {data.issuedAt || data.reportAt ? (
                <div>
                  <dt className="text-ink-muted">{copy.reportLabel}</dt>
                  <dd className="m-0 mt-0.5 text-ink">
                    {[data.issuedAt, data.reportAt].filter(Boolean).join(" / ")}
                  </dd>
                </div>
              ) : null}
              {data.verdict?.length ? (
                <div>
                  <dt className="text-ink-muted">{copy.verdictTitle}</dt>
                  <dd className="m-0 mt-1 space-y-1 text-ink">
                    {data.verdict.map((v) => (
                      <p key={v.classNumber} className="m-0">
                        {copy.classLabel} {v.classNumber} — {v.chanceLabel}
                      </p>
                    ))}
                  </dd>
                </div>
              ) : null}
              {data.hashPrefix ? (
                <div>
                  <dt className="text-ink-muted">{copy.verifyHash}</dt>
                  <dd className="m-0 mt-0.5 font-mono text-xs text-ink-muted">
                    {data.hashPrefix}…
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {status === "valid" && data?.conclusion ? (
            <div className="mt-5">
              <ConclusionPdfButton
                locale={locale}
                conclusion={data.conclusion}
                className="w-full sm:w-auto"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
