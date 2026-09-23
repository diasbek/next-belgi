"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { DashPanel } from "@/components/molecules/DashChrome";
import { fieldInput } from "@/styles/ui";

const INTENTS = ["own_brand", "agency", "lawyer", "other"] as const;

export function OnboardingCard({
  locale,
  initial,
}: {
  locale: Locale;
  initial: {
    full_name: string | null;
    company_name: string | null;
    job_title: string | null;
    user_intent: string | null;
  };
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.full_name || "");
  const [company, setCompany] = useState(initial.company_name || "");
  const [jobTitle, setJobTitle] = useState(initial.job_title || "");
  const [intent, setIntent] = useState(initial.user_intent || "own_brand");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !company.trim()) {
      setError(copy.onboarding.required);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/profile/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          company_name: company,
          job_title: jobTitle,
          user_intent: intent,
          complete_onboarding: true,
          locale,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || copy.profile.error);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function intentLabel(value: string) {
    const map = copy.onboarding.intents as Record<string, string>;
    return map[value] || value;
  }

  return (
    <DashPanel className="mb-6 overflow-hidden">
      <div className="border-b border-border bg-row-hover px-5 py-4">
        <p className="m-0 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {copy.onboarding.eyebrow}
        </p>
        <h2 className="m-0 mt-1 text-lg font-semibold text-ink">
          {copy.onboarding.title}
        </h2>
        <p className="m-0 mt-1 text-sm text-ink-muted">{copy.onboarding.lead}</p>
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 px-5 py-5">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">
            {copy.onboarding.fullName}
          </span>
          <input
            className={fieldInput}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={copy.onboarding.fullNamePlaceholder}
            required
            autoComplete="name"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">
            {copy.onboarding.company}
          </span>
          <input
            className={fieldInput}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={copy.onboarding.companyPlaceholder}
            required
            autoComplete="organization"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">
            {copy.onboarding.jobTitle}
          </span>
          <input
            className={fieldInput}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={copy.onboarding.jobTitlePlaceholder}
            autoComplete="organization-title"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">
            {copy.onboarding.intent}
          </span>
          <select
            className={fieldInput}
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
          >
            {INTENTS.map((v) => (
              <option key={v} value={v}>
                {intentLabel(v)}
              </option>
            ))}
          </select>
        </label>
        {error ? (
          <p className="m-0 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? copy.adminUi.loading : copy.onboarding.submit}
        </Button>
      </form>
    </DashPanel>
  );
}
