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
  /** Adliya / national UZ SoT */
  uz: InventedMatch[];
  /** Madrid / WIPO designations for UZ */
  wipo: InventedMatch[];
  /** External offices keyed by jurisdiction code */
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

function asMatchList(value: unknown): InventedMatch[] {
  return Array.isArray(value) ? (value as InventedMatch[]) : [];
}

function fallbackMatches(
  query: string,
  jurisdictions: JurisdictionCode[],
): InventedPayload {
  const q = query.trim() || "Mark";
  const upper = q.toUpperCase();

  const uz: InventedMatch[] = [
    {
      name: upper,
      owner: 'OOO "DEMO TRADE UZ"',
      status: "Registered",
      classesText: "[35] Advertising",
      similarity: 74,
      registeredFrom: "12.03.2022",
    },
    {
      name: `${q} PLUS`,
      owner: 'MChJ "Demo Brands"',
      status: "Pending",
      classesText: "[25] Clothing",
      similarity: 51,
      registeredFrom: "01.08.2024",
    },
    {
      name: `${upper} GROUP`,
      owner: "Demo Hygiene LLC",
      status: "Registered",
      classesText: "[03] Cosmetics",
      similarity: 38,
      registeredFrom: "18.11.2021",
    },
  ];

  const wipo: InventedMatch[] = [
    {
      name: `IR-${upper.slice(0, 8)}`,
      owner: "Madrid Demo SA",
      status: "Protected",
      classesText: "[09] Software",
      similarity: 62,
      registeredFrom: "15.06.2021",
    },
    {
      name: `${q} INTERNATIONAL`,
      owner: "WIPO Demo Holdings AG",
      status: "Designated",
      classesText: "[35] Services",
      similarity: 44,
      registeredFrom: "03.02.2023",
    },
    {
      name: `${upper}-MD`,
      owner: "Global Marks Demo B.V.",
      status: "Protected",
      classesText: "[42] Tech services",
      similarity: 29,
      registeredFrom: "22.09.2020",
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
  return { uz, wipo, blocks };
}

function ensureLocalHits(
  invented: InventedPayload,
  query: string,
  jurisdictions: JurisdictionCode[],
): InventedPayload {
  const fallback = fallbackMatches(query, jurisdictions);
  return {
    uz: invented.uz.length > 0 ? invented.uz : fallback.uz,
    wipo: invented.wipo.length > 0 ? invented.wipo : fallback.wipo,
    blocks: { ...fallback.blocks, ...invented.blocks },
  };
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

function normalizeInventedPayload(raw: unknown): InventedPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  // New shape: explicit uz + wipo
  let uz = asMatchList(data.uz);
  let wipo = asMatchList(data.wipo);

  // Legacy shape: local array (first half UZ, rest Madrid)
  const local = asMatchList(data.local);
  if (uz.length === 0 && wipo.length === 0 && local.length > 0) {
    const split = Math.max(1, Math.ceil(local.length / 2));
    uz = local.slice(0, split);
    wipo = local.slice(split);
    if (wipo.length === 0) wipo = local.slice(0, 1);
  }

  const blocksRaw =
    data.blocks && typeof data.blocks === "object"
      ? (data.blocks as Record<string, unknown>)
      : {};
  const blocks: Record<string, InventedMatch[]> = {};
  for (const [key, value] of Object.entries(blocksRaw)) {
    blocks[key] = asMatchList(value);
  }

  // OpenAI sometimes puts uz/wipo inside blocks — lift them
  if (uz.length === 0 && blocks.uz?.length) {
    uz = blocks.uz;
    delete blocks.uz;
  }
  if (wipo.length === 0 && (blocks.wipo?.length || blocks.madrid?.length)) {
    wipo = blocks.wipo?.length ? blocks.wipo : blocks.madrid;
    delete blocks.wipo;
    delete blocks.madrid;
  }

  return { uz, wipo, blocks };
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
              "Return JSON only with keys: uz (array), wipo (array), blocks (object keyed by external jurisdiction codes).",
              "uz = national Uzbekistan (Adliya) registry hits — ALWAYS 2-4 items, never empty.",
              "wipo = Madrid/WIPO international registrations designating UZ — ALWAYS 2-4 items, never empty.",
              "Each hit: name, owner, status, classesText, similarity (1-99), registeredFrom (optional date string).",
              "For each requested external jurisdiction in blocks return 2-3 hits.",
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
              requiredLocal: ["uz", "wipo"],
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
    return normalizeInventedPayload(JSON.parse(content));
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

/**
 * Invent multi-jurisdiction matches + wordmark images for Demo Mode.
 * Adliya (uz) and Madrid (wipo) are always filled — never empty.
 */
export async function buildDemoSearchBundle(params: {
  query: string;
  activity: string;
  niceClasses: number[];
  jurisdictions: JurisdictionCode[];
  locale: Locale;
}): Promise<DemoSearchBundle> {
  const q = params.query.trim();
  const invented = ensureLocalHits(
    (await inventWithOpenAi(params)) ??
      fallbackMatches(q, params.jurisdictions),
    q,
    params.jurisdictions,
  );

  const matches: TrademarkMatch[] = [
    ...invented.uz.map((row, i) => toMatch(q, row, "demo-uz", "UZ", i)),
    ...invented.wipo.map((row, i) => toMatch(q, row, "demo-wipo", "WIPO", i)),
  ];

  const externalBlocks: ExternalBlockInput[] = [];
  const asOf = new Date().toISOString();
  for (const code of params.jurisdictions) {
    if (code === "uz" || code === "wipo") continue;
    const rows = invented.blocks[code] || [];
    const fallbackExt = fallbackMatches(q, [code]).blocks[code] || [];
    const filled = rows.length > 0 ? rows : fallbackExt;
    const label = SOURCE_LABEL[code] || code.toUpperCase();
    externalBlocks.push({
      id: code,
      matches: filled.map((row, i) =>
        toMatch(q, row, `demo-${code}`, label, i),
      ),
      asOf,
    });
  }

  return { matches, externalBlocks };
}
