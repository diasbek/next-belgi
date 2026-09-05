import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  makeOAuthState,
} from "@/lib/auth/google";
import { requireUserApi } from "@/lib/auth/session";
import { safeInternalNext } from "@/lib/navigation/safe-next";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "link" ? "link" : "login";
  const next = safeInternalNext(url.searchParams.get("next"), "/account/");

  let userId: string | undefined;
  if (mode === "link") {
    const user = await requireUserApi();
    if (!user) {
      const login = new URL("/login/", url.origin);
      login.searchParams.set("next", next);
      return NextResponse.redirect(login);
    }
    userId = user.id;
  }

  const state = makeOAuthState({ mode, next, userId });
  const authUrl = await buildGoogleAuthUrl({ state, mode });
  if (!authUrl) {
    const cfg = await import("@/lib/integrations/store").then((m) =>
      m.getIntegration("google"),
    );
    const error =
      cfg && (cfg.mode || "test") !== "live"
        ? "provider_test_mode"
        : "provider_not_configured";
    return NextResponse.json({ ok: false, error }, { status: 503 });
  }

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("belgi_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
