"use client";

import { Drawer } from "vaul";
import { cn } from "@/lib/cn";

/**
 * Overlay layers (dashboard):
 * - tab bar: z-70
 * - sheet scrim: z-80
 * - sheet content: z-90
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-ink/35 lg:hidden" />
        <Drawer.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[90] flex max-h-[min(88dvh,40rem)] flex-col rounded-t-2xl bg-white outline-none lg:hidden",
            "pb-[var(--safe-bottom)]",
            className,
          )}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-black/15" aria-hidden />
          {title ? (
            <Drawer.Title className="m-0 px-5 pt-3 pb-1 text-base font-semibold text-ink">
              {title}
            </Drawer.Title>
          ) : (
            <Drawer.Title className="sr-only">Menu</Drawer.Title>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-1">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
