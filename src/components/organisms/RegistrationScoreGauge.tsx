"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
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
  resetCalculator: string;
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

/** PageSpeed / Lighthouse score colors */
const PSI = {
  poor: "#ff4e42",
  needs: "#ffa400",
  good: "#0cce6b",
  poorBg: "rgba(255, 78, 66, 0.12)",
  needsBg: "rgba(255, 164, 0, 0.12)",
  goodBg: "rgba(12, 206, 107, 0.12)",
} as const;

function toneOf(score: number): AssessmentTone {
  if (score >= 90) return "good";
  if (score >= 50) return "needs";
  return "poor";
}

function toneColor(tone: AssessmentTone) {
  return PSI[tone];
}

function toneBg(tone: AssessmentTone) {
  if (tone === "good") return PSI.goodBg;
  if (tone === "needs") return PSI.needsBg;
  return PSI.poorBg;
}

/** easeOutExpo — close to Lighthouse arc settle */
function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useCountUp(target: number, durationMs: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(easeOutExpo(t) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled]);
  return enabled ? value : target;
}

type Trig = {
  size: number;
  stroke: number;
  radiusInner: number;
  radiusOuter: number;
  circInner: number;
  circOuter: number;
  endDiffInner: number;
  endDiffOuter: number;
  strokeGap: number;
};

function determineTrig(size: number, stroke?: number): Trig {
  const sw = stroke ?? size / 32;
  const radiusInner = size / sw;
  const strokeGap = 0.5 * sw;
  const radiusOuter = radiusInner + strokeGap + sw;
  const circInner = 2 * Math.PI * radiusInner;
  const circOuter = 2 * Math.PI * radiusOuter;
  const endDiffInner =
    Math.acos(1 - 0.5 * Math.pow((0.5 * sw) / radiusInner, 2)) * radiusInner;
  const endDiffOuter =
    Math.acos(1 - 0.5 * Math.pow((0.5 * sw) / radiusOuter, 2)) * radiusOuter;
  return {
    size,
    stroke: sw,
    radiusInner,
    radiusOuter,
    circInner,
    circOuter,
    endDiffInner,
    endDiffOuter,
    strokeGap,
  };
}

function metricArcLength(
  trig: Trig,
  weightingPct: number,
  isButt = false,
) {
  const linecapFactor = isButt ? 0 : 2 * trig.endDiffOuter;
  return Math.max(
    0,
    weightingPct * trig.circOuter - trig.strokeGap - linecapFactor,
  );
}

