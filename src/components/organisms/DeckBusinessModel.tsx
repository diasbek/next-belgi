"use client";

import type {
  DeckBusinessActor,
  DeckBusinessFlow,
  DeckFlowKind,
} from "@/data/deck";
import { cn } from "@/lib/cn";

const kindChip: Record<DeckFlowKind, string> = {
  money: "border-ink bg-ink text-white",
  value: "border-ink/15 bg-lime/75 text-ink",
  lead: "border-ink/15 bg-surface-muted text-ink",
  satisfaction: "border-dashed border-ink/35 bg-white text-ink/75",
};

const kindDot: Record<DeckFlowKind, string> = {
  money: "bg-ink",
  value: "bg-lime ring-1 ring-ink/20",
  lead: "bg-ink/35",
  satisfaction: "bg-white ring-1 ring-ink/30",
};

function ActorCard({
  actor,
  emphasize,
}: {
  actor: DeckBusinessActor;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 text-center sm:px-4 sm:py-3",
        emphasize
          ? "border-ink/15 bg-lime shadow-[0_12px_32px_-20px_rgba(26,28,24,0.45)]"
          : "border-ink/10 bg-white",
      )}
    >
      <p className="m-0 text-sm font-semibold text-ink">{actor.label}</p>
      <p className="m-0 mt-1 text-[0.7rem] leading-snug text-ink/55 sm:text-xs">
        {actor.detail}
      </p>
    </div>
  );
}

function FlowChip({ flow }: { flow: DeckBusinessFlow }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-medium leading-tight sm:text-[0.7rem]",
        kindChip[flow.kind],
      )}
    >
      {flow.label}
    </span>
  );
}

export function DeckBusinessModel({
  actors,
  flows,
  moneyTitle,
  moneySources,
  satisfactionTitle,
  satisfactionSteps,
  legend,
  footnote,
}: {
  actors: DeckBusinessActor[];
  flows: DeckBusinessFlow[];
  moneyTitle: string;
  moneySources: string[];
  satisfactionTitle: string;
  satisfactionSteps: string[];
  legend: Record<DeckFlowKind, string>;
  footnote: string;
}) {
  const byId = Object.fromEntries(actors.map((a) => [a.id, a]));
  const moneyIn = flows.filter((f) => f.kind === "money");
  const valueOut = flows.filter(
    (f) => f.from === "belgi" && f.kind === "value",
  );
  const leadOut = flows.filter((f) => f.kind === "lead");
  const attorneyToClient = flows.filter(
    (f) => f.from === "attorneys" && f.kind === "value",
  );
  const satisfaction = flows.filter((f) => f.kind === "satisfaction");

  return (
    <div className="mt-4 space-y-3.5 lg:mt-5 lg:space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.65rem] text-ink/50 sm:text-xs">
        {(Object.keys(legend) as DeckFlowKind[]).map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", kindDot[kind])} />
            {legend[kind]}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-ink/10 bg-surface-muted/35 p-3 sm:p-4">
        {/* Clients */}
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          {byId.brands ? <ActorCard actor={byId.brands} /> : null}
          {byId.agencies ? <ActorCard actor={byId.agencies} /> : null}
        </div>

        <div className="my-2.5 flex flex-col items-center gap-1.5">
          <div className="flex flex-wrap justify-center gap-1.5">
            {moneyIn.map((f) => (
              <FlowChip key={`m-${f.from}`} flow={f} />
            ))}
          </div>
          <span className="text-xs text-ink/30" aria-hidden>
            ↓ деньги
          </span>
        </div>

        {byId.belgi ? (
          <div className="mx-auto max-w-sm">
            <ActorCard actor={byId.belgi} emphasize />
          </div>
        ) : null}

        <div className="my-2.5 flex flex-col items-center gap-1.5">
          <span className="text-xs text-ink/30" aria-hidden>
            ↓ ценность и лиды
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {valueOut.map((f) => (
              <FlowChip key={`v-${f.to}`} flow={f} />
            ))}
            {leadOut.map((f) => (
              <FlowChip key={`l-${f.to}`} flow={f} />
            ))}
          </div>
        </div>

        {/* Attorneys + back to clients */}
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
          {byId.attorneys ? <ActorCard actor={byId.attorneys} /> : null}
          <div className="flex flex-col items-center gap-1.5 sm:items-start">
            {attorneyToClient.map((f) => (
              <FlowChip key={`a-${f.label}`} flow={f} />
            ))}
            <p className="m-0 text-[0.65rem] text-ink/45">
              → клиент доходит до регистрации
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-col items-center gap-1.5 border-t border-ink/10 pt-3">
          {satisfaction.map((f) => (
            <FlowChip key={`s-${f.label}`} flow={f} />
          ))}
          <p className="m-0 text-center text-[0.7rem] text-ink/50">
            ↑ удовлетворённость → повторные кредиты и рекомендации
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <div className="rounded-xl border border-ink/10 bg-white p-3.5 sm:p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">
            {moneyTitle}
          </p>
          <ul className="mt-2 m-0 list-none space-y-1.5 p-0">
            {moneySources.map((line) => (
              <li
                key={line}
                className="flex gap-2 text-[0.8125rem] leading-snug text-ink"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white p-3.5 sm:p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">
            {satisfactionTitle}
          </p>
          <ol className="mt-2 m-0 list-none space-y-1.5 p-0">
            {satisfactionSteps.map((line, i) => (
              <li
                key={line}
                className="flex gap-2 text-[0.8125rem] leading-snug text-ink"
              >
                <span className="shrink-0 tabular-nums text-ink/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {line}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="m-0 text-xs leading-relaxed text-ink/40">{footnote}</p>
    </div>
  );
}
