#!/usr/bin/env npx tsx
import { getServiceDb } from "../src/lib/db/client";
import { decryptSecretPayload } from "../src/lib/crypto/aes";
import { loadVaultRecord } from "../src/lib/integrations/secrets-vault";
import { invalidateIntegrationCache } from "../src/lib/integrations/store";

async function inspect(provider: string) {
  invalidateIntegrationCache();
  const db = getServiceDb();
  if (!db) throw new Error("no db");
  const { data } = await db
    .from("integration_secrets")
    .select("provider, enabled, updated_at, payload_encrypted")
    .eq("provider", provider)
    .maybeSingle();
  const vault = await loadVaultRecord(provider as never);
  let dbKeys: string[] = [];
  let vaultKeys: string[] = [];
  if (data?.payload_encrypted) {
    try {
      const p = decryptSecretPayload<Record<string, unknown>>(
        data.payload_encrypted,
      );
      dbKeys = Object.keys(p).filter((k) => {
        const v = p[k];
        return v != null && String(v).trim() !== "";
      });
    } catch (e) {
      dbKeys = [`DECRYPT_FAIL:${e instanceof Error ? e.message : e}`];
    }
  }
  if (vault?.payload_encrypted) {
    try {
      const p = decryptSecretPayload<Record<string, unknown>>(
        vault.payload_encrypted,
      );
      vaultKeys = Object.keys(p).filter((k) => {
        const v = p[k];
        return v != null && String(v).trim() !== "";
      });
    } catch (e) {
      vaultKeys = [`DECRYPT_FAIL:${e instanceof Error ? e.message : e}`];
    }
  }
  console.log(
    provider,
    JSON.stringify({
      dbRow: Boolean(data),
      dbKeys,
      vault: Boolean(vault),
      vaultKeys,
      updated_at: data?.updated_at ?? vault?.updated_at ?? null,
    }),
  );
}

async function main() {
  for (const p of [
    "eskiz",
    "openai",
    "resend",
    "adliya",
    "telegram",
    "ipaustralia",
    "euipo",
  ]) {
    await inspect(p);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
