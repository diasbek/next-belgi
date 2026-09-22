import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceDb } from "@/lib/db/client";
import { createRegistryProvider } from "./provider";
import type {
  RegistryRemoteTrademark,
  TrademarkRegistryProvider,
} from "./types";

const IMPORT_SECRET =
  process.env.BELGI_IMPORT_SECRET?.trim() || "belgi-import-2026-yfsl";

export type SyncMode = "incremental" | "page" | "enrich";

export type SyncOptions = {
  mode?: SyncMode;
  pageSize?: number;
  maxPages?: number;
  startPage?: number;
  listOnly?: boolean;
  provider?: TrademarkRegistryProvider;
  db?: SupabaseClient;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mapRow(tm: RegistryRemoteTrademark) {
  return {
    adliya_id: tm.adliyaId,
    number: tm.number,
    application_date: tm.date,
    registration_number: tm.registration_number,
    registration_date: tm.registration_date,
    expired: tm.expired,
    publication_date: tm.publication_date,
    logo: tm.logo,
    vienna_classification: tm.vienna_classification,
    collective: tm.collective,
    transliteration: tm.transliteration,
    trademark_type: tm.trademark_type,
    colors: tm.colors,
    applicant: tm.applicant,
    owner: tm.owner,
    owner_address: tm.owner_address,
    applicant_old: tm.applicant_old,
    owner_old: tm.owner_old,
    address: tm.address,
    status: tm.status,
    unprotected_element: tm.unprotected_element,
    raw: tm.raw,
  };
}

function mapMgs(tm: RegistryRemoteTrademark) {
  return tm.mgs.map((m) => ({
    adliya_mgs_id: m.adliyaMgsId,
    adliya_id: tm.adliyaId,
    trademark_adliya_id: tm.adliyaId,
    class_number: m.classNumber,
    text_uz: m.textUz,
    text_ru: m.textRu,
  }));
}

async function setState(
  db: SupabaseClient,
  patch: Record<string, unknown>,
  useRpc: boolean,
) {
  if (!useRpc) {
    const { error } = await db.from("trademark_import_state").upsert({
      id: 1,
      ...patch,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`state: ${error.message}`);
    return;
  }
  const { error } = await db.rpc("import_trademarks_set_state", {
    p_secret: IMPORT_SECRET,
    p_patch: patch,
  });
  if (error) throw new Error(`state_rpc: ${error.message}`);
}

async function upsertBatch(
  db: SupabaseClient,
  rows: ReturnType<typeof mapRow>[],
  mgs: ReturnType<typeof mapMgs>,
  useRpc: boolean,
) {
  if (useRpc) {
    const { error } = await db.rpc("import_trademarks_batch", {
      p_secret: IMPORT_SECRET,
      p_rows: rows,
      p_mgs: mgs,
    });
    if (error) throw new Error(`batch_rpc: ${error.message}`);
    return;
  }

  // Service-role path with merge policy in app code
  for (const row of rows) {
    const { data: existing } = await db
      .from("trademarks")
      .select("id, source, field_locks")
      .eq("adliya_id", row.adliya_id)
      .maybeSingle();

    if (existing?.source === "manual") continue;

    const locks: string[] = Array.isArray(existing?.field_locks)
      ? (existing.field_locks as string[])
      : [];

    if (!existing) {
      const { data: inserted, error } = await db
        .from("trademarks")
        .insert({
          ...row,
          source: "adliya",
          active: true,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle();
      if (error) throw new Error(`insert: ${error.message}`);
      if (inserted?.id) {
        await replaceAdliyaMgs(
          db,
          inserted.id as string,
          mgs.filter((m) => m.adliya_id === row.adliya_id),
        );
      }
      continue;
    }

    const patch: Record<string, unknown> = {
      source: "adliya",
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    for (const [key, value] of Object.entries(row)) {
      if (key === "adliya_id") continue;
      if (locks.includes(key)) continue;
      patch[key] = value;
    }

    const { error } = await db
      .from("trademarks")
      .update(patch)
      .eq("id", existing.id);
    if (error) throw new Error(`update: ${error.message}`);

    await replaceAdliyaMgs(
      db,
      existing.id as string,
      mgs.filter((m) => m.adliya_id === row.adliya_id),
    );
  }
}

async function replaceAdliyaMgs(
  db: SupabaseClient,
  trademarkId: string,
  mgs: ReturnType<typeof mapMgs>,
) {
  await db
    .from("trademark_mgs")
    .delete()
    .eq("trademark_id", trademarkId)
    .not("adliya_mgs_id", "is", null);

  if (!mgs.length) return;
  const { error } = await db.from("trademark_mgs").insert(
    mgs.map((m) => ({
      adliya_mgs_id: m.adliya_mgs_id,
      trademark_id: trademarkId,
      class_number: m.class_number,
      text_uz: m.text_uz,
      text_ru: m.text_ru,
    })),
  );
  if (error) throw new Error(`mgs: ${error.message}`);
}

async function enrich(
  provider: TrademarkRegistryProvider,
  item: RegistryRemoteTrademark,
  listOnly: boolean,
  detailDelayMs: number,
): Promise<RegistryRemoteTrademark> {
  if (listOnly) return item;
  const hasTexts = item.mgs.some((m) => m.textUz || m.textRu);
  if (item.transliteration && hasTexts) return item;
  const appNo = item.applicationNumber;
  if (!appNo) return item;
  try {
    const detail = await provider.getDetail(appNo);
    await sleep(detailDelayMs);
    return detail || item;
  } catch {
    await sleep(detailDelayMs * 2);
    return item;
  }
}

/**
 * Shared sync entry used by CLI and admin API.
 */
export async function runRegistrySync(opts: SyncOptions = {}): Promise<{
  ok: boolean;
  imported: number;
  pages: number;
  error?: string;
}> {
  const db = opts.db || getServiceDb();
  if (!db) {
    return { ok: false, imported: 0, pages: 0, error: "db_unavailable" };
  }

  let provider: TrademarkRegistryProvider;
  try {
    provider = opts.provider || createRegistryProvider();
  } catch (e) {
    return {
      ok: false,
      imported: 0,
      pages: 0,
      error: e instanceof Error ? e.message : "provider_error",
    };
  }

  const pageSize = opts.pageSize ?? Number(process.env.ADLIYA_PAGE_SIZE || 25);
  const maxPages = opts.maxPages ?? 1;
  const listOnly = opts.listOnly ?? false;
  const delayMs = Number(process.env.ADLIYA_IMPORT_DELAY_MS || 120);
  const detailDelayMs = Number(process.env.ADLIYA_DETAIL_DELAY_MS || 300);
  const useRpc = !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  // Prefer service path when service client is used
  const serviceMode = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  try {
    if (opts.mode === "enrich") {
      return await runEnrich(db, provider, {
        maxBatches: maxPages,
        detailDelayMs,
        useRpc: !serviceMode,
      });
    }

    let page =
      opts.startPage != null
        ? opts.startPage
        : await resolveStartPage(db, pageSize);
    let imported = 0;
    let pages = 0;

    await setState(
      db,
      {
        status: "running",
        page_size: pageSize,
        started_at: new Date().toISOString(),
        error: null,
      },
      !serviceMode,
    );

    while (pages < maxPages) {
      const result = await provider.listPage({ page, size: pageSize });
      if (!result.content.length && page > 0) break;

      const enriched: RegistryRemoteTrademark[] = [];
      for (const item of result.content) {
        enriched.push(await enrich(provider, item, listOnly, detailDelayMs));
      }

      const rows = enriched.map(mapRow);
      const mgs = enriched.flatMap(mapMgs);
      await upsertBatch(db, rows, mgs, !serviceMode);

      imported += rows.length;
      pages += 1;

      await setState(
        db,
        {
          last_page: page,
          total_elements: result.totalElements,
          total_pages: result.totalPages,
          imported_count: imported,
          status: "running",
        },
        !serviceMode,
      );

      if (result.last || page + 1 >= result.totalPages) break;
      page += 1;
      await sleep(delayMs);
    }

    await setState(
      db,
      {
        status: listOnly ? "paused" : "done",
        finished_at: listOnly ? null : new Date().toISOString(),
      },
      !serviceMode,
    );

    return { ok: true, imported, pages };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    try {
      await setState(
        db,
        { status: "error", error: message.slice(0, 2000) },
        !serviceMode,
      );
    } catch {
      // ignore
    }
    return { ok: false, imported: 0, pages: 0, error: message };
  }
}

async function resolveStartPage(db: SupabaseClient, pageSize: number) {
  const { data } = await db
    .from("trademark_import_state")
    .select("last_page")
    .eq("id", 1)
    .maybeSingle();
  if (data && typeof data.last_page === "number" && data.last_page >= 0) {
    return data.last_page + 1;
  }
  const { count } = await db
    .from("trademarks")
    .select("id", { count: "exact", head: true })
    .eq("source", "adliya");
  const imported = count ?? 0;
  return imported > 0 ? Math.floor(imported / pageSize) : 0;
}

async function runEnrich(
  db: SupabaseClient,
  provider: TrademarkRegistryProvider,
  opts: { maxBatches: number; detailDelayMs: number; useRpc: boolean },
) {
  let imported = 0;
  let pages = 0;
  const batchSize = 25;

  while (pages < opts.maxBatches) {
    const { data, error } = await db
      .from("trademarks")
      .select("id, adliya_id, number, raw")
      .eq("source", "adliya")
      .or("transliteration.is.null,transliteration.eq.")
      .order("adliya_id", { ascending: false })
      .limit(batchSize);

    if (error) throw new Error(error.message);
    if (!data?.length) break;

    const enriched: RegistryRemoteTrademark[] = [];
    for (const row of data) {
      const raw = row.raw as Record<string, unknown> | null;
      const appNo =
        (typeof raw?.applicationNumber === "number"
          ? raw.applicationNumber
          : null) ||
        (typeof row.number === "string"
          ? Number(String(row.number).replace(/\D/g, ""))
          : null);
      if (!appNo) continue;
      try {
        const detail = await provider.getDetail(appNo);
        if (detail) enriched.push(detail);
        await sleep(opts.detailDelayMs);
      } catch {
        await sleep(opts.detailDelayMs * 3);
      }
    }

    if (enriched.length) {
      await upsertBatch(
        db,
        enriched.map(mapRow),
        enriched.flatMap(mapMgs),
        opts.useRpc,
      );
      imported += enriched.length;
    }
    pages += 1;
  }

  await setState(
    db,
    { status: "done", finished_at: new Date().toISOString() },
    opts.useRpc,
  );
  return { ok: true, imported, pages };
}

export async function pauseRegistrySync(db?: SupabaseClient) {
  const client = db || getServiceDb();
  if (!client) return { ok: false, error: "db_unavailable" };
  const serviceMode = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  await setState(
    client,
    { status: "paused", finished_at: null },
    !serviceMode,
  );
  return { ok: true };
}
