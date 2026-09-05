import { hashOtpCode } from "@/lib/crypto/hash";
import { getServiceDb, serviceDbUnavailableError } from "@/lib/db/client";
import { getIntegration } from "@/lib/integrations/store";
import { TEST_OTP_CODE } from "@/lib/integrations/types";
import { sendEskizSms } from "@/lib/notifications/eskiz";
import { sendOtpEmail } from "@/lib/notifications/resend";
import {
  detectChannel,
  generateOtpCode,
  type OtpChannel,
} from "@/lib/otp/normalize";
import {
  issueOtpTicket,
  type OtpPurpose,
  verifyOtpTicket,
} from "@/lib/otp/ticket";

const OTP_TTL_MS = 10 * 60 * 1000;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRate(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

async function isChannelTestMode(channel: OtpChannel): Promise<boolean> {
  if (channel === "sms") {
    const cfg = await getIntegration("eskiz");
    return (cfg?.mode || "test") === "test";
  }
  const cfg = await getIntegration("resend");
  return (cfg?.mode || "test") === "test";
}

export async function sendOtp(params: {
  destination: string;
  purpose: OtpPurpose;
  locale?: string;
  ip?: string;
  userId?: string | null;
}): Promise<
  | { ok: true; channel: OtpChannel; challengeId: string; testMode?: boolean }
  | { ok: false; error: string; status: number }
> {
  const detected = detectChannel(params.destination);
  if (!detected) {
    return { ok: false, error: "invalid_destination", status: 400 };
  }

  const rateKey = `${params.purpose}:${detected.norm}:${params.ip || ""}`;
  if (!checkRate(rateKey, 5, 15 * 60_000)) {
    return { ok: false, error: "rate_limited", status: 429 };
  }

  const db = getServiceDb();
  if (!db) {
    return { ok: false, error: serviceDbUnavailableError(), status: 503 };
  }

  const testMode = await isChannelTestMode(detected.channel);
  const code = testMode ? TEST_OTP_CODE : generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const { data, error } = await db
    .from("otp_challenges")
    .insert({
      channel: detected.channel,
      destination: params.destination.trim(),
      destination_norm: detected.norm,
      purpose: params.purpose,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
      ip: params.ip ?? null,
      user_id: params.userId ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message || "otp_create_failed",
      status: 500,
    };
  }

  if (testMode) {
    console.info("[otp:test]", {
      channel: detected.channel,
      destination: detected.norm,
      code: TEST_OTP_CODE,
    });
    return {
      ok: true,
      channel: detected.channel,
      challengeId: data.id,
      testMode: true,
    };
  }

  const locale = params.locale || "uz";
  if (detected.channel === "sms") {
    const msg =
      locale === "ru"
        ? `Belgi.ai: код подтверждения ${code}`
        : `Belgi.ai: tasdiqlash kodi ${code}`;
    const sent = await sendEskizSms({ phone: detected.norm, message: msg });
    if (!sent.ok) {
      return { ok: false, error: sent.error, status: 503 };
    }
  } else {
    const sent = await sendOtpEmail(detected.norm, code, locale);
    if (!sent.ok) {
      return { ok: false, error: sent.error, status: 503 };
    }
  }

  return { ok: true, channel: detected.channel, challengeId: data.id };
}

export async function verifyOtp(params: {
  destination: string;
  code: string;
  purpose: OtpPurpose;
  userId?: string | null;
}): Promise<
  | { ok: true; ticket: string; channel: OtpChannel; destinationNorm: string }
  | { ok: false; error: string; status: number }
> {
  const detected = detectChannel(params.destination);
  if (!detected) {
    return { ok: false, error: "invalid_destination", status: 400 };
  }

  const db = getServiceDb();
  if (!db) {
    return { ok: false, error: serviceDbUnavailableError(), status: 503 };
  }

  const { data: rows } = await db
    .from("otp_challenges")
    .select("*")
    .eq("destination_norm", detected.norm)
    .eq("purpose", params.purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const row = rows?.[0];
  if (!row) return { ok: false, error: "otp_not_found", status: 400 };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "otp_expired", status: 400 };
  }
  if (row.attempts >= row.max_attempts) {
    return { ok: false, error: "otp_locked", status: 400 };
  }

  const testMode = await isChannelTestMode(detected.channel);
  const code = params.code.trim();
  const ok =
    hashOtpCode(code) === row.code_hash ||
    (testMode && code === TEST_OTP_CODE);

  await db
    .from("otp_challenges")
    .update({
      attempts: row.attempts + 1,
      ...(ok
        ? {
            verified_at: new Date().toISOString(),
            consumed_at: new Date().toISOString(),
          }
        : {}),
    })
    .eq("id", row.id);

  if (!ok) return { ok: false, error: "otp_invalid", status: 400 };

  let ticket: string;
  try {
    ticket = issueOtpTicket({
      challengeId: row.id,
      purpose: params.purpose,
      destinationNorm: detected.norm,
      channel: detected.channel,
      userId: params.userId ?? row.user_id,
    });
  } catch {
    return { ok: false, error: "OTP_PEPPER_missing", status: 503 };
  }

  return {
    ok: true,
    ticket,
    channel: detected.channel,
    destinationNorm: detected.norm,
  };
}

export { verifyOtpTicket, issueOtpTicket };
export type { OtpPurpose };
