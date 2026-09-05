import { NextResponse, type NextRequest } from "next/server";
import { getCanonicalRedirectFromHeaders } from "@/utils/seo/canonical-request";
import { stripLocalePrefix } from "@/i18n/paths";
import { SESSION_COOKIE } from "@/lib/auth/app-session";
import { getServiceDb } from "@/lib/db/client";
import { hashSessionToken } from "@/lib/crypto/hash";

function isProtectedPath(path: string) {
  return (
    path === "/account" ||
    path.startsWith("/account/") ||
    path === "/admin" ||
    path.startsWith("/admin/")
  );
}

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

async function resolveProxyAuth(request: NextRequest): Promise<{
  userId: string | null;
  role: string | null;
}> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { userId: null, role: null };

  let tokenHash: string;
  try {
    tokenHash = hashSessionToken(token);
  } catch {
    return { userId: null, role: null };
  }

  const db = getServiceDb();
  if (!db) {
    // Soft-pass if DB not configured in proxy env — pages will 503/redirect
    return { userId: "unknown", role: null };
  }

  const { data: session } = await db
    .from("app_sessions")
    .select("user_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!session || session.revoked_at) return { userId: null, role: null };
  if (new Date(session.expires_at).getTime() < Date.now()) {
    return { userId: null, role: null };
  }

  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", session.user_id)
    .maybeSingle();

  return {
    userId: session.user_id as string,
    role: (profile?.role as string) ?? null,
  };
}

/**
 * 1. Custom belgi_session gate for /account and /admin
 * 2. Canonical URL + locale cookie
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/uz" ||
    pathname === "/uz/" ||
    pathname.startsWith("/uz/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/uz" || pathname === "/uz/"
        ? "/"
        : pathname.replace(/^\/uz/, "") || "/";
    if (!url.pathname.endsWith("/") && !url.pathname.includes(".")) {
      url.pathname = `${url.pathname}/`;
    }
    return NextResponse.redirect(url, 308);
  }

  if (!pathname.startsWith("/_next")) {
    const canonical = getCanonicalRedirectFromHeaders(
      request.headers,
      request.nextUrl,
    );
    if (canonical) {
      return NextResponse.redirect(canonical, 308);
    }
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { path } = stripLocalePrefix(pathname);
  const russian =
    pathname === "/ru" || pathname === "/ru/" || pathname.startsWith("/ru/");

  if (isProtectedPath(path) && !pathname.startsWith("/api")) {
    const { userId, role } = await resolveProxyAuth(request);
    if (!userId) {
      const login = request.nextUrl.clone();
      login.pathname = russian ? "/ru/login/" : "/login/";
      login.searchParams.set(
        "next",
        `${pathname}${request.nextUrl.search || ""}`,
      );
      return NextResponse.redirect(login);
    }

    if (isAdminPath(path) && userId !== "unknown" && role !== "admin") {
      const home = request.nextUrl.clone();
      home.pathname = russian ? "/ru/" : "/";
      home.search = "";
      return NextResponse.redirect(home);
    }
  }

  response.headers.set("x-html-lang", russian ? "ru" : "uz");

  if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    response.cookies.set("belgi_locale", russian ? "ru" : "uz", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/", "/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
