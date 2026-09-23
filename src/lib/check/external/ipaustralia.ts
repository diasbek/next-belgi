import { getIntegration } from "@/lib/integrations/store";
import { markSimilarity } from "@/lib/check/similarity";
import type { TrademarkMatch } from "@/lib/check/types";
import type {
  ExternalSearchOptions,
  ExternalSearchResult,
  ExternalTrademarkSearchProvider,
} from "./types";

const AU_BASE =
  process.env.IPAUSTRALIA_BASE?.trim() ||
  "https://production.api.ipaustralia.gov.au";

function mockMatches(query: string, limit: number): TrademarkMatch[] {
  const samples = [
    { name: `${query.toUpperCase()} AU`, owner: "Example Pty Ltd" },
    { name: `AUS ${query}`, owner: "Demo Brands Australia" },
  ];
  return samples.slice(0, limit).map((s, i) => ({
    id: `ipau-mock-${i}`,
    name: s.name,
    owner: s.owner,
    status: "Registered",
    similarity: markSimilarity(query, s.name),
    sourceLabel: "AU",
    classesText: "[009] Scientific apparatus",
  }));
}

function normalizeHit(
  query: string,
  row: Record<string, unknown>,
  i: number,
): TrademarkMatch {
  const name = String(
    row.words ||
      row.wordMark ||
      row.trademarkName ||
      row.mark ||
      row.number ||
      `AU-${i}`,
  );
  return {
    id: String(row.number || row.applicationNumber || `ipau-${i}`),
    name,
    owner: row.owner ? String(row.owner) : undefined,
    status: row.status ? String(row.status) : undefined,
    registeredFrom: row.registrationDate
      ? String(row.registrationDate)
      : undefined,
    similarity: markSimilarity(query, name),
    classesText: Array.isArray(row.classes)
      ? (row.classes as unknown[]).join(", ")
      : undefined,
    sourceLabel: "AU",
  };
}

export const ipAustraliaProvider: ExternalTrademarkSearchProvider = {
  id: "ipaustralia",
  jurisdiction: "au",

  async searchSimilar(
    query: string,
    options?: ExternalSearchOptions,
  ): Promise<ExternalSearchResult> {
    const q = query.trim();
    if (!q) return { matches: [] };
    const limit = options?.limit ?? 10;

    const payload = await getIntegration("ipaustralia");
    if (!payload) {
      return { matches: [], unavailable: true };
    }

    const mode = String(payload.mode || "mock");
    if (mode === "mock") {
      return { matches: mockMatches(q, limit), fetchedAt: new Date().toISOString() };
    }

    const apiKey = String(payload.api_key || "").trim();
    const path =
      process.env.IPAUSTRALIA_SEARCH_PATH?.trim() ||
      "/public/trademarks/v1/search";
    const url = new URL(path, AU_BASE.endsWith("/") ? AU_BASE : `${AU_BASE}/`);
    url.searchParams.set("q", q);
    url.searchParams.set("rows", String(limit));

    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (apiKey) headers["X-API-KEY"] = apiKey;
      const res = await fetch(url.toString(), {
        headers,
        signal: options?.signal,
        cache: "no-store",
      });
      if (!res.ok) {
        console.warn("[ipaustralia] search", res.status);
        return { matches: [], unavailable: true };
      }
      const json = (await res.json()) as {
        results?: Record<string, unknown>[];
        trademarks?: Record<string, unknown>[];
        items?: Record<string, unknown>[];
      };
      const rows = json.results || json.trademarks || json.items || [];
      const matches = rows
        .slice(0, limit)
        .map((row, i) => normalizeHit(q, row, i))
        .sort((a, b) => b.similarity - a.similarity);
      return { matches, fetchedAt: new Date().toISOString() };
    } catch (e) {
      console.warn("[ipaustralia] search error", e);
      return { matches: [], unavailable: true };
    }
  },
};
