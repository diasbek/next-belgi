import { getServiceDb } from "@/lib/db/client";

const CACHE_TTL_MS = 30_000;
const KEY = "demo_mode";

type Cache = { at: number; enabled: boolean };
let cache: Cache | null = null;

export function invalidateDemoModeCache() {
  cache = null;
}

export async function isDemoMode(): Promise<boolean> {
  const now = Date.now();
  if (cache && now - cache.at <= CACHE_TTL_MS) return cache.enabled;

  const db = getServiceDb();
  if (!db) {
    cache = { at: now, enabled: false };
    return false;
  }

  const { data, error } = await db
    .from("app_settings")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();

  if (error || !data) {
    cache = { at: now, enabled: false };
    return false;
  }

  const enabled = Boolean(
    data.value &&
      typeof data.value === "object" &&
      (data.value as { enabled?: unknown }).enabled === true,
  );
  cache = { at: now, enabled };
  return enabled;
}

export async function setDemoMode(
  enabled: boolean,
  updatedBy?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getServiceDb();
  if (!db) return { ok: false, error: "db_unavailable" };

  const { error } = await db.from("app_settings").upsert(
    {
      key: KEY,
      value: { enabled },
      updated_by: updatedBy ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) return { ok: false, error: error.message };
  cache = { at: Date.now(), enabled };
  return { ok: true };
}
