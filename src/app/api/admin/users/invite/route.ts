import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";
import { createUserWithPassword } from "@/lib/auth/users";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: {
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password ?? "";
  if (!email || password.length < 6) {
    return NextResponse.json({ ok: false, error: "invalid_params" }, { status: 400 });
  }

  const role = body.role === "admin" ? "admin" : "user";

  const created = await createUserWithPassword({
    email,
    password,
    fullName: body.fullName?.trim() || null,
  });

  if ("error" in created) {
    return NextResponse.json({ ok: false, error: created.error }, { status: 400 });
  }

  if (role === "admin") {
    const service = getServiceClient();
    if (service) {
      await service
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", created.userId);
    }
  }

  return NextResponse.json({ ok: true, userId: created.userId });
}
