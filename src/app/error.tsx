"use client";

import { contentFocus } from "@/styles/ui";
import { cn } from "@/lib/cn";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className={cn(
        contentFocus,
        "flex min-h-[50vh] flex-col items-center justify-center gap-4 px-[var(--page-padding)] text-center",
      )}
    >
      <h1 className="m-0 text-2xl font-semibold">Something went wrong</h1>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
