"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import type { VerifyResponse } from "@/lib/conclusion/types";
import { ConclusionPdfButton } from "@/components/pdf/conclusion/ConclusionPdfButton";
import { cn } from "@/lib/cn";

function uniqueDates(...values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = raw?.trim();
    if (!v) continue;
    const key = v.replace(/\s+/g, " ").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-ink/10 py-3 last:border-b-0 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4 sm:py-3.5">
      <dt className="text-xs font-medium uppercase tracking-[0.04em] text-ink-muted sm:pt-0.5">
        {label}
      </dt>
      <dd className="m-0 min-w-0 text-sm leading-snug text-ink sm:text-[0.9375rem]">
        {children}
      </dd>
    </div>
  );
}

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
  const dates = uniqueDates(data?.issuedAt, data?.reportAt);
  const classes = data?.subject?.niceClasses ?? [];

  return (
    <div className="mx-auto w-full max-w-xl">
      <p className="m-0 text-sm font-medium text-ink-muted">{copy.agencyName}</p>
      <h1 className="m-0 mt-2 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {copy.verifyPageTitle}
      </h1>
      <p className="mt-2 font-mono text-sm tracking-[0.14em] text-ink/55">
        {code.toUpperCase()}
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-ink-muted" aria-live="polite">
          {copy.verifyLoading}
        </p>
      ) : (
        <article
          className={cn(
            "mt-8 overflow-hidden rounded-2xl border",
            status === "valid"
              ? "border-ink/10 bg-[#f7fbe9]"
              : "border-border bg-surface-muted",
          )}
        >
          <div
            className={cn(
              "flex items-start gap-3 border-b px-5 py-4 sm:px-6",
              status === "valid" ? "border-ink/10" : "border-border",
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                status === "valid"
                  ? "bg-ink text-white"
                  : "bg-ink/15 text-ink-muted",
              )}
              aria-hidden
            >
              {status === "valid" ? "✓" : "!"}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "m-0 text-base font-semibold sm:text-lg",
                  status === "valid" ? "text-ink" : "text-ink-muted",
                )}
              >
                {statusLabel}
              </p>
              {status === "valid" ? (
                <p className="m-0 mt-1 text-xs leading-relaxed text-ink/60">
                  {copy.verifyValidHint}
                </p>
              ) : null}
            </div>
          </div>

          {status === "valid" && data ? (
            <dl className="m-0 px-5 sm:px-6">
              {data.docNumber ? (
                <Field label={copy.verifyDocNumber}>
                  <span className="font-mono text-[0.8125rem] tracking-wide">
                    {data.docNumber}
                  </span>
                </Field>
              ) : null}

              {data.subject?.mark ? (
                <Field label={copy.markLabel}>
                  <span className="font-semibold">{data.subject.mark}</span>
                  {data.subject.markType ? (
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {data.subject.markType}
                    </span>
                  ) : null}
                </Field>
              ) : null}

              {classes.length > 0 ? (
                <Field label={copy.verifyClassesLabel}>
                  <div className="flex flex-wrap gap-1.5">
                    {classes.map((n) => (
                      <span
                        key={n}
                        className="inline-flex rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-ink ring-1 ring-ink/10"
                      >
                        {copy.classLabel} {n}
                      </span>
                    ))}
                  </div>
                </Field>
              ) : null}

              {dates.length > 0 ? (
                <Field label={copy.reportLabel}>{dates[0]}</Field>
              ) : null}

              {data.verdict?.length ? (
                <Field label={copy.verifyChanceLabel}>
                  <ul className="m-0 list-none space-y-2 p-0">
                    {data.verdict.map((v) => (
                      <li
                        key={v.classNumber}
                        className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                      >
                        <span className="text-ink-muted">
                          {copy.classLabel} {v.classNumber}
                        </span>
                        <span className="font-semibold tabular-nums text-ink">
                          {v.chanceLabel}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="m-0 mt-2 text-xs leading-relaxed text-ink/55">
                    {copy.verifyChanceHint}
                  </p>
                </Field>
              ) : null}
            </dl>
          ) : null}

          {status === "valid" && data?.conclusion ? (
            <div className="border-t border-ink/10 px-5 py-4 sm:px-6">
              <ConclusionPdfButton
                locale={locale}
                conclusion={data.conclusion}
                className="w-full sm:w-auto"
              />
            </div>
          ) : null}

          {status === "valid" && data?.hashPrefix ? (
            <p className="m-0 border-t border-ink/10 px-5 py-3 font-mono text-[0.6875rem] tracking-wide text-ink/40 sm:px-6">
              {copy.verifyHash} {data.hashPrefix}
            </p>
          ) : null}
        </article>
      )}
    </div>
  );
}
