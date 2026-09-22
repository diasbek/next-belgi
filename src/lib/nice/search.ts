import { Document } from "flexsearch";
import type { Locale } from "@/i18n/config";
import type { NiceTerm } from "@/data/nice/types";
import { loadNiceTerms, toNiceLocale } from "./load-catalog";

type TermIndex = {
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  index: any;
  byId: Map<string, NiceTerm>;
};

const indexes = new Map<string, Promise<TermIndex>>();

async function getIndex(locale: Locale): Promise<TermIndex> {
  const loc = toNiceLocale(locale);
  let pending = indexes.get(loc);
  if (!pending) {
    pending = (async () => {
      const terms = await loadNiceTerms(loc);
      const byId = new Map(terms.map((t) => [t.id, t]));
      const index = new Document({
        document: {
          id: "id",
          index: ["label", "classKey"],
          store: false,
        },
        tokenize: "forward",
        cache: 100,
        resolution: 9,
      });
      for (const t of terms) {
        index.add({
          id: t.id,
          label: t.label,
          classKey: `класс ${t.classNumber} class ${t.classNumber} кл ${t.classNumber}`,
        });
      }
      return { locale: loc, index, byId };
    })();
    indexes.set(loc, pending);
  }
  return pending;
}

export async function searchNiceTerms(
  locale: Locale,
  query: string,
  limit = 40,
): Promise<NiceTerm[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const { index, byId } = await getIndex(locale);
  const raw = index.search(q, { limit, enrich: false, suggest: true });
  const ids: string[] = [];
  const seen = new Set<string>();

  const blocks = Array.isArray(raw) ? raw : [];
  for (const block of blocks) {
    const result = (block?.result ?? block) as string[] | undefined;
    if (!Array.isArray(result)) continue;
    for (const id of result) {
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(String(id));
      if (ids.length >= limit) break;
    }
    if (ids.length >= limit) break;
  }

  if (ids.length === 0) {
    const terms = [...byId.values()];
    const lower = q.toLowerCase();
    return terms
      .filter((t) => t.label.toLowerCase().includes(lower))
      .slice(0, limit);
  }

  return ids
    .map((id) => byId.get(id))
    .filter((t): t is NiceTerm => Boolean(t))
    .slice(0, limit);
}

export async function getNiceTermsByIds(
  locale: Locale,
  ids: string[],
): Promise<NiceTerm[]> {
  const { byId } = await getIndex(locale);
  return ids.map((id) => byId.get(id)).filter((t): t is NiceTerm => Boolean(t));
}
