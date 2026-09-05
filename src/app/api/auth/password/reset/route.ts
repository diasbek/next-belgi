import { NextResponse } from "next/server";
import {
  attachSessionCookie,
  createAppSession,
  revokeAllUserSessions,
} from "@/lib/auth/app-session";
import { clientIp } from "@/lib/auth/csrf";
import { findUserIdByIdentity, setUserPassword } from "@/lib/auth/users";
import { verifyOtpTicket } from "@/lib/otp/ticket";

export async function POST(request: Request) {
  let body: { ticket?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const ticket = verifyOtpTicket(body.ticket || "");
  if (!ticket || ticket.purpose !== "reset") {
    return NextResponse.json({ ok: false, error: "invalid_ticket" }, { status: 400 });
  }

  const userId = await findUserIdByIdentity(ticket.destinationNorm);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  const set = await setUserPassword(userId, body.password || "");
  if ("error" in set) {
    return NextResponse.json({ ok: false, error: set.error }, { status: 400 });
  }

  await revokeAllUserSessions(userId);

  const session = await createAppSession({
    userId,
    ip: clientIp(request),
    userAgent: request.headers.get("user-agent"),
  });
  if (!session) {
    return NextResponse.json({ ok: false, error: "session_failed" }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  attachSessionCookie(res, session.token, session.expiresAt);
  return res;
}
