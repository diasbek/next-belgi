import { cn } from "@/lib/cn";

/** Decorative locked report chrome — no API match data. */
export function ReportPreviewTeaser({
  query,
  niceClasses,
  markType,
  className,
}: {
  query: string;
  niceClasses: string[];
  markType: string;
  className?: string;
}) {
  const rows = [0, 1, 2];

  return (
    <div className={cn("select-none", className)} aria-hidden>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:justify-between">
        <div>
          <div className="h-3 w-16 rounded bg-black/10" />
          <p className="m-0 mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {query}
          </p>
        </div>
        <div className="text-sm sm:text-right">
          <div className="ml-auto h-3 w-20 rounded bg-black/10 sm:ml-auto" />
          <p className="m-0 mt-1 text-ink">
            {(niceClasses || []).join(" ") || "—"}
          </p>
          <p className="m-0 mt-2 text-ink-muted">{markType}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 h-4 w-40 rounded bg-black/10" />
        <div className="overflow-hidden rounded-2xl border border-border">
          {rows.map((i) => (
            <div
              key={i}
              className="grid gap-3 border-b border-border px-4 py-5 last:border-b-0 md:grid-cols-[1fr_1.2fr_auto]"
            >
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-black/15" />
                <div className="h-3 w-40 rounded bg-black/10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full max-w-xs rounded bg-black/10" />
                <div className="h-3 w-48 rounded bg-black/10" />
              </div>
              <div className="h-8 w-16 rounded-full bg-black/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-4">
          <div className="mb-3 h-4 w-32 rounded bg-black/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-black/10" />
            <div className="h-3 w-5/6 rounded bg-black/10" />
            <div className="h-3 w-40 rounded bg-black/10" />
          </div>
        </div>
        <div className="rounded-2xl border border-border p-4">
          <div className="mb-3 h-4 w-28 rounded bg-black/10" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 flex-1 rounded-xl bg-black/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
