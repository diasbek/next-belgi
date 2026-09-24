/**
 * Madrid Monitor bulk XML → local trademarks (source='madrid').
 *
 * WIPO publishes XML dumps of international registrations. We keep only
 * records that designate Uzbekistan (UZ). Live scraping of Madrid Monitor
 * is prohibited by ToS — this importer is the legal path.
 *
 * Expected element names (flexible / case-insensitive):
 *   InternationalRegistration / Mark / Designation / NiceClass, etc.
 * Also accepts a JSON lines / array dump for fixtures:
 *   { irn, mark, owner, status, classes, designations: ["UZ", ...] }
 */

import { getServiceDb } from "@/lib/db/client";
import type { RegistrySource } from "@/lib/registry/types";

export type MadridRecord = {
  irn: string;
  mark: string;
  owner?: string;
  status?: string;
  registrationDate?: string;
  expiryDate?: string;
  classes: number[];
  designations: string[];
  raw?: Record<string, unknown>;
};

export type MadridImportResult = {
  ok: boolean;
  scanned: number;
  uzDesignations: number;
  upserted: number;
  error?: string;
  fileLabel?: string;
};

const SOURCE: RegistrySource = "madrid";

function textBetween(xml: string, tag: string): string | null {
  const re = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,
    "i",
  );
  const m = xml.match(re);
  return m ? stripTags(m[1]).trim() : null;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function allText(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    out.push(stripTags(m[1]));
  }
  return out;
}

/** Parse a single registration fragment from Madrid XML. */
export function parseMadridFragment(fragment: string): MadridRecord | null {
  const irn =
    textBetween(fragment, "INTREGN") ||
    textBetween(fragment, "InternationalRegistrationNumber") ||
    textBetween(fragment, "IRN") ||
    textBetween(fragment, "RegistrationNumber");
  const mark =
    textBetween(fragment, "MARK") ||
    textBetween(fragment, "MarkVerbalElementText") ||
    textBetween(fragment, "WordMarkSpecification") ||
    textBetween(fragment, "MarkName") ||
    textBetween(fragment, "TRANS");
  if (!irn || !mark) return null;

  const owner =
    textBetween(fragment, "HOLGR") ||
    textBetween(fragment, "ApplicantName") ||
    textBetween(fragment, "HolderName") ||
    textBetween(fragment, "OWNER") ||
    undefined;

  const status =
    textBetween(fragment, "CURRENT_STATUS") ||
    textBetween(fragment, "MarkCurrentStatusCode") ||
    textBetween(fragment, "Status") ||
    undefined;

  const designations = [
    ...allText(fragment, "DESIGNATION"),
    ...allText(fragment, "DesignationCountryCode"),
    ...allText(fragment, "ContractingPartyCode"),
    ...allText(fragment, "CountryCode"),
  ]
    .map((d) => d.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))
    .filter(Boolean);

  const classRaw = [
    ...allText(fragment, "NICE_CLASS"),
    ...allText(fragment, "ClassNumber"),
    ...allText(fragment, "NiceClass"),
  ];
  const classes = [
    ...new Set(
      classRaw
        .flatMap((c) => c.match(/\d+/g) || [])
        .map((n) => Number(n))
        .filter((n) => n >= 1 && n <= 45),
    ),
  ];

  return {
    irn: irn.replace(/\D/g, "") || irn.trim(),
    mark: mark.trim(),
    owner: owner?.trim() || undefined,
    status: status?.trim() || undefined,
    registrationDate:
      textBetween(fragment, "REGISTRATION_DATE") ||
      textBetween(fragment, "RegistrationDate") ||
      undefined,
    expiryDate:
      textBetween(fragment, "EXPIRY_DATE") ||
      textBetween(fragment, "ExpiryDate") ||
      undefined,
    classes,
    designations: [...new Set(designations)],
    raw: { fragmentSnippet: fragment.slice(0, 500) },
  };
}

/** Split XML into registration-sized chunks. */
export function splitMadridXml(xml: string): string[] {
  const patterns = [
    /<(?:InternationalRegistration|MARK_RECORD|TradeMark|MARK)[\s>][\s\S]*?<\/(?:InternationalRegistration|MARK_RECORD|TradeMark|MARK)>/gi,
  ];
  for (const re of patterns) {
    const found = xml.match(re);
    if (found?.length) return found;
  }
  // Fallback: treat whole doc as one fragment
  return xml.trim() ? [xml] : [];
}

export function parseMadridXml(xml: string): MadridRecord[] {
  return splitMadridXml(xml)
    .map(parseMadridFragment)
    .filter((r): r is MadridRecord => Boolean(r));
}

