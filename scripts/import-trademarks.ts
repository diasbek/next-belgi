/**
 * Import Adliya trademarks into local Belgi registry (SoT).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --max-pages=2
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --list-only
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --enrich-only
 *   npx tsx --env-file=.env.local scripts/import-trademarks.ts --start-page=10
 *
 * Requires:
 *   ADLIYA_ACCESS_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  OR  (anon key + BELGI_IMPORT_SECRET)
 */

import { createClient } from "@supabase/supabase-js";
import { runRegistrySync } from "../src/lib/registry/sync";
import { createRegistryProvider } from "../src/lib/registry/provider";

function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  if (!process.env.ADLIYA_ACCESS_TOKEN?.trim()) {
    throw new Error(
      "ADLIYA_ACCESS_TOKEN is required. Log in at https://im.adliya.uz and copy Bearer token.",
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const key = serviceKey || anon;
  if (!key) {
    throw new Error(
      "Need SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  const db = createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const provider = createRegistryProvider({
    token: process.env.ADLIYA_ACCESS_TOKEN,
    apiBase: process.env.ADLIYA_API_BASE,
  });

  const listOnly = argFlag("list-only");
  const enrichOnly = argFlag("enrich-only");
  const maxPages = argValue("max-pages")
    ? Number(argValue("max-pages"))
    : enrichOnly
      ? 20
      : Infinity;
  const startPage = argValue("start-page")
    ? Number(argValue("start-page"))
    : undefined;
  const pageSize = Number(process.env.ADLIYA_PAGE_SIZE || 25);

  console.log(
    `[registry sync] enrich=${enrichOnly} listOnly=${listOnly} maxPages=${maxPages}`,
  );

  const result = await runRegistrySync({
    db,
    provider,
    mode: enrichOnly ? "enrich" : "page",
    maxPages: Number.isFinite(maxPages) ? maxPages : 10_000,
    pageSize,
    startPage,
    listOnly,
  });

  if (!result.ok) {
    console.error("[error]", result.error);
    process.exitCode = 1;
    return;
  }
  console.log(
    `[complete] imported=${result.imported} pages=${result.pages}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
