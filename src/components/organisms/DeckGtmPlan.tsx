"use client";

import type { DeckGtmStage } from "@/data/deck";
import { cn } from "@/lib/cn";

export function DeckGtmPlan({
  lead,
  stages,
  footnote,
}: {
  lead: string;
  stages: DeckGtmStage[];
  footnote: string;
}) {
  return (
    <div className="mt-4 space-y-3 lg:mt-5">
      <p className="m-0 max-w-2xl text-sm leading-snug text-ink/65">{lead}</p>

      <ol className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
        {stages.map((stage, i) => (
          <li
            key={stage.title}
            className={cn(
              "flex flex-col rounded-xl border border-ink/10 bg-white p-3.5 sm:p-4",
              i === 0 && "bg-lime/45 sm:col-span-2 lg:col-span-1",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="m-0 text-[0.65rem] font-semibold tabular-nums tracking-wide text-ink/40">
                {String(i + 1).padStart(2, "0")}
              </p>
              <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[0.65rem] font-medium leading-tight text-ink/60">
                {stage.unlocks}
              </span>
            </div>
            <p className="m-0 mt-2 text-sm font-semibold text-ink">
              {stage.title}
            </p>
            <ul className="mt-2.5 m-0 flex list-none flex-col gap-1.5 p-0">
              {stage.actions.map((action) => (
                <li
                  key={action}
                  className="flex gap-2 text-[0.75rem] leading-snug text-ink/75 sm:text-[0.8125rem]"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink/40" />
                  {action}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="m-0 text-xs leading-relaxed text-ink/40">{footnote}</p>
    </div>
  );
}
