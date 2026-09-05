import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import { listIntegrationStatuses } from "@/lib/integrations/store";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const items = await listIntegrationStatuses();
  return NextResponse.json({ ok: true, items });
}
