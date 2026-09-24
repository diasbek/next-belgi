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
 *   Admin → Integrations → Adliya (access_token in Supabase), OR ADLIYA_ACCESS_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  OR  (anon key + BELGI_IMPORT_SECRET)
 *   SECRETS_MASTER_KEY (to decrypt Admin secrets)
 */

import { createClient } from "@supabase/supabase-js";
import { runRegistrySync } from "../src/lib/registry/sync";
import { createRegistryProvider } from "../src/lib/registry/provider";
import { getIntegration } from "../src/lib/integrations/store";

function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  const adliya = await getIntegration("adliya");
  const token =
    adliya?.access_token?.trim() ||
    process.env.ADLIYA_ACCESS_TOKEN?.trim() ||
    "";
  if (!token) {
    throw new Error(
      "Adliya access_token missing. Set it in Admin → Integrations (preferred) or ADLIYA_ACCESS_TOKEN.",
    );
  }

  const apiBase =
    adliya?.api_base?.trim() ||
    process.env.ADLIYA_API_BASE?.trim() ||
    undefined;

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
    token,
    apiBase,
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
