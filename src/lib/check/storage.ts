import type { TrademarkReport } from "@/lib/check/types";

const REPORT_STORAGE_KEY = "belgi_last_report";

export function storeReport(report: TrademarkReport) {
  try {
    sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
  } catch {
    // ignore
  }
}

export function readStoredReport(): TrademarkReport | null {
  try {
    const raw = sessionStorage.getItem(REPORT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TrademarkReport;
  } catch {
    return null;
  }
}
