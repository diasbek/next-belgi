import { createServiceSupabaseClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import {
  getSessionTokenFromCookies,
  resolveSessionUserId,
} from "@/lib/auth/app-session";
import { getServiceDb } from "@/lib/db/client";

export type ProfileRole = "user" | "admin";

export interface AppUser {
  id: string;
  email: string | null;
  phone: string | null;
  profile: {
    id: string;
    full_name: string | null;
    phone: string | null;
    locale: string;
    avatar_url: string | null;
    role: ProfileRole;
    has_password: boolean;
  };
  balance: number;
  providers: {
    google: boolean;
  };
}

export async function getSessionUserId(): Promise<string | null> {
  const token = await getSessionTokenFromCookies();
  return resolveSessionUserId(token);
}

export async function getAppUser(): Promise<AppUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const db = getServiceDb();
  if (!db) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name, phone, locale, avatar_url, role, has_password")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: wallet }, { data: authUser }, { data: google }] =
    await Promise.all([
      db.from("wallets").select("balance").eq("user_id", userId).maybeSingle(),
      db.auth.admin.getUserById(userId),
      db
        .from("auth_providers")
        .select("id")
        .eq("user_id", userId)
        .eq("provider", "google")
        .maybeSingle(),
    ]);

  const email = authUser.user?.email ?? null;
  const phone =
    profile.phone ||
    (authUser.user?.phone as string | undefined) ||
    null;

  return {
    id: userId,
    email,
    phone,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone,
      locale: profile.locale ?? "uz",
      avatar_url: profile.avatar_url,
      role: (profile.role as ProfileRole) || "user",
      has_password: Boolean(profile.has_password),
    },
    balance: wallet?.balance ?? 0,
    providers: {
      google: Boolean(google),
    },
  };
}

export async function requireUser(loginPath = "/login/"): Promise<AppUser> {
  const appUser = await getAppUser();
  if (!appUser) redirect(loginPath);
  return appUser;
}

export async function requireAdmin(
  loginPath = "/login/",
  forbiddenPath = "/",
): Promise<AppUser> {
  const appUser = await requireUser(loginPath);
  if (appUser.profile.role !== "admin") redirect(forbiddenPath);
  return appUser;
}

export async function requireUserApi(): Promise<AppUser | null> {
  return getAppUser();
}

export async function requireAdminApi(): Promise<AppUser | null> {
  const appUser = await getAppUser();
  if (!appUser || appUser.profile.role !== "admin") return null;
  return appUser;
}

export function getServiceClient() {
  try {
    return createServiceSupabaseClient();
  } catch {
    return null;
  }
}

/** @deprecated use AppUser.id */
export type { AppUser as SessionAppUser };
