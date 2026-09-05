"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAppCopy } from "@/i18n/app-copy";
import { Button } from "@/components/atoms/Button";
import { fieldInput, sectionLead, sectionTitle } from "@/styles/ui";
import {
  MODULE_CATALOG,
  type IntegrationProvider,
  type ModuleCatalogItem,
} from "@/lib/integrations/types";
import { cn } from "@/lib/cn";

type Status = {
  provider: IntegrationProvider;
  configured: boolean;
  enabled: boolean;
  mode: string;
  masked: Record<string, string | boolean | null>;
  updated_at: string | null;
};

function modeBadgeClass(mode: string) {
  if (mode === "live") return "bg-ink text-white";
  if (mode === "sandbox") return "bg-amber-100 text-amber-900";
  if (mode === "dev" || mode === "mock" || mode === "test") {
    return "bg-lime text-ink";
  }
  return "bg-surface-muted text-ink-muted";
}

export function IntegrationsPanel({ locale }: { locale: Locale }) {
  const copy = getAppCopy(locale);
  const [items, setItems] = useState<Status[]>([]);
  const [active, setActive] = useState<IntegrationProvider | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const statusMap = useMemo(() => {
    const m = new Map<IntegrationProvider, Status>();
    for (const i of items) m.set(i.provider, i);
    return m;
  }, [items]);

  const catalog = active
    ? MODULE_CATALOG.find((c) => c.provider === active)
    : null;

  async function load() {
    const res = await fetch("/api/admin/integrations/");
    const json = (await res.json()) as { ok?: boolean; items?: Status[] };
    if (json.items) setItems(json.items);
  }

  useEffect(() => {
    void load();
  }, []);

  function openModule(provider: IntegrationProvider) {
    const st = statusMap.get(provider);
    const cat = MODULE_CATALOG.find((c) => c.provider === provider)!;
    const next: Record<string, string> = {
      mode: st?.mode || cat.defaultMode,
    };
    for (const field of cat.fields) {
      if (field.key === "mode") continue;
      const masked = st?.masked[field.key];
      if (field.secret) {
        next[field.key] = "";
      } else if (typeof masked === "string") {
        next[field.key] = masked;
      } else {
        next[field.key] = "";
      }
    }
    setForm(next);
    setEnabled(st?.enabled !== false);
    setActive(provider);
    setMsg(null);
    setErr(null);
  }

  function modeLabel(mode: string) {
    const map: Record<string, string> = {
      live: copy.adminIntegrations.modeLive,
      test: copy.adminIntegrations.modeTest,
      sandbox: copy.adminIntegrations.modeSandbox,
      dev: copy.adminIntegrations.modeDev,
      mock: copy.adminIntegrations.modeMock,
    };
    return map[mode] || mode;
  }

  function moduleTitle(provider: IntegrationProvider) {
    return copy.adminIntegrations.modules[provider]?.title || provider;
  }

  function moduleLead(provider: IntegrationProvider) {
    return copy.adminIntegrations.modules[provider]?.lead || "";
  }

  function visibleFields(cat: ModuleCatalogItem) {
    const mode = form.mode || cat.defaultMode;
    return cat.fields.filter((f) => {
      if (f.key === "mode") return true;
      if (f.hideWhenModes?.includes(mode)) return false;
      return true;
    });
  }

  async function save() {
    if (!active) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/integrations/${active}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: form, enabled }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErr(json.error || "error");
        return;
      }
      setMsg(copy.adminIntegrations.saved);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    if (!active) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/integrations/${active}/test/`, {
        method: "POST",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!json.ok) {
        setErr(json.error || "test_failed");
        return;
      }
      setMsg(`${active}: ok`);
    } finally {
      setBusy(false);
    }
  }

  async function resetSilent() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/integrations/reset-silent/", {
        method: "POST",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        items?: Status[];
      };
      if (!res.ok || !json.ok) {
        setErr(json.error || "error");
        return;
      }
      if (json.items) setItems(json.items);
      setMsg(copy.adminIntegrations.resetSilentDone);
      setActive(null);
    } finally {
      setBusy(false);
    }
  }

  const categories: Array<{
    id: ModuleCatalogItem["category"];
    title: string;
  }> = [
    { id: "messaging", title: copy.adminIntegrations.catMessaging },
    { id: "payments", title: copy.adminIntegrations.catPayments },
    { id: "ai", title: copy.adminIntegrations.catAi },
    { id: "auth", title: copy.adminIntegrations.catAuth },
    { id: "data", title: copy.adminIntegrations.catData },
  ];

  return (
    <div>
      <h1 className={sectionTitle}>{copy.adminIntegrations.title}</h1>
      <p className={sectionLead}>{copy.adminIntegrations.lead}</p>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        {copy.adminIntegrations.masterKeyNote}
      </p>
      <div className="mb-8">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => void resetSilent()}
        >
          {copy.adminIntegrations.resetSilent}
        </Button>
        {msg ? <p className="mt-3 text-sm text-success">{msg}</p> : null}
        {err && !active ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {err}
          </p>
        ) : null}
      </div>

      {categories.map((cat) => {
        const mods = MODULE_CATALOG.filter((m) => m.category === cat.id);
        if (!mods.length) return null;
        return (
          <section key={cat.id} className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              {cat.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mods.map((mod) => {
                const st = statusMap.get(mod.provider);
                const mode = st?.mode || mod.defaultMode;
                return (
                  <button
                    key={mod.provider}
                    type="button"
                    onClick={() => openModule(mod.provider)}
                    className={cn(
                      "rounded-2xl border border-black/10 bg-white p-4 text-left transition",
                      "hover:border-ink/30 hover:shadow-sm",
                      active === mod.provider && "border-ink ring-1 ring-ink",
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="font-semibold text-ink">
                        {moduleTitle(mod.provider)}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                          modeBadgeClass(mode),
                        )}
                      >
                        {modeLabel(mode)}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-ink-muted">
                      {moduleLead(mod.provider)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {st?.configured
                        ? copy.adminIntegrations.configured
                        : copy.adminIntegrations.missing}
                      {st?.enabled === false
                        ? ` · ${copy.adminIntegrations.disabled}`
                        : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {active && catalog ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-ink">
                  {moduleTitle(active)}
                </h3>
                <p className="text-sm text-ink-muted">
                  {moduleLead(active)}
                </p>
              </div>
              <button
                type="button"
                className="text-2xl leading-none text-ink-muted"
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {catalog.testOtpHint && form.mode === "test" ? (
              <p className="mb-4 rounded-xl bg-lime/60 px-3 py-2 text-sm text-ink">
                {copy.adminIntegrations.testOtpHint}
              </p>
            ) : null}
            {(active === "payme" || active === "click") &&
            form.mode === "dev" ? (
              <p className="mb-4 rounded-xl bg-lime/60 px-3 py-2 text-sm text-ink">
                {copy.adminIntegrations.devPayHint}
              </p>
            ) : null}
            {active === "payme" && form.mode === "sandbox" ? (
              <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {copy.adminIntegrations.sandboxPayHint}
              </p>
            ) : null}

            <div className="flex flex-col gap-3">
              {visibleFields(catalog).map((field) => {
                if (field.kind === "select") {
                  return (
                    <label key={field.key} className="text-sm font-medium">
                      {field.key === "mode"
                        ? copy.adminIntegrations.mode
                        : field.key}
                      <select
                        className={`${fieldInput} mt-1`}
                        value={form[field.key] || catalog.defaultMode}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                      >
                        {(field.options || []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {modeLabel(opt.value)}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }
                return (
                  <label key={field.key} className="text-sm font-medium">
                    {field.key}
                    <input
                      className={`${fieldInput} mt-1`}
                      type={field.secret ? "password" : "text"}
                      autoComplete="off"
                      placeholder={
                        field.secret && statusMap.get(active)?.configured
                          ? String(
                              statusMap.get(active)?.masked[field.key] ||
                                "••••",
                            )
                          : undefined
                      }
                      value={form[field.key] || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  </label>
                );
              })}

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                {copy.adminIntegrations.enabled}
              </label>
            </div>

            {msg ? (
              <p className="mt-3 text-sm text-success">{msg}</p>
            ) : null}
            {err ? (
              <p className="mt-3 text-sm text-danger" role="alert">
                {err}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" disabled={busy} onClick={() => void save()}>
                {copy.adminIntegrations.save}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void test()}
              >
                {copy.adminIntegrations.test}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActive(null)}
              >
                {copy.adminIntegrations.close}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
