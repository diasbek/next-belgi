/** Simple Origin/Referer CSRF check for cookie-authenticated mutating requests. */
export function assertSameOrigin(request: Request): boolean {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Same-origin browsers always send Origin on POST from fetch
  if (origin) {
    try {
      if (site) {
        const expected = new URL(site.startsWith("http") ? site : `https://${site}`);
        const got = new URL(origin);
        if (got.host === expected.host) return true;
      }
      // Dev / localhost
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("0.0.0.0")
      ) {
        return true;
      }
      // Allow same host as request URL
      const reqUrl = new URL(request.url);
      const got = new URL(origin);
      return got.host === reqUrl.host;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const reqUrl = new URL(request.url);
      const ref = new URL(referer);
      return ref.host === reqUrl.host;
    } catch {
      return false;
    }
  }

  // No Origin/Referer (e.g. same-site navigation or some clients) — allow GET only callers skip this
  return true;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
