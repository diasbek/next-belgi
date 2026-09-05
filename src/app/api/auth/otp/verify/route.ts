import { NextResponse } from "next/server";
import { verifyOtp, type OtpPurpose } from "@/lib/otp/service";
import { requireUserApi } from "@/lib/auth/session";
import {
  attachSessionCookie,
  createAppSession,
} from "@/lib/auth/app-session";
import { clientIp } from "@/lib/auth/csrf";
import {
  createUserWithPassword,
  findUserIdByIdentity,
} from "@/lib/auth/users";
import { randomToken } from "@/lib/crypto/hash";

export async function POST(request: Request) {
  let body: {
    destination?: string;
    code?: string;
    purpose?: OtpPurpose;
    locale?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const purpose = body.purpose || "register";
  let userId: string | null = null;
  if (purpose === "link") {
    const user = await requireUserApi();
    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  const result = await verifyOtp({
    destination: body.destination || "",
    code: body.code || "",
    purpose,
    userId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }

  // Register: create user + session immediately; password set later under session
  if (purpose === "register") {
    const existing = await findUserIdByIdentity(result.destinationNorm);
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "identity_taken" },
        { status: 409 },
      );
    }

    const created = await createUserWithPassword({
      email: result.channel === "email" ? result.destinationNorm : null,
      phone: result.channel === "sms" ? result.destinationNorm : null,
      password: randomToken(24),
      locale: body.locale,
      hasPassword: false,
    });
    if ("error" in created) {
      const status = created.error === "identity_taken" ? 409 : 400;
      return NextResponse.json({ ok: false, error: created.error }, { status });
    }

    const session = await createAppSession({
      userId: created.userId,
      ip: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "session_failed" },
        { status: 503 },
      );
    }

    const res = NextResponse.json({
      ok: true,
      session: true,
      needsPassword: true,
      channel: result.channel,
      destinationNorm: result.destinationNorm,
      userId: created.userId,
    });
    attachSessionCookie(res, session.token, session.expiresAt);
    return res;
  }

  return NextResponse.json({
    ok: true,
    ticket: result.ticket,
    channel: result.channel,
    destinationNorm: result.destinationNorm,
  });
}
