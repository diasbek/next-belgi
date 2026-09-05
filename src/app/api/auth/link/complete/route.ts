import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { linkEmailToUser, linkPhoneToUser, setUserPassword } from "@/lib/auth/users";
import { verifyOtpTicket } from "@/lib/otp/ticket";

export async function POST(request: Request) {
  const user = await requireUserApi();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { ticket?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const ticket = verifyOtpTicket(body.ticket || "");
  if (!ticket || ticket.purpose !== "link") {
    return NextResponse.json({ ok: false, error: "invalid_ticket" }, { status: 400 });
  }
  if (ticket.userId && ticket.userId !== user.id) {
    return NextResponse.json({ ok: false, error: "invalid_ticket" }, { status: 400 });
  }

  if (ticket.channel === "email") {
    const linked = await linkEmailToUser(user.id, ticket.destinationNorm);
    if ("error" in linked) {
      return NextResponse.json({ ok: false, error: linked.error }, { status: 409 });
    }
  } else {
    const linked = await linkPhoneToUser(user.id, ticket.destinationNorm);
    if ("error" in linked) {
      return NextResponse.json({ ok: false, error: linked.error }, { status: 409 });
    }
  }

  if (body.password && body.password.length >= 6) {
    await setUserPassword(user.id, body.password);
  }

  return NextResponse.json({ ok: true });
}
