import type { ActivityClassification, NiceClassSuggestion } from "./types";
import type { ClassifyLocale } from "./types";
import {
  clampClassNumber,
  clampConfidence,
  normalizeActivityKey,
} from "./normalize";
import { getIntegration } from "@/lib/integrations/store";

const OPENAI_TIMEOUT_MS = 12_000;

interface OpenAiJsonResult {
  activityNormalized?: string;
  classes?: Array<{
    classNumber?: number;
    label?: string;
    confidence?: number;
  }>;
  primaryClassNumbers?: number[];
}

async function getOpenAiConfig(): Promise<{
  apiKey: string;
  model: string;
  mode: string;
} | null> {
  const cfg = await getIntegration("openai");
  if (!cfg) return null;
  const mode = cfg.mode || "mock";
  if (mode === "mock") {
    return { apiKey: "", model: cfg.model?.trim() || "gpt-4.1-mini", mode };
  }
  if (!cfg.api_key) return null;
  return {
    apiKey: cfg.api_key,
    model: cfg.model?.trim() || "gpt-4.1-mini",
    mode,
  };
}

function buildSystemPrompt(locale: ClassifyLocale): string {
  const lang =
    locale === "ru"
      ? "Respond in Russian for labels and activityNormalized."
      : "Respond in Uzbek (Latin script) for labels and activityNormalized.";

  return [
    "You are an expert in the Nice Classification (МКТУ / Nice Agreement) for trademark filings in Uzbekistan.",
    "Given a free-text description of a company's goods or services, map it to 1–5 relevant Nice classes (numbers 1–45 only).",
    "Prefer the most specific classes. Do not invent class numbers outside 1–45.",
    "confidence is 0–1 for each class.",
    "primaryClassNumbers: top 1–3 class numbers ordered by relevance.",
    lang,
    "Return JSON only matching the schema.",
  ].join(" ");
}

function parseClasses(
  raw: OpenAiJsonResult["classes"],
): NiceClassSuggestion[] {
  if (!Array.isArray(raw)) return [];
  const out: NiceClassSuggestion[] = [];
  const seen = new Set<number>();

  for (const item of raw) {
    const classNumber = clampClassNumber(Number(item?.classNumber));
    if (classNumber == null || seen.has(classNumber)) continue;
    const label = String(item?.label ?? "").trim();
    if (!label) continue;
    seen.add(classNumber);
    out.push({
      classNumber,
      label,
      confidence: clampConfidence(Number(item?.confidence)),
    });
  }

  return out.slice(0, 5);
}

async function fetchOpenAiOnce(
  activity: string,
  locale: ClassifyLocale,
  model: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<ActivityClassification> {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "nice_activity_classification",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              activityNormalized: { type: "string" },
              classes: {
                type: "array",
                minItems: 1,
                maxItems: 5,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    classNumber: { type: "integer", minimum: 1, maximum: 45 },
                    label: { type: "string" },
                    confidence: { type: "number", minimum: 0, maximum: 1 },
                  },
                  required: ["classNumber", "label", "confidence"],
                },
              },
              primaryClassNumbers: {
                type: "array",
                minItems: 1,
                maxItems: 3,
                items: { type: "integer", minimum: 1, maximum: 45 },
              },
            },
            required: [
              "activityNormalized",
              "classes",
              "primaryClassNumbers",
            ],
          },
        },
      },
      messages: [
        { role: "system", content: buildSystemPrompt(locale) },
        {
          role: "user",
          content: JSON.stringify({
            locale,
            activity: normalizeActivityKey(activity) || activity.trim(),
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = new Error(`openai_${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("openai_empty");

  const parsed = JSON.parse(content) as OpenAiJsonResult;
  const classes = parseClasses(parsed.classes);
  if (classes.length === 0) throw new Error("openai_no_classes");

  const primary = (parsed.primaryClassNumbers ?? [])
    .map((n) => clampClassNumber(Number(n)))
    .filter((n): n is number => n != null)
    .slice(0, 3);

  return {
    locale,
    activityRaw: activity.trim(),
    activityNormalized:
      String(parsed.activityNormalized ?? "").trim() || activity.trim(),
    classes,
    primaryClassNumbers:
      primary.length > 0
        ? primary
        : classes.slice(0, 3).map((c) => c.classNumber),
    source: "openai",
    model,
  };
}

export async function classifyWithOpenAi(
  activity: string,
  locale: ClassifyLocale,
): Promise<ActivityClassification> {
  const cfg = await getOpenAiConfig();
  if (!cfg) throw new Error("missing_openai_key");
  if (cfg.mode === "mock") {
    throw new Error("openai_mock_mode");
  }
  const { model, apiKey } = cfg;
  const started = Date.now();

  const run = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
    try {
      return await fetchOpenAiOnce(
        activity,
        locale,
        model,
        apiKey,
        controller.signal,
      );
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const result = await run();
    console.info("[classify:openai]", {
      model,
      ms: Date.now() - started,
      classes: result.classes.map((c) => c.classNumber),
    });
    return result;
  } catch (first) {
    const status = (first as { status?: number }).status;
    const retryable =
      status === 429 ||
      (typeof status === "number" && status >= 500) ||
      (first instanceof Error && first.name === "AbortError");

    if (!retryable) throw first;

    const result = await run();
    console.info("[classify:openai:retry]", {
      model,
      ms: Date.now() - started,
      classes: result.classes.map((c) => c.classNumber),
    });
    return result;
  }
}

export async function isOpenAiConfigured(): Promise<boolean> {
  const cfg = await getOpenAiConfig();
  if (!cfg) return false;
  if (cfg.mode === "mock") return false; // force fallback path
  return Boolean(cfg.apiKey);
}
