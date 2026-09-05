"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { sectionLead, sectionTitle } from "@/styles/ui";
import { localePath } from "@/i18n/paths";
import {
  isCheckResumePath,
  safeInternalNext,
} from "@/lib/navigation/safe-next";

type Plan = {
  id: string;
  code: string;
  credits: number;
  price_uzs: number;
  title_uz: string;
  title_ru: string;
};

type LedgerRow = {
  id: string;
  delta: number;
  balance_after: number;
  reason: string;
  created_at: string;
};

export function BillingPanel({
  locale,
  plans,
  ledger,
  paymeOk,
  clickOk,
}: {
  locale: Locale;
  plans: Plan[];
  ledger: LedgerRow[];
  paymeOk: boolean;
  clickOk: boolean;
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const resumeNext = safeInternalNext(search.get("next"), "");
  const hasResume = Boolean(resumeNext && isCheckResumePath(resumeNext));
  const paidId = search.get("paid");

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paidId || !hasResume || !resumeNext) return;
    router.replace(resumeNext);
  }, [paidId, hasResume, resumeNext, router]);

  async function checkout(planId: string, provider: "payme" | "click") {
    setBusy(`${planId}-${provider}`);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          provider,
          locale,
          next: hasResume ? resumeNext : undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        checkoutUrl?: string;
        paymentId?: string;
        mock?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(
          json.error === "payments_not_configured"
            ? copy.billing.notConfigured
            : json.error || "Error",
        );
        return;
      }

      if (json.mock && json.paymentId) {
        const complete = await fetch("/api/billing/mock-complete/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: json.paymentId }),
        });
        const cjson = (await complete.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (!complete.ok || !cjson.ok) {
          setError(cjson.error || "Error");
          return;
        }
        if (hasResume && resumeNext) {
          router.push(resumeNext);
          return;
        }
        router.refresh();
        return;
      }

      if (!json.checkoutUrl) {
        setError(copy.billing.notConfigured);
        return;
      }
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className={sectionTitle}>{copy.billing.title}</h1>
      <p className={sectionLead}>{copy.billing.lead}</p>

      {hasResume ? (
        <div className="mb-6 rounded-xl bg-lime/60 px-4 py-3 text-sm text-ink">
          <p className="m-0">{copy.billing.resumeHint}</p>
          <Button
            href={resumeNext}
            variant="secondary"
            className="mt-3"
          >
            {copy.billing.continueCheck}
          </Button>
        </div>
      ) : null}

      {!paymeOk && !clickOk ? (
        <p className="mb-6 rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-muted">
          {copy.billing.notConfigured}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <h2 className="mb-3 text-lg font-semibold text-ink">{copy.billing.plans}</h2>
      <div className="mb-4 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm text-ink-muted">
        <p className="m-0">{copy.billing.payNotice}</p>
        <p className="mt-2 m-0">{copy.billing.debitMoment}</p>
        <p className="mt-2 m-0 flex flex-wrap gap-x-3 gap-y-1">
          <Link
            href={localePath(locale, "/offer/")}
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            {copy.billing.offerLink}
          </Link>
          <Link
            href={localePath(locale, "/credits/")}
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            {copy.billing.creditsLink}
          </Link>
          <Link
            href={localePath(locale, "/refunds/")}
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            {copy.billing.refundLink}
          </Link>
        </p>
      </div>
      <ul className="mb-10 divide-y divide-black/5 border-y border-black/5">
        {plans.map((plan) => {
          const title = locale === "ru" ? plan.title_ru : plan.title_uz;
          return (
            <li
              key={plan.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-ink">{title}</p>
                <p className="text-sm text-ink-muted">
                  {plan.credits} {copy.billing.creditsLabel} ·{" "}
                  {plan.price_uzs.toLocaleString()} {copy.billing.priceLabel}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {paymeOk ? (
                  <Button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void checkout(plan.id, "payme")}
                  >
                    {busy === `${plan.id}-payme`
                      ? "…"
                      : copy.billing.payPayme}
                  </Button>
                ) : null}
                {clickOk ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy !== null}
                    onClick={() => void checkout(plan.id, "click")}
                  >
                    {busy === `${plan.id}-click`
                      ? "…"
                      : copy.billing.payClick}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-3 text-lg font-semibold text-ink">{copy.billing.ledger}</h2>
      <ul className="divide-y divide-black/5 border-y border-black/5">
        {ledger.length === 0 ? (
          <li className="py-4 text-sm text-ink-muted">—</li>
        ) : (
          ledger.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="text-ink-muted">
                {new Date(row.created_at).toLocaleString()} · {row.reason}
              </span>
              <span className="font-medium text-ink">
                {row.delta > 0 ? "+" : ""}
                {row.delta} → {row.balance_after}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
