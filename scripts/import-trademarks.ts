/**
 * Import Adliya trademarks into Supabase.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --list-only
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --enrich-only
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --max-pages=2
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --list-only --start-page=10
 *
 * Requires:
 *   ADLIYA_ACCESS_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  OR  (NEXT_PUBLIC_SUPABASE_ANON_KEY + BELGI_IMPORT_SECRET)
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  fetchTrademarkDetail,
  searchTrademarksPage,
} from "../src/lib/adliya/client";
import type { AdliyaTrademark } from "../src/lib/adliya/types";

function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

const PAGE_SIZE = Number(process.env.ADLIYA_PAGE_SIZE || 100);
const DELAY_MS = Number(process.env.ADLIYA_IMPORT_DELAY_MS || 120);
const DETAIL_DELAY_MS = Number(process.env.ADLIYA_DETAIL_DELAY_MS || 300);
const IMPORT_SECRET =
  process.env.BELGI_IMPORT_SECRET?.trim() || "belgi-import-2026-yfsl";
const LIST_ONLY = argFlag("list-only");
const ENRICH_ONLY = argFlag("enrich-only");

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function mapTrademarkRow(tm: AdliyaTrademark) {
  return {
    id: tm.id,
    number: tm.number ?? null,
    application_date: tm.date ?? null,
    registration_number: tm.registration_number ?? null,
    registration_date: tm.registration_date ?? null,
    expired: tm.expired ?? null,
    publication_date: tm.publication_date ?? null,
    logo: tm.logo ?? null,
    vienna_classification: tm.vienna_classification ?? null,
    collective: Boolean(tm.collective),
    transliteration: tm.transliteration ?? null,
    trademark_type: tm.trademark_type ?? null,
    colors: tm.colors ?? null,
    applicant: tm.applicant ?? null,
    owner: tm.owner ?? null,
    owner_address: tm.owner_address ?? null,
    applicant_old: tm.applicant_old ?? null,
    owner_old: tm.owner_old ?? null,
    address: tm.address ?? null,
    status: tm.status ?? null,
    unprotected_element: tm.unprotected_element ?? null,
    raw: tm,
    updated_at: new Date().toISOString(),
  };
}

function mapMgsRows(tm: AdliyaTrademark) {
  return (tm.mgs_classification || [])
    .filter((m) => typeof m?.id === "number")
    .map((m) => ({
      id: m.id,
      trademark_id: tm.id,
      class_number: Number(m.number),
      text_uz: m.uz ?? null,
      text_ru: m.ru ?? null,
    }))
    .filter((m) => m.class_number >= 1 && m.class_number <= 45);
}

function applicationNumberFromRaw(raw: unknown): number | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.applicationNumber === "number") return r.applicationNumber;
  const num = typeof r.number === "string" ? r.number.replace(/\D/g, "") : "";
  if (num) return Number(num);
  return null;
}

async function enrichIfNeeded(item: AdliyaTrademark): Promise<AdliyaTrademark> {
  if (LIST_ONLY) return item;
  const appNo = item.applicationNumber;
  const hasTexts = (item.mgs_classification || []).some((m) =>
    Boolean(m.uz || m.ru),
  );
  if (item.transliteration && hasTexts) return item;
  if (!appNo) return item;
  try {
    const detail = await fetchTrademarkDetail(appNo);
    await sleep(DETAIL_DELAY_MS);
    return detail;
  } catch (error) {
    console.warn(`[detail] ${appNo}`, error);
    await sleep(DETAIL_DELAY_MS * 2);
    return item;
  }
}

function createDb(): { supabase: SupabaseClient; mode: "service" | "rpc" } {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceKey) {
    return {
      supabase: createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
      mode: "service",
    };
  }
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!anon) {
    throw new Error(
      "Need SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return {
    supabase: createClient(supabaseUrl, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    mode: "rpc",
  };
}

async function setState(
  supabase: SupabaseClient,
  mode: "service" | "rpc",
  patch: Record<string, unknown>,
) {
  if (mode === "service") {
    const { error } = await supabase.from("trademark_import_state").upsert({
      id: 1,
      ...patch,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`state: ${error.message}`);
    return;
  }
  const { error } = await supabase.rpc("import_trademarks_set_state", {
    p_secret: IMPORT_SECRET,
    p_patch: patch,
  });
  if (error) throw new Error(`state_rpc: ${error.message}`);
}

async function upsertBatch(
  supabase: SupabaseClient,
  mode: "service" | "rpc",
  rows: ReturnType<typeof mapTrademarkRow>[],
  mgs: ReturnType<typeof mapMgsRows>,
) {
  if (mode === "service") {
    const { error: upErr } = await supabase.from("trademarks").upsert(rows, {
      onConflict: "id",
    });
    if (upErr) throw new Error(`upsert trademarks: ${upErr.message}`);
    if (mgs.length) {
      const { error: mgsErr } = await supabase
        .from("trademark_mgs")
        .upsert(mgs, { onConflict: "id" });
      if (mgsErr) throw new Error(`upsert mgs: ${mgsErr.message}`);
    }
    return;
  }
  const { error } = await supabase.rpc("import_trademarks_batch", {
    p_secret: IMPORT_SECRET,
    p_rows: rows,
    p_mgs: mgs,
  });
  if (error) throw new Error(`batch_rpc: ${error.message}`);
}

async function readListState(supabase: SupabaseClient) {
  const startPage = argValue("start-page");
  if (startPage != null) {
    return {
      last_page: Number(startPage) - 1,
      imported_count: 0,
      started_at: null as string | null,
    };
  }
  const { count } = await supabase
    .from("trademarks")
    .select("id", { count: "exact", head: true });
  const imported = count ?? 0;
  const lastPage = imported > 0 ? Math.floor(imported / PAGE_SIZE) - 1 : -1;
  return {
    last_page: lastPage,
    imported_count: imported,
    started_at: null as string | null,
  };
}

async function runListImport(
  supabase: SupabaseClient,
  mode: "service" | "rpc",
) {
  const maxPages = argValue("max-pages")
    ? Number(argValue("max-pages"))
    : Infinity;
  const state = await readListState(supabase);
  let page = Number(state.last_page ?? -1) + 1;
  let imported = Number(state.imported_count ?? 0);

  await setState(supabase, mode, {
    status: "running",
    page_size: PAGE_SIZE,
    started_at: state.started_at || new Date().toISOString(),
    error: null,
  });

  console.log(
    `[start list${LIST_ONLY ? "-only" : ""}] page=${page} size=${PAGE_SIZE} imported=${imported}`,
  );

  let pagesDone = 0;
  while (pagesDone < maxPages) {
    const result = await searchTrademarksPage({ page, size: PAGE_SIZE });
    if (!result.content.length && page > 0) {
      console.log(`[done] empty page ${page}`);
      break;
    }

    const enriched: AdliyaTrademark[] = [];
    for (const item of result.content) {
      enriched.push(await enrichIfNeeded(item));
    }

    const rows = enriched.map(mapTrademarkRow);
    const mgs = enriched.flatMap(mapMgsRows);
    await upsertBatch(supabase, mode, rows, mgs);

    imported += rows.length;
    pagesDone += 1;

    await setState(supabase, mode, {
      last_page: page,
      total_elements: result.totalElements,
      total_pages: result.totalPages,
      imported_count: imported,
      status: "running",
    });

    console.log(
      `[page ${page}/${result.totalPages}] +${rows.length} mgs=${mgs.length} (total ${imported}/${result.totalElements})`,
    );

    if (result.last || page + 1 >= result.totalPages) break;
    page += 1;
    await sleep(DELAY_MS);
  }

  await setState(supabase, mode, {
    status: LIST_ONLY ? "paused" : "done",
    finished_at: LIST_ONLY ? null : new Date().toISOString(),
  });
  console.log(`[complete list] imported=${imported}`);
}

async function runEnrichOnly(
  supabase: SupabaseClient,
  mode: "service" | "rpc",
) {
  const batchSize = Number(argValue("batch") || 50);
  const maxBatches = argValue("max-pages")
    ? Number(argValue("max-pages"))
    : Infinity;

  console.log(`[start enrich] batch=${batchSize}`);
  let batches = 0;
  let enrichedTotal = 0;

  while (batches < maxBatches) {
    const { data, error } = await supabase
      .from("trademarks")
      .select("id, number, raw")
      .or("transliteration.is.null,transliteration.eq.")
      .order("id", { ascending: false })
      .limit(batchSize);

    if (error) throw new Error(`enrich_select: ${error.message}`);
    if (!data?.length) {
      console.log("[enrich] nothing left");
      break;
    }

    const enriched: AdliyaTrademark[] = [];
    for (const row of data) {
      const appNo =
        applicationNumberFromRaw(row.raw) ||
        (typeof row.number === "string"
          ? Number(String(row.number).replace(/\D/g, ""))
          : null);
      if (!appNo) continue;
      try {
        enriched.push(await fetchTrademarkDetail(appNo));
        await sleep(DETAIL_DELAY_MS);
      } catch (e) {
        console.warn(`[enrich] ${appNo}`, e);
        await sleep(DETAIL_DELAY_MS * 3);
      }
    }

    if (enriched.length) {
      await upsertBatch(
        supabase,
        mode,
        enriched.map(mapTrademarkRow),
        enriched.flatMap(mapMgsRows),
      );
      enrichedTotal += enriched.length;
    }

    batches += 1;
    console.log(
      `[enrich batch ${batches}] +${enriched.length} (total enriched ${enrichedTotal})`,
    );
  }

  await setState(supabase, mode, {
    status: "done",
    finished_at: new Date().toISOString(),
  });
  console.log(`[complete enrich] enriched=${enrichedTotal}`);
}

async function main() {
  if (!process.env.ADLIYA_ACCESS_TOKEN?.trim()) {
    throw new Error(
      "ADLIYA_ACCESS_TOKEN is required. Log in at https://im.adliya.uz and copy Bearer token.",
    );
  }

  const { supabase, mode } = createDb();
  console.log(`[mode] ${mode} listOnly=${LIST_ONLY} enrichOnly=${ENRICH_ONLY}`);

  try {
    if (ENRICH_ONLY) {
      await runEnrichOnly(supabase, mode);
    } else {
      await runListImport(supabase, mode);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[error]", message);
    try {
      await setState(supabase, mode, {
        status: "error",
        error: message.slice(0, 2000),
      });
    } catch {
      // ignore
    }
    process.exitCode = 1;
  }
}

main();
