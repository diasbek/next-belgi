import { getIntegration } from "@/lib/integrations/store";
import { insertNotificationLog } from "@/lib/db";

export async function sendTelegramMessage(text: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cfg = await getIntegration("telegram");
  if (!cfg) return { ok: false, error: "provider_not_configured" };

  if ((cfg.mode || "test") !== "live") {
    console.info("[telegram:silent]", text.slice(0, 500));
    await insertNotificationLog({
      provider: "telegram",
      kind: "lead",
      destination: cfg.chat_id || "test",
      status: "sent",
      providerMessageId: null,
      meta: { silent: true, mode: cfg.mode || "test" },
    });
    return { ok: true };
  }

  if (!cfg.bot_token || !cfg.chat_id) {
    return { ok: false, error: "provider_not_configured" };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${cfg.bot_token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chat_id,
        text: text.slice(0, 4000),
      }),
    },
  );

  const ok = response.ok;
  await insertNotificationLog({
    provider: "telegram",
    kind: "lead",
    destination: cfg.chat_id,
    status: ok ? "sent" : "failed",
    providerMessageId: null,
    meta: { status: response.status },
  });

  if (!ok) return { ok: false, error: `telegram_${response.status}` };
  return { ok: true };
}

export async function testTelegramConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cfg = await getIntegration("telegram");
  if (!cfg) return { ok: false, error: "provider_not_configured" };
  if ((cfg.mode || "test") !== "live") {
    return { ok: true };
  }
  if (!cfg.bot_token) return { ok: false, error: "provider_not_configured" };
  const res = await fetch(
    `https://api.telegram.org/bot${cfg.bot_token}/getMe`,
  );
  if (!res.ok) return { ok: false, error: `telegram_${res.status}` };
  return { ok: true };
}
