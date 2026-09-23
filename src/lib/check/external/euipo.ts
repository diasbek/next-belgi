import { getIntegration } from "@/lib/integrations/store";
import { markSimilarity } from "@/lib/check/similarity";
import type { TrademarkMatch } from "@/lib/check/types";
import type {
  ExternalSearchOptions,
  ExternalSearchResult,
  ExternalTrademarkSearchProvider,
} from "./types";

const SANDBOX_BASE =
  process.env.EUIPO_SANDBOX_BASE?.trim() ||
  "https://api-sandbox.euipo.europa.eu";
const LIVE_BASE =
  process.env.EUIPO_LIVE_BASE?.trim() || "https://api.euipo.europa.eu";

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  base: string,
): Promise<string | null> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }
  const tokenUrl =
    process.env.EUIPO_TOKEN_URL?.trim() ||
    `${base}/oauth/token` ||
    "https://euipo.europa.eu/cas-server-webapp/oidc/accessToken";

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: process.env.EUIPO_SCOPE?.trim() || "uid",
  });

  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[euipo] token", res.status);
      return null;
    }
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!json.access_token) return null;
    tokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
    };
    return json.access_token;
  } catch (e) {
    console.warn("[euipo] token error", e);
    return null;
  }
}

function mockMatches(query: string, limit: number): TrademarkMatch[] {
  const samples = [
    { name: `${query.toUpperCase()} EU`, owner: "Example GmbH" },
    { name: `${query}EURO`, owner: "Demo Brands SA" },
  ];
  return samples.slice(0, limit).map((s, i) => ({
    id: `euipo-mock-${i}`,
    name: s.name,
    owner: s.owner,
    status: "Registered",
    similarity: markSimilarity(query, s.name),
    sourceLabel: "EU",
    classesText: "[35] Advertising",
  }));
}

function normalizeHit(
  query: string,
  row: Record<string, unknown>,
  i: number,
): TrademarkMatch {
  const name = String(
    row.markName ||
      row.wordMark ||
      row.trademarkName ||
      row.name ||
      row.applicationNumber ||
      `EUTM-${i}`,
  );
  const owner = row.ownerName
    ? String(row.ownerName)
    : row.applicants
      ? String(row.applicants)
      : undefined;
  const classes = Array.isArray(row.niceClasses)
    ? (row.niceClasses as unknown[])
        .map((c) => (typeof c === "object" && c && "classNumber" in c
          ? String((c as { classNumber: unknown }).classNumber)
          : String(c)))
        .join(", ")
    : row.niceClassDescription
      ? String(row.niceClassDescription)
      : undefined;

  return {
    id: String(row.applicationNumber || row.id || `euipo-${i}`),
    name,
    owner,
    status: row.status ? String(row.status) : undefined,
    registeredFrom: row.registrationDate
      ? String(row.registrationDate)
      : undefined,
    similarity: markSimilarity(query, name),
    classesText: classes,
    sourceLabel: "EU",
  };
}

export const euipoProvider: ExternalTrademarkSearchProvider = {
  id: "euipo",
  jurisdiction: "eu",

  async searchSimilar(
    query: string,
    options?: ExternalSearchOptions,
  ): Promise<ExternalSearchResult> {
    const q = query.trim();
    if (!q) return { matches: [] };
    const limit = options?.limit ?? 10;

    const payload = await getIntegration("euipo");
    if (!payload) {
      return { matches: [], unavailable: true };
    }

    const mode = String(payload.mode || "mock");
    if (mode === "mock") {
      return { matches: mockMatches(q, limit), fetchedAt: new Date().toISOString() };
    }

    const clientId = String(payload.client_id || "").trim();
    const clientSecret = String(payload.client_secret || "").trim();
    if (!clientId || !clientSecret) {
      return { matches: [], unavailable: true };
    }

    const base = mode === "live" ? LIVE_BASE : SANDBOX_BASE;
    const token = await getAccessToken(clientId, clientSecret, base);
    if (!token) return { matches: [], unavailable: true };

    const searchPath =
      process.env.EUIPO_SEARCH_PATH?.trim() ||
      "/trademark-search/trademarks";
    const url = new URL(searchPath, base.endsWith("/") ? base : `${base}/`);
    url.searchParams.set("markName", q);
    url.searchParams.set("size", String(limit));
    if (options?.niceClasses?.length) {
      url.searchParams.set("niceClasses", options.niceClasses.join(","));
    }

    try {
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal: options?.signal,
        cache: "no-store",
      });
      if (!res.ok) {
        console.warn("[euipo] search", res.status);
        return { matches: [], unavailable: true };
      }
      const json = (await res.json()) as {
        trademarks?: Record<string, unknown>[];
        content?: Record<string, unknown>[];
        items?: Record<string, unknown>[];
      };
      const rows = json.trademarks || json.content || json.items || [];
      const matches = rows
        .slice(0, limit)
        .map((row, i) => normalizeHit(q, row, i))
        .sort((a, b) => b.similarity - a.similarity);
      return { matches, fetchedAt: new Date().toISOString() };
    } catch (e) {
      console.warn("[euipo] search error", e);
      return { matches: [], unavailable: true };
    }
  },
};
