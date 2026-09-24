"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { LegalDocMeta } from "@/data/legal/catalog";
import { getLegalPdfCopy } from "@/lib/legal/pdf-copy";
import { Button } from "@/components/atoms/Button";
import { ConclusionPdfLightbox } from "@/components/pdf/conclusion/ConclusionPdfLightbox";

function prefersPdfDownloadFallback() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function LegalPdfButton({
  locale,
  title,
  markdown,
  meta,
  className,
}: {
  locale: Locale;
  title: string;
  markdown: string;
  meta: LegalDocMeta;
  className?: string;
}) {
  const copy = getLegalPdfCopy(locale);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("belgi-legal.pdf");
  const [failed, setFailed] = useState(false);
  const iosFallback = prefersPdfDownloadFallback();

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  async function ensureBlob() {
    if (blob && blobUrl) return { blob, url: blobUrl, filename };
    const { buildLegalPdfBlob } = await import("./buildLegalPdfBlob");
    const built = await buildLegalPdfBlob({
      locale,
      title,
      markdown,
      meta,
    });
    const url = URL.createObjectURL(built.blob);
    setBlob(built.blob);
    setFilename(built.filename);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return { blob: built.blob, url, filename: built.filename };
  }

  async function onOpen() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    setOpen(true);
    try {
      await ensureBlob();
    } catch (e) {
      console.warn("[legal-pdf:preview]", e);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    try {
      const ready = await ensureBlob();
      if (!ready) return;
      const { triggerBlobDownload } = await import(
        "@/components/pdf/conclusion/triggerBlobDownload"
      );
      await triggerBlobDownload(ready.blob, ready.filename, "application/pdf");
    } catch (e) {
      console.warn("[legal-pdf:download]", e);
      setFailed(true);
    }
  }

  return (
    <>
      <Button
        type="button"
        className={className}
        onClick={() => void onOpen()}
        disabled={busy}
      >
        {busy ? copy.loading : copy.openPdf}
      </Button>
      <ConclusionPdfLightbox
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setFailed(false);
        }}
        blobUrl={failed ? null : blobUrl}
        busy={busy}
        preferDownloadFallback={iosFallback || failed}
        labels={{
          title: copy.pdfPreviewTitle,
          download: copy.downloadPdf,
          close: copy.close,
          loading: copy.loading,
          unavailable: copy.pdfPreviewUnavailable,
        }}
        onDownload={() => void onDownload()}
      />
    </>
  );
}
