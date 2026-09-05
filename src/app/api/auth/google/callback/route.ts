import { NextResponse } from "next/server";
import {
  attachSessionCookie,
  createAppSession,
} from "@/lib/auth/app-session";
import { clientIp } from "@/lib/auth/csrf";
import {
  exchangeGoogleCode,
  linkGoogleToUser,
  parseOAuthState,
  resolveGoogleLogin,
} from "@/lib/auth/google";
import { safeInternalNext } from "@/lib/navigation/safe-next";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  const cookieState = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)belgi_oauth_state=([^;]+)/)?.[1];

  const fail = (reason: string, next = "/login/") => {
    const dest = new URL(safeInternalNext(next, "/login/"), url.origin);
    dest.searchParams.set("oauth_error", reason);
    const res = NextResponse.redirect(dest);
    res.cookies.set("belgi_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  };

  if (err) return fail("oauth_denied");
  if (!code || !state) return fail("oauth_denied");

  const decodedCookie = cookieState ? decodeURIComponent(cookieState) : null;
  if (!decodedCookie || decodedCookie !== state) {
    return fail("oauth_state");
  }

  const parsed = parseOAuthState(state);
  if (!parsed) return fail("oauth_state");

  const info = await exchangeGoogleCode(code);
  if (!info) return fail("oauth_denied", parsed.next || "/login/");

  if (parsed.mode === "link") {
    if (!parsed.userId) return fail("unauthorized", "/login/");
    const linked = await linkGoogleToUser(parsed.userId, info);
    if ("error" in linked) {
      return fail(linked.error, parsed.next || "/account/profile/");
    }
    const dest = new URL(
      safeInternalNext(parsed.next, "/account/profile/"),
      url.origin,
    );
    const res = NextResponse.redirect(dest);
    res.cookies.set("belgi_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  }

  const resolved = await resolveGoogleLogin(info);
  if (!resolved.ok) {
    return fail(resolved.error, parsed.next || "/login/");
  }

  const session = await createAppSession({
    userId: resolved.userId,
    ip: clientIp(request),
    userAgent: request.headers.get("user-agent"),
  });
  if (!session) return fail("session_failed", parsed.next || "/login/");

  const dest = new URL(
    safeInternalNext(parsed.next, "/account/"),
    url.origin,
  );
  const res = NextResponse.redirect(dest);
  attachSessionCookie(res, session.token, session.expiresAt);
  res.cookies.set("belgi_oauth_state", "", { path: "/", maxAge: 0 });
  return res;
}
