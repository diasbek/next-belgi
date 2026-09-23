/** Jurisdiction codes for multi-country trademark checks. */

export const JURISDICTION_CODES = ["uz", "wipo", "eu", "us", "au", "kz"] as const;

export type JurisdictionCode = (typeof JURISDICTION_CODES)[number];

export type JurisdictionMeta = {
  code: JurisdictionCode;
  /** Always included in every check; not optional / not billed extra */
  required?: boolean;
  /** Served from local SoT (Adliya / Madrid), not live external API */
  local?: boolean;
  /** Extra credits on top of base check (config; overridable via env) */
  extraCredits: number;
  /** Integration provider key when live search is used */
  provider?: "euipo" | "uspto" | "ipaustralia" | "kazpatent";
};

export const JURISDICTIONS: Record<JurisdictionCode, JurisdictionMeta> = {
  uz: { code: "uz", required: true, local: true, extraCredits: 0 },
  wipo: { code: "wipo", local: true, extraCredits: 0 },
  eu: { code: "eu", extraCredits: 1, provider: "euipo" },
  us: { code: "us", extraCredits: 1, provider: "uspto" },
  au: { code: "au", extraCredits: 1, provider: "ipaustralia" },
  kz: { code: "kz", extraCredits: 1, provider: "kazpatent" },
};

const EXTRA_ENV: Partial<Record<JurisdictionCode, string>> = {
  eu: process.env.BELGI_CREDIT_EXTRA_EU,
  us: process.env.BELGI_CREDIT_EXTRA_US,
  au: process.env.BELGI_CREDIT_EXTRA_AU,
  kz: process.env.BELGI_CREDIT_EXTRA_KZ,
};

export function isJurisdictionCode(v: string): v is JurisdictionCode {
  return (JURISDICTION_CODES as readonly string[]).includes(v);
}

export function normalizeJurisdictions(
  input: string[] | undefined | null,
): JurisdictionCode[] {
  const set = new Set<JurisdictionCode>(["uz"]);
  for (const raw of input || []) {
    const code = String(raw).trim().toLowerCase();
    if (isJurisdictionCode(code)) set.add(code);
  }
  // WIPO Madrid block is always searched from local SoT when available
  if (!set.has("wipo")) set.add("wipo");
  return JURISDICTION_CODES.filter((c) => set.has(c));
}

export function extraCreditsFor(jurisdictions: JurisdictionCode[]): number {
  let n = 0;
  for (const code of jurisdictions) {
    if (JURISDICTIONS[code].required) continue;
    if (code === "wipo") continue; // included in base (local Madrid)
    const env = EXTRA_ENV[code];
    const configured =
      env != null && env !== ""
        ? Number(env)
        : JURISDICTIONS[code].extraCredits;
    n += Number.isFinite(configured) ? Math.max(0, configured) : 0;
  }
  return n;
}

export function totalCheckCredits(jurisdictions: JurisdictionCode[]): number {
  return 1 + extraCreditsFor(jurisdictions);
}
