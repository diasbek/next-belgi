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

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  lead,
  confirmLabel,
  cancelLabel,
  onConfirm,
  danger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  lead?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  danger?: boolean;
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

  const desktop =
    open && isLg === true ? (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-ink/35"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 w-full max-w-md rounded-2xl border border-black/5 bg-white p-5 shadow-lg"
        >
          <h2 className="m-0 text-lg font-semibold text-ink">{title}</h2>
          {lead ? <p className="mt-2 text-sm text-ink-muted">{lead}</p> : null}
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              className={cn(danger && "!bg-danger hover:!bg-danger/90")}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      {mounted && desktop ? createPortal(desktop, document.body) : null}

      {isLg === false ? (
        <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
          {lead ? (
            <p className="mb-4 px-2 text-sm text-ink-muted">{lead}</p>
          ) : null}
          <div className="flex flex-col gap-2 px-2">
            <Button
              type="button"
              className={cn(
                "w-full",
                danger && "!bg-danger hover:!bg-danger/90",
              )}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}
