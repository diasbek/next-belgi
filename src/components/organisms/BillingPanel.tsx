"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { DashPageHeader, DashPanel } from "@/components/molecules/DashChrome";
import { IconCoins } from "@/components/atoms/DashIcons";
import { localePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
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
  title_en?: string | null;
};

const EN_PLAN_TITLES: Record<string, string> = {
  check_1: "1 check",
  pack_5: "5 checks",
  pack_10: "10 checks",
  pack_50: "50 checks",
};

function planTitle(plan: Plan, locale: Locale): string {
  if (locale === "ru") return plan.title_ru;
  if (locale === "en") {
    return plan.title_en || EN_PLAN_TITLES[plan.code] || plan.title_uz;
  }
  return plan.title_uz;
}

type LedgerRow = {
  id: string;
  delta: number;
  balance_after: number;
  reason: string;
  created_at: string;
};

function formatMoney(n: number, locale: Locale) {
  return n.toLocaleString(
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ",
  );
}

function creditsWord(
  n: number,
  copy: ReturnType<typeof getAppCopy>["billing"],
  locale: Locale,
) {
  if (locale !== "ru") {
    return n === 1 ? copy.creditsOne : copy.creditsMany;
  }
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return copy.creditsMany;
  if (d === 1) return copy.creditsOne;
  if (d >= 2 && d <= 4) return copy.creditsFew;
  return copy.creditsMany;
}

function ledgerOpLabel(
  reason: string,
  copy: ReturnType<typeof getAppCopy>["billing"],
) {
  switch (reason) {
    case "purchase":
      return copy.opPurchase;
    case "check_debit":
      return copy.opCheck;
    case "refund":
      return copy.opRefund;
    case "admin_adjust":
      return copy.opAdjust;
    default:
      return reason;
  }
}

