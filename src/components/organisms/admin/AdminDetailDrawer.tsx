"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "@/components/molecules/BottomSheet";
import { IconButton } from "@/components/atoms/admin/IconButton";
import { useIsLg } from "@/hooks/useIsLg";
import { cn } from "@/lib/cn";

/**
 * Desktop: portaled side panel (above AppShell).
 * Mobile: vaul BottomSheet only — never both at once (vaul locks scroll/clicks on lg).
 */
export function AdminDetailDrawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const isLg = useIsLg();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className="fixed inset-0 z-[200] flex justify-end">
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
            "relative z-10 flex h-dvh w-full flex-col overflow-hidden border-l border-black/5 bg-white shadow-[-8px_0_24px_rgb(26_28_24/0.1)]",
            wide ? "max-w-2xl" : "max-w-md",
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-5 py-4">
            <h2 className="m-0 text-base font-semibold text-ink">{title}</h2>
            <IconButton onClick={() => onOpenChange(false)} aria-label="Close">
              ×
            </IconButton>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {children}
          </div>
          {footer ? (
            <div className="shrink-0 border-t border-black/5 px-5 py-4">
              {footer}
            </div>
          ) : null}
        </aside>
      </div>
    ) : null;

  return (
    <>
      {mounted && desktop
        ? createPortal(desktop, document.body)
        : null}

      {isLg === false ? (
        <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
          <div className="px-2 pb-2">{children}</div>
          {footer ? <div className="mt-4 px-2">{footer}</div> : null}
        </BottomSheet>
      ) : null}
    </>
  );
}
