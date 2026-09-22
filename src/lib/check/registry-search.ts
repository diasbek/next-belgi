import { getServiceDb } from "@/lib/db/client";
import { adliyaLogoUrl } from "@/lib/adliya/types";
import type { TrademarkMatch } from "./types";

const MIN_SIM = Number(process.env.REGISTRY_SEARCH_MIN_SIM || 0.15);
const LIMIT = Number(process.env.REGISTRY_SEARCH_LIMIT || 15);

export type RegistrySearchHit = {
  id: string;
  adliya_id: number | null;
  number: string | null;
  transliteration: string | null;
  owner: string | null;
  applicant: string | null;
  status: string | null;
  logo: string | null;
  registration_date: string | null;
  expired: string | null;
  similarity: number;
  classes_text: string | null;
};

/**
 * Local registry similarity search (pg_trgm RPC).
 */
export async function searchLocalRegistry(params: {
  query: string;
  niceClasses?: number[];
  limit?: number;
  minSim?: number;
}): Promise<TrademarkMatch[]> {
  const db = getServiceDb();
  if (!db) return [];

  const query = params.query.trim();
  if (!query) return [];

  const { data, error } = await db.rpc("search_trademarks_similar", {
    p_query: query,
    p_classes: params.niceClasses?.length ? params.niceClasses : null,
    p_limit: params.limit ?? LIMIT,
    p_min_sim: params.minSim ?? MIN_SIM,
  });

  if (error) {
    console.warn("[registry-search]", error.message);
    // Fallback: ilike only
    return fallbackIlike(db, query, params.niceClasses, params.limit ?? LIMIT);
  }

  return ((data || []) as RegistrySearchHit[]).map((row) => ({
    id: row.id,
    name: row.transliteration || row.number || row.id,
    owner: row.owner || row.applicant || undefined,
    registeredFrom: row.registration_date || undefined,
    registeredTo: row.expired || undefined,
    status: row.status || undefined,
    similarity: Math.round(Number(row.similarity || 0) * 100),
    classesText: row.classes_text || undefined,
    imageUrl: logoUrl(row.logo),
    sourceLabel: "UZ",
  }));
}

function logoUrl(logo: string | null): string | undefined {
  if (!logo) return undefined;
  if (logo.startsWith("http")) return logo;
  return adliyaLogoUrl(logo) || undefined;
}

async function fallbackIlike(
  db: NonNullable<ReturnType<typeof getServiceDb>>,
  query: string,
  niceClasses: number[] | undefined,
  limit: number,
): Promise<TrademarkMatch[]> {
  let q = db
    .from("trademarks")
    .select(
      "id, number, transliteration, owner, applicant, status, logo, registration_date, expired",
    )
    .eq("active", true)
    .or(
      `transliteration.ilike.%${query}%,number.ilike.%${query}%`,
    )
    .limit(limit);

  const { data } = await q;
  const rows = data || [];

  if (niceClasses?.length) {
    const ids = rows.map((r) => r.id);
    if (!ids.length) return [];
    const { data: mgs } = await db
      .from("trademark_mgs")
      .select("trademark_id, class_number")
      .in("trademark_id", ids)
      .in("class_number", niceClasses);
    const allowed = new Set((mgs || []).map((m) => m.trademark_id));
    return rows
      .filter((r) => allowed.has(r.id))
      .map((row) => ({
        id: row.id,
        name: row.transliteration || row.number || row.id,
        owner: row.owner || row.applicant || undefined,
        registeredFrom: row.registration_date || undefined,
        registeredTo: row.expired || undefined,
        status: row.status || undefined,
        similarity: 40,
        imageUrl: logoUrl(row.logo),
        sourceLabel: "UZ",
      }));
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.transliteration || row.number || row.id,
    owner: row.owner || row.applicant || undefined,
    registeredFrom: row.registration_date || undefined,
    registeredTo: row.expired || undefined,
    status: row.status || undefined,
    similarity: 40,
    imageUrl: logoUrl(row.logo),
    sourceLabel: "UZ",
  }));
}
