import type { Locale } from "@/i18n/config";
import type { NiceSelection, NiceSelectionTerm } from "@/data/nice/types";
import { classTitle } from "./load-catalog";

export type ActivityOption =
  | {
      kind: "term";
      value: string; // term id
      label: string;
      classNumber: number;
    }
  | {
      kind: "custom";
      value: string; // `__custom__:${text}`
      label: string;
    };

export function customOptionValue(text: string) {
  return `__custom__:${text}`;
}

export function parseCustomOptionValue(value: string): string | null {
  if (!value.startsWith("__custom__:")) return null;
  return value.slice("__custom__:".length);
}

export function optionsToSelection(
  options: ActivityOption[],
): NiceSelection {
  const terms: NiceSelectionTerm[] = [];
  const customs: string[] = [];
  const classSet = new Set<number>();

  for (const opt of options) {
    if (opt.kind === "term") {
      terms.push({
        id: opt.value,
        classNumber: opt.classNumber,
        term: opt.label,
      });
      classSet.add(opt.classNumber);
    } else {
      const text = parseCustomOptionValue(opt.value) ?? opt.label;
      if (text.trim()) customs.push(text.trim());
    }
  }

  const classNumbers = [...classSet].sort((a, b) => a - b);
  const customText = customs.length ? customs.join(", ") : undefined;

  return {
    terms,
    customText,
    classNumbers,
  };
}

export function selectionToActivityString(
  selection: NiceSelection,
  _locale: Locale,
): string {
  const parts = [
    ...selection.terms.map((t) => t.term),
    ...(selection.customText ? [selection.customText] : []),
  ];
  if (parts.length) return parts.join(", ");
  return "";
}

export function affectedClassSummaries(
  classNumbers: number[],
  locale: Locale,
): { classNumber: number; title: string }[] {
  return classNumbers.map((n) => ({
    classNumber: n,
    title: classTitle(n, locale),
  }));
}

const STORAGE_KEY = "belgi_nice_selection_v1";

export function storeNiceSelection(selection: NiceSelection) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  } catch {
    /* ignore */
  }
}

export function readNiceSelection(): NiceSelection | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NiceSelection;
    if (!parsed || !Array.isArray(parsed.terms)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearNiceSelection() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
