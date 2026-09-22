import { createHash } from "crypto";
import type { Locale } from "@/i18n/config";
import type { ConclusionClassVerdict } from "./types";
import expertRefsJson from "@/data/expert-conclusion-refs.json";

export type ExpertConclusionRef = {
  mark: string;
  mark_normalized: string;
  nice_classes: number[];
  activity_raw?: string | null;
  appearance?: string;
  issued_at?: string | null;
  report_at?: string | null;
  source_file?: string | null;
  agency?: string;
  verdicts: ConclusionClassVerdict[];
  adliya_matches?: unknown[];
  madrid_matches?: unknown[];
  internet_items?: unknown[];
  madrid_empty?: boolean;
  internet_empty?: boolean;
  disclaimer?: string | null;
};

const bundled = expertRefsJson as ExpertConclusionRef[];

export function normalizeMark(mark: string): string {
  return mark
    .normalize("NFKC")
    .replace(/[’`ʻʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

export function getBundledExpertRefs(): ExpertConclusionRef[] {
  return bundled;
}

/** Exact normalized mark match, else closest above threshold. */
export function findExpertRef(
  mark: string,
  refs: ExpertConclusionRef[] = bundled,
  opts?: { minSimilarity?: number },
): { ref: ExpertConclusionRef; score: number; exact: boolean } | null {
  const key = normalizeMark(mark);
  if (!key) return null;

  const exact = refs.find((r) => r.mark_normalized === key);
  if (exact) return { ref: exact, score: 1, exact: true };

  const minSim = opts?.minSimilarity ?? 0.86;
  let best: { ref: ExpertConclusionRef; score: number } | null = null;
  for (const r of refs) {
    const score = similarity(key, r.mark_normalized);
    if (!best || score > best.score) best = { ref: r, score };
  }
  if (best && best.score >= minSim) {
    return { ref: best.ref, score: best.score, exact: false };
  }
  return null;
}

export function expertVerdictsForClasses(
  ref: ExpertConclusionRef,
  classNumbers: number[],
): ConclusionClassVerdict[] {
  if (!ref.verdicts?.length) return [];
  if (!classNumbers.length) return [...ref.verdicts];

  const byClass = new Map(ref.verdicts.map((v) => [v.classNumber, v]));
  const out: ConclusionClassVerdict[] = [];
  for (const n of classNumbers) {
    const hit = byClass.get(n);
    if (hit) out.push(hit);
  }
  // If no overlap, return all expert verdicts (multi-class reports like Eliss/GLOMAP).
  return out.length ? out : [...ref.verdicts];
}

export function refsContentHash(refs: ExpertConclusionRef[]): string {
  return createHash("sha256")
    .update(JSON.stringify(refs.map((r) => r.mark_normalized).sort()))
    .digest("hex")
    .slice(0, 16);
}

export function localeFromMark(_mark: string): Locale {
  return "uz";
}
