import { createHmac, timingSafeEqual } from "crypto";
import { otpPepper } from "@/lib/crypto/hash";

const TICKET_TTL_MS = 15 * 60 * 1000;

export type OtpPurpose = "register" | "login" | "link" | "reset";

function sign(payload: string): string {
  return createHmac("sha256", otpPepper()).update(payload).digest("base64url");
}

export function issueOtpTicket(params: {
  challengeId: string;
  purpose: OtpPurpose;
  destinationNorm: string;
  channel: "sms" | "email";
  userId?: string | null;
}): string {
  const exp = Date.now() + TICKET_TTL_MS;
  const payload = [
    params.challengeId,
    params.purpose,
    params.destinationNorm,
    params.channel,
    params.userId || "",
    String(exp),
  ].join("|");
  return Buffer.from(`${payload}|${sign(payload)}`, "utf8").toString(
    "base64url",
  );
}

export function verifyOtpTicket(ticket: string): {
  challengeId: string;
  purpose: OtpPurpose;
  destinationNorm: string;
  channel: "sms" | "email";
  userId: string | null;
} | null {
  try {
    const raw = Buffer.from(ticket, "base64url").toString("utf8");
    const parts = raw.split("|");
    if (parts.length !== 7) return null;
    const [challengeId, purpose, destinationNorm, channel, userId, expStr, sig] =
      parts;
    const payload = parts.slice(0, 6).join("|");
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || exp < Date.now()) return null;
    if (!["register", "login", "link", "reset"].includes(purpose)) return null;
    if (channel !== "sms" && channel !== "email") return null;
    return {
      challengeId,
      purpose: purpose as OtpPurpose,
      destinationNorm,
      channel,
      userId: userId || null,
    };
  } catch {
    return null;
  }
}
