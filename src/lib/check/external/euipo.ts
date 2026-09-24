import { getIntegration } from "@/lib/integrations/store";
import { markSimilarity } from "@/lib/check/similarity";
import type { TrademarkMatch } from "@/lib/check/types";
import type {
  ExternalSearchOptions,
  ExternalSearchResult,
  ExternalTrademarkSearchProvider,
} from "./types";

/** Official EUIPO hosts (OpenAPI / portal security docs). */
const SANDBOX_API =
  process.env.EUIPO_SANDBOX_BASE?.trim() ||
  "https://api-sandbox.euipo.europa.eu";
const LIVE_API =
  process.env.EUIPO_LIVE_BASE?.trim() || "https://api.euipo.europa.eu";
const SANDBOX_TOKEN =
  process.env.EUIPO_SANDBOX_TOKEN_URL?.trim() ||
  "https://auth-sandbox.euipo.europa.eu/oidc/accessToken";
const LIVE_TOKEN =
  process.env.EUIPO_TOKEN_URL?.trim() ||
  "https://euipo.europa.eu/cas-server-webapp/oidc/accessToken";

const SEARCH_PATH =
  process.env.EUIPO_SEARCH_PATH?.trim() || "/trademark-search/trademarks";
const GS_TERMS_PATH =
  process.env.EUIPO_GS_TERMS_PATH?.trim() || "/goods-and-services/terms";

/** Gateway rejects size < 10. */
const MIN_PAGE_SIZE = 10;
const DEFAULT_SCOPE = process.env.EUIPO_SCOPE?.trim() || "uid";

type TokenCache = { key: string; token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function escapeRsql(value: string): string {
  return value.replace(/([\\*"'();,=!<>~])/g, "\\$1");
}

function buildVerbalQuery(query: string, niceClasses?: number[]): string {
  const q = escapeRsql(query.trim());
  let rsql = `wordMarkSpecification.verbalElement==*${q}*`;
  if (niceClasses?.length) {
    const classes = niceClasses
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 45)
      .join(",");
    if (classes) rsql += ` and niceClasses=in=(${classes})`;
  }
  return rsql;
}

function apiBase(mode: string): string {
  return mode === "live" ? LIVE_API : SANDBOX_API;
}

function tokenUrl(mode: string): string {
  return mode === "live" ? LIVE_TOKEN : SANDBOX_TOKEN;
}

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  mode: string,
): Promise<{ token: string | null; error?: string }> {
  const url = tokenUrl(mode);
  const cacheKey = `${mode}:${clientId}:${DEFAULT_SCOPE}`;
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
    scope: DEFAULT_SCOPE,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      console.warn("[euipo] token", res.status, detail);
      return {
        token: null,
        error:
          res.status === 401
            ? "euipo_token_unauthorized"
            : `euipo_token_${res.status}`,
      };
    }
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!json.access_token) return { token: null, error: "euipo_token_empty" };
    tokenCache = {
      key: cacheKey,
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in || 7200) * 1000,
    };
    return { token: json.access_token };
  } catch (e) {
    console.warn("[euipo] token error", e);
    return { token: null, error: "euipo_token_network" };
  }
}

function authHeaders(token: string, clientId: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "X-IBM-Client-Id": clientId,
    Accept: "application/json",
  };
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

function pickName(row: Record<string, unknown>, i: number): string {
  const word = row.wordMarkSpecification;
  if (word && typeof word === "object") {
    const verbal = (word as { verbalElement?: unknown }).verbalElement;
    if (verbal) return String(verbal);
  }
  return String(
    row.markName ||
      row.wordMark ||
      row.trademarkName ||
      row.name ||
      row.applicationNumber ||
      `EUTM-${i}`,
  );
}

function pickOwner(row: Record<string, unknown>): string | undefined {
  const applicants = row.applicants;
  if (Array.isArray(applicants) && applicants[0]) {
    const first = applicants[0] as { name?: unknown };
    if (first.name) return String(first.name);
  }
  if (row.ownerName) return String(row.ownerName);
  return undefined;
}

function pickClasses(row: Record<string, unknown>): string | undefined {
  if (Array.isArray(row.niceClasses)) {
    return (row.niceClasses as unknown[])
      .map((c) =>
        typeof c === "object" && c && "classNumber" in c
          ? String((c as { classNumber: unknown }).classNumber)
          : String(c),
      )
      .join(", ");
  }
  if (row.niceClassDescription) return String(row.niceClassDescription);
  return undefined;
}

function normalizeHit(
  query: string,
  row: Record<string, unknown>,
  i: number,
): TrademarkMatch {
  const name = pickName(row, i);
  return {
    id: String(row.applicationNumber || row.id || `euipo-${i}`),
    name,
    owner: pickOwner(row),
    status: row.status ? String(row.status) : undefined,
    registeredFrom: row.registrationDate
      ? String(row.registrationDate)
      : undefined,
    similarity: markSimilarity(query, name),
    classesText: pickClasses(row),
    sourceLabel: "EU",
  };
}

function mapApiError(status: number, body: string): string {
  if (status === 403) {
    if (/not registered to plan/i.test(body)) return "euipo_not_subscribed";
    return "euipo_forbidden_subscription_pending";
  }
  if (status === 401) return "euipo_unauthorized";
  if (status === 429) return "euipo_rate_limited";
  return `euipo_http_${status}`;
}

