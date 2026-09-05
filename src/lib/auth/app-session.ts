import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  hashSessionToken,
  randomToken,
  sessionSecret,
} from "@/lib/crypto/hash";
import { getServiceDb } from "@/lib/db/client";

export const SESSION_COOKIE = "belgi_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SLIDE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export async function createAppSession(params: {
  userId: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{ token: string; expiresAt: Date } | null> {
  try {
    sessionSecret();
  } catch {
    return null;
  }
  const db = getServiceDb();
  if (!db) return null;

  const token = randomToken(32);
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const { error } = await db.from("app_sessions").insert({
    user_id: params.userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    ip: params.ip ?? null,
    user_agent: params.userAgent ?? null,
  });
  if (error) {
    console.error("[session:create]", error.message);
    return null;
  }
  return { token, expiresAt };
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
) {
  response.cookies.set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(
      Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
    ),
  );
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
}

export async function resolveSessionUserId(
  token: string | undefined | null,
): Promise<string | null> {
  if (!token) return null;
  let tokenHash: string;
  try {
    tokenHash = hashSessionToken(token);
  } catch {
    return null;
  }
  const db = getServiceDb();
  if (!db) return null;

  const { data } = await db
    .from("app_sessions")
    .select("id, user_id, expires_at, revoked_at, last_seen_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!data || data.revoked_at) return null;
  const expires = new Date(data.expires_at).getTime();
  if (expires < Date.now()) return null;

  const lastSeen = new Date(data.last_seen_at).getTime();
  if (Date.now() - lastSeen > SLIDE_THRESHOLD_MS) {
    const newExpires = new Date(Date.now() + SESSION_TTL_MS);
    await db
      .from("app_sessions")
      .update({
        last_seen_at: new Date().toISOString(),
        expires_at: newExpires.toISOString(),
      })
      .eq("id", data.id);
  } else {
    await db
      .from("app_sessions")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  return data.user_id as string;
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function revokeSessionByToken(
  token: string | undefined | null,
): Promise<void> {
  if (!token) return;
  let tokenHash: string;
  try {
    tokenHash = hashSessionToken(token);
  } catch {
    return;
  }
  const db = getServiceDb();
  if (!db) return;
  await db
    .from("app_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("revoked_at", null);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  const db = getServiceDb();
  if (!db) return;
  await db
    .from("app_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);
}

/** Lightweight check for proxy: cookie present + session row valid. */
export async function resolveSessionUserIdFromRequest(
  cookieHeader: string | null,
): Promise<{ userId: string | null; role: string | null }> {
  if (!cookieHeader) return { userId: null, role: null };
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`),
  );
  const token = match?.[1] ? decodeURIComponent(match[1]) : null;
  const userId = await resolveSessionUserId(token);
  if (!userId) return { userId: null, role: null };

  const db = getServiceDb();
  if (!db) return { userId, role: null };
  const { data } = await db
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return { userId, role: (data?.role as string) ?? null };
}
