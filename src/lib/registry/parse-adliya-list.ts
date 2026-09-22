import { mapSearchHit, normalizePage } from "@/lib/adliya/client";
import type { AdliyaSearchHit, AdliyaTrademark } from "@/lib/adliya/types";
import { mapAdliyaToRemote } from "@/lib/registry/provider";
import type { RegistryRemoteTrademark } from "@/lib/registry/types";
import { extractAdliyaListRaw } from "@/lib/registry/extract-adliya-list";

function isSearchHit(value: unknown): value is AdliyaSearchHit {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("APPLICATION" in value || "TRADEMARK" in value),
  );
}

export function parseAdliyaListPayload(raw: unknown): {
  trademarks: AdliyaTrademark[];
  remotes: RegistryRemoteTrademark[];
  totalHint: number;
} {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const page = normalizePage(raw);
    if (page.content.length) {
      const remotes = page.content.map(mapAdliyaToRemote);
      return {
        trademarks: page.content,
        remotes,
        totalHint: page.totalElements || page.content.length,
      };
    }
  }

  const list = extractAdliyaListRaw(raw);
  const trademarks: AdliyaTrademark[] = [];
  for (const item of list) {
    if (isSearchHit(item)) {
      const tm = mapSearchHit(item);
      if (tm.id > 0) trademarks.push(tm);
      continue;
    }
    if (
      item &&
      typeof item === "object" &&
      typeof (item as AdliyaTrademark).id === "number" &&
      (item as AdliyaTrademark).id > 0
    ) {
      trademarks.push(item as AdliyaTrademark);
    }
  }

  return {
    trademarks,
    remotes: trademarks.map(mapAdliyaToRemote),
    totalHint: trademarks.length,
  };
}
