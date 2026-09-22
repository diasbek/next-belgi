import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import { updateLeadStatus } from "@/lib/db";
import type { LeadStatus } from "@/lib/db/types";

const STATUSES: LeadStatus[] = ["new", "sent", "failed"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.status || !STATUSES.includes(body.status as LeadStatus)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }

  const ok = await updateLeadStatus(id, body.status as LeadStatus);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: body.status });
}
