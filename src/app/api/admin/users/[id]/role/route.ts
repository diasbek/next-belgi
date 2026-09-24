import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

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

  let body: { role?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (
    body.role !== "user" &&
    body.role !== "admin" &&
    body.role !== "attorney" &&
    body.role !== "org_admin"
  ) {
    return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
  }

  if (id === admin.id && body.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "cannot_demote_self" },
      { status: 400 },
    );
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { error } = await service
    .from("profiles")
    .update({ role: body.role })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, role: body.role });
}
