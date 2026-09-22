"use client";

import { BottomSheet } from "@/components/molecules/BottomSheet";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";

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
  return (
    <>
      {/* Desktop centered panel */}
      {open ? (
        <div className="fixed inset-0 z-[85] hidden items-center justify-center p-4 lg:flex">
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
            {lead ? (
              <p className="mt-2 text-sm text-ink-muted">{lead}</p>
            ) : null}
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
      ) : null}

      <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
        {lead ? <p className="mb-4 px-2 text-sm text-ink-muted">{lead}</p> : null}
        <div className="flex flex-col gap-2 px-2">
          <Button
            type="button"
            className={cn("w-full", danger && "!bg-danger hover:!bg-danger/90")}
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
    </>
  );
}
