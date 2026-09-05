"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { authErrorMessage, getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { fieldInput, sectionLead, sectionTitle } from "@/styles/ui";
import { localePath } from "@/i18n/paths";

type LinkChannel = "email" | "phone";

export function ProfileForm({
  locale,
  initial,
  email,
  phone,
  hasPassword,
  googleLinked,
}: {
  locale: Locale;
  email: string;
  phone: string;
  hasPassword: boolean;
  googleLinked: boolean;
  initial: { full_name: string | null; phone: string | null };
}) {
  const copy = getAppCopy(locale);
  const router = useRouter();
  const [name, setName] = useState(initial.full_name || "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailDest, setEmailDest] = useState("");
  const [phoneDest, setPhoneDest] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [activeChannel, setActiveChannel] = useState<LinkChannel | null>(null);
  const [linkStep, setLinkStep] = useState<"idle" | "code" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayPhone = phone || initial.phone || "";

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/account/profile/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, locale }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(authErrorMessage(copy, json.error, copy.profile.error));
        return;
      }
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  async function sendLinkOtp(channel: LinkChannel) {
    setError(null);
    setMessage(null);
    const destination = channel === "email" ? emailDest.trim() : phoneDest.trim();
    if (!destination) return;
    const res = await fetch("/api/auth/otp/send/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        purpose: "link",
        locale,
      }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setError(authErrorMessage(copy, json.error, copy.profile.error));
      return;
    }
    setActiveChannel(channel);
    setLinkCode("");
    setLinkStep("code");
  }

  async function verifyLinkOtp() {
    if (!activeChannel) return;
    setError(null);
    const destination =
      activeChannel === "email" ? emailDest.trim() : phoneDest.trim();
    const verify = await fetch("/api/auth/otp/verify/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        code: linkCode,
        purpose: "link",
      }),
    });
    const vjson = (await verify.json()) as {
      ok?: boolean;
      error?: string;
      ticket?: string;
    };
    if (!verify.ok || !vjson.ok || !vjson.ticket) {
      setError(authErrorMessage(copy, vjson.error, copy.profile.error));
      return;
    }
    const complete = await fetch("/api/auth/link/complete/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket: vjson.ticket }),
    });
    const cjson = (await complete.json()) as { ok?: boolean; error?: string };
    if (!complete.ok || !cjson.ok) {
      setError(authErrorMessage(copy, cjson.error, copy.profile.error));
      return;
    }
    setLinkStep("done");
    setMessage(copy.profile.linkDone);
    setActiveChannel(null);
    router.refresh();
  }

  async function unlinkGoogle() {
    setError(null);
    const res = await fetch("/api/auth/google/unlink/", { method: "POST" });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setError(authErrorMessage(copy, json.error, copy.profile.error));
      return;
    }
    setMessage(copy.profile.googleUnlinked);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className={sectionTitle}>{copy.profile.title}</h1>
        <p className={sectionLead}>{copy.profile.lead}</p>
        <form onSubmit={onSave} className="flex max-w-md flex-col gap-4">
          <label className="text-sm font-medium">
            {copy.profile.name}
            <input
              className={`${fieldInput} mt-1`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="text-sm font-medium">
            {copy.profile.email}
            <input
              className={`${fieldInput} mt-1`}
              type="email"
              value={email}
              disabled
              placeholder={copy.profile.emailPlaceholder}
              autoComplete="email"
            />
          </label>
          <label className="text-sm font-medium">
            {copy.profile.phone}
            <input
              className={`${fieldInput} mt-1`}
              type="tel"
              value={displayPhone}
              disabled
              placeholder={copy.profile.phonePlaceholder}
              autoComplete="tel"
            />
          </label>
          <Button type="submit" disabled={loading}>
            {copy.profile.save}
          </Button>
          {saved ? (
            <p className="text-sm text-success">{copy.profile.saved}</p>
          ) : null}
        </form>
      </div>

      <div className="max-w-md">
        <h2 className="mb-2 text-lg font-semibold">{copy.profile.providers}</h2>
        <p className="mb-3 text-sm text-ink-muted">
          {hasPassword ? copy.profile.hasPassword : copy.profile.noPassword}
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          {googleLinked ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void unlinkGoogle()}
            >
              {copy.profile.unlinkGoogle}
            </Button>
          ) : (
            <a
              href={`/api/auth/google/start/?mode=link&next=${encodeURIComponent(localePath(locale, "/account/profile/"))}`}
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium"
            >
              {copy.profile.linkGoogle}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium">
              {copy.profile.linkEmail}
              <input
                className={`${fieldInput} mt-1`}
                type="email"
                placeholder={copy.profile.emailPlaceholder}
                value={emailDest}
                onChange={(e) => setEmailDest(e.target.value)}
                autoComplete="email"
                disabled={linkStep === "code" && activeChannel === "phone"}
              />
            </label>
            {linkStep !== "code" || activeChannel !== "email" ? (
              <Button
                type="button"
                className="mt-3"
                disabled={!emailDest.trim() || linkStep === "code"}
                onClick={() => void sendLinkOtp("email")}
              >
                {copy.profile.sendOtp}
              </Button>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium">
              {copy.profile.linkPhone}
              <input
                className={`${fieldInput} mt-1`}
                type="tel"
                placeholder={copy.profile.phonePlaceholder}
                value={phoneDest}
                onChange={(e) => setPhoneDest(e.target.value)}
                autoComplete="tel"
                disabled={linkStep === "code" && activeChannel === "email"}
              />
            </label>
            {linkStep !== "code" || activeChannel !== "phone" ? (
              <Button
                type="button"
                className="mt-3"
                disabled={!phoneDest.trim() || linkStep === "code"}
                onClick={() => void sendLinkOtp("phone")}
              >
                {copy.profile.sendOtp}
              </Button>
            ) : null}
          </div>
        </div>

        {linkStep === "code" && activeChannel ? (
          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-surface-muted p-4">
            <p className="text-sm text-ink-muted">{copy.login.otpSent}</p>
            <label className="text-sm font-medium">
              {copy.login.otpCode}
              <input
                className={`${fieldInput} mt-1`}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={copy.login.otpCode}
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void verifyLinkOtp()}>
                {copy.login.verifyOtp}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setLinkStep("idle");
                  setActiveChannel(null);
                  setLinkCode("");
                }}
              >
                {copy.profile.cancel}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
