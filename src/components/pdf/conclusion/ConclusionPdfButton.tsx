"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { ConclusionDocument } from "@/lib/conclusion";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import { Button } from "@/components/atoms/Button";
import { ConclusionPdfLightbox } from "./ConclusionPdfLightbox";

function prefersPdfDownloadFallback() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

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
  const [open, setOpen] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState("belgi.pdf");
  const [failed, setFailed] = useState(false);
  const iosFallback = prefersPdfDownloadFallback();

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (!conclusion) return null;

  async function ensureBlob() {
    if (!conclusion) return null;
    if (blob && blobUrl) return { blob, url: blobUrl, filename };
    const { buildConclusionPdfBlob } = await import(
      "@/components/pdf/conclusion/downloadConclusionPdf"
    );
    const built = await buildConclusionPdfBlob(conclusion);
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
    if (!conclusion || busy) return;
    setBusy(true);
    setFailed(false);
    setOpen(true);
    try {
      await ensureBlob();
    } catch (e) {
      console.warn("[pdf:preview]", e);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    try {
      const ready = await ensureBlob();
      if (!ready) return;
      const { triggerBlobDownload } = await import("./triggerBlobDownload");
      await triggerBlobDownload(ready.blob, ready.filename, "application/pdf");
    } catch (e) {
      console.warn("[pdf:download]", e);
      setFailed(true);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setFailed(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        className={className}
        disabled={busy && !open}
        onClick={() => void onOpen()}
      >
        {busy && !blobUrl ? copy.downloading : copy.openPdf}
      </Button>
      <ConclusionPdfLightbox
        open={open}
        onOpenChange={onOpenChange}
        blobUrl={blobUrl}
        busy={busy}
        preferDownloadFallback={iosFallback || failed || (!busy && open && !blobUrl)}
        labels={{
          title: copy.pdfPreviewTitle,
          download: copy.downloadPdf,
          close: copy.closePdf,
          loading: copy.downloading,
          unavailable: failed
            ? copy.downloadFailed
            : copy.pdfPreviewUnavailable,
        }}
        onDownload={() => void onDownload()}
      />
    </>
  );
}
