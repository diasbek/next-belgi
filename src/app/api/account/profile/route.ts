import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { requireUserApi } from "@/lib/auth/session";
import { getServiceDb } from "@/lib/db/client";
import { assertSameOrigin } from "@/lib/auth/csrf";

const INTENTS = new Set(["own_brand", "agency", "lawyer", "other"]);

export async function PATCH(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "csrf" }, { status: 403 });
  }
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: {
    full_name?: string;
    locale?: string;
    company_name?: string;
    job_title?: string;
    user_intent?: string;
    complete_onboarding?: boolean;
  };
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
  if (isLocale(body.locale)) {
    patch.locale = body.locale;
  }
  if (typeof body.company_name === "string") {
    patch.company_name = body.company_name.trim() || null;
  }
  if (typeof body.job_title === "string") {
    patch.job_title = body.job_title.trim() || null;
  }
  if (typeof body.user_intent === "string") {
    const intent = body.user_intent.trim();
    if (intent && !INTENTS.has(intent)) {
      return NextResponse.json({ ok: false, error: "invalid_intent" }, { status: 400 });
    }
    patch.user_intent = intent || null;
  }
  if (body.complete_onboarding) {
    patch.onboarding_completed_at = new Date().toISOString();
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "empty_patch" }, { status: 400 });
  }

  const { error } = await db.from("profiles").update(patch).eq("id", user.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
