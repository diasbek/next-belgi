import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.profile.role,
      fullName: user.profile.full_name,
      locale: user.profile.locale,
      hasPassword: user.profile.has_password,
      balance: user.balance,
      providers: user.providers,
    },
  });
}
