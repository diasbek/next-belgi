import { NextResponse, type NextRequest } from "next/server";

/**
 * Custom belgi_session — no Supabase Auth cookies in the browser.
 * Full validation happens in requireUser / resolveSessionUserIdFromRequest.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  return { response, request };
}
