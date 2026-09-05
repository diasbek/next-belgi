/** Normalize UZ phone to +998XXXXXXXXX or null. */
export function normalizeUzPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("998") && local.length === 12) {
    // ok
  } else if (local.startsWith("8") && local.length === 10) {
    local = `998${local.slice(1)}`;
  } else if (local.length === 9) {
    local = `998${local}`;
  } else {
    return null;
  }
  if (!/^998\d{9}$/.test(local)) return null;
  return `+${local}`;
}

export function normalizeEmail(input: string): string | null {
  const e = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return e;
}

/** Synthetic emails for phone-only accounts — not shown as a real email. */
export function isSyntheticPhoneEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith("@phone.belgi.local");
}

export function displayAuthEmail(
  email: string | null | undefined,
): string | null {
  if (!email || isSyntheticPhoneEmail(email)) return null;
  return email;
}

export type OtpChannel = "sms" | "email";

export function detectChannel(destination: string): {
  channel: OtpChannel;
  norm: string;
} | null {
  if (destination.includes("@")) {
    const norm = normalizeEmail(destination);
    if (!norm) return null;
    return { channel: "email", norm };
  }
  const norm = normalizeUzPhone(destination);
  if (!norm) return null;
  return { channel: "sms", norm };
}

export function generateOtpCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}
