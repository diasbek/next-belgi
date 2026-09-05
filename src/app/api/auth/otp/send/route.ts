import { NextResponse } from "next/server";
import { clientIp } from "@/lib/auth/csrf";
import { sendOtp, type OtpPurpose } from "@/lib/otp/service";
import { requireUserApi } from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: {
    destination?: string;
    purpose?: OtpPurpose;
    locale?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const purpose = body.purpose || "register";
  if (!["register", "login", "link", "reset"].includes(purpose)) {
    return NextResponse.json({ ok: false, error: "invalid_purpose" }, { status: 400 });
  }

  let userId: string | null = null;
  if (purpose === "link") {
    const user = await requireUserApi();
    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  const result = await sendOtp({
    destination: body.destination || "",
    purpose,
    locale: body.locale,
    ip: clientIp(request),
    userId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    channel: result.channel,
    challengeId: result.challengeId,
    testMode: Boolean(result.testMode),
    testCode: result.testMode ? "00000" : undefined,
  });
}
