export type ClassifyLocale = "uz" | "ru" | "en";

export type ClassificationSource =
  | "openai"
  | "cache"
  | "fallback"
  | "catalog"
  | "catalog+openai";

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
