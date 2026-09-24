import { parseClassNumbers } from "./conflict-risk";
import type { TrademarkMatch, TrademarkSourceBlock } from "./types";

export type AssessmentMetricId = "SIM" | "CLS" | "PHN" | "CNT" | "STS";
export type AssessmentTone = "poor" | "needs" | "good";

export type AssessmentMetric = {
  id: AssessmentMetricId;
  score: number;
  weight: number;
  tone: AssessmentTone;
};

export type RegistrationAssessment = {
  score: number;
  metrics: AssessmentMetric[];
  positive: boolean;
};

export const ASSESSMENT_WEIGHTS: Record<AssessmentMetricId, number> = {
  SIM: 0.3,
  CLS: 0.3,
  CNT: 0.15,
  STS: 0.15,
  PHN: 0.1,
};

const METRIC_ORDER: AssessmentMetricId[] = [
  "SIM",
  "CLS",
  "PHN",
  "CNT",
  "STS",
];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function assessmentTone(score: number): AssessmentTone {
  if (score >= 90) return "good";
  if (score >= 50) return "needs";
  return "poor";
}

function statusSeverity(status: string | undefined): number {
  if (!status) return 0.35;
  const s = status.toLowerCase();
  if (
    /regist|действ|актив|registered|granted|охраня|roʻyxat|royxat/.test(s)
  ) {
    return 1;
  }
  if (
    /pend|examen|экспертиз|pending|application|заяв|koʻrib|korib/.test(s)
  ) {
    return 0.75;
  }
  if (/refus|reject|отказ|отклон|cancelled|annul/.test(s)) {
    return 0.15;
  }
  return 0.45;
}

function scoreSim(matches: TrademarkMatch[]): number {
  if (matches.length === 0) return 100;
  const maxSim = Math.max(
    ...matches.map((m) => Math.max(0, Math.min(100, m.similarity))),
  );
  let score = 100 - maxSim;
  // Stronger penalty for near-identical names
  if (maxSim >= 90) score = Math.min(score, 8);
  else if (maxSim >= 80) score = Math.min(score, 18);
  else if (maxSim >= 70) score = Math.min(score, Math.round(score * 0.65));
  return clamp(score);
}

function scoreCls(
  matches: TrademarkMatch[],
  queryClassNumbers: number[],
): number {
  if (matches.length === 0) return 100;
  const maxSim = Math.max(...matches.map((m) => m.similarity));
  if (queryClassNumbers.length === 0) {
    // No class context — mild hit from name alone
    if (maxSim >= 70) return clamp(100 - maxSim * 0.45);
    return clamp(88 + (30 - Math.min(30, maxSim)) * 0.3);
  }

  const top = [...matches]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 8);

  let worst = 100;
  for (const classNumber of queryClassNumbers) {
    const overlapping = top.filter((m) =>
      parseClassNumbers(m.classesText).includes(classNumber),
    );
    if (overlapping.length === 0) {
      worst = Math.min(worst, maxSim >= 70 ? 72 : 92);
      continue;
    }
    const maxInClass = Math.max(...overlapping.map((m) => m.similarity));
    let classScore =
      maxInClass >= 80
        ? 100 - maxInClass - 20
        : maxInClass >= 60
          ? 100 - maxInClass - 12
          : 100 - maxInClass * 0.7;
    classScore -= Math.min(18, overlapping.length * 4);
    worst = Math.min(worst, classScore);
  }
  return clamp(worst);
}

function scorePhn(matches: TrademarkMatch[]): number {
  if (matches.length === 0) return 100;
  const mid = matches.filter((m) => m.similarity >= 45 && m.similarity < 75);
  const highExact = matches.filter((m) => m.similarity >= 90);
  // Phonetic cloud: many mid-sim variants (not exact clones)
  const ratio = mid.length / Math.max(1, matches.length);
  let score = 100 - ratio * 70 - mid.length * 4;
  // Exact clones are handled by SIM; don't double-punish PHN as hard
  if (highExact.length > 0 && mid.length === 0) score = Math.max(score, 78);
  return clamp(score);
}

function scoreCnt(matches: TrademarkMatch[]): number {
  if (matches.length === 0) return 100;
  const serious = matches.filter((m) => m.similarity >= 50).length;
  if (serious === 0) return 96;
  // Logarithmic density penalty
  const penalty = Math.log2(serious + 1) * 22;
  return clamp(100 - penalty);
}

function scoreSts(matches: TrademarkMatch[]): number {
  if (matches.length === 0) return 100;
  const relevant = matches.filter((m) => m.similarity >= 40);
  if (relevant.length === 0) return 94;

  let weighted = 0;
  let weightSum = 0;
  for (const m of relevant) {
    const w = Math.max(0.2, m.similarity / 100);
    weighted += statusSeverity(m.status) * w;
    weightSum += w;
  }
  const avgSeverity = weightSum > 0 ? weighted / weightSum : 0;
  return clamp(100 - avgSeverity * 75);
}

export function scoreRegistrationAssessment(params: {
  matches: TrademarkMatch[];
  queryClassNumbers: number[];
}): RegistrationAssessment {
  const matches = params.matches.filter(
    (m) => typeof m.similarity === "number" && Number.isFinite(m.similarity),
  );

  const raw: Record<AssessmentMetricId, number> = {
    SIM: scoreSim(matches),
    CLS: scoreCls(matches, params.queryClassNumbers),
    PHN: scorePhn(matches),
    CNT: scoreCnt(matches),
    STS: scoreSts(matches),
  };

  const metrics: AssessmentMetric[] = METRIC_ORDER.map((id) => {
    const score = raw[id];
    return {
      id,
      score,
      weight: ASSESSMENT_WEIGHTS[id],
      tone: assessmentTone(score),
    };
  });

  const score = clamp(
    metrics.reduce((sum, m) => sum + m.weight * m.score, 0),
  );

  return {
    score,
    metrics,
    positive: score >= 50,
  };
}

export function scoreAssessmentFromSources(
  sources: TrademarkSourceBlock[],
  queryClassNumbers: number[],
): RegistrationAssessment {
  const matches = sources.flatMap((s) =>
    s.unavailable ? [] : s.matches || [],
  );
  return scoreRegistrationAssessment({ matches, queryClassNumbers });
}
