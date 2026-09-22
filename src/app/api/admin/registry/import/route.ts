import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";
import { parseAdliyaListPayload } from "@/lib/registry/parse-adliya-list";
import { importRemoteTrademarks } from "@/lib/registry/sync";

export const maxDuration = 60;

const MAX_CHUNK = 500;

/**
 * Paste/import Adliya list JSON (page wrapper or array of APPLICATION hits).
 * Client should send chunks of ≤500 items for large pastes (up to 20k).
 */
export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let body: { items?: unknown; data?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const payload =
    body.items != null
      ? body.items
      : body.data != null
        ? { data: body.data }
        : body;

  const { remotes } = parseAdliyaListPayload(payload);
  if (!remotes.length) {
    return NextResponse.json(
      { ok: false, error: "empty_or_invalid_payload" },
      { status: 400 },
    );
  }
  if (remotes.length > MAX_CHUNK) {
    return NextResponse.json(
      {
        ok: false,
        error: `chunk_too_large`,
        max: MAX_CHUNK,
        got: remotes.length,
      },
      { status: 413 },
    );
  }

  const result = await importRemoteTrademarks(db, remotes);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    imported: result.imported,
  });
}
