import { NextResponse } from "next/server";
import { getServiceDb } from "@/lib/db/client";
import type { ConclusionDocument, VerifyResponse } from "@/lib/conclusion";
import type { Locale } from "@/i18n/config";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { code: raw } = await context.params;
  const code = (raw || "").trim().toUpperCase();

  if (!code || code.length < 6) {
    const body: VerifyResponse = { ok: false, status: "not_found" };
    return NextResponse.json(body, { status: 404 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json(
      { ok: false, status: "not_found", error: "db_unavailable" },
      { status: 503 },
    );
  }

  const { data, error } = await db
    .from("trademark_checks")
    .select(
      "verification_code, payload_hash, conclusion_doc, verification_revoked_at, locale",
    )
    .eq("verification_code", code)
    .maybeSingle();

  if (error || !data) {
    const body: VerifyResponse = { ok: false, status: "not_found" };
    return NextResponse.json(body, { status: 404 });
  }

  if (data.verification_revoked_at) {
    const body: VerifyResponse = { ok: false, status: "revoked" };
    return NextResponse.json(body, { status: 410 });
  }

  const doc = data.conclusion_doc as ConclusionDocument | null;
  const hash = typeof data.payload_hash === "string" ? data.payload_hash : "";

  const body: VerifyResponse = {
    ok: true,
    status: "valid",
    subject: doc?.subject
      ? {
          mark: doc.subject.mark,
          markType: doc.subject.markType,
          niceClasses: doc.subject.niceClasses,
        }
      : undefined,
    verdict: doc?.verdict?.byClass,
    issuedAt: doc?.issuedAt,
    reportAt: doc?.reportAt,
    docNumber: doc?.docNumber,
    hashPrefix: hash ? hash.slice(0, 12) : undefined,
    locale: (data.locale as Locale) || doc?.locale || "uz",
  };

  return NextResponse.json(body);
}
