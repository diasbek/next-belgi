import { getIntegration } from "@/lib/integrations/store";
import { markSimilarity } from "@/lib/check/similarity";
import type { TrademarkMatch } from "@/lib/check/types";
import type {
  ExternalSearchOptions,
  ExternalSearchResult,
  ExternalTrademarkSearchProvider,
} from "./types";

/**
 * Australian Trade Mark Search API v1 (RAML/OAS 1.0.5)
 * Spec: australian-trade-mark-search-api-1.0.5
 *
 * TEST: https://test.api.ipaustralia.gov.au/public/australian-trade-mark-search-api/v1
 * PROD: https://production.api.ipaustralia.gov.au/public/australian-trade-mark-search-api/v1
 * OAuth: …/public/external-token-api/v1/access_token (client_credentials)
 *
 * Preferred: POST /page/advanced → ApiTrademark[]
 * Fallback:  POST /search/quick → trademarkIds → GET /trade-mark/{id}
 */

const TEST_API =
  process.env.IPAUSTRALIA_TEST_BASE?.trim() ||
  "https://test.api.ipaustralia.gov.au";
const LIVE_API =
  process.env.IPAUSTRALIA_LIVE_BASE?.trim() ||
  process.env.IPAUSTRALIA_BASE?.trim() ||
  "https://production.api.ipaustralia.gov.au";

const SEARCH_API_PATH =
  process.env.IPAUSTRALIA_SEARCH_API_PATH?.trim() ||
  "/public/australian-trade-mark-search-api/v1";
const TOKEN_PATH =
  process.env.IPAUSTRALIA_TOKEN_PATH?.trim() ||
  "/public/external-token-api/v1/access_token";

const DETAIL_CONCURRENCY = 4;
const MAX_PAGE_SIZE = 100;

