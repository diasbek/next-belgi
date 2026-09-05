import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  getSessionTokenFromCookies,
  revokeSessionByToken,
} from "@/lib/auth/app-session";

export async function POST() {
  const token = await getSessionTokenFromCookies();
  await revokeSessionByToken(token);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
