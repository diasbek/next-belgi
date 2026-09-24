import type { JurisdictionCode } from "@/lib/check/jurisdictions";

export type FeeType = "filing" | "exam" | "reg" | "class_extra";

export type FeeScheduleRow = {
  country: JurisdictionCode;
  feeType: FeeType;
  amount: number;
  currency: string;
  label: string;
};

/** Indicative static schedule until admin CRUD / fee_schedules DB is primary. */
export const FEE_AS_OF = "2026-09-01";

export const DEFAULT_FEE_SCHEDULE: FeeScheduleRow[] = [
  // Uzbekistan (UZS) — indicative
  { country: "uz", feeType: "filing", amount: 1_200_000, currency: "UZS", label: "filing" },
  { country: "uz", feeType: "exam", amount: 800_000, currency: "UZS", label: "examination" },
  { country: "uz", feeType: "reg", amount: 1_000_000, currency: "UZS", label: "registration" },
  { country: "uz", feeType: "class_extra", amount: 400_000, currency: "UZS", label: "extra class" },
  // Madrid / WIPO (CHF)
  { country: "wipo", feeType: "filing", amount: 653, currency: "CHF", label: "basic fee" },
  { country: "wipo", feeType: "class_extra", amount: 100, currency: "CHF", label: "extra class" },
  // EUIPO (EUR)
  { country: "eu", feeType: "filing", amount: 850, currency: "EUR", label: "application" },
  { country: "eu", feeType: "class_extra", amount: 50, currency: "EUR", label: "2nd class" },
  // USPTO (USD)
  { country: "us", feeType: "filing", amount: 350, currency: "USD", label: "TEAS Plus / class" },
  { country: "us", feeType: "class_extra", amount: 350, currency: "USD", label: "per additional class" },
  // IP Australia (AUD)
  { country: "au", feeType: "filing", amount: 250, currency: "AUD", label: "application / class" },
  { country: "au", feeType: "class_extra", amount: 250, currency: "AUD", label: "per additional class" },
  // Kazakhstan (KZT)
  { country: "kz", feeType: "filing", amount: 45_000, currency: "KZT", label: "filing" },
  { country: "kz", feeType: "class_extra", amount: 15_000, currency: "KZT", label: "extra class" },
];

export type FeeLine = {
  jurisdiction: JurisdictionCode;
  feeType: FeeType;
  label: string;
  amount: number;
  currency: string;
};

export function estimateFees(
  jurisdictions: JurisdictionCode[],
  classCount: number,
  schedule: FeeScheduleRow[] = DEFAULT_FEE_SCHEDULE,
): FeeLine[] {
  const classes = Math.max(1, Math.min(45, Math.floor(classCount) || 1));
  const lines: FeeLine[] = [];

  for (const country of jurisdictions) {
    const rows = schedule.filter((r) => r.country === country);
    const filing = rows.find((r) => r.feeType === "filing");
    const exam = rows.find((r) => r.feeType === "exam");
    const reg = rows.find((r) => r.feeType === "reg");
    const extra = rows.find((r) => r.feeType === "class_extra");

    if (filing) {
      // US/AU: filing is often per-class
      if (country === "us" || country === "au") {
        lines.push({
          jurisdiction: country,
          feeType: "filing",
          label: `${filing.label} × ${classes}`,
          amount: filing.amount * classes,
          currency: filing.currency,
        });
      } else {
        lines.push({
          jurisdiction: country,
          feeType: "filing",
          label: filing.label,
          amount: filing.amount,
          currency: filing.currency,
        });
        if (extra && classes > 1) {
          const extraClasses =
            country === "eu" ? Math.max(0, classes - 1) : classes - 1;
          if (extraClasses > 0) {
            lines.push({
              jurisdiction: country,
              feeType: "class_extra",
              label: `${extra.label} × ${extraClasses}`,
              amount: extra.amount * extraClasses,
              currency: extra.currency,
            });
          }
        }
      }
    }
    if (exam) {
      lines.push({
        jurisdiction: country,
        feeType: "exam",
        label: exam.label,
        amount: exam.amount,
        currency: exam.currency,
      });
    }
    if (reg) {
      lines.push({
        jurisdiction: country,
        feeType: "reg",
        label: reg.label,
        amount: reg.amount,
        currency: reg.currency,
      });
    }
  }

  return lines;
}