export function parseMadridJson(text: string): MadridRecord[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    // JSONL
    return trimmed
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return normalizeJsonRecord(JSON.parse(line));
        } catch {
          return null;
        }
      })
      .filter((r): r is MadridRecord => Boolean(r));
  }
  const arr = Array.isArray(data) ? data : [data];
  return arr
    .map((row) => normalizeJsonRecord(row))
    .filter((r): r is MadridRecord => Boolean(r));
}

function normalizeJsonRecord(row: unknown): MadridRecord | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  const irn = String(o.irn ?? o.IRN ?? o.number ?? "").trim();
  const mark = String(o.mark ?? o.name ?? o.transliteration ?? "").trim();
  if (!irn || !mark) return null;
  const designations = (
    Array.isArray(o.designations)
      ? o.designations
      : String(o.designations || "UZ").split(",")
  )
    .map((d) => String(d).toUpperCase().trim().slice(0, 2))
    .filter(Boolean);
  const classes = (
    Array.isArray(o.classes)
      ? o.classes
      : String(o.classes || "")
          .split(/[,;\s]+/)
          .filter(Boolean)
  )
    .map((n) => Number(n))
    .filter((n) => n >= 1 && n <= 45);
  return {
    irn,
    mark,
    owner: o.owner ? String(o.owner) : undefined,
    status: o.status ? String(o.status) : undefined,
    registrationDate: o.registrationDate
      ? String(o.registrationDate)
      : undefined,
    expiryDate: o.expiryDate ? String(o.expiryDate) : undefined,
    classes,
    designations: designations.length ? designations : ["UZ"],
    raw: o,
  };
}

export function parseMadridDump(content: string, _fileLabel?: string): MadridRecord[] {
  const trimmed = content.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("<") || trimmed.includes("<?xml")) {
    return parseMadridXml(trimmed);
  }
  return parseMadridJson(trimmed);
}

function hasUz(rec: MadridRecord): boolean {
  return rec.designations.some((d) => d === "UZ" || d === "UZB");
}

/**
 * Upsert Madrid UZ-designation records into local trademarks SoT.
 */
export async function importMadridDump(params: {
  content: string;
  fileLabel?: string;
}): Promise<MadridImportResult> {
  const db = getServiceDb();
  if (!db) {
    return {
      ok: false,
      scanned: 0,
      uzDesignations: 0,
      upserted: 0,
      error: "db_unavailable",
    };
  }

  const fileLabel = params.fileLabel || "upload";
  await db.from("madrid_import_state").upsert({
    id: 1,
    status: "running",
    last_file: fileLabel,
    error: null,
    updated_at: new Date().toISOString(),
  });

  try {
    const all = parseMadridDump(params.content, fileLabel);
    const uz = all.filter(hasUz);
    let upserted = 0;

    for (const rec of uz) {
      const externalId = `madrid:${rec.irn}`;
      const row = {
        external_id: externalId,
        number: rec.irn,
        registration_number: rec.irn,
        transliteration: rec.mark,
        owner: rec.owner || null,
        applicant: rec.owner || null,
        status: rec.status || "International registration",
        registration_date: rec.registrationDate || null,
        expired: rec.expiryDate || null,
        trademark_type: "word",
        raw: rec.raw || {},
        source: SOURCE,
        active: true,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await db
        .from("trademarks")
        .select("id")
        .eq("external_id", externalId)
        .maybeSingle();

      let tmId: string | null = existing?.id ?? null;

      if (tmId) {
        const { error } = await db.from("trademarks").update(row).eq("id", tmId);
        if (error) throw new Error(error.message);
      } else {
        const { data: inserted, error } = await db
          .from("trademarks")
          .insert(row)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        tmId = inserted.id;
      }

      if (tmId && rec.classes.length) {
        await db.from("trademark_mgs").delete().eq("trademark_id", tmId);
        const mgs = rec.classes.map((class_number) => ({
          trademark_id: tmId!,
          class_number,
          text_uz: null,
          text_ru: null,
          adliya_mgs_id: null,
        }));
        const { error: mgsErr } = await db.from("trademark_mgs").insert(mgs);
        if (mgsErr) throw new Error(mgsErr.message);
      }
      upserted++;
    }

    await db.from("madrid_import_state").upsert({
      id: 1,
      status: "idle",
      last_file: fileLabel,
      last_imported_at: new Date().toISOString(),
      records_total: all.length,
      records_uz: uz.length,
      error: null,
      updated_at: new Date().toISOString(),
    });

    return {
      ok: true,
      scanned: all.length,
      uzDesignations: uz.length,
      upserted,
      fileLabel,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.from("madrid_import_state").upsert({
      id: 1,
      status: "error",
      error: message,
      updated_at: new Date().toISOString(),
    });
    return {
      ok: false,
      scanned: 0,
      uzDesignations: 0,
      upserted: 0,
      error: message,
      fileLabel,
    };
  }
}
