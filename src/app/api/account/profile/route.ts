import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { assertSameOrigin } from "@/lib/auth/csrf";

export async function PATCH(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "csrf" }, { status: 403 });
  }
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { full_name?: string; locale?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.full_name === "string") {
    patch.full_name = body.full_name.trim() || null;
  }
  if (body.locale === "uz" || body.locale === "ru") {
    patch.locale = body.locale;
  }

  const { error } = await db.from("profiles").update(patch).eq("id", user.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
