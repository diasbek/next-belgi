import {
  decryptSecretPayload,
  encryptSecretPayload,
  hasSecretsMasterKey,
} from "@/lib/crypto/aes";
import { getServiceDb } from "@/lib/db/client";
import {
  getModuleCatalog,
  type IntegrationPayloadMap,
  type IntegrationProvider,
  type IntegrationStatus,
  isIntegrationProvider,
  isPayloadConfigured,
  maskPayload,
  resolveMode,
} from "./types";

type CacheEntry = {
  at: number;
  enabled: boolean;
  payload: Record<string, unknown> | null;
  updated_at: string | null;
};

const cache = new Map<IntegrationProvider, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function envFallback(
  provider: IntegrationProvider,
): Record<string, unknown> | null {
  const catalog = getModuleCatalog(provider);
  // Credentials from env bootstrap, but mode stays silent catalog default.
  // Live/sandbox only when explicitly saved via Admin Integrations.
  const silent = catalog.defaultMode;
  switch (provider) {
    case "eskiz": {
      const email = process.env.ESKIZ_EMAIL?.trim();
      const password = process.env.ESKIZ_PASSWORD?.trim();
      if (!email || !password) return null;
      return {
        mode: silent,
        email,
        password,
        from: process.env.ESKIZ_FROM?.trim() || "Belgi",
        base_url:
          process.env.ESKIZ_BASE_URL?.trim() ||
          "https://notify.eskiz.uz/api",
      };
    }
    case "openai": {
      const api_key = process.env.OPENAI_API_KEY?.trim();
      if (!api_key) return null;
      return {
        mode: silent,
        api_key,
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
      };
    }
    case "resend": {
      const api_key = process.env.RESEND_API_KEY?.trim();
      if (!api_key) return null;
      return {
        mode: silent,
        api_key,
        from:
          process.env.RESEND_FROM?.trim() ||
          "Belgi.ai <onboarding@resend.dev>",
        notify_to:
          process.env.RESEND_NOTIFY_TO?.trim() ||
          process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
          "",
      };
    }
    case "payme": {
      const merchant_id = process.env.PAYME_MERCHANT_ID?.trim();
      const key = process.env.PAYME_KEY?.trim();
      if (!merchant_id || !key) return null;
      return { mode: silent, merchant_id, key };
    }
    case "click": {
      const merchant_id = process.env.CLICK_MERCHANT_ID?.trim();
      const service_id = process.env.CLICK_SERVICE_ID?.trim();
      const secret_key = process.env.CLICK_SECRET_KEY?.trim();
      if (!merchant_id || !service_id || !secret_key) return null;
      return { mode: silent, merchant_id, service_id, secret_key };
    }
    case "google": {
      const client_id = process.env.GOOGLE_CLIENT_ID?.trim();
      const client_secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
      if (!client_id || !client_secret) return null;
      return {
        mode: silent,
        client_id,
        client_secret,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI?.trim() || "",
      };
    }
    case "telegram": {
      const bot_token = process.env.TELEGRAM_BOT_TOKEN?.trim();
      const chat_id = process.env.TELEGRAM_CHAT_ID?.trim();
      if (!bot_token || !chat_id) return null;
      return { mode: silent, bot_token, chat_id };
    }
    case "adliya": {
      const access_token = process.env.ADLIYA_ACCESS_TOKEN?.trim();
      if (!access_token) return null;
      return {
        mode: silent,
        access_token,
        api_base:
          process.env.ADLIYA_API_BASE?.trim() || "https://api-ip.adliya.uz",
      };
    }
    default:
      return { mode: silent };
  }
}

function defaultSoftPayload(
  provider: IntegrationProvider,
): Record<string, unknown> {
  const catalog = getModuleCatalog(provider);
  return { mode: catalog.defaultMode };
}

async function loadFromDb(
  provider: IntegrationProvider,
): Promise<CacheEntry | null> {
  const db = getServiceDb();
  if (!db) return null;
  const { data, error } = await db
    .from("integration_secrets")
    .select("payload_encrypted, enabled, updated_at")
    .eq("provider", provider)
    .maybeSingle();
  if (error || !data) return null;
  try {
    const payload = decryptSecretPayload<Record<string, unknown>>(
      data.payload_encrypted,
    );
    return {
      at: Date.now(),
      enabled: data.enabled !== false,
      payload,
      updated_at: data.updated_at ?? null,
    };
  } catch {
    return {
      at: Date.now(),
      enabled: false,
      payload: null,
      updated_at: data.updated_at ?? null,
    };
  }
}

