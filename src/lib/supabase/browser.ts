/**
 * @deprecated Do not use in the browser. Auth is BFF + belgi_session only.
 */
export function createBrowserSupabase(): never {
  throw new Error(
    "Browser Supabase client removed. Use /api/auth/* and /api/account/*",
  );
}
