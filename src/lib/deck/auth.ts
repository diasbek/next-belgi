import { sha256Hex, safeEqualHex } from "@/lib/crypto/hash";

export const DECK_COOKIE = "belgi_deck";
export const DECK_TTL_SEC = 14 * 24 * 60 * 60;

/** Default matches the investor link password; override with DECK_PASSWORD. */
function deckPassword(): string {
  return process.env.DECK_PASSWORD?.trim() || "123belgi456";
}

/** Opaque cookie value — rotating DECK_PASSWORD invalidates old cookies. */
export function deckUnlockToken(): string {
  return sha256Hex(`belgi-deck-unlock:${deckPassword()}`).slice(0, 32);
}

export function isValidDeckPassword(password: string): boolean {
  return safeEqualHex(sha256Hex(password), sha256Hex(deckPassword()));
}

export function isDeckUnlocked(cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;
  return safeEqualHex(
    sha256Hex(cookieValue),
    sha256Hex(deckUnlockToken()),
  );
}

export function deckCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/deck",
    maxAge: DECK_TTL_SEC,
  };
}
