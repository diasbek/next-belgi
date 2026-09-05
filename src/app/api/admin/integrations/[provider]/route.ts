import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import {
  deleteIntegration,
  getIntegrationStatus,
  saveIntegration,
} from "@/lib/integrations/store";
import {
  isIntegrationProvider,
  type IntegrationProvider,
} from "@/lib/integrations/types";

type Ctx = { params: Promise<{ provider: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { provider: raw } = await ctx.params;
  if (!isIntegrationProvider(raw)) {
    return NextResponse.json({ ok: false, error: "invalid_provider" }, { status: 400 });
  }
  const status = await getIntegrationStatus(raw);
  return NextResponse.json({ ok: true, status });
}

export async function PUT(request: Request, ctx: Ctx) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { provider: raw } = await ctx.params;
  if (!isIntegrationProvider(raw)) {
    return NextResponse.json({ ok: false, error: "invalid_provider" }, { status: 400 });
  }
  const provider = raw as IntegrationProvider;

  let body: { payload?: Record<string, unknown>; enabled?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const result = await saveIntegration(provider, body.payload || {}, {
    enabled: body.enabled,
    updatedBy: admin.id,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  const status = await getIntegrationStatus(provider);
  return NextResponse.json({ ok: true, status });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { provider: raw } = await ctx.params;
  if (!isIntegrationProvider(raw)) {
    return NextResponse.json({ ok: false, error: "invalid_provider" }, { status: 400 });
  }
  const result = await deleteIntegration(raw);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
