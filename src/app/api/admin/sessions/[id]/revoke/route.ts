import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import { revokeSessionById } from "@/lib/auth/app-session";

export async function POST(
  _request: Request,
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

  const ok = await revokeSessionById(id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "revoke_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
