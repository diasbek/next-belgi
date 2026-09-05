import { getIntegration } from "@/lib/integrations/store";
import { insertNotificationLog } from "@/lib/db";

let eskizTokenCache: { token: string; exp: number } | null = null;

async function getEskizToken(): Promise<string | null> {
  const cfg = await getIntegration("eskiz");
  if (!cfg) return null;
  if ((cfg.mode || "test") !== "live") return null;
  if (!cfg.email || !cfg.password) return null;
  if (eskizTokenCache && eskizTokenCache.exp > Date.now() + 60_000) {
    return eskizTokenCache.token;
  }
  const base = (cfg.base_url || "https://notify.eskiz.uz/api").replace(
    /\/$/,
    "",
  );
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: cfg.email, password: cfg.password }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { token?: string } };
  const token = json.data?.token;
  if (!token) return null;
  eskizTokenCache = { token, exp: Date.now() + 25 * 24 * 60 * 60 * 1000 };
  return token;
}

export async function sendEskizSms(params: {
  phone: string;
  message: string;
}): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const cfg = await getIntegration("eskiz");
  if (!cfg) return { ok: false, error: "provider_not_configured" };

  if ((cfg.mode || "test") !== "live") {
    console.info("[eskiz:silent]", {
      phone: params.phone,
      message: params.message.slice(0, 80),
    });
    await insertNotificationLog({
      provider: "eskiz",
      kind: "otp",
      destination: params.phone,
      status: "sent",
      providerMessageId: null,
      meta: { silent: true, mode: cfg.mode || "test" },
    });
    return { ok: true, messageId: "silent" };
  }

  const token = await getEskizToken();
  if (!token) return { ok: false, error: "eskiz_auth_failed" };

  const base = (cfg.base_url || "https://notify.eskiz.uz/api").replace(
    /\/$/,
    "",
  );
  const phone = params.phone.replace(/^\+/, "");
  const form = new URLSearchParams();
  form.set("mobile_phone", phone);
  form.set("message", params.message);
  form.set("from", cfg.from || "4546");

  const res = await fetch(`${base}/message/sms/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const text = await res.text();
  let messageId: string | undefined;
  try {
    const json = JSON.parse(text) as { id?: string | number; message?: string };
    messageId = json.id != null ? String(json.id) : undefined;
  } catch {
    /* ignore */
  }

  await insertNotificationLog({
    provider: "eskiz",
    kind: "otp",
    destination: params.phone,
    status: res.ok ? "sent" : "failed",
    providerMessageId: messageId ?? null,
    meta: { status: res.status, body: text.slice(0, 500) },
  });

  if (!res.ok) return { ok: false, error: `eskiz_${res.status}` };
  return { ok: true, messageId };
}

export async function testEskizConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cfg = await getIntegration("eskiz");
  if (!cfg) return { ok: false, error: "provider_not_configured" };
  if ((cfg.mode || "test") !== "live") return { ok: true };
  const token = await getEskizToken();
  if (!token) return { ok: false, error: "eskiz_auth_failed" };
  return { ok: true };
}
