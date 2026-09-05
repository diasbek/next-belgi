"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { authErrorMessage, getAppCopy } from "@/i18n/app-copy";
import { safeInternalNext } from "@/lib/navigation/safe-next";
import { PageContainer } from "@/components/atoms/PageContainer";
import { Button } from "@/components/atoms/Button";
import { fieldInput, sectionLead, sectionTitle } from "@/styles/ui";

type Step = "identity" | "otp" | "password";

type Capabilities = {
  google: boolean;
  otpTest: boolean;
};

export function RegisterForm({ locale }: { locale: Locale }) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const next = safeInternalNext(
    search.get("next"),
    localePath(locale, "/account/"),
  );
  const loginHref = `${localePath(locale, "/login/")}?next=${encodeURIComponent(next)}`;

  const [step, setStep] = useState<Step>("identity");
  const [destination, setDestination] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [caps, setCaps] = useState<Capabilities>({
    google: false,
    otpTest: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/capabilities/");
        const json = (await res.json()) as Capabilities & { ok?: boolean };
        if (!cancelled && json) {
          setCaps({
            google: Boolean(json.google),
            otpTest: Boolean(json.otpTest),
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function heading(): { title: string; lead: string } {
    if (step === "otp") {
      return { title: copy.login.titleOtp, lead: copy.login.leadOtp };
    }
    if (step === "password") {
      return {
        title: copy.login.titleSetPassword,
        lead: copy.login.leadSetPassword,
      };
    }
    return { title: copy.login.titleSignUp, lead: copy.login.leadSignUp };
  }

  async function sendOtp() {
    if (!acceptTerms) {
      setError(copy.login.acceptRequired);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          purpose: "register",
          locale,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        testMode?: boolean;
      };
      if (!res.ok || !json.ok) {
        setError(authErrorMessage(copy, json.error));
        return;
      }
      setTestMode(Boolean(json.testMode));
      setStep("otp");
    } catch {
      setError(copy.login.error);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          code,
          purpose: "register",
          locale,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        session?: boolean;
      };
      if (!res.ok || !json.ok || !json.session) {
        setError(authErrorMessage(copy, json.error));
        return;
      }
      setPassword("");
      setStep("password");
    } catch {
      setError(copy.login.error);
    } finally {
      setLoading(false);
    }
  }

  async function completeRegister() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password/set/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(authErrorMessage(copy, json.error));
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError(copy.login.error);
    } finally {
      setLoading(false);
    }
  }

  const { title, lead } = heading();

  return (
    <PageContainer measure="focus" className="py-[var(--section-y)]">
      <h1 className={sectionTitle}>{title}</h1>
      <p className={sectionLead}>{lead}</p>

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {caps.google && step === "identity" ? (
        <a
          href={
            acceptTerms
              ? `/api/auth/google/start/?next=${encodeURIComponent(next)}`
              : "#"
          }
          aria-disabled={!acceptTerms}
          onClick={(e) => {
            if (!acceptTerms) {
              e.preventDefault();
              setError(copy.login.acceptRequired);
            }
          }}
          className="mb-6 flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink hover:bg-black/[0.03]"
        >
          {copy.login.google}
        </a>
      ) : null}

      {step === "identity" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void sendOtp();
          }}
        >
          <label className="text-sm font-medium text-ink">
            {copy.login.identity}
            <input
              className={`${fieldInput} mt-1`}
              type="text"
              autoComplete="username"
              required
              placeholder={copy.login.identityHint}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </label>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-1"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <span>
              {copy.login.acceptTerms}{" "}
              <Link
                href={localePath(locale, "/terms/")}
                className="underline underline-offset-2"
              >
                {locale === "ru" ? "Оферта" : "Oferta"}
              </Link>
              ,{" "}
              <Link
                href={localePath(locale, "/privacy/")}
                className="underline underline-offset-2"
              >
                {locale === "ru" ? "Конфиденциальность" : "Maxfiylik"}
              </Link>
              ,{" "}
              <Link
                href={localePath(locale, "/consent/")}
                className="underline underline-offset-2"
              >
                {locale === "ru" ? "Согласие" : "Rozilik"}
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-ink-muted">
            <input
              type="checkbox"
              className="mt-1"
              checked={acceptMarketing}
              onChange={(e) => setAcceptMarketing(e.target.checked)}
            />
            <span>{copy.login.acceptMarketing}</span>
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {copy.login.continue}
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void verifyOtp();
          }}
        >
          <p className="text-sm text-ink-muted">{copy.login.otpSent}</p>
          {testMode || caps.otpTest ? (
            <p className="rounded-xl bg-lime/50 px-3 py-2 text-sm text-ink">
              {copy.login.otpTestHint}
            </p>
          ) : null}
          <label className="text-sm font-medium text-ink">
            {copy.login.otpCode}
            <input
              className={`${fieldInput} mt-1`}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {copy.login.verifyOtp}
          </Button>
        </form>
      ) : null}

      {step === "password" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void completeRegister();
          }}
        >
          <label className="text-sm font-medium text-ink">
            {copy.login.setPassword}
            <input
              className={`${fieldInput} mt-1`}
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {copy.login.completeRegister}
          </Button>
        </form>
      ) : null}

      <div className="mt-6 text-sm">
        <Link
          href={loginHref}
          className="text-ink-muted underline-offset-2 hover:underline"
        >
          {copy.login.switchToSignIn}
        </Link>
      </div>
    </PageContainer>
  );
}
