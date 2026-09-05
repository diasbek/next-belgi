import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { setUserPassword } from "@/lib/auth/users";

/**
 * @deprecated Prefer POST /api/auth/password/set after OTP verify creates a session.
 * Kept as session-authenticated password set for older clients.
 */
export async function POST(request: Request) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { password?: string; ticket?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const result = await setUserPassword(user.id, body.password || "");
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
