import { NextResponse } from "next/server";
import { getIntegration } from "@/lib/integrations/store";
import { isGoogleLiveConfigured } from "@/lib/auth/google";

/** Public capabilities for login UI (no secrets). */
export async function GET() {
  const [eskiz, resend, googleLive] = await Promise.all([
    getIntegration("eskiz"),
    getIntegration("resend"),
    isGoogleLiveConfigured(),
  ]);

  const otpTest =
    (eskiz?.mode || "test") !== "live" ||
    (resend?.mode || "test") !== "live";

  return NextResponse.json({
    ok: true,
    google: googleLive,
    otpTest,
  });
}
