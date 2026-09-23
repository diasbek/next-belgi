import { getServiceDb } from "@/lib/db/client";
import type { TrademarkMatch } from "@/lib/check/types";
import type { ExternalSearchResult } from "./types";

const DEFAULT_TTL_MS = Number(
  process.env.EXTERNAL_SEARCH_CACHE_TTL_MS || 24 * 60 * 60 * 1000,
);

function classesKey(classes?: number[]): string {
  if (!classes?.length) return "";
  return [...classes].sort((a, b) => a - b).join(",");
}

function normQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function readExternalCache(params: {
  jurisdiction: string;
  query: string;
  niceClasses?: number[];
}): Promise<ExternalSearchResult | null> {
  const db = getServiceDb();
  if (!db) return null;
  const query_norm = normQuery(params.query);
  if (!query_norm) return null;
  const classes_key = classesKey(params.niceClasses);

  const { data, error } = await db
    .from("external_search_cache")
    .select("payload, unavailable, fetched_at, expires_at")
    .eq("jurisdiction", params.jurisdiction)
    .eq("query_norm", query_norm)
    .eq("classes_key", classes_key)
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  return {
    matches: (data.payload as TrademarkMatch[]) || [],
    unavailable: Boolean(data.unavailable),
    fetchedAt: data.fetched_at,
    fromCache: true,
  };
}

export async function writeExternalCache(params: {
  jurisdiction: string;
  query: string;
  niceClasses?: number[];
  result: ExternalSearchResult;
  ttlMs?: number;
}): Promise<void> {
  const db = getServiceDb();
  if (!db) return;
  const query_norm = normQuery(params.query);
  if (!query_norm) return;
  const classes_key = classesKey(params.niceClasses);
  const ttl = params.ttlMs ?? DEFAULT_TTL_MS;
  const now = new Date();
  const expires = new Date(now.getTime() + ttl);

  await db.from("external_search_cache").upsert(
    {
      jurisdiction: params.jurisdiction,
      query_norm,
      classes_key,
      payload: params.result.matches,
      unavailable: Boolean(params.result.unavailable),
      fetched_at: now.toISOString(),
      expires_at: expires.toISOString(),
    },
    { onConflict: "jurisdiction,query_norm,classes_key" },
  );
}
