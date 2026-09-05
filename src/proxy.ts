import { NextResponse, type NextRequest } from "next/server";
import { getCanonicalRedirectFromHeaders } from "@/utils/seo/canonical-request";

/**
 * 1. One-hop 308 to the canonical URL (https apex, trailing slash).
 * 2. Legacy /uz → unprefixed (UZ is default).
 * 3. Set x-html-lang + locale cookie (/ru → ru, else uz).
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

  const requestHeaders = new Headers(request.headers);
  const russian =
    pathname === "/ru" || pathname === "/ru/" || pathname.startsWith("/ru/");
  requestHeaders.set("x-html-lang", russian ? "ru" : "uz");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

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
  matcher: ["/", "/((?!_next/|favicon.ico).*)"],
};
