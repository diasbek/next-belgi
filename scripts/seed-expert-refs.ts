/**
 * Seed YURISER expert PDF refs into the database.
 *
 * 1) Upserts public.expert_conclusion_refs (needs migration 20260923030000)
 * 2) Always upserts trademark_checks rows (verification_code REF-*) with conclusion_doc
 *    so admin history / verify QR work even before the dedicated table exists.
 *
 *   npm run seed:expert-refs
 */
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import refsJson from "../src/data/expert-conclusion-refs.json";
import {
  buildConclusionDocument,
  hashConclusionPayload,
} from "../src/lib/conclusion/buildConclusionDocument";
import type { TrademarkReport } from "../src/lib/check/types";
import type { ConclusionMatchCard, ConclusionInternetItem } from "../src/lib/conclusion/types";

type Ref = (typeof refsJson)[number];

function normalizeMark(mark: string): string {
  return mark
    .normalize("NFKC")
    .replace(/[’`ʻʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function verificationCodeFor(mark: string): string {
  const base = normalizeMark(mark)
    .replace(/[^a-z0-9а-яёўқғҳ]+/gi, "")
    .slice(0, 8)
    .toUpperCase();
  const hash = createHash("sha1").update(normalizeMark(mark)).digest("hex").slice(0, 4).toUpperCase();
  return `REF${base}${hash}`.slice(0, 14);
}

function reportFromRef(ref: Ref): TrademarkReport {
  const adliya = (ref.adliya_matches || []) as ConclusionMatchCard[];
  const madrid = (ref.madrid_matches || []) as ConclusionMatchCard[];
  const internet = (ref.internet_items || []) as ConclusionInternetItem[];

  const classRisks = (ref.verdicts || []).map((v) => ({
    classNumber: v.classNumber,
    // Inverse of chance mid → conflict heuristic for display; expert verdicts override later.
    percent: Math.max(5, 100 - Math.round((v.chanceMin + v.chanceMax) / 2)),
  }));

  return {
    query: ref.mark,
    activity: ref.activity_raw || ref.nice_classes.map((n) => `class ${n}`).join(", "),
    markType: ref.appearance || "so‘zli",
    niceClasses: (ref.nice_classes || []).map((n) => `[${n}]`),
    sources: [
      {
        id: "uz",
        title: "Adliya",
        matches: adliya.map((m, i) => ({
          id: m.id || `a-${i}`,
          name: m.name,
          owner: m.owner,
          registeredFrom: m.term?.split(" - ")[0],
          registeredTo: m.term?.split(" - ")[1],
          classesText: m.classesText,
          similarity: m.similarity ?? 55,
        })),
        empty: adliya.length === 0,
      },
      {
        id: "wipo",
        title: "Madrid",
        matches: madrid.map((m, i) => ({
          id: m.id || `m-${i}`,
          name: m.name,
          owner: m.owner,
          classesText: m.classesText,
          similarity: m.similarity ?? 40,
        })),
        empty: Boolean(ref.madrid_empty) || madrid.length === 0,
      },
      {
        id: "internet",
        title: "Internet",
        matches: internet.map((it, i) => ({
          id: `i-${i}`,
          name: it.title,
          classesText: it.note,
          sourceLabel: it.url,
          similarity: 20,
        })),
        empty: Boolean(ref.internet_empty) || internet.length === 0,
      },
    ],
    conclusion: {
      title: "Xulosa",
      lead: "Expert reference",
      positive: classRisks.every((r) => r.percent < 50),
    },
    classRisks,
    recommendations: {
      title: "Tavsiya",
      replaceHint: "",
      alternatives: [],
    },
    lawyers: [],
    disclaimer:
      ref.disclaimer ||
      "Adliya vazirligi ekspertiza fikri ushbu xulosadan farq qilishi mumkin.",
  };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const refs = refsJson as Ref[];

  // --- 1) Dedicated refs table (optional until migration applied) ---
  const tableRows = refs.map((r) => ({
    mark: r.mark,
    mark_normalized: r.mark_normalized,
    nice_classes: r.nice_classes ?? [],
    activity_raw: r.activity_raw ?? null,
    appearance: r.appearance ?? "so‘zli",
    issued_at: r.issued_at ?? null,
    report_at: r.report_at ?? null,
    source_file: r.source_file ?? null,
    agency: r.agency ?? "YURISER LLC",
    verdicts: r.verdicts ?? [],
    adliya_matches: r.adliya_matches ?? [],
    madrid_matches: r.madrid_matches ?? [],
    internet_items: r.internet_items ?? [],
    madrid_empty: Boolean(r.madrid_empty),
    internet_empty: Boolean(r.internet_empty),
    disclaimer: r.disclaimer ?? null,
    raw_excerpt: r.raw_excerpt ?? null,
    updated_at: new Date().toISOString(),
  }));

  const tableRes = await db
    .from("expert_conclusion_refs")
    .upsert(tableRows, { onConflict: "mark_normalized" })
    .select("mark");

  if (tableRes.error) {
    console.warn(
      "[expert_conclusion_refs]",
      tableRes.error.message,
      "— apply supabase/migrations/20260923030000_expert_conclusion_refs.sql then re-run.",
    );
  } else {
    console.log(`expert_conclusion_refs: upserted ${tableRes.data?.length ?? 0}`);
  }

  // --- 2) trademark_checks with conclusion_doc (always) ---
  let ok = 0;
  for (const ref of refs) {
    const code = verificationCodeFor(ref.mark);
    const report = reportFromRef(ref);
    const conclusion = buildConclusionDocument({
      report,
      locale: "uz",
      verificationCode: code,
    });
    // Force expert verdicts explicitly
    conclusion.verdict.byClass = ref.verdicts.map((v) => ({
      classNumber: v.classNumber,
      chanceMin: v.chanceMin,
      chanceMax: v.chanceMax,
      chanceLabel: v.chanceLabel,
    }));
    const payloadHash = hashConclusionPayload(conclusion);

    const { data: existing } = await db
      .from("trademark_checks")
      .select("id")
      .eq("verification_code", code)
      .maybeSingle();

    const row = {
      query: ref.mark,
      activity_raw: ref.activity_raw || `TXHK ${ (ref.nice_classes || []).join(",") }`,
      activity_normalized: ref.activity_raw || null,
      locale: "uz",
      nice_classes: (ref.nice_classes || []).map((n) => ({
        classNumber: n,
        label: `class ${n}`,
        confidence: 1,
      })),
      classification_source: "catalog",
      report,
      source: "registry",
      verification_code: code,
      payload_hash: payloadHash,
      conclusion_doc: conclusion,
    };

    if (existing?.id) {
      const { error } = await db
        .from("trademark_checks")
        .update(row)
        .eq("id", existing.id);
      if (error) {
        console.error("update", ref.mark, error.message);
        continue;
      }
    } else {
      const { error } = await db.from("trademark_checks").insert(row);
      if (error) {
        console.error("insert", ref.mark, error.message);
        continue;
      }
    }
    ok += 1;
    console.log(`  check ${ref.mark} → ${code}`);
  }

  console.log(`trademark_checks expert seeds: ${ok}/${refs.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
