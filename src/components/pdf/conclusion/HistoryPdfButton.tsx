"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { ConclusionDocument } from "@/lib/conclusion";
import { getConclusionCopy } from "@/lib/conclusion/copy";

export function HistoryPdfButton({
  locale,
  checkId,
}: {
  locale: Locale;
  checkId: string;
}) {
  const copy = getConclusionCopy(locale);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(
        `/api/account/checks/${encodeURIComponent(checkId)}/`,
        { credentials: "include" },
      );
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        conclusion?: ConclusionDocument | null;
      };
      if (!res.ok || !json.ok || !json.conclusion) {
        console.warn(
          "[history:pdf]",
          json.error || "missing_conclusion",
          res.status,
        );
        setFailed(true);
        return;
      }
      const { downloadConclusionPdf } = await import(
        "@/components/pdf/conclusion/downloadConclusionPdf"
      );
      await downloadConclusionPdf(json.conclusion);
    } catch (e) {
      console.warn("[history:pdf]", e);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onClick()}
      title={failed ? copy.downloadPdf : undefined}
      data-failed={failed || undefined}
      className="ml-3 inline-flex items-center font-medium text-ink underline-offset-2 hover:underline disabled:opacity-50 data-[failed]:text-red-600"
    >
      {busy ? copy.downloading : "PDF"}
    </button>
  );
}
