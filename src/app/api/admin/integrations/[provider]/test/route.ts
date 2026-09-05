import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/session";
import { getIntegration } from "@/lib/integrations/store";
import {
  getModuleCatalog,
  isIntegrationProvider,
} from "@/lib/integrations/types";
import { testEskizConnection } from "@/lib/notifications/eskiz";
import { testResendConnection } from "@/lib/notifications/resend";
import { testTelegramConnection } from "@/lib/notifications/telegram";
import { testGoogleConnection } from "@/lib/auth/google";

type Ctx = { params: Promise<{ provider: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { provider: raw } = await ctx.params;
  if (!isIntegrationProvider(raw)) {
    return NextResponse.json({ ok: false, error: "invalid_provider" }, { status: 400 });
  }

  const cfg = await getIntegration(raw);
  if (!cfg) {
    return NextResponse.json({ ok: false, error: "provider_not_configured" });
  }

  const catalog = getModuleCatalog(raw);
  const mode =
    (cfg as { mode?: string }).mode || catalog.defaultMode;

  switch (raw) {
    case "eskiz":
      if (mode !== "live") return NextResponse.json({ ok: true, mode });
      return NextResponse.json(await testEskizConnection());
    case "resend":
      if (mode !== "live") return NextResponse.json({ ok: true, mode });
      return NextResponse.json(await testResendConnection());
    case "telegram":
      return NextResponse.json(await testTelegramConnection());
    case "google":
      if (mode !== "live") return NextResponse.json({ ok: true, mode });
      return NextResponse.json(await testGoogleConnection());
    case "openai": {
      if (mode === "mock") return NextResponse.json({ ok: true, mode: "mock" });
      const openai = await getIntegration("openai");
      if (!openai?.api_key) {
        return NextResponse.json({ ok: false, error: "provider_not_configured" });
      }
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openai.api_key}` },
      });
      return NextResponse.json(
        res.ok ? { ok: true } : { ok: false, error: `openai_${res.status}` },
      );
    }
    case "payme":
    case "click":
      if (mode === "dev") return NextResponse.json({ ok: true, mode: "dev" });
      return NextResponse.json({ ok: true, mode });
    case "adliya":
      if (mode !== "live") return NextResponse.json({ ok: true, mode });
      return NextResponse.json({ ok: true, mode });
    default:
      return NextResponse.json({ ok: false, error: "unsupported" }, { status: 400 });
  }
}
