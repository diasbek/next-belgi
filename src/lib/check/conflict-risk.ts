import type { ClassRisk, TrademarkMatch, TrademarkSourceBlock } from "./types";

export type ConflictScore = {
  classRisks: ClassRisk[];
  overallConflict: number;
  maxSimilarity: number;
  /** True when overall conflict is low enough that registration outlook is positive */
  positive: boolean;
};

/** Extract Nice class numbers from free-text like "[09] Software, 25 clothing". */
export function parseClassNumbers(text: string | undefined | null): number[] {
  if (!text) return [];
  const found = new Set<number>();
  for (const m of String(text).matchAll(/\b(\d{1,2})\b/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 45) found.add(n);
  }
  return [...found];
}

export function parseQueryClassNumbers(
  niceClasses: string[] | number[] | undefined,
): number[] {
  if (!niceClasses?.length) return [];
  const out = new Set<number>();
  for (const item of niceClasses) {
    if (typeof item === "number" && item >= 1 && item <= 45) {
      out.add(item);
      continue;
    }
    for (const n of parseClassNumbers(String(item))) out.add(n);
  }
  return [...out];
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Conflict risk (0–100) per query Nice class.
 * High name similarity → high conflict; Nice class overlap adds a bonus.
 * Display registration chance via mapRiskToChance(conflict).
 */
export function scoreConflictRisk(params: {
  matches: TrademarkMatch[];
  queryClassNumbers: number[];
}): ConflictScore {
  const matches = params.matches.filter(
    (m) => typeof m.similarity === "number" && Number.isFinite(m.similarity),
  );
  const maxSimilarity =
    matches.length > 0
      ? Math.max(...matches.map((m) => Math.max(0, Math.min(100, m.similarity))))
      : 0;

  const queryClasses =
    params.queryClassNumbers.length > 0
      ? params.queryClassNumbers.slice(0, 6)
      : [];

  // Global base from name similarity alone (no class context)
  const nameBase =
    maxSimilarity >= 80
      ? maxSimilarity
      : maxSimilarity >= 60
        ? maxSimilarity * 0.9
        : maxSimilarity >= 40
          ? maxSimilarity * 0.75
          : maxSimilarity * 0.45;

  if (queryClasses.length === 0) {
    const overall = clamp(nameBase);
    return {
      classRisks: overall > 0 ? [{ classNumber: 0, percent: overall }] : [],
      overallConflict: overall,
      maxSimilarity,
      positive: overall < 45,
    };
  }

  const classRisks: ClassRisk[] = queryClasses.map((classNumber) => {
    const overlapping = matches.filter((m) =>
      parseClassNumbers(m.classesText).includes(classNumber),
    );
    const maxInClass =
      overlapping.length > 0
        ? Math.max(...overlapping.map((m) => m.similarity))
        : 0;

    let conflict: number;
    if (overlapping.length > 0) {
      // Strong name hit in the same Nice class → very high conflict
      const overlapBonus = maxInClass >= 70 ? 25 : maxInClass >= 45 ? 18 : 12;
      conflict = Math.min(100, maxInClass + overlapBonus);
      // Floor: same-class medium similarity still serious
      if (maxInClass >= 50) conflict = Math.max(conflict, 70);
      if (maxInClass >= 80) conflict = Math.max(conflict, 88);
    } else if (maxSimilarity >= 70) {
      // High name similarity but different classes — elevated but lower than overlap
      conflict = clamp(maxSimilarity * 0.55);
    } else if (maxSimilarity >= 40) {
      conflict = clamp(maxSimilarity * 0.35);
    } else {
      conflict = clamp(Math.max(8, maxSimilarity * 0.2));
    }

    return { classNumber, percent: clamp(conflict) };
  });

  const overallConflict =
    classRisks.length > 0
      ? Math.max(...classRisks.map((c) => c.percent))
      : clamp(nameBase);

  return {
    classRisks,
    overallConflict,
    maxSimilarity,
    positive: overallConflict < 45,
  };
}

export function scoreConflictFromSources(
  sources: TrademarkSourceBlock[],
  queryClassNumbers: number[],
): ConflictScore {
  const matches = sources.flatMap((s) =>
    s.unavailable ? [] : s.matches || [],
  );
  return scoreConflictRisk({ matches, queryClassNumbers });
}
