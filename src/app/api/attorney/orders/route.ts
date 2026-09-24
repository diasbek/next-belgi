import { NextResponse } from "next/server";
import { requireAttorneyApi, getServiceClient } from "@/lib/auth/session";

/** Attorney inbox: orders assigned to the linked patent attorney profile. */
export async function GET() {
  const attorney = await requireAttorneyApi();
  if (!attorney) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ items: [] });
  }

  const { data: link } = await db
    .from("patent_attorneys_db")
    .select("id")
    .eq("profile_user_id", attorney.id)
    .maybeSingle();

  if (!link && attorney.profile.role !== "admin") {
    return NextResponse.json({ items: [], hint: "profile_not_linked" });
  }

  let query = db
    .from("service_orders")
    .select(
      "id, service_slug, status, payload, check_id, attorney_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (attorney.profile.role !== "admin" && link) {
    query = query.eq("attorney_id", link.id);
  } else if (attorney.profile.role === "admin") {
    query = query.not("attorney_id", "is", null);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ items: data || [] });
}
