"use client";

import { useId, useState } from "react";
import type {
  AssessmentMetric,
  AssessmentMetricId,
  AssessmentTone,
  RegistrationAssessment,
} from "@/lib/check/types";
import { cn } from "@/lib/cn";

export type ScoreGaugeLabels = {
  title: string;
  disclaimer: string;
  showCalculator: string;
  hideCalculator: string;
  legendPoor: string;
  legendNeeds: string;
  legendGood: string;
  metricNames: Record<AssessmentMetricId, string>;
  metricLabel: string;
  weightLabel: string;
  scoreLabel: string;
  contributionLabel: string;
  classChanceLabel: string;
};

type ClassChip = {
  key: string;
  label: string;
  percent: number;
};

const TONE_STROKE: Record<AssessmentTone, string> = {
  poor: "var(--color-danger)",
  needs: "var(--color-warning)",
  good: "var(--color-success)",
};

function toneOf(score: number): AssessmentTone {
  if (score >= 90) return "good";
  if (score >= 50) return "needs";
  return "poor";
}

function RingGauge({
  score,
  size = 168,
}: {
  score: number;
  size?: number;
}) {
  const tone = toneOf(score);
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * progress;
  const uid = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      role="img"
      aria-label={`${score}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(26,28,24,0.1)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={TONE_STROKE[tone]}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink font-display font-semibold"
        style={{ fontSize: size * 0.28 }}
        id={uid}
      >
        {score}
      </text>
    </svg>
  );
}

function MetricDots({
  metrics,
  activeId,
  onSelect,
  names,
}: {
  metrics: AssessmentMetric[];
  activeId: AssessmentMetricId | null;
  onSelect: (id: AssessmentMetricId | null) => void;
  names: Record<AssessmentMetricId, string>;
}) {
  return (
    <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0 sm:justify-start">
      {metrics.map((m) => {
        const active = activeId === m.id;
        return (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onSelect(active ? null : m.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-white text-ink hover:border-ink/40",
              )}
              aria-pressed={active}
              title={names[m.id]}
            >
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ background: TONE_STROKE[m.tone] }}
                aria-hidden
              />
              <span className="font-semibold tracking-wide">{m.id}</span>
              <span className="tabular-nums opacity-80">{m.score}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function RegistrationScoreGauge({
  assessment,
  labels,
  classChips = [],
  compact = false,
}: {
  assessment: RegistrationAssessment;
  labels: ScoreGaugeLabels;
  classChips?: ClassChip[];
  compact?: boolean;
}) {
  const [openCalc, setOpenCalc] = useState(false);
  const [activeId, setActiveId] = useState<AssessmentMetricId | null>(null);
  const active = assessment.metrics.find((m) => m.id === activeId) ?? null;
  const tone = toneOf(assessment.score);

  return (
    <div className="mt-4 sm:mt-5">
      <div
        className={cn(
          "flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6",
          compact && "sm:gap-4",
        )}
      >
        <RingGauge score={assessment.score} size={compact ? 132 : 168} />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="m-0 text-sm font-semibold text-ink">{labels.title}</p>
          <p className="m-0 mt-1 text-xs leading-relaxed text-ink/70">
            {labels.disclaimer}
          </p>
          <div className="mt-3">
            <MetricDots
              metrics={assessment.metrics}
              activeId={activeId}
              onSelect={setActiveId}
              names={labels.metricNames}
            />
          </div>
          {active ? (
            <p className="m-0 mt-2 text-xs text-ink-muted">
              {labels.metricNames[active.id]} · {labels.weightLabel}{" "}
              {Math.round(active.weight * 100)}% · {labels.contributionLabel}{" "}
              {Math.round(active.weight * active.score)}
            </p>
          ) : null}
          <ul className="m-0 mt-3 flex list-none flex-wrap justify-center gap-x-3 gap-y-1 p-0 text-[0.6875rem] text-ink-muted sm:justify-start">
            <li className="inline-flex items-center gap-1">
              <span
                className="size-1.5 rounded-full"
                style={{ background: TONE_STROKE.poor }}
              />
              {labels.legendPoor}
            </li>
            <li className="inline-flex items-center gap-1">
              <span
                className="size-1.5 rounded-full"
                style={{ background: TONE_STROKE.needs }}
              />
              {labels.legendNeeds}
            </li>
            <li className="inline-flex items-center gap-1">
              <span
                className="size-1.5 rounded-full"
                style={{ background: TONE_STROKE.good }}
              />
              {labels.legendGood}
            </li>
          </ul>
          <p
            className="m-0 mt-2 text-xs font-medium"
            style={{ color: TONE_STROKE[tone] }}
          >
            {assessment.score}/100
          </p>
        </div>
      </div>

      {classChips.length > 0 ? (
        <div className="mt-4">
          <p className="m-0 mb-2 text-xs text-ink-muted">
            {labels.classChanceLabel}
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {classChips.map((chip) => (
              <div
                key={chip.key}
                className="flex h-20 w-[calc(50%-0.25rem)] max-w-28 flex-col justify-between rounded-xl bg-white p-2.5 sm:h-24 sm:w-28 sm:p-3"
              >
                <span className="text-xs text-ink-muted">{chip.label}</span>
                <span className="text-xl font-semibold sm:text-2xl">
                  {chip.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="mt-4 text-xs font-medium text-ink underline underline-offset-2"
        onClick={() => setOpenCalc((v) => !v)}
        aria-expanded={openCalc}
      >
        {openCalc ? labels.hideCalculator : labels.showCalculator}
      </button>

      {openCalc ? (
        <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[280px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border text-ink-muted">
                <th className="px-3 py-2 font-medium">{labels.metricLabel}</th>
                <th className="px-3 py-2 font-medium tabular-nums">
                  {labels.scoreLabel}
                </th>
                <th className="px-3 py-2 font-medium">{labels.weightLabel}</th>
                <th className="px-3 py-2 font-medium">
                  {labels.contributionLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {assessment.metrics.map((m) => (
                <tr key={m.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2">
                    <span
                      className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
                      style={{ background: TONE_STROKE[m.tone] }}
                    />
                    <span className="font-semibold">{m.id}</span>
                    <span className="ml-1 text-ink-muted">
                      {labels.metricNames[m.id]}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{m.score}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {Math.round(m.weight * 100)}%
                  </td>
                  <td className="px-3 py-2 tabular-nums font-medium">
                    {Math.round(m.weight * m.score)}
                  </td>
                </tr>
              ))}
              <tr className="bg-surface-muted font-semibold">
                <td className="px-3 py-2" colSpan={3}>
                  Σ
                </td>
                <td className="px-3 py-2 tabular-nums">{assessment.score}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
