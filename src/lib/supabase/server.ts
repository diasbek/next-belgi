/**
 * @deprecated Prefer service-role BFF. Kept only for rare anon storage URLs.
 */
export async function createServerSupabase() {
  const { createServiceSupabaseClient, isSupabaseConfigured } = await import(
    "@/lib/supabase/client"
  );
  if (!isSupabaseConfigured()) return null;
  try {
    return createServiceSupabaseClient();
  } catch {
    return null;
  }
}
