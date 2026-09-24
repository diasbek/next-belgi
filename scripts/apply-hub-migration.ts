#!/usr/bin/env npx tsx
/**
 * Apply multi-jurisdiction hub migration to the linked Supabase project.
 *
 * Requires one of:
 *   DATABASE_URL / SUPABASE_DB_URL  — direct Postgres connection string
 *   SUPABASE_ACCESS_TOKEN + project ref — Management API SQL endpoint
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/apply-hub-migration.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SQL_PATH = resolve(
  process.cwd(),
  "supabase/migrations/20260923190000_multi_jurisdiction_hub.sql",
);

async function viaDatabaseUrl(url: string, sql: string) {
  const { default: pg } = await import("pg").catch(() => ({ default: null }));
  if (!pg) {
    console.error("Install pg: npm i -D pg @types/pg");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log("OK — applied via DATABASE_URL");
  } finally {
    await client.end();
  }
}

async function viaManagementApi(token: string, ref: string, sql: string) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.error("Management API failed", res.status, text.slice(0, 500));
    process.exit(1);
  }
  console.log("OK — applied via Management API");
}

async function main() {
  const sql = readFileSync(SQL_PATH, "utf8");
  const dbUrl =
    process.env.DATABASE_URL?.trim() ||
    process.env.SUPABASE_DB_URL?.trim() ||
    "";
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim() || "";
  const ref =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([a-z0-9]+)\.supabase\.co/,
    )?.[1] ||
    "";

  if (dbUrl) {
    await viaDatabaseUrl(dbUrl, sql);
    return;
  }
  if (token && ref) {
    await viaManagementApi(token, ref, sql);
    return;
  }
  console.error(`Missing credentials.

Set either:
  DATABASE_URL=postgresql://postgres:PASSWORD@db.${ref || "PROJECT"}.supabase.co:5432/postgres
or:
  SUPABASE_ACCESS_TOKEN=sbp_...  (Account → Access Tokens)
  SUPABASE_PROJECT_REF=${ref || "yfslkvdnnlbbuqriyfcu"}

Or paste ${SQL_PATH} into:
  https://supabase.com/dashboard/project/${ref || "yfslkvdnnlbbuqriyfcu"}/sql/new
`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
