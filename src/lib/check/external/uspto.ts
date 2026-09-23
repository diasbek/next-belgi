import { getIntegration } from "@/lib/integrations/store";
import { markSimilarity } from "@/lib/check/similarity";
import type { TrademarkMatch } from "@/lib/check/types";
import type {
  ExternalSearchOptions,
  ExternalSearchResult,
  ExternalTrademarkSearchProvider,
} from "./types";

const ODP_SEARCH =
  process.env.USPTO_ODP_SEARCH_URL?.trim() ||
  "https://api.uspto.gov/api/v1/patent/applications/search";
// Trademark Open Data search endpoint (configurable — USPTO evolves portals)
const TM_SEARCH =
  process.env.USPTO_TM_SEARCH_URL?.trim() ||
  "https://developer.uspto.gov/ds-api/trademark/v1/search";

function mockMatches(query: string, limit: number): TrademarkMatch[] {
  const samples = [
    { name: `${query.toUpperCase()} USA`, owner: "Example LLC" },
    { name: `US-${query}`, owner: "Demo Inc." },
  ];
  return samples.slice(0, limit).map((s, i) => ({
    id: `uspto-mock-${i}`,
    name: s.name,
    owner: s.owner,
    status: "Live/Registered",
    similarity: markSimilarity(query, s.name),
    sourceLabel: "US",
    classesText: "[025] Clothing",
  }));
}

function normalizeHit(
  query: string,
  row: Record<string, unknown>,
  i: number,
): TrademarkMatch {
  const name = String(
    row.markIdentification ||
      row.wordMark ||
      row.mark ||
      row.trademarkName ||
      row.serialNumber ||
      `US-${i}`,
  );
  return {
    id: String(row.serialNumber || row.registrationNumber || `uspto-${i}`),
    name,
    owner: row.ownerName
      ? String(row.ownerName)
      : row.owners
        ? String(row.owners)
        : undefined,
    status: row.status ? String(row.status) : undefined,
    registeredFrom: row.registrationDate
      ? String(row.registrationDate)
      : undefined,
    similarity: markSimilarity(query, name),
    classesText: row.internationalClasses
      ? String(row.internationalClasses)
      : undefined,
    sourceLabel: "US",
  };
}

export const usptoProvider: ExternalTrademarkSearchProvider = {
  id: "uspto",
  jurisdiction: "us",

  async searchSimilar(
    query: string,
    options?: ExternalSearchOptions,
  ): Promise<ExternalSearchResult> {
    const q = query.trim();
    if (!q) return { matches: [] };
    const limit = options?.limit ?? 10;

    const payload = await getIntegration("uspto");
    if (!payload) {
      return { matches: [], unavailable: true };
    }

    const mode = String(payload.mode || "mock");
    if (mode === "mock") {
      return { matches: mockMatches(q, limit), fetchedAt: new Date().toISOString() };
    }

    const apiKey = String(payload.api_key || "").trim();
    if (!apiKey) return { matches: [], unavailable: true };

    const url = new URL(TM_SEARCH);
    url.searchParams.set("q", q);
    url.searchParams.set("rows", String(limit));
    if (options?.niceClasses?.length) {
      url.searchParams.set("classes", options.niceClasses.join(","));
    }

    try {
      const res = await fetch(url.toString(), {
        headers: {
          "USPTO-API-KEY": apiKey,
          Accept: "application/json",
        },
        signal: options?.signal,
        cache: "no-store",
      });
      if (!res.ok) {
        // Fallback attempt via ODP if configured differently
        console.warn("[uspto] search", res.status, ODP_SEARCH);
        return { matches: [], unavailable: true };
      }
      const json = (await res.json()) as {
        results?: Record<string, unknown>[];
        response?: { docs?: Record<string, unknown>[] };
        trademarks?: Record<string, unknown>[];
      };
      const rows =
        json.results ||
        json.trademarks ||
        json.response?.docs ||
        [];
      const matches = rows
        .slice(0, limit)
        .map((row, i) => normalizeHit(q, row, i))
        .sort((a, b) => b.similarity - a.similarity);
      return { matches, fetchedAt: new Date().toISOString() };
    } catch (e) {
      console.warn("[uspto] search error", e);
      return { matches: [], unavailable: true };
    }
  },
};
