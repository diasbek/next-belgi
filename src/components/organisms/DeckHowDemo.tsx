"use client";

import { useEffect, useState } from "react";
import type { DeckHowDemo as DeckHowDemoCopy, DeckStep } from "@/data/deck";
import { cn } from "@/lib/cn";

type Phase = "brief" | "pipeline" | "report" | "gap";

/**
 * Demo scenario for the pitch “How it works” slide:
 * brief (brand + Nice) → same pipeline steps as /check/ → report → loop.
 * Runs only while `active` so other slides stay quiet.
 */
export function DeckHowDemo({
  steps,
  demo,
  active,
}: {
  steps: DeckStep[];
  demo: DeckHowDemoCopy;
  active: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [briefTick, setBriefTick] = useState(0);

  useEffect(() => {
    if (!active) {
      setPhase("brief");
      setPipelineIndex(0);
      setBriefTick(0);
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setPhase("report");
      setBriefTick(1);
      setPipelineIndex(demo.pipeline.length - 1);
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    function runBrief() {
      setPhase("brief");
      setBriefTick(0);
      setPipelineIndex(0);
      later(demo.briefMs / 2, () => {
        setBriefTick(1);
        later(demo.briefMs / 2, runPipeline);
      });
    }

    function runPipeline() {
      setPhase("pipeline");
      setPipelineIndex(0);
      let i = 0;
      function advance() {
        if (i >= demo.pipeline.length - 1) {
          later(demo.stepMs, runReport);
          return;
        }
        later(demo.stepMs, () => {
          i += 1;
          setPipelineIndex(i);
          advance();
        });
      }
      advance();
    }

    function runReport() {
      setPhase("report");
      later(demo.reportMs, () => {
        setPhase("gap");
        later(demo.loopGapMs, runBrief);
      });
    }

    runBrief();
    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [active, demo]);

  const macroIndex =
    phase === "brief"
      ? briefTick === 0
        ? 0
        : 1
      : phase === "pipeline"
        ? 2
        : 3;

  const progress =
    phase === "brief"
      ? Math.round(((briefTick + 1) / 2) * 18)
      : phase === "pipeline"
        ? Math.round(
            18 +
              ((pipelineIndex + 1) / Math.max(1, demo.pipeline.length)) * 72,
          )
        : 100;

  const stepLabel = demo.pipeline[pipelineIndex] ?? demo.pipeline[0] ?? "";
  const stepNo = String(pipelineIndex + 1).padStart(2, "0");
  const totalNo = String(demo.pipeline.length).padStart(2, "0");

  return (
    <div className="mt-5 grid gap-4 lg:mt-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-7">
      {/* Mobile: compact step rail */}
      <ol className="m-0 flex list-none gap-1.5 overflow-x-auto p-0 lg:hidden">
        {steps.map((step, i) => {
          const on = i === macroIndex;
          const done = i < macroIndex;
          return (
            <li
              key={step.title}
              className={cn(
                "shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                on
                  ? "border-ink/20 bg-lime text-ink"
                  : done
                    ? "border-ink/10 bg-surface-muted text-ink/60"
                    : "border-ink/10 text-ink/40",
              )}
            >
              {String(i + 1).padStart(2, "0")} {step.title}
            </li>
          );
        })}
      </ol>

      {/* Desktop: full step cards */}
      <ol className="m-0 hidden list-none space-y-2 p-0 lg:block">
        {steps.map((step, i) => {
          const on = i === macroIndex;
          const done = i < macroIndex;
          return (
            <li
              key={step.title}
              className={cn(
                "rounded-xl border px-4 py-3 transition duration-300",
                on
                  ? "border-ink/15 bg-lime/55 shadow-[0_10px_28px_-18px_rgba(26,28,24,0.4)]"
                  : done
                    ? "border-ink/8 bg-surface-muted/80"
                    : "border-ink/8 bg-white",
              )}
            >
              <p
                className={cn(
                  "m-0 text-[0.65rem] font-semibold tabular-nums tracking-wide",
                  on ? "text-ink/55" : "text-ink/35",
                )}
              >
                {String(i + 1).padStart(2, "0")}
                {done ? " · готово" : on ? " · сейчас" : ""}
              </p>
              <p
                className={cn(
                  "m-0 mt-1 text-sm font-semibold",
                  on ? "text-ink" : "text-ink/70",
                )}
              >
                {step.title}
              </p>
              <p className="m-0 mt-1 text-[0.8125rem] leading-snug text-ink/55">
                {step.text}
              </p>
            </li>
          );
        })}
      </ol>

      <div
        className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5"
        aria-live="polite"
        aria-busy={phase === "pipeline"}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-ink/40">
            Сценарий
          </p>
          <span className="rounded-md bg-ink px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
            {demo.demoBadge}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 font-mono text-sm font-semibold transition",
              phase === "brief" && briefTick === 0
                ? "bg-lime text-ink"
                : "bg-surface-muted text-ink",
            )}
          >
            {demo.brand}
          </span>
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-sm transition",
              phase === "brief" && briefTick >= 1
                ? "bg-lime text-ink"
                : "bg-surface-muted text-ink/70",
            )}
          >
            {demo.activity} · {demo.classLabel}
          </span>
          {demo.registries.map((r) => (
            <span
              key={r}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition",
                phase === "pipeline"
                  ? "bg-lime/70 text-ink"
                  : "bg-surface-muted text-ink/55",
              )}
            >
              {r}
            </span>
          ))}
        </div>

        <div className="mt-5 min-h-[10.5rem] text-center sm:min-h-[11.5rem]">
          {phase === "brief" ? (
            <div className="flex h-full min-h-[10.5rem] flex-col items-center justify-center sm:min-h-[11.5rem]">
              <p className="m-0 text-sm text-ink/55">
                {briefTick === 0
                  ? "Ввод обозначения…"
                  : "Выбор товаров и классов МКТУ…"}
              </p>
              <p className="m-0 mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
                {briefTick === 0 ? demo.brand : demo.activity}
              </p>
            </div>
          ) : null}

          {phase === "pipeline" ? (
            <>
              <div
                className="relative mx-auto mb-4 size-16 sm:size-[4.5rem]"
                aria-hidden
              >
                <span className="check-ring-pulse absolute inset-0 rounded-full border-2 border-lime" />
                <span className="check-ring-pulse check-ring-pulse--late absolute inset-0 rounded-full border-2 border-lime" />
                <span className="check-scan-arc absolute inset-0 rounded-full" />
                <span className="absolute inset-[6px] flex items-center justify-center rounded-full bg-white">
                  <span className="text-xs font-semibold tabular-nums text-ink sm:text-sm">
                    {progress}%
                  </span>
                </span>
              </div>
              <p className="m-0 mb-3 text-sm font-medium text-ink">
                {demo.searchingTitle}
              </p>
              <div
                key={pipelineIndex}
                className="check-step-card mx-auto max-w-sm rounded-2xl bg-lime/50 px-4 py-3.5 text-left sm:px-5"
              >
                <p className="m-0 text-xs font-semibold tabular-nums text-ink/50">
                  {stepNo} / {totalNo}
                </p>
                <p className="m-0 mt-1.5 text-sm font-semibold leading-snug text-ink sm:text-base">
                  {stepLabel}
                </p>
              </div>
              <div className="relative mx-auto mt-3 h-1.5 max-w-sm overflow-hidden rounded-full bg-lime/40">
                <div
                  className="relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <span
                    className="check-bar-shimmer absolute inset-0"
                    aria-hidden
                  />
                </div>
              </div>
            </>
          ) : null}

          {phase === "report" || phase === "gap" ? (
            <div className="flex min-h-[10.5rem] flex-col items-center justify-center sm:min-h-[11.5rem]">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                ✓
              </span>
              <p className="m-0 mt-3 text-base font-semibold text-ink">
                {demo.reportTitle}
              </p>
              <p className="m-0 mt-1.5 text-sm font-medium text-ink/80">
                {demo.reportChance}
              </p>
              <p className="m-0 mt-2 font-mono text-xs tracking-wide text-ink/45">
                {demo.reportMeta}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
