"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { ConclusionDocument } from "@/lib/conclusion";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import { Button } from "@/components/atoms/Button";

export function ConclusionPdfButton({
  locale,
  conclusion,
  className,
}: {
  locale: Locale;
  conclusion: ConclusionDocument | null | undefined;
  className?: string;
}) {
  const copy = getConclusionCopy(locale);
  const [busy, setBusy] = useState(false);

  if (!conclusion) return null;

  async function onClick() {
    if (!conclusion || busy) return;
    setBusy(true);
    try {
      const { downloadConclusionPdf } = await import(
        "@/components/pdf/conclusion/downloadConclusionPdf"
      );
      await downloadConclusionPdf(conclusion);
    } catch (e) {
      console.warn("[pdf:download]", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      className={className}
      disabled={busy}
      onClick={() => void onClick()}
    >
      {busy ? copy.downloading : copy.downloadPdf}
    </Button>
  );
}
