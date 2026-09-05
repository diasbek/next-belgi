export function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const w = window as Window & {
      ym?: (id: number, method: string, ...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
      dataLayer?: Array<Record<string, unknown>>;
    };
    w.dataLayer?.push({ event: name, ...payload });
    if (typeof w.gtag === "function") {
      w.gtag("event", name, payload);
    }
  } catch {
    // ignore analytics errors
  }
}
