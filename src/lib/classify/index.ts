import {
  buildFallbackClassification,
  classRisksFromClassification,
  niceClassesFromClassification,
} from "./fallback";
import {
  getCachedClassification,
  setCachedClassification,
} from "./cache";
import { classificationInputHash, normalizeClassifyLocale } from "./normalize";
import { classifyWithOpenAi, isOpenAiConfigured } from "./openai";
import type {
  ActivityClassification,
  ClassifyActivityInput,
} from "./types";

export type {
  ActivityClassification,
  ClassificationSource,
  ClassifyActivityInput,
  ClassifyLocale,
  NiceClassSuggestion,
} from "./types";

export {
  classRisksFromClassification,
  niceClassesFromClassification,
};

/**
 * Classify free-text company activity into Nice (МКТУ) classes.
 * Order: cache → OpenAI → deterministic fallback.
 */
export async function classifyActivity(
  input: ClassifyActivityInput,
): Promise<ActivityClassification> {
  const activity = input.activity.trim();
  const locale = normalizeClassifyLocale(input.locale);

  if (!activity) {
    return buildFallbackClassification("", locale);
  }

  const inputHash = classificationInputHash(locale, activity);
  const cached = await getCachedClassification(inputHash);
  if (cached?.classes?.length) {
    return {
      ...cached,
      activityRaw: activity,
      locale,
      source: "cache",
    };
  }

  if (!(await isOpenAiConfigured())) {
    return buildFallbackClassification(activity, locale);
  }

  try {
    const classified = await classifyWithOpenAi(activity, locale);
    await setCachedClassification(inputHash, classified);
    return classified;
  } catch (error) {
    console.warn("[classify:fallback]", {
      reason: error instanceof Error ? error.message : "unknown",
      hash: inputHash.slice(0, 12),
    });
    return buildFallbackClassification(activity, locale);
  }
}