async function euipoGetJson(params: {
  mode: string;
  clientId: string;
  clientSecret: string;
  path: string;
  searchParams?: Record<string, string>;
  signal?: AbortSignal;
}): Promise<
  | { ok: true; json: unknown }
  | { ok: false; error: string; status?: number }
> {
  const auth = await getAccessToken(
    params.clientId,
    params.clientSecret,
    params.mode,
  );
  if (!auth.token) return { ok: false, error: auth.error || "euipo_token_failed" };

  const base = apiBase(params.mode);
  const url = new URL(
    params.path.startsWith("http")
      ? params.path
      : `${base.replace(/\/$/, "")}${params.path.startsWith("/") ? "" : "/"}${params.path}`,
  );
  for (const [k, v] of Object.entries(params.searchParams || {})) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: authHeaders(auth.token, params.clientId),
      signal: params.signal,
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      console.warn("[euipo]", params.path, res.status, text.slice(0, 200));
      return {
        ok: false,
        error: mapApiError(res.status, text),
        status: res.status,
      };
    }
    try {
      return { ok: true, json: text ? JSON.parse(text) : {} };
    } catch {
      return { ok: false, error: "euipo_invalid_json" };
    }
  } catch (e) {
    console.warn("[euipo] fetch error", e);
    return { ok: false, error: "euipo_network" };
  }
}

export async function testEuipoConnection(): Promise<{
  ok: boolean;
  mode?: string;
  error?: string;
  tokenOk?: boolean;
  trademarkSearchOk?: boolean;
  goodsAndServicesOk?: boolean;
  sampleCount?: number;
  detail?: string;
}> {
  const payload = await getIntegration("euipo");
  if (!payload) return { ok: false, error: "provider_not_configured" };
  const mode = String(payload.mode || "mock");
  if (mode === "mock") return { ok: true, mode: "mock" };

  const clientId = String(payload.client_id || "").trim();
  const clientSecret = String(payload.client_secret || "").trim();
  if (!clientId || !clientSecret) {
    return { ok: false, mode, error: "provider_not_configured" };
  }

  const auth = await getAccessToken(clientId, clientSecret, mode);
  if (!auth.token) {
    return {
      ok: false,
      mode,
      tokenOk: false,
      error: auth.error || "euipo_token_failed",
      detail:
        mode === "live"
          ? "Production token URL failed — check client_id/secret from Apps on dev.euipo.europa.eu"
          : "Sandbox token failed — use credentials from dev-sandbox.euipo.europa.eu (separate realm)",
    };
  }

  const tm = await euipoGetJson({
    mode,
    clientId,
    clientSecret,
    path: SEARCH_PATH,
    searchParams: {
      page: "0",
      size: String(MIN_PAGE_SIZE),
      query: "wordMarkSpecification.verbalElement==*test*",
    },
  });

  const gs = await euipoGetJson({
    mode,
    clientId,
    clientSecret,
    path: GS_TERMS_PATH,
    searchParams: {
      page: "0",
      size: String(MIN_PAGE_SIZE),
      term: "coffee",
      language: "en",
    },
  });

  const trademarkSearchOk = tm.ok;
  const goodsAndServicesOk = gs.ok;
  const sampleCount =
    tm.ok && tm.json && typeof tm.json === "object"
      ? Number(
          (tm.json as { totalElements?: number }).totalElements ??
            (
              (tm.json as { trademarks?: unknown[] }).trademarks ||
              (tm.json as { content?: unknown[] }).content ||
              []
            ).length,
        )
      : 0;

  if (!trademarkSearchOk) {
    const err = !tm.ok ? tm.error : "euipo_search_failed";
    return {
      ok: false,
      mode,
      tokenOk: true,
      trademarkSearchOk: false,
      goodsAndServicesOk,
      error: err,
      detail:
        err === "euipo_forbidden_subscription_pending" ||
        err === "euipo_not_subscribed"
          ? "OAuth OK, but Trademark Search returned 403. In Apps → Subscriptions confirm plan is Approved (production needs docs to docs.apiplatform@euipo.europa.eu; sandbox usually activates faster)."
          : undefined,
    };
  }

  return {
    ok: true,
    mode,
    tokenOk: true,
    trademarkSearchOk: true,
    goodsAndServicesOk,
    sampleCount,
    detail: goodsAndServicesOk
      ? undefined
      : "Trademark Search OK; Goods & Services still 403 — check that product subscription is Approved.",
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
      return {
        matches: mockMatches(q, limit),
        fetchedAt: new Date().toISOString(),
      };
    }

    const clientId = String(payload.client_id || "").trim();
    const clientSecret = String(payload.client_secret || "").trim();
    if (!clientId || !clientSecret) {
      return { matches: [], unavailable: true };
    }

    const pageSize = Math.max(MIN_PAGE_SIZE, Math.min(limit, 100));
    const result = await euipoGetJson({
      mode,
      clientId,
      clientSecret,
      path: SEARCH_PATH,
      searchParams: {
        page: "0",
        size: String(pageSize),
        query: buildVerbalQuery(q, options?.niceClasses),
      },
      signal: options?.signal,
    });

    if (!result.ok) {
      return { matches: [], unavailable: true };
    }

    const json = result.json as {
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
  },
};
