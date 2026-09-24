/**
 * Fallback vault for office API secrets when `integration_secrets_provider_check`
 * on the remote DB has not been expanded yet (migration 20260923190000).
 * Uses a private Storage bucket; same AES ciphertext as the DB column.
 */
import { getServiceDb } from "@/lib/db/client";
import type { IntegrationProvider } from "./types";

const BUCKET = "integration-secrets";
const OFFICE_PROVIDERS = new Set<IntegrationProvider>([
  "euipo",
  "uspto",
  "ipaustralia",
  "kazpatent",
]);

export function isOfficeVaultProvider(provider: IntegrationProvider): boolean {
  return OFFICE_PROVIDERS.has(provider);
}

function objectPath(provider: IntegrationProvider): string {
  return `providers/${provider}.json`;
}

export type VaultRecord = {
  payload_encrypted: string;
  enabled: boolean;
  updated_at: string;
  updated_by?: string | null;
};

async function ensureBucket(): Promise<boolean> {
  const db = getServiceDb();
  if (!db) return false;
  const { data: buckets } = await db.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET || b.id === BUCKET)) return true;
  const { error } = await db.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 65_536,
    allowedMimeTypes: ["application/json", "text/plain", "application/octet-stream"],
  });
  if (error && !/already exists|Duplicate/i.test(error.message)) {
    console.warn("[secrets-vault] createBucket", error.message);
    return false;
  }
  return true;
}

export async function loadVaultRecord(
  provider: IntegrationProvider,
): Promise<VaultRecord | null> {
  if (!isOfficeVaultProvider(provider)) return null;
  const db = getServiceDb();
  if (!db) return null;
  const { data, error } = await db.storage
    .from(BUCKET)
    .download(objectPath(provider));
  if (error || !data) return null;
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as VaultRecord;
    if (!parsed?.payload_encrypted) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveVaultRecord(
  provider: IntegrationProvider,
  record: VaultRecord,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isOfficeVaultProvider(provider)) {
    return { ok: false, error: "vault_provider_unsupported" };
  }
  const db = getServiceDb();
  if (!db) return { ok: false, error: "db_unavailable" };
  if (!(await ensureBucket())) {
    return { ok: false, error: "vault_bucket_unavailable" };
  }
  const body = JSON.stringify(record);
  const { error } = await db.storage
    .from(BUCKET)
    .upload(objectPath(provider), body, {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteVaultRecord(
  provider: IntegrationProvider,
): Promise<void> {
  if (!isOfficeVaultProvider(provider)) return;
  const db = getServiceDb();
  if (!db) return;
  await db.storage.from(BUCKET).remove([objectPath(provider)]);
}

export function isProviderCheckConstraintError(message: string): boolean {
  return /integration_secrets_provider_check|23514/i.test(message);
}
