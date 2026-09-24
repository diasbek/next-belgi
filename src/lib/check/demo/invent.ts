import type { Locale } from "@/i18n/config";
import { getIntegration } from "@/lib/integrations/store";
import { markSimilarity } from "@/lib/check/similarity";
import type { JurisdictionCode } from "@/lib/check/jurisdictions";
import type { TrademarkMatch } from "@/lib/check/types";
import type { ExternalBlockInput } from "@/lib/check/mock";
import { renderWordmarkImage } from "./wordmark";

const TIMEOUT_MS = 20_000;

type InventedMatch = {
  name: string;
  owner: string;
  status?: string;
  classesText?: string;
  similarity?: number;
  registeredFrom?: string;
};

type InventedPayload = {
  local: InventedMatch[];
  blocks: Record<string, InventedMatch[]>;
};

const SOURCE_LABEL: Record<string, string> = {
  uz: "UZ",
  wipo: "WIPO",
  eu: "EU",
  us: "US",
  au: "AU",
  kz: "KZ",
};

function fallbackMatches(
  query: string,
  jurisdictions: JurisdictionCode[],
): InventedPayload {
  const q = query.trim() || "Mark";
  const local: InventedMatch[] = [
    {
      name: `${q.toUpperCase()}`,
      owner: 'OOO "DEMO TRADE"',
      status: "Registered",
      classesText: "[35] Advertising",
      similarity: 72,
      registeredFrom: "12.03.2022",
    },
    {
      name: `${q} PLUS`,
      owner: "Demo Brands LLC",
      status: "Pending",
      classesText: "[25] Clothing",
      similarity: 48,
      registeredFrom: "01.08.2024",
    },
    {
      name: `IR-${q.slice(0, 8).toUpperCase()}`,
      owner: "Madrid Demo SA",
      status: "Protected",
      classesText: "[09] Software",
      similarity: 41,
      registeredFrom: "2021-06-15",
    },
  ];

  const blocks: Record<string, InventedMatch[]> = {};
  for (const code of jurisdictions) {
    if (code === "uz" || code === "wipo") continue;
    blocks[code] = [
      {
        name: `${q} ${code.toUpperCase()}`,
        owner: `Demo Owner ${code.toUpperCase()}`,
        status: "Registered",
        classesText: "[35] Services",
        similarity: 55,
      },
      {
        name: `${q}${code}`,
        owner: "Synthetic Holdings",
        status: "Published",
        classesText: "[03] Cosmetics",
        similarity: 33,
      },
    ];
  }
  return { local, blocks };
}

function toMatch(
  query: string,
  row: InventedMatch,
  idPrefix: string,
  sourceLabel: string,
  i: number,
): TrademarkMatch {
  const name = String(row.name || `${query}-${i}`).trim();
  const sim =
    typeof row.similarity === "number" && Number.isFinite(row.similarity)
      ? Math.max(1, Math.min(99, Math.round(row.similarity)))
      : markSimilarity(query, name);
  return {
    id: `${idPrefix}-${i}`,
    name,
    owner: row.owner ? String(row.owner) : undefined,
    status: row.status ? String(row.status) : undefined,
    registeredFrom: row.registeredFrom
      ? String(row.registeredFrom)
      : undefined,
    similarity: sim,
    classesText: row.classesText ? String(row.classesText) : undefined,
    sourceLabel,
    imageUrl: renderWordmarkImage(name),
  };
}

async function inventWithOpenAi(params: {
  query: string;
  activity: string;
  niceClasses: number[];
  jurisdictions: JurisdictionCode[];
  locale: Locale;
}): Promise<InventedPayload | null> {
  const cfg = await getIntegration("openai");
  if (!cfg?.api_key || (cfg.mode || "mock") === "mock") return null;

  const model = cfg.model?.trim() || "gpt-4.1-mini";
  const external = params.jurisdictions.filter(
    (j) => j !== "uz" && j !== "wipo",
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.api_key}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You invent realistic but fictional trademark search hits for a DEMO product.",
              "Do not copy real famous brand owners verbatim as legal entities; invent plausible fictional owners.",
              "Return JSON only with keys: local (array, 2-4 UZ+Madrid style hits), blocks (object keyed by jurisdiction codes).",
              "Each hit: name, owner, status, classesText, similarity (1-99), registeredFrom (optional date string).",
              "First 1-2 local hits are national UZ; remaining local hits are Madrid/WIPO designations for UZ.",
              "For each requested external jurisdiction return 2-3 hits.",
              "Names should be phonetically or visually similar to the query.",
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              locale: params.locale,
              query: params.query,
              activity: params.activity,
              niceClasses: params.niceClasses,
              externalJurisdictions: external,
            }),
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("[demo:invent] openai", res.status);
      return null;
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as InventedPayload;
    if (!parsed || !Array.isArray(parsed.local)) return null;
    return {
      local: parsed.local,
      blocks:
        parsed.blocks && typeof parsed.blocks === "object"
          ? parsed.blocks
          : {},
    };
  } catch (e) {
    console.warn("[demo:invent]", e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export type DemoSearchBundle = {
  matches: TrademarkMatch[];
  externalBlocks: ExternalBlockInput[];
};

/** Invent multi-jurisdiction matches + wordmark images for Demo Mode. */
export async function buildDemoSearchBundle(params: {
  query: string;
  activity: string;
  niceClasses: number[];
  jurisdictions: JurisdictionCode[];
  locale: Locale;
}): Promise<DemoSearchBundle> {
  const q = params.query.trim();
  const invented =
    (await inventWithOpenAi(params)) ??
    fallbackMatches(q, params.jurisdictions);

  const matches: TrademarkMatch[] = invented.local.map((row, i) => {
    const isWipo = i >= Math.ceil(invented.local.length / 2);
    return toMatch(q, row, isWipo ? "demo-wipo" : "demo-uz", isWipo ? "WIPO" : "UZ", i);
  });

  const externalBlocks: ExternalBlockInput[] = [];
  const asOf = new Date().toISOString();
  for (const code of params.jurisdictions) {
    if (code === "uz" || code === "wipo") continue;
    const rows = invented.blocks[code] || [];
    const label = SOURCE_LABEL[code] || code.toUpperCase();
    externalBlocks.push({
      id: code,
      matches: rows.map((row, i) =>
        toMatch(q, row, `demo-${code}`, label, i),
      ),
      asOf,
    });
  }

  return { matches, externalBlocks };
}