async function resolveEntry(
  provider: IntegrationProvider,
): Promise<CacheEntry> {
  const now = Date.now();
  let entry = cache.get(provider);
  if (entry && now - entry.at <= CACHE_TTL_MS) return entry;

  entry = (await loadFromDb(provider)) ?? {
    at: now,
    enabled: true,
    payload: null,
    updated_at: null,
  };

  if (!entry.payload) {
    entry = {
      ...entry,
      payload: envFallback(provider) ?? defaultSoftPayload(provider),
    };
  } else if (!entry.payload.mode) {
    entry = {
      ...entry,
      payload: {
        ...entry.payload,
        mode: getModuleCatalog(provider).defaultMode,
      },
    };
  }

  cache.set(provider, entry);
  return entry;
}

export function invalidateIntegrationCache(provider?: IntegrationProvider) {
  if (provider) cache.delete(provider);
  else cache.clear();
}

export async function getIntegration<P extends IntegrationProvider>(
  provider: P,
): Promise<IntegrationPayloadMap[P] | null> {
  const entry = await resolveEntry(provider);
  if (!entry.enabled) return null;
  if (!isPayloadConfigured(provider, entry.payload)) return null;
  return entry.payload as IntegrationPayloadMap[P];
}

export async function getIntegrationStatus(
  provider: IntegrationProvider,
): Promise<IntegrationStatus> {
  const entry = await resolveEntry(provider);
  const payload = entry.payload ?? defaultSoftPayload(provider);
  return {
    provider,
    configured: isPayloadConfigured(provider, entry.payload),
    enabled: entry.enabled !== false,
    mode: resolveMode(provider, payload),
    masked: maskPayload(provider, payload),
    updated_at: entry.updated_at,
  };
}

export async function listIntegrationStatuses(): Promise<IntegrationStatus[]> {
  const providers = [
    "eskiz",
    "openai",
    "resend",
    "payme",
    "click",
    "google",
    "telegram",
    "adliya",
  ] as const;
  return Promise.all(providers.map((p) => getIntegrationStatus(p)));
}

export async function saveIntegration(
  provider: IntegrationProvider,
  payload: Record<string, unknown>,
  opts: { enabled?: boolean; updatedBy?: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isIntegrationProvider(provider)) {
    return { ok: false, error: "invalid_provider" };
  }
  if (!hasSecretsMasterKey()) {
    return { ok: false, error: "SECRETS_MASTER_KEY_missing" };
  }
  const db = getServiceDb();
  if (!db) return { ok: false, error: "db_unavailable" };

  const existing = await loadFromDb(provider);
  const catalog = getModuleCatalog(provider);
  const merged: Record<string, unknown> = {
    mode: catalog.defaultMode,
    ...(existing?.payload ?? envFallback(provider) ?? {}),
  };
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "string" && v.trim() === "" && merged[k] && k !== "mode") {
      continue;
    }
    if (v === undefined || v === null) continue;
    merged[k] = typeof v === "string" ? v.trim() : v;
  }

  let encrypted: string;
  try {
    encrypted = encryptSecretPayload(merged);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "encrypt_failed",
    };
  }

  const { error } = await db.from("integration_secrets").upsert(
    {
      provider,
      payload_encrypted: encrypted,
      enabled: opts.enabled ?? true,
      updated_by: opts.updatedBy ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider" },
  );
  if (error) return { ok: false, error: error.message };
  invalidateIntegrationCache(provider);
  return { ok: true };
}

export async function deleteIntegration(
  provider: IntegrationProvider,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getServiceDb();
  if (!db) return { ok: false, error: "db_unavailable" };
  const { error } = await db
    .from("integration_secrets")
    .delete()
    .eq("provider", provider);
  if (error) return { ok: false, error: error.message };
  invalidateIntegrationCache(provider);
  return { ok: true };
}
