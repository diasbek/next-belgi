import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hmacSha256Hex(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function otpPepper(): string {
  const p = process.env.OTP_PEPPER?.trim() || process.env.SESSION_SECRET?.trim();
  if (!p) throw new Error("OTP_PEPPER_missing");
  return p;
}

export function sessionSecret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (!s) throw new Error("SESSION_SECRET_missing");
  return s;
}

export function hashOtpCode(code: string): string {
  return sha256Hex(`${otpPepper()}:${code.trim()}`);
}

export function hashSessionToken(token: string): string {
  return sha256Hex(`${sessionSecret()}:${token}`);
}
