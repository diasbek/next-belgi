import {
  createServiceSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

export function isServiceDbConfigured(): boolean {
  return Boolean(
    isSupabaseConfigured() && process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim(),
  );
}

export function getServiceDb() {
  if (!isServiceDbConfigured()) return null;
  try {
    return createServiceSupabaseClient();
  } catch {
    return null;
  }
}

/** Stable error code when service DB client cannot be created. */
export function serviceDbUnavailableError(): "service_role_missing" | "db_unavailable" {
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim()) {
    return "service_role_missing";
  }
  return "db_unavailable";
}
