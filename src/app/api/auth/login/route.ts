import { NextResponse } from "next/server";
import {
  attachSessionCookie,
  createAppSession,
} from "@/lib/auth/app-session";
import { clientIp } from "@/lib/auth/csrf";
import { verifyPasswordLogin } from "@/lib/auth/users";

export async function POST(request: Request) {
  let body: { identity?: string; email?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const identity = (body.identity || body.email || "").trim();
  const password = body.password || "";
  if (!identity || password.length < 6) {
    return NextResponse.json(
      { ok: false, error: "invalid_credentials" },
      { status: 400 },
    );
  }

  const result = await verifyPasswordLogin({ identity, password });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  const session = await createAppSession({
    userId: result.userId,
    ip: clientIp(request),
    userAgent: request.headers.get("user-agent"),
  });
  if (!session) {
    return NextResponse.json({ ok: false, error: "session_failed" }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true, userId: result.userId });
  attachSessionCookie(res, session.token, session.expiresAt);
  return res;
}
