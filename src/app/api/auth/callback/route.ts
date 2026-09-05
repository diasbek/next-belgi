/** Remove legacy Supabase OAuth callback — Google uses /api/auth/google/callback. */
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/account/";
  return NextResponse.redirect(new URL(next, url.origin));
}
