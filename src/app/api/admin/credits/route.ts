import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: { userId?: string; delta?: number; note?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.userId || typeof body.delta !== "number" || body.delta === 0) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  const params = {
    p_user_id: body.userId,
    p_delta: body.delta,
    p_note: body.note ?? null,
  };

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { data, error } = await service.rpc("admin_adjust_credits", params);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, balance: data });
}
