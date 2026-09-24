"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/atoms/Button";

export function AttachAttorneyButton({
  locale,
  attorneyId,
  orderId,
}: {
  locale: Locale;
  attorneyId: string;
  orderId?: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const label =
    locale === "ru"
      ? "Привязать"
      : locale === "en"
        ? "Attach"
        : "Bogʻlash";

  async function attach() {
    if (!orderId) {
      setMsg(
        locale === "ru"
          ? "Сначала создайте заказ услуги."
          : locale === "en"
            ? "Create a service order first."
            : "Avval xizmat buyurtmasini yarating.",
      );
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/service-orders/${orderId}/attorney/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attorneyId }),
      });
      if (!res.ok) throw new Error("fail");
      setMsg(
        locale === "ru"
          ? "Привязано"
          : locale === "en"
            ? "Attached"
            : "Bogʻlandi",
      );
    } catch {
      setMsg(
        locale === "ru"
          ? "Ошибка"
          : locale === "en"
            ? "Error"
            : "Xatolik",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="secondary"
        disabled={busy}
        onClick={() => void attach()}
        className="!min-h-0 !px-3 !py-1.5 text-xs"
      >
        {label}
      </Button>
      {msg ? <span className="text-xs text-ink-muted">{msg}</span> : null}
    </span>
  );
}
