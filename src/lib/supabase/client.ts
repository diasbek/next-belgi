import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function env(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() || undefined;
}

/** Prefer server-only SUPABASE_URL; fall back to public for bootstrap. */
function getSupabaseUrlInternal(): string | undefined {
  return env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
}

function getAnonKey(): string | undefined {
  return (
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  );
}

function getServiceRoleKey(): string | undefined {
  return env("SUPABASE_SERVICE_ROLE_KEY");
}

export const SUPABASE_STORAGE_BUCKET =
  process.env["SUPABASE_STORAGE_BUCKET"]?.trim() || "images";

export function getSupabaseUrl(): string | undefined {
  return getSupabaseUrlInternal();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrlInternal() && getServiceRoleKey());
}

/** @deprecated Browser clients are not used; BFF session only. */
export function createBrowserSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrlInternal();
  const anonKey = getAnonKey();
  if (!url || !anonKey) {
    throw new Error("Supabase public keys are not configured");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Server-only client with service role.
 * Bypasses RLS — use only in Route Handlers / Server Actions / BFF.
 */
export function createServiceSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrlInternal();
  const serviceKey = getServiceRoleKey();
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getPublicStorageUrl(path: string): string | null {
  const url = getSupabaseUrlInternal();
  if (!url) return null;
  const clean = path.replace(/^\/+/, "");
  return `${url}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${clean}`;
}
