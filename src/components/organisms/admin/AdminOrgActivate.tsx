"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/atoms/Button";

export function AdminOrgActivate({
  orgId,
  locale,
  status,
}: {
  orgId: string;
  locale: Locale;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(createKey: boolean) {
    setBusy(true);
    setErr(null);
    setKey(null);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activate: true, createKey }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        apiKey?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setErr(json.error || "error");
        return;
      }
      if (json.apiKey) setKey(json.apiKey);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {status !== "active" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => void run(false)}
          >
            {locale === "ru"
              ? "Активировать"
              : locale === "en"
                ? "Activate"
                : "Faollashtirish"}
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={busy}
          onClick={() => void run(true)}
        >
          {locale === "ru"
            ? "API-ключ"
            : locale === "en"
              ? "Mint API key"
              : "API kalit"}
        </Button>
      </div>
      {key ? (
        <code className="max-w-full break-all rounded-lg bg-white px-2 py-1 text-xs text-ink">
          {key}
        </code>
      ) : null}
      {err ? <p className="text-xs text-danger">{err}</p> : null}
    </div>
  );
}
