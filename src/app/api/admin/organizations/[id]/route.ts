import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";

/** Admin: activate waitlist org and optionally mint an API key. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: { activate?: boolean; createKey?: boolean; keyName?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* empty body ok */
  }

  if (body.activate !== false) {
    const { error } = await db
      .from("organizations")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  let apiKey: string | undefined;
  if (body.createKey) {
    const raw = `bg_${randomBytes(24).toString("hex")}`;
    const keyHash = createHash("sha256").update(raw).digest("hex");
    const keyPrefix = raw.slice(0, 10);
    const { error } = await db.from("org_api_keys").insert({
      org_id: id,
      name: body.keyName || "default",
      key_prefix: keyPrefix,
      key_hash: keyHash,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    apiKey = raw;
  }

  return NextResponse.json({
    ok: true,
    apiKey,
    warning: apiKey
      ? "Store the API key now — it will not be shown again."
      : undefined,
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const { data: org } = await db
    .from("organizations")
    .select("id, name, status, registries, volume_hint, contact_email, created_at")
    .eq("id", id)
    .maybeSingle();

  const { data: keys } = await db
    .from("org_api_keys")
    .select("id, name, key_prefix, rate_limit_per_min, last_used_at, revoked_at, created_at")
    .eq("org_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ org, keys: keys || [] });
}
