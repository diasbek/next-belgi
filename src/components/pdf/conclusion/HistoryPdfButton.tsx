"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { ConclusionDocument } from "@/lib/conclusion";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import { ConclusionPdfLightbox } from "./ConclusionPdfLightbox";

function prefersPdfDownloadFallback() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function HistoryPdfButton({
  locale,
  checkId,
}: {
  locale: Locale;
  checkId: string;
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

  async function loadConclusion(): Promise<ConclusionDocument | null> {
    const res = await fetch(
      `/api/account/checks/${encodeURIComponent(checkId)}/`,
      { credentials: "include" },
    );
    const json = (await res.json()) as {
      ok?: boolean;
      conclusion?: ConclusionDocument | null;
    };
    if (!res.ok || !json.ok || !json.conclusion) return null;
    return json.conclusion;
  }

  async function ensureBlob() {
    if (blob && blobUrl) return { blob, url: blobUrl, filename };
    const conclusion = await loadConclusion();
    if (!conclusion) throw new Error("no_conclusion");
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
    if (busy) return;
    setBusy(true);
    setFailed(false);
    setOpen(true);
    try {
      await ensureBlob();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    try {
      const ready = await ensureBlob();
      const { triggerBlobDownload } = await import("./triggerBlobDownload");
      await triggerBlobDownload(ready.blob, ready.filename, "application/pdf");
    } catch {
      setFailed(true);
    }
  }

  return (
    <span className="ml-3 inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        disabled={busy && !open}
        onClick={() => void onOpen()}
        aria-busy={busy}
        className="inline-flex items-center font-medium text-ink underline-offset-2 hover:underline disabled:opacity-50"
      >
        {busy && !blobUrl ? copy.downloading : copy.openPdf}
      </button>
      {failed && !open ? (
        <span className="text-xs text-danger" role="alert">
          {copy.downloadFailed}
        </span>
      ) : null}
      <ConclusionPdfLightbox
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setFailed(false);
        }}
        blobUrl={blobUrl}
        busy={busy}
        preferDownloadFallback={
          iosFallback || failed || (!busy && open && !blobUrl)
        }
        labels={{
          title: copy.pdfPreviewTitle,
          download: copy.downloadPdf,
          close: copy.closePdf,
          loading: copy.downloading,
          unavailable: failed ? copy.downloadFailed : copy.pdfPreviewUnavailable,
        }}
        onDownload={() => void onDownload()}
      />
    </span>
  );
}
