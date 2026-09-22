import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import type { ConclusionDocument } from "@/lib/conclusion";

type RouteContext = { params: Promise<{ id: string }> };

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
      "id, user_id, query, verification_code, conclusion_doc, verification_revoked_at, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (data.user_id !== user.id && user.profile.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    checkId: data.id,
    query: data.query,
    verificationCode: data.verification_code,
    revoked: Boolean(data.verification_revoked_at),
    conclusion: data.conclusion_doc as ConclusionDocument | null,
    createdAt: data.created_at,
  });
}
