import type { JurisdictionCode } from "@/lib/check/jurisdictions";
import {
  isJurisdictionCode,
  normalizeJurisdictions,
} from "@/lib/check/jurisdictions";

const KEY = "belgi_check_jurisdictions";

const OPTIONAL: JurisdictionCode[] = ["eu", "us", "au", "kz"];

export function readJurisdictions(): JurisdictionCode[] {
  if (typeof window === "undefined") return normalizeJurisdictions([]);
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return normalizeJurisdictions([]);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return normalizeJurisdictions([]);
    return normalizeJurisdictions(
      parsed.filter((x): x is string => typeof x === "string"),
    );
  } catch {
    return normalizeJurisdictions([]);
  }
}

export function storeJurisdictions(codes: JurisdictionCode[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(normalizeJurisdictions(codes)));
}

export function optionalJurisdictionCodes(): JurisdictionCode[] {
  return [...OPTIONAL];
}

export function toggleJurisdiction(
  current: JurisdictionCode[],
  code: string,
  on: boolean,
): JurisdictionCode[] {
  if (!isJurisdictionCode(code) || code === "uz" || code === "wipo") {
    return normalizeJurisdictions(current);
  }
  const set = new Set(current);
  if (on) set.add(code);
  else set.delete(code);
  return normalizeJurisdictions([...set]);
}