function formatLedgerDate(iso: string, locale: Locale) {
  const d = new Date(iso);
  return d.toLocaleString(
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "uz-UZ",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function BillingPanel({
  locale,
  balance,
  plans,
  ledger,
  paymeOk,
  clickOk,
}: {
  locale: Locale;
  balance: number;
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

  const defaultProvider: "payme" | "click" | null = paymeOk
    ? "payme"
    : clickOk
      ? "click"
      : null;

  const [selectedId, setSelectedId] = useState(plans[0]?.id ?? "");
  const [provider, setProvider] = useState<"payme" | "click" | null>(
    defaultProvider,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plans.length) return;
    if (!plans.some((p) => p.id === selectedId)) {
      setSelectedId(plans[0].id);
    }
  }, [plans, selectedId]);

  useEffect(() => {
    if (provider === "payme" && !paymeOk) {
      setProvider(clickOk ? "click" : null);
    } else if (provider === "click" && !clickOk) {
      setProvider(paymeOk ? "payme" : null);
    } else if (!provider && defaultProvider) {
      setProvider(defaultProvider);
    }
  }, [provider, paymeOk, clickOk, defaultProvider]);

  useEffect(() => {
    if (!paidId || !hasResume || !resumeNext) return;
    router.replace(resumeNext);
  }, [paidId, hasResume, resumeNext, router]);

  const unitPrice = useMemo(() => {
    const one = plans.find((p) => p.credits === 1) || plans[0];
    if (!one || one.credits <= 0) return 0;
    return Math.round(one.price_uzs / one.credits);
  }, [plans]);

  const selected = plans.find((p) => p.id === selectedId) || plans[0] || null;
  const balanceAfter = balance + (selected?.credits ?? 0);

  async function checkout() {
    if (!selected || !provider) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selected.id,
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
      setBusy(false);
    }
  }

  const canPay = Boolean(selected && provider && (paymeOk || clickOk));

  return (
    <div>
      <DashPageHeader title={copy.billing.title} lead={copy.billing.lead} />

      {hasResume ? (
        <div className="mb-5 rounded-2xl border border-black/5 bg-lime/50 px-4 py-3 text-sm text-ink sm:px-5">
          <p className="m-0">{copy.billing.resumeHint}</p>
          <Button href={resumeNext} variant="secondary" className="mt-3">
            {copy.billing.continueCheck}
          </Button>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/5 bg-[#eceee8] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-ink">
            <IconCoins />
          </span>
          <p className="m-0 text-sm text-ink sm:text-base">
            <span className="text-ink-muted">{copy.billing.yourBalance}: </span>
            <span className="font-semibold">
              {balance} {creditsWord(balance, copy.billing, locale)}
            </span>
          </p>
        </div>
        <Link
          href={localePath(locale, "/account/check/")}
          className="inline-flex items-center gap-1 text-sm font-medium text-ink underline-offset-2 hover:underline"
        >
          {copy.billing.startCheck}
          <span aria-hidden>→</span>
        </Link>
      </div>

      {!paymeOk && !clickOk ? (
        <p className="mb-5 rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-muted">
          {copy.billing.notConfigured}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] lg:items-start">
        <section>
          <h2 className="mb-3 text-base font-semibold text-ink sm:text-lg">
            {copy.billing.choosePackage}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => {
              const active = plan.id === selected?.id;
              const planPer = Math.round(
                plan.price_uzs / Math.max(plan.credits, 1),
              );
              const planSave =
                unitPrice > 0
                  ? Math.max(0, unitPrice * plan.credits - plan.price_uzs)
                  : 0;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-colors",
                    active
                      ? "border-[#b8d96a] bg-[#f4fbe6]"
                      : "border-black/10 bg-white hover:border-black/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        active
                          ? "border-[#7aab2e] bg-[#7aab2e]"
                          : "border-black/20 bg-white",
                      )}
                      aria-hidden
                    >
                      {active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 font-semibold text-ink">
                        {planTitle(plan, locale)}
                      </p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-ink">
                        {formatMoney(plan.price_uzs, locale)}{" "}
                        {copy.billing.priceLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {copy.billing.perCheck.replace(
                          "{price}",
                          formatMoney(planPer, locale),
                        )}
                      </p>
                      {planSave > 0 ? (
                        <span className="mt-2 inline-flex rounded-md bg-lime px-2 py-0.5 text-xs font-medium text-ink">
                          {copy.billing.savings.replace(
                            "{amount}",
                            formatMoney(planSave, locale),
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-ink sm:text-lg">
            {copy.billing.payPackage}
          </h2>
          <DashPanel className="p-4 sm:p-5">
            {selected ? (
              <>
                <dl className="m-0 space-y-2.5 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-muted">
                      {copy.billing.selectedPackage}
                    </dt>
                    <dd className="m-0 font-medium text-ink">
                      {planTitle(selected, locale)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-muted">
                      {copy.billing.willCredit}
                    </dt>
                    <dd className="m-0 font-medium text-ink">
                      +{selected.credits}{" "}
                      {creditsWord(selected.credits, copy.billing, locale)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-black/5 pt-3">
                    <dt className="text-ink-muted">{copy.billing.toPay}</dt>
                    <dd className="m-0 text-xl font-semibold tracking-tight text-ink">
                      {formatMoney(selected.price_uzs, locale)}{" "}
                      {copy.billing.priceLabel}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-muted">
                      {copy.billing.balanceAfter}
                    </dt>
                    <dd className="m-0 font-medium text-ink">
                      {balanceAfter}{" "}
                      {creditsWord(balanceAfter, copy.billing, locale)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 mb-2 text-sm font-medium text-ink">
                  {copy.billing.paymentMethod}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {paymeOk ? (
                    <button
                      type="button"
                      onClick={() => setProvider("payme")}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                        provider === "payme"
                          ? "border-[#b8d96a] bg-[#f4fbe6] text-ink"
                          : "border-black/10 bg-white text-ink-muted hover:border-black/20",
                      )}
                    >
                      {copy.billing.payPayme}
                    </button>
                  ) : null}
                  {clickOk ? (
                    <button
                      type="button"
                      onClick={() => setProvider("click")}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                        provider === "click"
                          ? "border-[#b8d96a] bg-[#f4fbe6] text-ink"
                          : "border-black/10 bg-white text-ink-muted hover:border-black/20",
                      )}
                    >
                      {copy.billing.payClick}
                    </button>
                  ) : null}
                </div>

                <Button
                  type="button"
                  className="mt-4 w-full"
                  disabled={!canPay || busy}
                  onClick={() => void checkout()}
                >
                  {busy
                    ? "…"
                    : copy.billing.payAmount.replace(
                        "{amount}",
                        formatMoney(selected.price_uzs, locale),
                      )}
                </Button>

                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
                  <Link
                    href={localePath(locale, "/offer/")}
                    className="underline-offset-2 hover:underline"
                  >
                    {copy.billing.offerLink}
                  </Link>
                  <Link
                    href={localePath(locale, "/refunds/")}
                    className="underline-offset-2 hover:underline"
                  >
                    {copy.billing.refundLink}
                  </Link>
                </p>
              </>
            ) : (
              <p className="m-0 text-sm text-ink-muted">—</p>
            )}
          </DashPanel>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink sm:text-lg">
          {copy.billing.ledger}
        </h2>
        <DashPanel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs text-ink-muted">
                  <th className="px-4 py-3 font-medium sm:px-5">
                    {copy.billing.colDate}
                  </th>
                  <th className="px-4 py-3 font-medium sm:px-5">
                    {copy.billing.colOp}
                  </th>
                  <th className="px-4 py-3 font-medium sm:px-5">
                    {copy.billing.colCredits}
                  </th>
                  <th className="px-4 py-3 font-medium sm:px-5">
                    {copy.billing.colBalance}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-sm text-ink-muted sm:px-5"
                    >
                      {copy.billing.ledgerEmpty}
                    </td>
                  </tr>
                ) : (
                  ledger.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap text-ink-muted sm:px-5">
                        {formatLedgerDate(row.created_at, locale)}
                      </td>
                      <td className="px-4 py-3.5 text-ink sm:px-5">
                        {ledgerOpLabel(row.reason, copy.billing)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3.5 font-medium sm:px-5",
                          row.delta > 0
                            ? "text-emerald-700"
                            : row.delta < 0
                              ? "text-red-600"
                              : "text-ink",
                        )}
                      >
                        {row.delta > 0 ? "+" : ""}
                        {row.delta}
                      </td>
                      <td className="px-4 py-3.5 text-ink sm:px-5">
                        {row.balance_after}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DashPanel>
      </section>
    </div>
  );
}
