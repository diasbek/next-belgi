import { getIntegration } from "@/lib/integrations/store";
import { randomToken } from "@/lib/crypto/hash";
import { getServiceDb } from "@/lib/db/client";
import {
  createUserWithPassword,
  findUserIdByEmail,
  siteUrl,
} from "@/lib/auth/users";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

export async function getGoogleRedirectUri(): Promise<string> {
  const cfg = await getIntegration("google");
  if (cfg?.redirect_uri) return cfg.redirect_uri;
  return `${siteUrl()}/api/auth/google/callback/`;
}

export async function buildGoogleAuthUrl(params: {
  state: string;
  mode: "login" | "link";
}): Promise<string | null> {
  const cfg = await getIntegration("google");
  if (!cfg?.client_id || !cfg.client_secret) return null;
  if ((cfg.mode || "test") !== "live") return null;
  const redirectUri = await getGoogleRedirectUri();
  const url = new URL(GOOGLE_AUTH);
  url.searchParams.set("client_id", cfg.client_id);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", params.state);
  return url.toString();
}

export async function isGoogleLiveConfigured(): Promise<boolean> {
  const cfg = await getIntegration("google");
  return Boolean(
    cfg?.client_id &&
      cfg.client_secret &&
      (cfg.mode || "test") === "live",
  );
}

export function makeOAuthState(payload: {
  mode: "login" | "link";
  next?: string;
  userId?: string;
}): string {
  const raw = JSON.stringify({
    ...payload,
    n: randomToken(8),
  });
  return Buffer.from(raw, "utf8").toString("base64url");
}

export function parseOAuthState(state: string): {
  mode: "login" | "link";
  next?: string;
  userId?: string;
} | null {
  try {
    const json = JSON.parse(
      Buffer.from(state, "base64url").toString("utf8"),
    ) as {
      mode?: string;
      next?: string;
      userId?: string;
    };
    if (json.mode !== "login" && json.mode !== "link") return null;
    return {
      mode: json.mode,
      next: json.next,
      userId: json.userId,
    };
  } catch {
    return null;
  }
}

export async function exchangeGoogleCode(code: string): Promise<{
  email: string;
  emailVerified: boolean;
  sub: string;
  name?: string;
  picture?: string;
} | null> {
  const cfg = await getIntegration("google");
  if (!cfg?.client_id || !cfg.client_secret) return null;
  const redirectUri = await getGoogleRedirectUri();

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return null;
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return null;

  const infoRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) return null;
  const info = (await infoRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
    picture?: string;
  };
  if (!info.sub || !info.email) return null;
  return {
    sub: info.sub,
    email: info.email.toLowerCase(),
    emailVerified:
      info.email_verified === true || info.email_verified === "true",
    name: info.name,
    picture: info.picture,
  };
}

export async function resolveGoogleLogin(info: {
  email: string;
  emailVerified: boolean;
  sub: string;
  name?: string;
}): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  if (!info.emailVerified) {
    return { ok: false, error: "google_email_required" };
  }

  const db = getServiceDb();
  if (!db) return { ok: false, error: "db_unavailable" };

  const { data: existingProvider } = await db
    .from("auth_providers")
    .select("user_id")
    .eq("provider", "google")
    .eq("provider_user_id", info.sub)
    .maybeSingle();

  if (existingProvider?.user_id) {
    return { ok: true, userId: existingProvider.user_id as string };
  }

  const byEmail = await findUserIdByEmail(info.email);
  if (byEmail) {
    // Auto-link verified Google to existing account with same email
    const { error } = await db.from("auth_providers").insert({
      user_id: byEmail,
      provider: "google",
      provider_user_id: info.sub,
      email: info.email,
    });
    if (error && !/duplicate|unique/i.test(error.message)) {
      return { ok: false, error: error.message };
    }
    return { ok: true, userId: byEmail };
  }

  // Create new user (random password; has_password false)
  const created = await createUserWithPassword({
    email: info.email,
    password: randomToken(24),
    fullName: info.name || null,
  });
  if ("error" in created) return { ok: false, error: created.error };

  await db
    .from("profiles")
    .update({ has_password: false })
    .eq("id", created.userId);

  await db.from("auth_providers").insert({
    user_id: created.userId,
    provider: "google",
    provider_user_id: info.sub,
    email: info.email,
  });

  return { ok: true, userId: created.userId };
}

export async function linkGoogleToUser(
  userId: string,
  info: { email: string; emailVerified: boolean; sub: string },
): Promise<{ ok: true } | { error: string }> {
  if (!info.emailVerified) return { error: "google_email_required" };
  const db = getServiceDb();
  if (!db) return { error: "db_unavailable" };

  const { data: taken } = await db
    .from("auth_providers")
    .select("user_id")
    .eq("provider", "google")
    .eq("provider_user_id", info.sub)
    .maybeSingle();

  if (taken && taken.user_id !== userId) {
    return { error: "provider_taken" };
  }

  const emailOwner = await findUserIdByEmail(info.email);
  if (emailOwner && emailOwner !== userId) {
    return { error: "email_belongs_other" };
  }

  const { error } = await db.from("auth_providers").upsert(
    {
      user_id: userId,
      provider: "google",
      provider_user_id: info.sub,
      email: info.email,
    },
    { onConflict: "provider,provider_user_id" },
  );
  if (error) return { error: error.message };
  return { ok: true };
}

export async function unlinkGoogle(
  userId: string,
): Promise<{ ok: true } | { error: string }> {
  const db = getServiceDb();
  if (!db) return { error: "db_unavailable" };

  const { data: profile } = await db
    .from("profiles")
    .select("has_password")
    .eq("id", userId)
    .maybeSingle();

  const { data: providers } = await db
    .from("auth_providers")
    .select("id")
    .eq("user_id", userId);

  const methods =
    (profile?.has_password ? 1 : 0) + (providers?.length ?? 0);

  if (methods <= 1) {
    return { error: "last_auth_method" };
  }

  const { error } = await db
    .from("auth_providers")
    .delete()
    .eq("user_id", userId)
    .eq("provider", "google");
  if (error) return { error: error.message };
  return { ok: true };
}

export async function testGoogleConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cfg = await getIntegration("google");
  if (!cfg) return { ok: false, error: "provider_not_configured" };
  if (!cfg.client_id || !cfg.client_secret) {
    return { ok: false, error: "provider_not_configured" };
  }
  return { ok: true };
}
