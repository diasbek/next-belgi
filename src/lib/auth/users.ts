import { getServiceDb } from "@/lib/db/client";
import {
  detectChannel,
  normalizeEmail,
  normalizeUzPhone,
} from "@/lib/otp/normalize";

function authAdminHeaders(): { url: string; headers: Record<string, string> } | null {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return {
    url: url.replace(/\/$/, ""),
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  };
}

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const norm = normalizeEmail(email);
  if (!norm) return null;

  const admin = authAdminHeaders();
  if (admin) {
    const res = await fetch(
      `${admin.url}/auth/v1/admin/users?email=${encodeURIComponent(norm)}`,
      { headers: admin.headers },
    );
    if (res.ok) {
      const json = (await res.json()) as {
        users?: Array<{ id: string; email?: string }>;
        id?: string;
      };
      if (json.id) return json.id;
      const match = json.users?.find(
        (u) => u.email?.toLowerCase() === norm,
      );
      if (match) return match.id;
    }
  }

  const db = getServiceDb();
  if (!db) return null;
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !data?.users) return null;
  return data.users.find((u) => u.email?.toLowerCase() === norm)?.id ?? null;
}

export async function findUserIdByPhone(phone: string): Promise<string | null> {
  const db = getServiceDb();
  if (!db) return null;
  const norm = normalizeUzPhone(phone);
  if (!norm) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("phone", norm)
    .maybeSingle();
  if (profile?.id) return profile.id as string;

  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !data?.users) return null;
  const found = data.users.find((u) => {
    const p = (u.phone || "").replace(/\s/g, "");
    return p === norm || p === norm.replace("+", "") || `+${p}` === norm;
  });
  return found?.id ?? null;
}

export async function findUserIdByIdentity(
  destination: string,
): Promise<string | null> {
  const detected = detectChannel(destination);
  if (!detected) return null;
  if (detected.channel === "email") return findUserIdByEmail(detected.norm);
  return findUserIdByPhone(detected.norm);
}

export async function createUserWithPassword(params: {
  email?: string | null;
  phone?: string | null;
  password: string;
  fullName?: string | null;
  locale?: string;
  hasPassword?: boolean;
}): Promise<{ userId: string } | { error: string }> {
  const db = getServiceDb();
  if (!db) return { error: "db_unavailable" };

  const email = params.email ? normalizeEmail(params.email) : null;
  const phone = params.phone ? normalizeUzPhone(params.phone) : null;
  if (!email && !phone) return { error: "invalid_destination" };
  if (params.password.length < 6) return { error: "weak_password" };

  const authEmail =
    email || `${phone!.replace("+", "")}@phone.belgi.local`;

  const { data, error } = await db.auth.admin.createUser({
    email: authEmail,
    password: params.password,
    email_confirm: true,
    phone: phone || undefined,
    phone_confirm: Boolean(phone),
    user_metadata: {
      full_name: params.fullName || undefined,
      locale: params.locale || "uz",
      phone_only: !email,
    },
  });

  if (error || !data.user) {
    const msg = error?.message || "create_failed";
    if (/already|registered|exists/i.test(msg)) {
      return { error: "identity_taken" };
    }
    return { error: msg };
  }

  const hasPassword = params.hasPassword !== false;
  await db
    .from("profiles")
    .update({
      has_password: hasPassword,
      phone,
      full_name: params.fullName || null,
      locale: params.locale === "ru" ? "ru" : "uz",
    })
    .eq("id", data.user.id);

  return { userId: data.user.id };
}

export async function setUserPassword(
  userId: string,
  password: string,
): Promise<{ ok: true } | { error: string }> {
  const db = getServiceDb();
  if (!db) return { error: "db_unavailable" };
  if (password.length < 6) return { error: "weak_password" };
  const { error } = await db.auth.admin.updateUserById(userId, { password });
  if (error) return { error: error.message };
  await db.from("profiles").update({ has_password: true }).eq("id", userId);
  return { ok: true };
}

export async function verifyPasswordLogin(params: {
  identity: string;
  password: string;
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const db = getServiceDb();
  if (!db) return { ok: false, error: "db_unavailable" };

  const detected = detectChannel(params.identity);
  if (!detected) return { ok: false, error: "invalid_credentials" };

  let email: string | null = null;
  let userId: string | null = null;

  if (detected.channel === "email") {
    email = detected.norm;
    userId = await findUserIdByEmail(email);
  } else {
    userId = await findUserIdByPhone(detected.norm);
    if (userId) {
      const { data } = await db.auth.admin.getUserById(userId);
      email = data.user?.email ?? null;
    }
  }

  if (!userId || !email) {
    return { ok: false, error: "invalid_credentials" };
  }

  const { data: profile } = await db
    .from("profiles")
    .select("has_password")
    .eq("id", userId)
    .maybeSingle();

  if (profile && profile.has_password === false) {
    return { ok: false, error: "password_not_set" };
  }

  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !anon) return { ok: false, error: "auth_unavailable" };

  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify({ email, password: params.password }),
  });

  if (!res.ok) {
    return { ok: false, error: "invalid_credentials" };
  }

  return { ok: true, userId };
}

export async function linkPhoneToUser(
  userId: string,
  phone: string,
): Promise<{ ok: true } | { error: string }> {
  const db = getServiceDb();
  if (!db) return { error: "db_unavailable" };
  const norm = normalizeUzPhone(phone);
  if (!norm) return { error: "invalid_destination" };

  const taken = await findUserIdByPhone(norm);
  if (taken && taken !== userId) return { error: "identity_taken" };

  const { error } = await db.auth.admin.updateUserById(userId, {
    phone: norm,
    phone_confirm: true,
  });
  if (error) return { error: error.message };
  await db.from("profiles").update({ phone: norm }).eq("id", userId);
  return { ok: true };
}

export async function linkEmailToUser(
  userId: string,
  email: string,
): Promise<{ ok: true } | { error: string }> {
  const db = getServiceDb();
  if (!db) return { error: "db_unavailable" };
  const norm = normalizeEmail(email);
  if (!norm) return { error: "invalid_destination" };

  const taken = await findUserIdByEmail(norm);
  if (taken && taken !== userId) return { error: "identity_taken" };

  const { error } = await db.auth.admin.updateUserById(userId, {
    email: norm,
    email_confirm: true,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function countAuthMethods(userId: string): Promise<number> {
  const db = getServiceDb();
  if (!db) return 0;
  const { data: profile } = await db
    .from("profiles")
    .select("has_password")
    .eq("id", userId)
    .maybeSingle();
  const { data: providers } = await db
    .from("auth_providers")
    .select("id")
    .eq("user_id", userId);

  let n = 0;
  if (profile?.has_password) n += 1;
  n += providers?.length ?? 0;
  return n;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
  ).replace(/\/$/, "");
}
