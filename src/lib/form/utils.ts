import type { Locale } from "@/i18n/config";

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return value.trim();
}

export const phoneRegex =
  /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$|^\+998\d{9}$/;

export function isValidUzPhone(value?: string | null) {
  return Boolean(value && phoneRegex.test(normalizePhone(value)));
}

export function createRequestId(prefix = "req") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

export function readUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]) {
    const v = params.get(key);
    if (v) utm[key] = v;
  }
  return utm;
}

export function formErrorMessage(locale: Locale) {
  return locale === "uz"
    ? "Yuborishda xato. Maʼlumotlar saqlangan — qayta urinib koʻring."
    : "Ошибка отправки. Данные сохранены — попробуйте ещё раз.";
}
