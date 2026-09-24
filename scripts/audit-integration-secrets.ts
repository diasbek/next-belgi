#!/usr/bin/env npx tsx
import {
  getIntegration,
  getIntegrationStatus,
  saveIntegration,
} from "../src/lib/integrations/store";
import { encryptSecretPayload } from "../src/lib/crypto/aes";
import { getServiceDb } from "../src/lib/db/client";

const providers = [
  "eskiz",
  "openai",
  "resend",
  "payme",
  "click",
  "google",
  "telegram",
  "adliya",
  "euipo",
  "uspto",
  "ipaustralia",
] as const;

async function main() {
  console.log("=== integration_secrets (masked) ===");
  for (const p of providers) {
    const s = await getIntegrationStatus(p);
    console.log(
      p.padEnd(12),
      JSON.stringify({
        configured: s.configured,
        enabled: s.enabled,
        mode: s.mode,
        keys: Object.keys(s.masked || {}),
      }),
    );
  }

  if (process.argv.includes("--clean-ipaustralia-legacy")) {
    const cur = await getIntegration("ipaustralia");
    if (!cur) throw new Error("ipaustralia_missing");
    const clean: Record<string, unknown> = {
      mode: cur.mode || "test",
      test_client_id: cur.test_client_id || cur.client_id,
      test_client_secret:
        cur.test_client_secret || cur.client_secret || cur.api_key,
      live_client_id: cur.live_client_id,
      live_client_secret: cur.live_client_secret,
    };
    // Drop empty
    for (const [k, v] of Object.entries(clean)) {
      if (v == null || v === "") delete clean[k];
    }
    const db = getServiceDb();
    if (!db) throw new Error("db_unavailable");
    const encrypted = encryptSecretPayload(clean);
    const { error } = await db.from("integration_secrets").upsert(
      {
        provider: "ipaustralia",
        payload_encrypted: encrypted,
        enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" },
    );
    if (error) throw new Error(error.message);
    // also clear cache via save noop
    await saveIntegration("ipaustralia", { mode: String(clean.mode) }, {
      enabled: true,
    });
    const s = await getIntegrationStatus("ipaustralia");
    console.log("cleaned_ipaustralia", JSON.stringify(s.masked));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
