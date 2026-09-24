"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "@/components/molecules/BottomSheet";
import { Button } from "@/components/atoms/Button";
import { useIsLg } from "@/hooks/useIsLg";
import { cn } from "@/lib/cn";

function useClientMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export type ConclusionPdfLightboxLabels = {
  title: string;
  download: string;
  close: string;
  loading: string;
  unavailable: string;
};

export function ConclusionPdfLightbox({
  open,
  onOpenChange,
  blobUrl,
  busy,
  preferDownloadFallback,
  labels,
  onDownload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blobUrl: string | null;
  busy?: boolean;
  /** When true (e.g. iOS), show download-first message instead of relying on iframe */
  preferDownloadFallback?: boolean;
  labels: ConclusionPdfLightboxLabels;
  onDownload: () => void;
}) {
  const isLg = useIsLg();
  const mounted = useClientMounted();

  useEffect(() => {
    if (!open || isLg !== true) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isLg]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const previewBody = (
    <div className="flex min-h-0 flex-1 flex-col">
      {busy && !blobUrl ? (
        <p className="m-0 flex flex-1 items-center justify-center p-8 text-sm text-ink-muted">
          {labels.loading}
        </p>
      ) : preferDownloadFallback || !blobUrl ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="m-0 max-w-sm text-sm text-ink-muted">
            {labels.unavailable}
          </p>
          <Button type="button" onClick={onDownload} disabled={!blobUrl && busy}>
            {labels.download}
          </Button>
        </div>
      ) : (
        <iframe
          src={blobUrl}
          title={labels.title}
          className="min-h-[min(70dvh,40rem)] w-full flex-1 rounded-xl border border-ink/10 bg-white"
        />
      )}
    </div>
  );

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink/10 pt-3">
      <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
        {labels.close}
      </Button>
      <Button
        type="button"
        onClick={onDownload}
        disabled={!blobUrl || busy}
      >
        {labels.download}
      </Button>
    </div>
  );

  const desktop =
    open && isLg === true ? (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          className="absolute inset-0 bg-ink/35"
          aria-label={labels.close}
          onClick={() => onOpenChange(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
          className={cn(
            "relative z-10 flex max-h-[min(92dvh,56rem)] w-full max-w-4xl flex-col",
            "rounded-2xl border border-black/5 bg-white p-4 shadow-lg sm:p-5",
          )}
        >
          <h2 className="m-0 mb-3 shrink-0 text-lg font-semibold text-ink">
            {labels.title}
          </h2>
          {previewBody}
          <div className="mt-3 shrink-0">{footer}</div>
        </div>
      </div>
    ) : null;

  return (
    <>
      {mounted && desktop ? createPortal(desktop, document.body) : null}
      <BottomSheet
        open={open && isLg === false}
        onOpenChange={onOpenChange}
        title={labels.title}
        className="max-h-[min(92dvh,56rem)]"
      >
        <div className="flex min-h-[min(70dvh,36rem)] flex-col gap-3 px-2 pb-2">
          {previewBody}
          {footer}
        </div>
      </BottomSheet>
    </>
  );
}