type TokenCache = { key: string; token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

type ApiOwner = {
  name?: string | null;
};

type ApiGoodsAndServices = {
  class?: string | null;
  descriptionText?: string[] | null;
};

/** ApiTrademark from trade-mark-types.raml */
type ApiTrademark = {
  number?: string | null;
  irNumber?: string | null;
  words?: string[] | null;
  statusGroup?: string | null;
  statusCode?: string | null;
  statusDetail?: string | null;
  filingDate?: string | null;
  registeredFromDate?: string | null;
  enteredOnRegisterDate?: string | null;
  owner?: ApiOwner[] | null;
  goodsAndServices?: ApiGoodsAndServices[] | null;
};

type ApiQuickSearchResult = {
  count?: number;
  trademarkIds?: string[];
};

type ApiAdvancedSearchPageResult = {
  count?: number;
  trademarks?: ApiTrademark[];
};

function hostForMode(mode: string): string {
  return mode === "test" ? TEST_API : LIVE_API;
}

function apiRoot(mode: string): string {
  const host = hostForMode(mode).replace(/\/$/, "");
  const path = SEARCH_API_PATH.startsWith("/")
    ? SEARCH_API_PATH
    : `/${SEARCH_API_PATH}`;
  return `${host}${path.replace(/\/$/, "")}`;
}

function tokenEndpoint(mode: string): string {
  const host = hostForMode(mode).replace(/\/$/, "");
  const path = TOKEN_PATH.startsWith("/") ? TOKEN_PATH : `/${TOKEN_PATH}`;
  return `${host}${path}`;
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  mode: string,
): Promise<{ token: string | null; error?: string }> {
  const cacheKey = `${mode}:${clientId}`;
  if (
    tokenCache &&
    tokenCache.key === cacheKey &&
    tokenCache.expiresAt > Date.now() + 30_000
  ) {
    return { token: tokenCache.token };
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const res = await fetch(tokenEndpoint(mode), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      console.warn("[ipaustralia] token", res.status, detail);
      return {
        token: null,
        error:
          res.status === 401
            ? "ipaustralia_token_unauthorized"
            : `ipaustralia_token_${res.status}`,
      };
    }
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!json.access_token) {
      return { token: null, error: "ipaustralia_token_empty" };
    }
    tokenCache = {
      key: cacheKey,
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
    };
    return { token: json.access_token };
  } catch (e) {
    console.warn("[ipaustralia] token error", e);
    return { token: null, error: "ipaustralia_token_network" };
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

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

function resolveCredentials(
  payload: Record<string, unknown>,
  mode: string,
): {
  clientId: string;
  clientSecret: string;
} {
  // Credentials live only in Admin → Integrations (Supabase encrypted).
  // No process.env secret fallback.
  const legacyId = String(payload.client_id || "").trim();
  const legacySecret = String(
    payload.client_secret || payload.api_key || "",
  ).trim();

  if (mode === "test") {
    const clientId = String(payload.test_client_id || legacyId || "").trim();
    const clientSecret = String(
      payload.test_client_secret || legacySecret || "",
    ).trim();
    return { clientId, clientSecret };
  }

  const clientId = String(payload.live_client_id || legacyId || "").trim();
  const clientSecret = String(
    payload.live_client_secret || legacySecret || "",
  ).trim();
  return { clientId, clientSecret };
}

function markName(tm: ApiTrademark, fallback: string): string {
  const words = (tm.words || []).map(String).filter(Boolean);
  if (words.length) return words.join(" ");
  return tm.number?.trim() || fallback;
}

function normalizeTrademark(
  query: string,
  tm: ApiTrademark,
  i: number,
): TrademarkMatch {
  const name = markName(tm, `AU-${i}`);
  const owners = (tm.owner || [])
    .map((o) => o?.name?.trim())
    .filter((n): n is string => Boolean(n));
  const classes = (tm.goodsAndServices || [])
    .map((g) => g?.class?.trim())
    .filter((c): c is string => Boolean(c));

  return {
    id: String(tm.number || tm.irNumber || `ipau-${i}`),
    name,
    owner: owners[0],
    status: tm.statusDetail || tm.statusCode || tm.statusGroup || undefined,
    registeredFrom:
      tm.registeredFromDate ||
      tm.enteredOnRegisterDate ||
      tm.filingDate ||
      undefined,
    similarity: markSimilarity(query, name),
    classesText: classes.length ? classes.join(", ") : undefined,
    sourceLabel: "AU",
  };
}

/** Build TrademarkApiAdvancedSearchPageRequest for word similarity. */
function buildPageAdvancedBody(
  query: string,
  limit: number,
  niceClasses?: number[],
) {
  const pageSize = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
  const searchQuery: Record<string, unknown> = {
    // PART catches substring variants; good default for conflict screening
    word: { text: query, type: "PART" },
    // Pending + registered — relevant for clearance
    statuses: ["PENDING_REGISTERED"],
    kinds: ["WORD", "FIGURATIVE", "FANCY"],
  };

  if (niceClasses?.length) {
    const n = niceClasses.find((c) => Number.isFinite(c) && c >= 1 && c <= 45);
    if (n != null) {
      searchQuery.classNumber = { text: String(n), type: "SINGLE" };
    }
  }

  return {
    pageNumber: 0,
    pageSize,
    sort: { field: "WORDS", direction: "ASCENDING" },
    rows: [{ query: searchQuery }],
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]!);
    }
  }
  const n = Math.min(concurrency, Math.max(items.length, 1));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