function ExplodeyGauge({
  score,
  metrics,
  size = 200,
  compact = false,
}: {
  score: number;
  metrics: AssessmentMetric[];
  size?: number;
  compact?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [peek, setPeek] = useState(false);
  const [highlightId, setHighlightId] = useState<AssessmentMetricId | null>(
    null,
  );
  const displayScore = useCountUp(score, 1100, !reducedMotion);
  const tone = toneOf(score);
  const highlightMetric =
    metrics.find((m) => m.id === highlightId) ?? null;
  const highlightTone = highlightMetric?.tone ?? tone;

  const trig = useMemo(() => determineTrig(128), []);
  const svgSize = compact ? size * 0.85 : size;
  const offset = -0.5 * 128;
  const percent = Math.max(0, Math.min(100, displayScore)) / 100;
  const arcLen = Math.max(0, percent * trig.circInner);
  const innerDashOffset = 0.25 * trig.circInner - trig.endDiffInner;

  const totalWeight = metrics.reduce((s, m) => s + m.weight, 0) || 1;

  const metricLayout = useMemo(() => {
    const radiusTextOuter = trig.radiusOuter + trig.stroke;
    const radiusTextInner = trig.radiusOuter - trig.stroke;
    const rows: Array<{
      m: AssessmentMetric;
      i: number;
      weightingPct: number;
      metricLengthMax: number;
      metricLength: number;
      hoverLength: number;
      contribution: number;
      offset: number;
      labelX: number;
      labelY: number;
      valueX: number;
      valueY: number;
      labelAnchor: "start" | "end" | "middle";
      valueAnchor: "start" | "end" | "middle";
      labelBaseline: "hanging" | "auto" | "middle";
      valueBaseline: "hanging" | "auto" | "middle";
      color: string;
    }> = [];

    let offsetAdder =
      0.25 * trig.circOuter - trig.endDiffOuter - 0.5 * trig.strokeGap;
    let angleAdder = -0.5 * Math.PI;

    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i]!;
      const weightingPct = m.weight / totalWeight;
      const metricLengthMax = metricArcLength(trig, weightingPct);
      const metricPercent = (m.score / 100) * weightingPct;
      const metricLength = metricArcLength(trig, metricPercent);
      const metricOffset = weightingPct * trig.circOuter;
      const hoverLength = metricArcLength(trig, weightingPct, true);
      const contribution = Math.round(m.weight * m.score);

      const midAngle = angleAdder + weightingPct * Math.PI;
      const cos = Math.cos(midAngle);
      const sin = Math.sin(midAngle);

      rows.push({
        m,
        i,
        weightingPct,
        metricLengthMax,
        metricLength,
        hoverLength,
        contribution,
        offset: offsetAdder,
        labelX: radiusTextOuter * cos,
        labelY: radiusTextOuter * sin,
        valueX: radiusTextInner * cos,
        valueY: radiusTextInner * sin,
        labelAnchor: cos > 0 ? "start" : cos < 0 ? "end" : "middle",
        valueAnchor: cos > 0 ? "end" : cos < 0 ? "start" : "middle",
        labelBaseline: sin > 0 ? "hanging" : sin < 0 ? "auto" : "middle",
        valueBaseline: sin < 0 ? "hanging" : sin > 0 ? "auto" : "middle",
        color: toneColor(m.tone),
      });

      offsetAdder -= metricOffset;
      angleAdder += weightingPct * 2 * Math.PI;
    }

    return rows;
  }, [metrics, totalWeight, trig]);

  // Peek tease like Lighthouse (~1s delay, 2.5s peek)
  useEffect(() => {
    if (reducedMotion) return;
    const start = window.setTimeout(() => {
      if (svgRef.current?.matches(":hover")) return;
      setPeek(true);
      setExpanded(true);
    }, 1000);
    const end = window.setTimeout(() => {
      setPeek(false);
      setExpanded(false);
      setHighlightId(null);
    }, 1000 + 2500);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(end);
    };
  }, [score, reducedMotion]);

  function onPointerLeave() {
    if (peek) return;
    setExpanded(false);
    setHighlightId(null);
  }

  function onInnerEnter() {
    setPeek(false);
    setExpanded(true);
    setHighlightId(null);
  }

  function onMetricEnter(id: AssessmentMetricId) {
    setPeek(false);
    setExpanded(true);
    setHighlightId(id);
  }

  const scaleInitial = trig.radiusInner / trig.radiusOuter;
  const bgTone = highlightId ? highlightTone : tone;
  const showScore = !highlightId;

  return (
    <div
      className={cn(
        "psi-gauge",
        `psi-gauge--${tone}`,
        expanded && "psi-gauge--expanded",
        highlightId && "psi-gauge--highlight",
        peek && "psi-gauge--peek",
      )}
      style={
        {
          "--psi-color": toneColor(tone),
          "--psi-bg": toneBg(bgTone),
          "--psi-highlight": toneBg(highlightTone),
          "--psi-scale-initial": scaleInitial,
          "--psi-stroke": `${trig.stroke}px`,
          "--psi-radius-inner": `${trig.radiusInner}px`,
          "--psi-radius-outer": `${trig.radiusOuter}px`,
          "--psi-circ": String(2 * Math.PI),
        } as CSSProperties
      }
    >
      <svg
        ref={svgRef}
        className="psi-gauge__svg"
        width={svgSize}
        height={svgSize}
        viewBox={`${offset} ${offset} 128 128`}
        role="img"
        aria-label={`${score}`}
        onPointerLeave={onPointerLeave}
      >
        {/* Soft tint disc — PageSpeed filled background */}
        <circle
          className="psi-gauge__disc"
          cx={0}
          cy={0}
          r={trig.radiusInner - trig.stroke * 0.35}
          fill="var(--psi-bg)"
          style={
            highlightId
              ? ({ fill: "var(--psi-highlight)" } as CSSProperties)
              : undefined
          }
        />

        {/* Outer metric ring */}
        <g className="psi-gauge__outer">
          <circle
            className="psi-gauge__under-hover"
            cx={0}
            cy={0}
            r={trig.radiusOuter}
            fill="none"
            stroke="transparent"
            strokeWidth={24}
            strokeLinecap="butt"
            onPointerEnter={onInnerEnter}
          />
          {metricLayout.map((row) => (
            <g
              key={row.m.id}
              className={cn(
                "psi-gauge__metric",
                highlightId === row.m.id && "psi-gauge__metric--active",
              )}
              style={
                {
                  "--metric-color": row.color,
                  "--metric-offset": row.offset,
                  "--metric-array": `${row.metricLength} ${trig.circOuter - row.metricLength}`,
                  "--i": row.i,
                } as CSSProperties
              }
            >
              {/* Max weight track (faded) */}
              <circle
                className="psi-gauge__metric-track"
                cx={0}
                cy={0}
                r={trig.radiusOuter}
                fill="none"
                stroke={row.color}
                strokeWidth={trig.stroke}
                strokeLinecap="round"
                strokeDasharray={`${row.metricLengthMax} ${trig.circOuter - row.metricLengthMax}`}
                strokeDashoffset={row.offset}
              />
              {/* Filled contribution arc */}
              <circle
                className="psi-gauge__metric-arc"
                cx={0}
                cy={0}
                r={trig.radiusOuter}
                fill="none"
                stroke={row.color}
                strokeWidth={trig.stroke}
                strokeLinecap="round"
                strokeDashoffset={row.offset}
              />
              {/* Invisible hover target */}
              <circle
                className="psi-gauge__metric-hit"
                cx={0}
                cy={0}
                r={trig.radiusOuter}
                fill="none"
                stroke="transparent"
                strokeWidth={22}
                strokeLinecap="butt"
                strokeDasharray={`${row.hoverLength} ${trig.circOuter - row.hoverLength - trig.endDiffOuter}`}
                strokeDashoffset={row.offset}
                onPointerEnter={() => onMetricEnter(row.m.id)}
              />
              <text
                className="psi-gauge__metric-label"
                x={row.labelX}
                y={row.labelY}
                textAnchor={row.labelAnchor}
                dominantBaseline={row.labelBaseline}
              >
                {row.m.id}
              </text>
              <text
                className="psi-gauge__metric-value"
                x={row.valueX}
                y={row.valueY}
                textAnchor={row.valueAnchor}
                dominantBaseline={row.valueBaseline}
                fill={row.color}
              >
                +{row.contribution}
              </text>
            </g>
          ))}
        </g>

        {/* Inner score arc */}
        <g
          className="psi-gauge__inner"
          onPointerEnter={onInnerEnter}
        >
          <circle
            className="psi-gauge__track"
            cx={0}
            cy={0}
            r={trig.radiusInner}
            fill="none"
            stroke="rgba(26,28,24,0.08)"
            strokeWidth={trig.stroke}
          />
          <circle
            className="psi-gauge__arc"
            cx={0}
            cy={0}
            r={trig.radiusInner}
            fill="none"
            stroke={toneColor(tone)}
            strokeWidth={trig.stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${Math.max(0, trig.circInner - arcLen)}`}
            strokeDashoffset={innerDashOffset}
          />
          <text
            className="psi-gauge__score"
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fill={toneColor(tone)}
            style={{ opacity: showScore ? 1 : 0 }}
          >
            {displayScore}
          </text>
          {/* Hit area for inner */}
          <circle
            cx={0}
            cy={0}
            r={trig.radiusInner - trig.stroke}
            fill="transparent"
            stroke="none"
          />
        </g>
      </svg>
    </div>
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
  const calcId = useId();
  const metricsKey = assessment.metrics
    .map((m) => `${m.id}:${m.score}`)
    .join(",");
  const [draftScores, setDraftScores] = useState<
    Record<AssessmentMetricId, number>
  >(
    () =>
      Object.fromEntries(
        assessment.metrics.map((m) => [m.id, m.score]),
      ) as Record<AssessmentMetricId, number>,
  );
  const [syncedKey, setSyncedKey] = useState(metricsKey);
  if (metricsKey !== syncedKey) {
    setSyncedKey(metricsKey);
    setDraftScores(
      Object.fromEntries(
        assessment.metrics.map((m) => [m.id, m.score]),
      ) as Record<AssessmentMetricId, number>,
    );
  }

  const liveMetrics: AssessmentMetric[] = assessment.metrics.map((m) => {
    const score = Math.max(
      0,
      Math.min(100, Math.round(draftScores[m.id] ?? m.score)),
    );
    return {
      ...m,
      score,
      tone: toneOf(score),
    };
  });
  const liveScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(liveMetrics.reduce((sum, m) => sum + m.weight * m.score, 0)),
    ),
  );
  const tone = toneOf(liveScore);
  const dirty = liveMetrics.some(
    (m, i) => m.score !== assessment.metrics[i]?.score,
  );

  return (
    <div className="mt-4 sm:mt-5">
      <div
        className={cn(
          "flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8",
          compact && "sm:gap-5",
        )}
      >
        <ExplodeyGauge
          score={liveScore}
          metrics={liveMetrics}
          size={compact ? 176 : 220}
          compact={compact}
        />

        <div className="min-w-0 flex-1 text-center sm:pt-2 sm:text-left">
          <p className="m-0 text-base font-semibold text-ink sm:text-lg">
            {labels.title}
          </p>
          <p className="m-0 mt-1.5 text-xs leading-relaxed text-ink/65 sm:text-sm">
            {labels.disclaimer}{" "}
            <button
              type="button"
              className="font-medium text-[#1a73e8] underline-offset-2 hover:underline"
              onClick={() => setOpenCalc((v) => !v)}
              aria-expanded={openCalc}
              aria-controls={calcId}
            >
              {openCalc ? labels.hideCalculator : labels.showCalculator}
            </button>
          </p>

          <ul className="m-0 mt-4 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-2 p-0 text-xs text-ink-muted sm:justify-start">
            <li className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-0 border-x-[5px] border-x-transparent border-b-[9px]"
                style={{ borderBottomColor: PSI.poor }}
                aria-hidden
              />
              {labels.legendPoor}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-2"
                style={{ background: PSI.needs }}
                aria-hidden
              />
              {labels.legendNeeds}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: PSI.good }}
                aria-hidden
              />
              {labels.legendGood}
            </li>
          </ul>

          <p
            className="m-0 mt-2 text-xs font-medium tabular-nums"
            style={{ color: toneColor(tone) }}
          >
            {liveScore}/100
            {dirty ? " *" : ""}
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

      {openCalc ? (
        <div
          id={calcId}
          className="mt-3 overflow-x-auto rounded-xl border border-border bg-white"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
            <p className="m-0 text-xs font-medium text-ink-muted">
              {labels.showCalculator}
            </p>
            <button
              type="button"
              className="text-xs font-medium text-[#1a73e8] underline-offset-2 hover:underline disabled:opacity-40"
              disabled={!dirty}
              onClick={() =>
                setDraftScores(
                  Object.fromEntries(
                    assessment.metrics.map((m) => [m.id, m.score]),
                  ) as Record<AssessmentMetricId, number>,
                )
              }
            >
              {labels.resetCalculator}
            </button>
          </div>
          <table className="w-full min-w-[320px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border text-ink-muted">
                <th className="px-3 py-2 font-medium">{labels.metricLabel}</th>
                <th className="px-3 py-2 font-medium">{labels.scoreLabel}</th>
                <th className="px-3 py-2 font-medium">{labels.weightLabel}</th>
                <th className="px-3 py-2 font-medium">
                  {labels.contributionLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {liveMetrics.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-3 py-2.5 align-middle">
                    <span
                      className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
                      style={{ background: toneColor(m.tone) }}
                    />
                    <span className="font-semibold">{m.id}</span>
                    <span className="ml-1 text-ink-muted">
                      {labels.metricNames[m.id]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex min-w-[9rem] items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={m.score}
                        aria-label={`${m.id} ${labels.scoreLabel}`}
                        className="h-1.5 w-full accent-[var(--color-primary)]"
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setDraftScores((prev) => ({
                            ...prev,
                            [m.id]: next,
                          }));
                        }}
                      />
                      <span className="w-7 shrink-0 tabular-nums text-right font-medium">
                        {m.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums align-middle">
                    {Math.round(m.weight * 100)}%
                  </td>
                  <td className="px-3 py-2.5 tabular-nums font-medium align-middle">
                    {Math.round(m.weight * m.score)}
                  </td>
                </tr>
              ))}
              <tr className="bg-surface-muted font-semibold">
                <td className="px-3 py-2" colSpan={3}>
                  Σ
                </td>
                <td
                  className="px-3 py-2 tabular-nums"
                  style={{ color: toneColor(tone) }}
                >
                  {liveScore}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
