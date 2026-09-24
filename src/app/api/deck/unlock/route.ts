import { NextResponse } from "next/server";
import {
  DECK_COOKIE,
  deckCookieOptions,
  deckUnlockToken,
  isValidDeckPassword,
} from "@/lib/deck/auth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!isValidDeckPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "invalid_password" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DECK_COOKIE, deckUnlockToken(), deckCookieOptions());
  return res;
}