async function fetchMarkDetail(
  mode: string,
  token: string,
  id: string,
  signal?: AbortSignal,
): Promise<ApiTrademark | null> {
  const url = `${apiRoot(mode)}/trade-mark/${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, {
      headers: authHeaders(token),
      signal,
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[ipaustralia] detail", id, res.status);
      return null;
    }
    return (await res.json()) as ApiTrademark;
  } catch (e) {
    console.warn("[ipaustralia] detail error", id, e);
    return null;
  }
}

async function searchViaPageAdvanced(
  mode: string,
  token: string,
  query: string,
  limit: number,
  niceClasses: number[] | undefined,
  signal?: AbortSignal,
): Promise<{ ok: true; trademarks: ApiTrademark[] } | { ok: false; status: number }> {
  const res = await fetch(`${apiRoot(mode)}/page/advanced`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(buildPageAdvancedBody(query, limit, niceClasses)),
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    console.warn("[ipaustralia] page/advanced", res.status);
    return { ok: false, status: res.status };
  }
  const json = (await res.json()) as ApiAdvancedSearchPageResult;
  return { ok: true, trademarks: json.trademarks || [] };
}

async function searchViaQuickThenDetail(
  mode: string,
  token: string,
  query: string,
  limit: number,
  signal?: AbortSignal,
): Promise<ApiTrademark[]> {
  const res = await fetch(`${apiRoot(mode)}/search/quick`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      query,
      sort: { field: "NUMBER", direction: "ASCENDING" },
      filters: {
        quickSearchType: ["WORD"],
        // Spec statuses for quick search (ApiQuickSearchFilters)
        status: ["PENDING", "REGISTERED"],
      },
    }),
    signal,
    cache: "no-store",
  });
  if (!res.ok) {
    console.warn("[ipaustralia] search/quick", res.status);
    return [];
  }
  const json = (await res.json()) as ApiQuickSearchResult;
  const ids = (json.trademarkIds || []).slice(0, limit);
  if (!ids.length) return [];

  const details = await mapPool(ids, DETAIL_CONCURRENCY, (id) =>
    fetchMarkDetail(mode, token, id, signal),
  );
  return details.filter((d): d is ApiTrademark => Boolean(d));
}

export async function testIpAustraliaConnection(): Promise<{
  ok: boolean;
  mode?: string;
  tokenOk?: boolean;
  searchOk?: boolean;
  sampleCount?: number;
  error?: string;
  detail?: string;
}> {
  const payload = await getIntegration("ipaustralia");
  if (!payload) {
    return { ok: false, error: "provider_not_configured" };
  }
  const mode = String(payload.mode || "mock");
  if (mode === "mock") return { ok: true, mode: "mock" };

  const { clientId, clientSecret } = resolveCredentials(payload, mode);
  if (!clientId || !clientSecret) {
    return { ok: false, error: "provider_not_configured", mode };
  }

  const tok = await getAccessToken(clientId, clientSecret, mode);
  if (!tok.token) {
    return {
      ok: false,
      mode,
      tokenOk: false,
      error: tok.error || "ipaustralia_token_failed",
    };
  }

  try {
    // Spec example: POST /search/quick with query TEST
    const res = await fetch(`${apiRoot(mode)}/search/quick`, {
      method: "POST",
      headers: authHeaders(tok.token),
      body: JSON.stringify({
        query: "TEST",
        sort: { field: "NUMBER", direction: "ASCENDING" },
        filters: {
          quickSearchType: ["WORD"],
          status: ["REGISTERED"],
        },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 240);
      console.warn("[ipaustralia] test search", res.status, detail);
      return {
        ok: false,
        mode,
        tokenOk: true,
        searchOk: false,
        error: `ipaustralia_search_${res.status}`,
        detail:
          res.status === 403
            ? "OAuth OK, but search returned 403 — confirm Australian Trade Mark Search API access is approved."
            : detail || undefined,
      };
    }
    const json = (await res.json()) as ApiQuickSearchResult;
    return {
      ok: true,
      mode,
      tokenOk: true,
      searchOk: true,
      sampleCount: json.trademarkIds?.length ?? json.count ?? 0,
    };
  } catch (e) {
    console.warn("[ipaustralia] test error", e);
    return {
      ok: false,
      mode,
      tokenOk: true,
      searchOk: false,
      error: "ipaustralia_search_network",
    };
  }
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
      return {
        matches: mockMatches(q, limit),
        fetchedAt: new Date().toISOString(),
      };
    }

    const { clientId, clientSecret } = resolveCredentials(payload, mode);
    if (!clientId || !clientSecret) {
      return { matches: [], unavailable: true };
    }

    const tok = await getAccessToken(clientId, clientSecret, mode);
    if (!tok.token) {
      return { matches: [], unavailable: true };
    }

    try {
      let trademarks: ApiTrademark[] = [];

      const page = await searchViaPageAdvanced(
        mode,
        tok.token,
        q,
        limit,
        options?.niceClasses,
        options?.signal,
      );

      if (page.ok) {
        trademarks = page.trademarks;
      } else {
        // Fallback to quick search + GET /trade-mark/{id} (spec primary paths)
        trademarks = await searchViaQuickThenDetail(
          mode,
          tok.token,
          q,
          limit,
          options?.signal,
        );
      }

      const matches = trademarks
        .slice(0, limit)
        .map((tm, i) => normalizeTrademark(q, tm, i))
        .sort((a, b) => b.similarity - a.similarity);

      return { matches, fetchedAt: new Date().toISOString() };
    } catch (e) {
      console.warn("[ipaustralia] search error", e);
      return { matches: [], unavailable: true };
    }
  },
};
