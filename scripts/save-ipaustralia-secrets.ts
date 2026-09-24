#!/usr/bin/env npx tsx
/**
 * Save IP Australia OAuth credentials (test and/or live) into integration_secrets.
 * Reads JSON from stdin. Never logs secrets.
 *
 * Example:
 *   echo '{"mode":"test","test_client_id":"...","test_client_secret":"...","live_client_id":"...","live_client_secret":"..."}' | \
 *     npx tsx --env-file=.env.local scripts/save-ipaustralia-secrets.ts
 */
import {
  getIntegration,
  getIntegrationStatus,
  saveIntegration,
} from "../src/lib/integrations/store";

async function main() {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) throw new Error("stdin_empty");

  const parsed = JSON.parse(raw) as Record<string, string | undefined>;
  const mode = (parsed.mode || "test").trim();
  if (mode !== "test" && mode !== "live" && mode !== "mock") {
    throw new Error("invalid_mode");
  }

  const existing = (await getIntegration("ipaustralia")) ?? {};
  const patch: Record<string, string> = { mode };

  // Migrate legacy single pair → test_* if missing
  const legacyId = String(existing.client_id || "").trim();
  const legacySecret = String(
    existing.client_secret || existing.api_key || "",
  ).trim();
  if (
    legacyId &&
    legacySecret &&
    !String(existing.test_client_id || "").trim()
  ) {
    patch.test_client_id = legacyId;
    patch.test_client_secret = legacySecret;
  }

  for (const key of [
    "test_client_id",
    "test_client_secret",
    "live_client_id",
    "live_client_secret",
  ] as const) {
    const v = parsed[key]?.trim();
    if (v) patch[key] = v;
  }

  const hasTest = Boolean(
    patch.test_client_id || existing.test_client_id || legacyId,
  );
  const hasLive = Boolean(
    patch.live_client_id ||
      existing.live_client_id ||
      parsed.live_client_id,
  );
  if (mode === "test" && !hasTest && !parsed.test_client_id) {
    throw new Error("missing_test_credentials");
  }
  if (mode === "live" && !hasLive && !parsed.live_client_id) {
    throw new Error("missing_live_credentials");
  }

  const saved = await saveIntegration("ipaustralia", patch, {
    enabled: true,
    updatedBy: null,
  });
  if (!saved.ok) {
    console.error("SAVE_FAILED", saved.error);
    process.exit(1);
  }

  const status = await getIntegrationStatus("ipaustralia");
  console.log(
    JSON.stringify(
      {
        ok: true,
        provider: status.provider,
        enabled: status.enabled,
        configured: status.configured,
        mode: status.mode,
        masked: status.masked,
        updated_at: status.updated_at,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
