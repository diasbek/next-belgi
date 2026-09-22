"use client";

import { BottomSheet } from "@/components/molecules/BottomSheet";
import { IconButton } from "@/components/atoms/admin/IconButton";
import { cn } from "@/lib/cn";

/**
 * z-index: overlay 85, panel 90 (above tab bar 70)
 */
export function AdminDetailDrawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-[85] hidden lg:block">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-black/5 bg-white shadow-[-8px_0_24px_rgb(26_28_24/0.1)]",
            )}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <h2 className="m-0 text-base font-semibold text-ink">{title}</h2>
              <IconButton onClick={() => onOpenChange(false)} aria-label="Close">
                ×
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
            {footer ? (
              <div className="border-t border-black/5 px-5 py-4">{footer}</div>
            ) : null}
          </aside>
        </div>
      ) : null}

      <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
        <div className="px-2 pb-2">{children}</div>
        {footer ? <div className="mt-4 px-2">{footer}</div> : null}
      </BottomSheet>
    </>
  );
}
