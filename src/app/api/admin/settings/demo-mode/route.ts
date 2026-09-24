import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import { isDemoMode, setDemoMode } from "@/lib/settings/demo-mode";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const enabled = await isDemoMode();
  return NextResponse.json({ ok: true, enabled });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: { enabled?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const enabled = Boolean(body.enabled);
  const result = await setDemoMode(enabled, admin.id);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, enabled });
}
