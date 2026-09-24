import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import {
  getExternalProvider,
  searchExternalJurisdiction,
} from "@/lib/check/external";
import type { JurisdictionCode } from "@/lib/check/jurisdictions";

const EXPLORE_CODES = ["eu", "us", "au"] as const;
type ExploreCode = (typeof EXPLORE_CODES)[number];

function isExploreCode(v: unknown): v is ExploreCode {
  return typeof v === "string" && (EXPLORE_CODES as readonly string[]).includes(v);
}

function parseNiceClasses(raw: unknown): number[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: number[] = [];
  for (const item of raw) {
    const n = typeof item === "number" ? item : Number(item);
    if (Number.isInteger(n) && n >= 1 && n <= 45) out.push(n);
  }
  return out.length ? [...new Set(out)].sort((a, b) => a - b) : undefined;
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  if (!isExploreCode(b.jurisdiction)) {
    return NextResponse.json(
      { ok: false, error: "invalid_jurisdiction" },
      { status: 400 },
    );
  }

  const query = typeof b.query === "string" ? b.query.trim() : "";
  if (!query || query.length > 200) {
    return NextResponse.json({ ok: false, error: "invalid_query" }, { status: 400 });
  }

  const limitRaw = typeof b.limit === "number" ? b.limit : Number(b.limit);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(50, Math.max(1, Math.floor(limitRaw)))
    : 20;

  const niceClasses = parseNiceClasses(b.niceClasses);
  const skipCache = b.skipCache !== false;
  const jurisdiction = b.jurisdiction as JurisdictionCode;
  const provider = getExternalProvider(jurisdiction);

  const result = await searchExternalJurisdiction(jurisdiction, query, {
    niceClasses,
    limit,
    skipCache,
  });

  return NextResponse.json({
    ok: true,
    jurisdiction,
    query,
    unavailable: Boolean(result.unavailable),
    fetchedAt: result.fetchedAt ?? new Date().toISOString(),
    fromCache: Boolean(result.fromCache),
    matches: result.matches.slice(0, limit),
    meta: {
      providerId: provider?.id ?? null,
      count: result.matches.length,
      limit,
      niceClasses: niceClasses ?? [],
      skipCache,
    },
  });
}
