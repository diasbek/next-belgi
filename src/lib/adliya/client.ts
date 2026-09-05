import type {
  AdliyaPage,
  AdliyaSearchHit,
  AdliyaTrademark,
} from "./types";
import { ADLIYA_API_BASE } from "./types";
import { getIntegration } from "@/lib/integrations/store";

async function resolveAdliyaConfig(): Promise<{
  token: string | null;
  apiBase: string;
  mode: string;
} | null> {
  const cfg = await getIntegration("adliya");
  if (!cfg) return null;
  // Soft-configured silent modes always work without live credentials.
  const mode = cfg.mode || "test";
  if (mode !== "live") {
    return {
      token: null,
      apiBase: cfg.api_base || ADLIYA_API_BASE,
      mode,
    };
  }
  return {
    token: cfg.access_token || null,
    apiBase: (cfg.api_base || ADLIYA_API_BASE).replace(/\/$/, ""),
    mode,
  };
}

function authHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Origin: "https://im.adliya.uz",
    Referer: "https://im.adliya.uz/",
  };
  if (token) {
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return headers;
}

async function adliyaFetch(path: string, init?: RequestInit): Promise<Response> {
  const cfg = await resolveAdliyaConfig();
  if (!cfg || cfg.mode !== "live" || !cfg.token) {
    return new Response(JSON.stringify({ data: null, silent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const url = path.startsWith("http") ? path : `${cfg.apiBase}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...authHeaders(cfg.token),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

function unwrapData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null;
  return (value as T) ?? null;
}

function asNumberArray(
  value: Array<string | number | null> | string | number | null | undefined,
): number[] {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 45);
}

/** Map nested search hit → stub trademark (detail fills the rest). */
export function mapSearchHit(hit: AdliyaSearchHit): AdliyaTrademark {
  const app = hit.APPLICATION || {};
  const tm = hit.TRADEMARK || {};
  const pub = hit.PUBLICATION || {};
  const mgsNumbers = asNumberArray(hit.MGS_CLASSIFICATION?.number);
  const appId = Number(app.id);
  const appNumber = app.number != null ? Number(app.number) : null;

  return {
    id: Number.isFinite(appId) ? appId : 0,
    applicationNumber: Number.isFinite(appNumber as number) ? appNumber : null,
    number: app.number != null ? `TB ${app.number}` : null,
    date: app.send_date ?? null,
    registration_date: app.registration_date ?? null,
    expired: app.expiry_date ?? null,
    publication_date: firstOf(pub.publication_date),
    logo: firstOf(tm.image),
    status: app.application_status ?? null,
    mgs_classification: mgsNumbers.map((n, i) => ({
      id: Number.isFinite(appId) ? appId * 1000 + i : i,
      number: n,
    })),
  };
}

function isSearchHit(value: unknown): value is AdliyaSearchHit {
  return Boolean(
    value &&
      typeof value === "object" &&
      ("APPLICATION" in value || "TRADEMARK" in value),
  );
}

function isDetailTrademark(value: unknown): value is AdliyaTrademark {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      typeof (value as AdliyaTrademark).id === "number" &&
      !("APPLICATION" in value),
  );
}

function normalizePage(raw: unknown): AdliyaPage<AdliyaTrademark> {
  const root =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const payload = "data" in root ? root.data : raw;

  let content: AdliyaTrademark[] = [];
  if (Array.isArray(payload)) {
    content = payload.map((item) =>
      isSearchHit(item)
        ? mapSearchHit(item)
        : isDetailTrademark(item)
          ? item
          : ({ id: 0 } as AdliyaTrademark),
    );
  } else if (payload && typeof payload === "object") {
    const pageObj = payload as Record<string, unknown>;
    const rows = Array.isArray(pageObj.content)
      ? pageObj.content
      : Array.isArray(pageObj.items)
        ? pageObj.items
        : Array.isArray(pageObj.results)
          ? pageObj.results
          : [];
    content = rows.map((item) =>
      isSearchHit(item) ? mapSearchHit(item) : (item as AdliyaTrademark),
    );
  }

  content = content.filter((tm) => typeof tm.id === "number" && tm.id > 0);

  const totalElements = Number(
    root.total_count ??
      root.totalElements ??
      root.total ??
      (payload &&
      typeof payload === "object" &&
      !Array.isArray(payload)
        ? (payload as Record<string, unknown>).totalElements
        : undefined) ??
      content.length,
  );
  const size = Number(root.size ?? content.length ?? 100) || 100;
  const totalPages = Number(
    root.total_pages ??
      root.totalPages ??
      Math.max(1, Math.ceil(totalElements / size)),
  );
  const number = Number(root.page ?? root.number ?? 0);

  return {
    content,
    totalElements,
    totalPages,
    number,
    size,
    last: Boolean(root.last ?? number + 1 >= totalPages),
  };
}

/** Paginated public register search (requires ADLIYA_ACCESS_TOKEN). */
export async function searchTrademarksPage(params: {
  page: number;
  size?: number;
}): Promise<AdliyaPage<AdliyaTrademark>> {
  const size = params.size ?? 100;
  const path = `/v1/register/public/search?objectType=TRADEMARK&page=${params.page}&size=${size}`;

  // NOTE: body must NOT include `sort` — Adliya returns 400.
  let lastStatus = 0;
  for (let attempt = 0; attempt <= 8; attempt++) {
    const res = await adliyaFetch(path, {
      method: "POST",
      body: JSON.stringify({
        page: params.page,
        size,
      }),
    });
    lastStatus = res.status;
    if (res.ok) return normalizePage(await res.json());
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after") || 0);
      const waitMs = Math.max(
        retryAfter * 1000,
        Math.min(60_000, 1500 * 2 ** attempt),
      );
      console.warn(`[adliya search] ${res.status}, wait ${waitMs}ms`);
      await sleep(waitMs);
      continue;
    }
    throw new Error(`adliya_search_${res.status}:${await res.text()}`);
  }
  throw new Error(`adliya_search_${lastStatus}_exhausted`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Detail by application number (e.g. 202608691), NOT internal id.
 * GET /v1/register/public/search/{applicationNumber}?objectType=TRADEMARK
 */
export async function fetchTrademarkDetail(
  applicationNumber: number,
  opts?: { retries?: number },
): Promise<AdliyaTrademark> {
  const path = `/v1/register/public/search/${applicationNumber}?objectType=TRADEMARK`;
  const retries = opts?.retries ?? 6;
  let lastStatus = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await adliyaFetch(path, { method: "GET" });
    lastStatus = res.status;
    if (res.ok) {
      const json = await res.json();
      const data = unwrapData<AdliyaTrademark>(json);
      if (!data || typeof data.id !== "number") {
        throw new Error(`adliya_detail_invalid:${applicationNumber}`);
      }
      return {
        ...data,
        applicationNumber,
      };
    }
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after") || 0);
      const waitMs = Math.max(
        retryAfter * 1000,
        Math.min(30_000, 800 * 2 ** attempt),
      );
      await sleep(waitMs);
      continue;
    }
    throw new Error(`adliya_detail_${res.status}:${path}`);
  }
  throw new Error(`adliya_detail_${lastStatus}_exhausted:${path}`);
}
