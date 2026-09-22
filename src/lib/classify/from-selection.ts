import type { NiceSelection } from "@/data/nice/types";
import { classTitle, toNiceLocale } from "@/lib/nice/load-catalog";
import type {
  ActivityClassification,
  NiceClassSuggestion,
} from "@/lib/classify/types";
import { clampClassNumber } from "@/lib/classify/normalize";

async function classifyCustomText(activity: string, locale?: string) {
  // Dynamic import avoids circular dependency with classify/index.ts
  const { classifyActivity } = await import("@/lib/classify/index");
  return classifyActivity({ activity, locale });
}

function parseNiceSelection(raw: unknown): NiceSelection | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<NiceSelection>;
  if (!Array.isArray(data.terms)) return null;

  const terms = data.terms
    .map((t) => {
      if (!t || typeof t !== "object") return null;
      const classNumber = clampClassNumber(Number(t.classNumber));
      const term = typeof t.term === "string" ? t.term.trim() : "";
      const id = typeof t.id === "string" ? t.id : `${classNumber}:${term}`;
      if (!classNumber || !term) return null;
      return { id, classNumber, term };
    })
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const customText =
    typeof data.customText === "string" && data.customText.trim()
      ? data.customText.trim()
      : undefined;

  const fromTerms = [...new Set(terms.map((t) => t.classNumber))];
  const fromPayload = Array.isArray(data.classNumbers)
    ? data.classNumbers
        .map((n) => clampClassNumber(Number(n)))
        .filter((n): n is number => n !== null)
    : [];

  const classNumbers = [...new Set([...fromTerms, ...fromPayload])].sort(
    (a, b) => a - b,
  );

  if (!terms.length && !customText) return null;

  return { terms, customText, classNumbers };
}

function catalogClassesFromSelection(
  selection: NiceSelection,
  locale: string | undefined,
): NiceClassSuggestion[] {
  const loc = toNiceLocale(locale);
  const byClass = new Map<number, string>();

  for (const t of selection.terms) {
    if (!byClass.has(t.classNumber)) {
      byClass.set(t.classNumber, t.term);
    }
  }

  for (const n of selection.classNumbers) {
    if (!byClass.has(n)) {
      byClass.set(n, classTitle(n, loc));
    }
  }

  return [...byClass.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([classNumber, label]) => ({
      classNumber,
      label,
      confidence: 0.95,
    }));
}

function mergeClasses(
  catalog: NiceClassSuggestion[],
  ai: NiceClassSuggestion[],
): NiceClassSuggestion[] {
  const map = new Map<number, NiceClassSuggestion>();
  for (const c of catalog) map.set(c.classNumber, c);
  for (const c of ai) {
    const existing = map.get(c.classNumber);
    if (!existing || (c.confidence ?? 0) > (existing.confidence ?? 0)) {
      map.set(c.classNumber, c);
    }
  }
  return [...map.values()].sort((a, b) => a.classNumber - b.classNumber);
}

/**
 * Resolve classification from client Nice multiselect when present;
 * otherwise returns null so callers fall back to free-text classifyActivity.
 */
export async function resolveActivityClassification(params: {
  activity: string;
  locale?: string;
  niceSelection?: unknown;
}): Promise<ActivityClassification | null> {
  const selection = parseNiceSelection(params.niceSelection);
  if (!selection) return null;

  const activityRaw = params.activity.trim();
  const catalogClasses = catalogClassesFromSelection(selection, params.locale);
  const hasTerms = selection.terms.length > 0;
  const customText = selection.customText?.trim();

  if (hasTerms && !customText) {
    return {
      locale: toNiceLocale(params.locale),
      activityRaw,
      activityNormalized: activityRaw,
      classes: catalogClasses.slice(0, 8),
      primaryClassNumbers: catalogClasses.slice(0, 3).map((c) => c.classNumber),
      source: "catalog",
    };
  }

  if (customText) {
    const ai = await classifyCustomText(customText, params.locale);
    if (!hasTerms) {
      return {
        ...ai,
        activityRaw,
        activityNormalized: activityRaw || ai.activityNormalized,
      };
    }
    const merged = mergeClasses(catalogClasses, ai.classes);
    return {
      locale: toNiceLocale(params.locale),
      activityRaw,
      activityNormalized: activityRaw,
      classes: merged.slice(0, 8),
      primaryClassNumbers: merged.slice(0, 3).map((c) => c.classNumber),
      source: "catalog+openai",
      model: ai.model,
    };
  }

  return null;
}
