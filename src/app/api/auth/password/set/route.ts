import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { setUserPassword } from "@/lib/auth/users";

/** Set / replace password for the current belgi_session user. */
export async function POST(request: Request) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const password = body.password || "";
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "weak_password" }, { status: 400 });
  }

  const result = await setUserPassword(user.id, password);
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
