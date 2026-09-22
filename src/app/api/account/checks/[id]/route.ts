import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { parseLocale } from "@/i18n/config";
import {
  buildConclusionDocument,
  generateVerificationCode,
  hashConclusionPayload,
  type ConclusionDocument,
} from "@/lib/conclusion";
import type { TrademarkReport } from "@/lib/check/types";

type RouteContext = { params: Promise<{ id: string }> };

function isConclusionDoc(value: unknown): value is ConclusionDocument {
  return Boolean(
    value &&
      typeof value === "object" &&
      "verdict" in value &&
      "subject" in value &&
      "verification" in value,
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { data, error } = await db
    .from("trademark_checks")
    .select(
      "id, user_id, query, activity_raw, locale, verification_code, conclusion_doc, verification_revoked_at, created_at, report",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (data.user_id !== user.id && user.profile.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let conclusion = isConclusionDoc(data.conclusion_doc)
    ? data.conclusion_doc
    : null;
  let verificationCode =
    typeof data.verification_code === "string" && data.verification_code
      ? data.verification_code
      : null;

  // Older checks predate conclusion_doc — rebuild from stored report.
  if (!conclusion && data.report && typeof data.report === "object") {
    const locale = parseLocale(
      typeof data.locale === "string" ? data.locale : "uz",
    );
    verificationCode = verificationCode || generateVerificationCode();
    conclusion = buildConclusionDocument({
      report: data.report as TrademarkReport,
      locale,
      verificationCode,
    });

    // Best-effort persist so next download is instant.
    const payloadHash = hashConclusionPayload(conclusion);
    void db
      .from("trademark_checks")
      .update({
        verification_code: verificationCode,
        payload_hash: payloadHash,
        conclusion_doc: conclusion,
      })
      .eq("id", data.id)
      .then(({ error: upErr }) => {
        if (upErr) console.warn("[checks:backfill-conclusion]", upErr.message);
      });
  }

  if (!conclusion) {
    return NextResponse.json(
      { ok: false, error: "missing_conclusion" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    checkId: data.id,
    query: data.query,
    verificationCode,
    revoked: Boolean(data.verification_revoked_at),
    conclusion,
    createdAt: data.created_at,
  });
}
