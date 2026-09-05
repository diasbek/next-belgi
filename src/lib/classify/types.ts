export type ClassifyLocale = "uz" | "ru";

export type ClassificationSource = "openai" | "cache" | "fallback";

export interface NiceClassSuggestion {
  classNumber: number;
  label: string;
  confidence: number;
}

export interface ActivityClassification {
  locale: ClassifyLocale;
  activityRaw: string;
  activityNormalized: string;
  classes: NiceClassSuggestion[];
  primaryClassNumbers: number[];
  source: ClassificationSource;
  model?: string;
}

export interface ClassifyActivityInput {
  activity: string;
  locale?: string;
}
