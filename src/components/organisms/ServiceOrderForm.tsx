"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import {
  getServicesCopy,
  type ServiceSlug,
} from "@/data/services-catalog";
import { cn } from "@/lib/cn";

type Props = {
  locale: Locale;
  serviceSlug: ServiceSlug;
  variant?: "filing" | "ip" | "attorney" | "b2b" | "generic";
  checkId?: string;
};

export function ServiceOrderForm({
  locale,
  serviceSlug,
  variant = "generic",
  checkId,
}: Props) {
  const labels = getServicesCopy(locale).orderForm;
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [ipType, setIpType] = useState(labels.ipTypes[0]?.value ?? "opposition");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const website = String(fd.get("website") || "");
    if (website) return;

    setStatus("loading");
    const data: Record<string, unknown> = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      company: String(fd.get("company") || ""),
      mark: String(fd.get("mark") || ""),
      classes: String(fd.get("classes") || ""),
      country: String(fd.get("country") || ""),
      message: String(fd.get("message") || ""),
      serviceSlug,
      checkId: checkId || undefined,
    };

    if (variant === "ip") data.ipType = ipType;
    if (variant === "b2b") {
      data.orgName = String(fd.get("orgName") || "");
      data.registries = String(fd.get("registries") || "");
      data.volume = String(fd.get("volume") || "");
    }

    try {
      const res = await fetch("/api/service-orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          locale,
          payload: data,
          checkId: checkId || undefined,
          website,
        }),
      });
      if (!res.ok) {
        setStatus("err");
        return;
      }
      setStatus("ok");
      e.currentTarget.reset();
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-xl bg-lime/50 px-4 py-3 text-sm text-ink">
        {labels.success}
      </p>
    );
  }

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink";

  return (
    <form
      id="order"
      onSubmit={onSubmit}
      className="scroll-mt-24 space-y-4 rounded-2xl bg-surface-muted p-5 sm:p-6"
    >
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      {variant === "b2b" ? (
        <>
          <label className="block text-sm font-medium text-ink">
            {labels.orgName}
            <input name="orgName" required className={fieldClass} />
          </label>
          <label className="block text-sm font-medium text-ink">
            {labels.registries}
            <input name="registries" className={fieldClass} />
          </label>
          <label className="block text-sm font-medium text-ink">
            {labels.volume}
            <input name="volume" className={fieldClass} />
          </label>
        </>
      ) : null}

      {variant === "ip" ? (
        <label className="block text-sm font-medium text-ink">
          {labels.ipTypeLabel}
          <select
            value={ipType}
            onChange={(e) => setIpType(e.target.value)}
            className={fieldClass}
          >
            {labels.ipTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          {labels.name}
          <input name="name" required className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-ink">
          {labels.email}
          <input name="email" type="email" required className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-ink">
          {labels.phone}
          <input name="phone" className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-ink">
          {labels.company}
          <input name="company" className={fieldClass} />
        </label>
      </div>

      {variant !== "b2b" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-ink">
            {labels.mark}
            <input name="mark" className={fieldClass} />
          </label>
          <label className="block text-sm font-medium text-ink">
            {labels.classes}
            <input name="classes" className={fieldClass} />
          </label>
          <label className="block text-sm font-medium text-ink sm:col-span-2">
            {labels.country}
            <input name="country" defaultValue="UZ" className={fieldClass} />
          </label>
        </div>
      ) : null}

      <label className="block text-sm font-medium text-ink">
        {labels.message}
        <textarea name="message" rows={3} className={fieldClass} />
      </label>

      {status === "err" ? (
        <p className="text-sm text-red-700">{labels.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white",
          status === "loading" && "opacity-60",
        )}
      >
        {labels.submit}
      </button>
    </form>
  );
}
