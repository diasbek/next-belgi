"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { authErrorMessage, getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { DashPanel } from "@/components/molecules/DashChrome";
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
  const [editing, setEditing] = useState<LinkChannel | null>(null);
  const [linkStep, setLinkStep] = useState<"form" | "code">("form");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentEmail = email.trim();
  const currentPhone = (phone || initial.phone || "").trim();
  const hasEmail = Boolean(currentEmail);
  const hasPhone = Boolean(currentPhone);

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

  function startEdit(channel: LinkChannel) {
    setError(null);
    setMessage(null);
    setEditing(channel);
    setLinkStep("form");
    setLinkCode("");
    if (channel === "email") setEmailDest("");
    else setPhoneDest("");
  }

  function cancelEdit() {
    setEditing(null);
    setLinkStep("form");
    setLinkCode("");
    setEmailDest("");
    setPhoneDest("");
  }

  async function sendLinkOtp(channel: LinkChannel) {
    setError(null);
    setMessage(null);
    const destination =
      channel === "email" ? emailDest.trim() : phoneDest.trim();
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
    setEditing(channel);
    setLinkCode("");
    setLinkStep("code");
  }

  async function verifyLinkOtp() {
    if (!editing) return;
    setError(null);
    const destination =
      editing === "email" ? emailDest.trim() : phoneDest.trim();
    const hadValue = editing === "email" ? hasEmail : hasPhone;
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
    cancelEdit();
    setMessage(hadValue ? copy.profile.changeDone : copy.profile.linkDone);
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

  function renderContact(channel: LinkChannel) {
    const isEmail = channel === "email";
    const title = isEmail ? copy.profile.email : copy.profile.phone;
    const value = isEmail ? currentEmail : currentPhone;
    const hasValue = isEmail ? hasEmail : hasPhone;
    const isEditing = editing === channel;
    const dest = isEmail ? emailDest : phoneDest;
    const onDestChange = isEmail ? setEmailDest : setPhoneDest;
    const actionLabel = hasValue
      ? isEmail
        ? copy.profile.changeEmail
        : copy.profile.changePhone
      : isEmail
        ? copy.profile.linkEmail
        : copy.profile.linkPhone;
    const fieldLabel = hasValue
      ? isEmail
        ? copy.profile.newEmail
        : copy.profile.newPhone
      : title;
    const placeholder = isEmail
      ? copy.profile.emailPlaceholder
      : copy.profile.phonePlaceholder;
    const emptyHint = isEmail
      ? copy.profile.emptyEmail
      : copy.profile.emptyPhone;

    return (
      <DashPanel key={channel} className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="m-0 text-base font-semibold text-ink">{title}</h2>
            {hasValue ? (
              <p className="mt-2 break-all text-sm text-ink">
                <span className="text-ink-muted">
                  {copy.profile.currentValue}:{" "}
                </span>
                {value}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">{emptyHint}</p>
            )}
          </div>
          {!isEditing ? (
            <Button
              type="button"
              variant={hasValue ? "secondary" : "primary"}
              className="shrink-0"
              onClick={() => startEdit(channel)}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4">
            {linkStep === "form" ? (
              <>
                <label className="text-sm font-medium">
                  {fieldLabel}
                  <input
                    className={`${fieldInput} mt-1`}
                    type={isEmail ? "email" : "tel"}
                    placeholder={placeholder}
                    value={dest}
                    onChange={(e) => onDestChange(e.target.value)}
                    autoComplete={isEmail ? "email" : "tel"}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={!dest.trim()}
                    onClick={() => void sendLinkOtp(channel)}
                  >
                    {copy.profile.sendOtp}
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancelEdit}>
                    {copy.profile.cancel}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="m-0 text-sm text-ink-muted">{copy.login.otpSent}</p>
                <p className="m-0 text-sm font-medium text-ink">{dest}</p>
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
                  <Button type="button" variant="ghost" onClick={cancelEdit}>
                    {copy.profile.cancel}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DashPanel>
    );
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div>
        <h1 className={sectionTitle}>{copy.profile.title}</h1>
        <p className={sectionLead}>{copy.profile.lead}</p>
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <label className="text-sm font-medium">
            {copy.profile.name}
            <input
              className={`${fieldInput} mt-1`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
          <Button type="submit" disabled={loading}>
            {copy.profile.save}
          </Button>
          {saved ? (
            <p className="m-0 text-sm text-success">{copy.profile.saved}</p>
          ) : null}
        </form>
      </div>

      {renderContact("email")}
      {renderContact("phone")}

      <DashPanel className="p-4 sm:p-5">
        <h2 className="m-0 text-base font-semibold text-ink">
          {copy.profile.providers}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {hasPassword ? copy.profile.hasPassword : copy.profile.noPassword}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
      </DashPanel>

      {message ? <p className="m-0 text-sm text-success">{message}</p> : null}
      {error ? (
        <p className="m-0 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
