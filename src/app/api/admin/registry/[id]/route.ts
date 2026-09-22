import { NextResponse } from "next/server";
import { requireAdminApi, getServiceClient } from "@/lib/auth/session";
import { createRegistryProvider } from "@/lib/registry/provider";

type PatchBody = {
  transliteration?: string | null;
  number?: string | null;
  status?: string | null;
  trademark_type?: string | null;
  applicant?: string | null;
  owner?: string | null;
  logo?: string | null;
  address?: string | null;
  colors?: string | null;
  owner_address?: string | null;
  unprotected_element?: string | null;
  active?: boolean;
  field_locks?: string[];
  fetchFromAdliya?: boolean;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { data, error } = await db
    .from("trademarks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data: mgs } = await db
    .from("trademark_mgs")
    .select("*")
    .eq("trademark_id", id)
    .order("class_number");

  return NextResponse.json({ ok: true, row: data, mgs: mgs || [] });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (body.fetchFromAdliya) {
    const { data: row } = await db
      .from("trademarks")
      .select("number, adliya_id, raw")
      .eq("id", id)
      .maybeSingle();
    if (!row) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const appNo =
      (typeof (row.raw as { applicationNumber?: number } | null)?.applicationNumber ===
      "number"
        ? (row.raw as { applicationNumber: number }).applicationNumber
        : null) ||
      (row.number ? Number(String(row.number).replace(/\D/g, "")) : null);
    if (!appNo) {
      return NextResponse.json({ ok: false, error: "no_application_number" }, { status: 400 });
    }
    try {
      const provider = createRegistryProvider();
      const detail = await provider.getDetail(appNo);
      if (!detail) {
        return NextResponse.json({ ok: false, error: "not_found_remote" }, { status: 404 });
      }
      const { error } = await db
        .from("trademarks")
        .update({
          adliya_id: detail.adliyaId,
          number: detail.number,
          application_date: detail.date,
          registration_number: detail.registration_number,
          registration_date: detail.registration_date,
          expired: detail.expired,
          publication_date: detail.publication_date,
          logo: detail.logo,
          vienna_classification: detail.vienna_classification,
          collective: detail.collective,
          transliteration: detail.transliteration,
          trademark_type: detail.trademark_type,
          colors: detail.colors,
          applicant: detail.applicant,
          owner: detail.owner,
          owner_address: detail.owner_address,
          address: detail.address,
          status: detail.status,
          unprotected_element: detail.unprotected_element,
          raw: detail.raw,
          synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      }
      await db
        .from("trademark_mgs")
        .delete()
        .eq("trademark_id", id)
        .not("adliya_mgs_id", "is", null);
      if (detail.mgs.length) {
        await db.from("trademark_mgs").insert(
          detail.mgs.map((m) => ({
            trademark_id: id,
            adliya_mgs_id: m.adliyaMgsId,
            class_number: m.classNumber,
            text_uz: m.textUz,
            text_ru: m.textRu,
          })),
        );
      }
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : "fetch_failed" },
        { status: 400 },
      );
    }
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  const fields = [
    "transliteration",
    "number",
    "status",
    "trademark_type",
    "applicant",
    "owner",
    "logo",
    "address",
    "colors",
    "owner_address",
    "unprotected_element",
  ] as const;
  for (const key of fields) {
    if (key in body) patch[key] = body[key];
  }
  if (typeof body.active === "boolean") patch.active = body.active;
  if (Array.isArray(body.field_locks)) patch.field_locks = body.field_locks;

  const { data, error } = await db
    .from("trademarks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, row: data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  const db = getServiceClient();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 });
  }

  const { error } = await db
    .from("trademarks")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
