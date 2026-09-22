import type { TrademarkReport } from "@/lib/check/types";

const REPORT_STORAGE_KEY = "belgi_last_report";
const PREVIEW_STORAGE_KEY = "belgi_last_report_preview";

export function storeReport(report: TrademarkReport, preview = false) {
  try {
    sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(report));
    sessionStorage.setItem(PREVIEW_STORAGE_KEY, preview ? "1" : "0");
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

export function readStoredReportPreview(): boolean {
  try {
    return sessionStorage.getItem(PREVIEW_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearStoredReportPreview() {
  try {
    sessionStorage.setItem(PREVIEW_STORAGE_KEY, "0");
  } catch {
    // ignore
  }
}
