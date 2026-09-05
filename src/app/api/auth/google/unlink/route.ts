import { NextResponse } from "next/server";
import { unlinkGoogle } from "@/lib/auth/google";
import { requireUserApi } from "@/lib/auth/session";

export async function POST() {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await unlinkGoogle(user.id);
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
