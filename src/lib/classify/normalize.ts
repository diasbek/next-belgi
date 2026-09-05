import { createHash } from "node:crypto";
import type { ClassifyLocale } from "./types";

export function normalizeClassifyLocale(locale?: string): ClassifyLocale {
  return locale?.toLowerCase().startsWith("ru") ? "ru" : "uz";
}

export function normalizeActivityKey(activity: string): string {
  return activity.trim().toLowerCase().replace(/\s+/g, " ");
}

export function classificationInputHash(
  locale: ClassifyLocale,
  activity: string,
): string {
  const payload = `${locale}|${normalizeActivityKey(activity)}`;
  return createHash("sha256").update(payload).digest("hex");
}

export function formatNiceClassLine(classNumber: number, label: string): string {
  return `[${classNumber}] ${label}`;
}

export function clampClassNumber(n: number): number | null {
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 45) return null;
  return rounded;
}

export function clampConfidence(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}
