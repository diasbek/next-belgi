import { createHash } from "crypto";
import { getIntegration } from "@/lib/integrations/store";

export type PaymentProvider = "payme" | "click";

export type PaymentRuntimeMode = "live" | "sandbox" | "dev";

export interface CheckoutPlan {
  id: string;
  code: string;
  credits: number;
  price_uzs: number;
  title_uz: string;
  title_ru: string;
}

export async function getPaymentMode(
  provider: PaymentProvider,
): Promise<PaymentRuntimeMode> {
  const cfg = await getIntegration(provider);
  if (!cfg) return "dev";
  const mode = (cfg as { mode?: string }).mode;
  if (provider === "payme") {
    if (mode === "sandbox" || mode === "live" || mode === "dev") return mode;
    return "dev";
  }
  if (mode === "live" || mode === "dev") return mode;
  return "dev";
}

export async function paymentsConfigured(
  provider: PaymentProvider,
): Promise<boolean> {
  const cfg = await getIntegration(provider);
  return Boolean(cfg);
}

export async function buildPaymeCheckoutUrl(params: {
  paymentId: string;
  amountUzs: number;
  returnUrl: string;
}): Promise<string | null> {
  const cfg = await getIntegration("payme");
  if (!cfg?.merchant_id) return null;
  const mode = await getPaymentMode("payme");
  if (mode === "dev") return null;

  const amountTiyin = params.amountUzs * 100;
  const payload = Buffer.from(
    `m=${cfg.merchant_id};ac.order_id=${params.paymentId};a=${amountTiyin};c=${params.returnUrl}`,
  ).toString("base64");
  const host =
    mode === "sandbox"
      ? "https://checkout.test.paycom.uz"
      : "https://checkout.paycom.uz";
  return `${host}/${payload}`;
}

export async function buildClickCheckoutUrl(params: {
  paymentId: string;
  amountUzs: number;
  returnUrl: string;
}): Promise<string | null> {
  const cfg = await getIntegration("click");
  if (!cfg?.merchant_id || !cfg.service_id) return null;
  const mode = await getPaymentMode("click");
  if (mode === "dev") return null;

  const url = new URL("https://my.click.uz/services/pay");
  url.searchParams.set("service_id", cfg.service_id);
  url.searchParams.set("merchant_id", cfg.merchant_id);
  url.searchParams.set("amount", String(params.amountUzs));
  url.searchParams.set("transaction_param", params.paymentId);
  url.searchParams.set("return_url", params.returnUrl);
  return url.toString();
}

export async function verifyClickSign(parts: {
  clickTransId: string;
  serviceId: string;
  merchantTransId: string;
  amount: string;
  action: string;
  signTime: string;
  signString: string;
}): Promise<boolean> {
  const cfg = await getIntegration("click");
  if (!cfg?.secret_key) return false;
  const raw = `${parts.clickTransId}${parts.serviceId}${cfg.secret_key}${parts.merchantTransId}${parts.amount}${parts.action}${parts.signTime}`;
  const expected = createHash("md5").update(raw).digest("hex");
  return expected.toLowerCase() === parts.signString.toLowerCase();
}

export async function verifyPaymeAuthHeader(
  authorization: string | null,
): Promise<boolean> {
  const cfg = await getIntegration("payme");
  if (!cfg?.key || !authorization?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(authorization.slice(6), "base64").toString(
    "utf8",
  );
  const expected = `Paycom:${cfg.key}`;
  return decoded === expected || decoded === `Paycom:${cfg.key}`;
}

export type PaymeRpcRequest = {
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
};

export function paymeError(
  id: number | string | undefined,
  code: number,
  message: string,
) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message: { ru: message, uz: message, en: message } },
  };
}

export function paymeResult(id: number | string | undefined, result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}
