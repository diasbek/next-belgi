import { NextResponse } from "next/server";
import { getServiceDb } from "@/lib/db/client";
import {
  DEFAULT_FEE_SCHEDULE,
  FEE_AS_OF,
  estimateFees,
  type FeeScheduleRow,
} from "@/lib/services/fee-estimate";
import {
  isJurisdictionCode,
  type JurisdictionCode,
} from "@/lib/check/jurisdictions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const classes = Number(url.searchParams.get("classes") || "1");
  const jurisdictions = (url.searchParams.get("jurisdictions") || "uz")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(isJurisdictionCode) as JurisdictionCode[];

  let schedule: FeeScheduleRow[] = DEFAULT_FEE_SCHEDULE;
  let asOf = FEE_AS_OF;

  const db = getServiceDb();
  if (db) {
    const { data } = await db
      .from("fee_schedules")
      .select("country, fee_type, amount, currency, label, valid_from")
      .is("valid_to", null)
      .order("valid_from", { ascending: false });

    if (data && data.length > 0) {
      schedule = data.map((row) => ({
        country: row.country as JurisdictionCode,
        feeType: row.fee_type as FeeScheduleRow["feeType"],
        amount: Number(row.amount),
        currency: String(row.currency),
        label: String(row.label || row.fee_type),
      }));
      asOf = String(data[0]?.valid_from || FEE_AS_OF);
    }
  }

  const lines = estimateFees(
    jurisdictions.length ? jurisdictions : ["uz"],
    classes,
    schedule,
  );

  return NextResponse.json({ asOf, lines, schedule });
}
