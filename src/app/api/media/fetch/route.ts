import { NextResponse } from "next/server";
import { ADLIYA_API_BASE } from "@/lib/adliya/types";

const ALLOWED_HOSTS = new Set([
  "api-ip.adliya.uz",
  "im.adliya.uz",
  "belgi.nocode.uz",
  "www.belgi.nocode.uz",
  "belgi.ai",
  "www.belgi.ai",
]);

function isAllowedUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (ALLOWED_HOSTS.has(u.hostname)) return u;
    // Allow configured Adliya API host
    try {
      const base = new URL(ADLIYA_API_BASE);
      if (u.hostname === base.hostname) return u;
    } catch {
      // ignore
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Same-origin image proxy so @react-pdf can embed Adliya logos (no CORS).
 * GET /api/media/fetch/?u=<encoded absolute url>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("u") || "";
  const target = isAllowedUrl(raw);
  if (!target) {
    return NextResponse.json({ ok: false, error: "forbidden_url" }, { status: 400 });
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        Accept: "image/*,*/*",
        Referer: "https://im.adliya.uz/",
        Origin: "https://im.adliya.uz",
      },
      cache: "force-cache",
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream_${res.status}` },
        { status: 502 },
      );
    }
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (e) {
    console.warn("[media:fetch]", e);
    return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
  }
}
