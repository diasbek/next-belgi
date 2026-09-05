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

type Step = "signin" | "otp" | "password";

type Capabilities = {
  google: boolean;
  otpTest: boolean;
};

export function LoginForm({ locale }: { locale: Locale }) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const next = safeInternalNext(
    search.get("next"),
    localePath(locale, "/account/"),
  );
  const oauthError = search.get("oauth_error");
  const registerHref = `${localePath(locale, "/register/")}?next=${encodeURIComponent(next)}`;

  const [step, setStep] = useState<Step>("signin");
  const [destination, setDestination] = useState("");
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState("");
  const [password, setPassword] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [caps, setCaps] = useState<Capabilities>({
    google: false,
    otpTest: true,
  });
  const [error, setError] = useState<string | null>(
    oauthError ? authErrorMessage(copy, oauthError) : null,
  );
  const [loading, setLoading] = useState(false);

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
      return { title: copy.login.titleReset, lead: copy.login.leadOtp };
    }
    if (step === "password") {
      return { title: copy.login.titleReset, lead: copy.login.leadReset };
    }
    return { title: copy.login.title, lead: copy.login.lead };
  }

  async function sendResetOtp() {
    if (!destination.trim()) {
      setError(copy.login.needDestination);
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
          purpose: "reset",
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

  async function verifyResetOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          code,
          purpose: "reset",
          locale,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        ticket?: string;
      };
      if (!res.ok || !json.ok || !json.ticket) {
        setError(authErrorMessage(copy, json.error));
        return;
      }
      setTicket(json.ticket);
      setPassword("");
      setStep("password");
    } catch {
      setError(copy.login.error);
    } finally {
      setLoading(false);
    }
  }

  async function completeReset() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password/reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, password }),
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

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: destination, password }),
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

      {caps.google && step === "signin" ? (
        <a
          href={`/api/auth/google/start/?next=${encodeURIComponent(next)}`}
          className="mb-6 flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink hover:bg-black/[0.03]"
        >
          {copy.login.google}
        </a>
      ) : null}

      {step === "signin" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void signIn();
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
          <label className="text-sm font-medium text-ink">
            {copy.login.password}
            <input
              className={`${fieldInput} mt-1`}
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {copy.login.signIn}
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void verifyResetOtp();
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
            void completeReset();
          }}
        >
          <label className="text-sm font-medium text-ink">
            {copy.login.newPassword}
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
            {copy.login.resetPassword}
          </Button>
        </form>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 text-sm">
        {step === "signin" ? (
          <>
            <Link
              href={registerHref}
              className="text-ink-muted underline-offset-2 hover:underline"
            >
              {copy.login.switchToSignUp}
            </Link>
            <button
              type="button"
              className="text-left text-ink-muted underline-offset-2 hover:underline"
              onClick={() => void sendResetOtp()}
            >
              {copy.login.forgotPassword}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="text-left text-ink-muted underline-offset-2 hover:underline"
            onClick={() => {
              setStep("signin");
              setCode("");
              setTicket("");
              setPassword("");
              setError(null);
            }}
          >
            {copy.login.switchToSignIn}
          </button>
        )}
      </div>
    </PageContainer>
  );
}
