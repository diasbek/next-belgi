import { Resend } from "resend";
import { getIntegration } from "@/lib/integrations/store";
import { insertNotificationLog } from "@/lib/db";

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  text: string;
  kind?: "otp" | "lead" | "report" | "system";
}): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const cfg = await getIntegration("resend");
  if (!cfg) return { ok: false, error: "provider_not_configured" };

  if ((cfg.mode || "test") !== "live") {
    console.info("[resend:silent]", {
      to: params.to,
      subject: params.subject,
      kind: params.kind,
    });
    await insertNotificationLog({
      provider: "resend",
      kind: params.kind || "system",
      destination: params.to,
      status: "sent",
      providerMessageId: null,
      meta: { silent: true, mode: cfg.mode || "test" },
    });
    return { ok: true, messageId: "silent" };
  }

  if (!cfg.api_key) return { ok: false, error: "provider_not_configured" };

  const resend = new Resend(cfg.api_key);
  const from = cfg.from || "Belgi.ai <onboarding@resend.dev>";
  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
  });

  await insertNotificationLog({
    provider: "resend",
    kind: params.kind || "system",
    destination: params.to,
    status: error ? "failed" : "sent",
    providerMessageId: data?.id ?? null,
    meta: error ? { error: error.message } : {},
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, messageId: data?.id };
}

export async function sendOtpEmail(to: string, code: string, locale: string) {
  const subject =
    locale === "ru"
      ? `Код подтверждения Belgi.ai: ${code}`
      : `Belgi.ai tasdiqlash kodi: ${code}`;
  const text =
    locale === "ru"
      ? `Ваш код подтверждения Belgi.ai: ${code}. Действует 10 минут.`
      : `Belgi.ai tasdiqlash kodi: ${code}. 10 daqiqa amal qiladi.`;
  return sendResendEmail({ to, subject, text, kind: "otp" });
}

export async function testResendConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cfg = await getIntegration("resend");
  if (!cfg) return { ok: false, error: "provider_not_configured" };
  if ((cfg.mode || "test") !== "live") return { ok: true };
  if (!cfg.api_key) return { ok: false, error: "provider_not_configured" };
  return { ok: true };
}
