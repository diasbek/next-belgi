import { parseLocale, type Locale } from "@/i18n/config";
import {
  classifyActivity,
  resolveActivityClassification,
} from "@/lib/classify";
import {
  classRisksFromClassification,
  niceClassesFromClassification,
} from "@/lib/classify";
import type { ActivityClassification } from "@/lib/classify";
import { insertTrademarkCheck } from "@/lib/db";
import {
  buildConclusionDocument,
  generateVerificationCode,
  hashConclusionPayload,
} from "@/lib/conclusion";
import type { ConclusionDocument } from "@/lib/conclusion";
import { isDemoMode } from "@/lib/settings/demo-mode";
import { buildDemoSearchBundle } from "./demo/invent";
import { searchExternalJurisdiction } from "./external";
import {
  normalizeJurisdictions,
  type JurisdictionCode,
} from "./jurisdictions";
import { buildMockReport, buildReportFromMatches } from "./mock";
import { searchLocalRegistry } from "./registry-search";
import type { CheckRequest, CheckResponse, TrademarkReport } from "./types";

function resolveLocale(locale?: string): Locale {
  return parseLocale(locale);
}

async function resolveClassification(
  input: CheckRequest,
): Promise<ActivityClassification> {
  const fromSelection = await resolveActivityClassification({
    activity: input.activity,
    locale: input.locale,
    niceSelection: input.niceSelection,
  });
  if (fromSelection) return fromSelection;
  return classifyActivity({
    activity: input.activity,
    locale: input.locale,
  });
}

function applyClassificationToReport(
  report: TrademarkReport,
  classification: ActivityClassification,
): TrademarkReport {
  return {
    ...report,
    activity: classification.activityNormalized || report.activity,
    niceClasses: niceClassesFromClassification(classification),
    classRisks: classRisksFromClassification(classification),
  };
}

function normalizeUpstream(
  raw: unknown,
  fallback: CheckRequest,
  classification: ActivityClassification,
  locale: Locale,
): TrademarkReport {
  if (!raw || typeof raw !== "object") {
    return buildMockReport(
      fallback.query,
      fallback.activity,
      classification,
      locale,
    );
  }

  const data = raw as Partial<TrademarkReport> & Record<string, unknown>;
  const base = buildMockReport(
    fallback.query,
    fallback.activity,
    classification,
    locale,
  );

  const merged: TrademarkReport = {
    ...base,
    ...data,
    query: typeof data.query === "string" ? data.query : fallback.query,
    activity:
      typeof data.activity === "string"
        ? data.activity
        : classification.activityNormalized || fallback.activity,
    sources: Array.isArray(data.sources) ? data.sources : base.sources,
    classRisks: Array.isArray(data.classRisks)
      ? data.classRisks
      : base.classRisks,
    lawyers: Array.isArray(data.lawyers) ? data.lawyers : base.lawyers,
    recommendations:
      data.recommendations && typeof data.recommendations === "object"
        ? { ...base.recommendations, ...data.recommendations }
        : base.recommendations,
    conclusion:
      data.conclusion && typeof data.conclusion === "object"
        ? { ...base.conclusion, ...data.conclusion }
        : base.conclusion,
    niceClasses: Array.isArray(data.niceClasses)
      ? data.niceClasses
      : base.niceClasses,
  };

  if (!Array.isArray(data.niceClasses) || data.niceClasses.length === 0) {
    return applyClassificationToReport(merged, classification);
  }

  return merged;
}

async function persistCheck(params: {
  query: string;
  activity: string;
  locale?: string;
  userId?: string | null;
  classification: ActivityClassification;
  report: TrademarkReport;
  source: "mock" | "upstream" | "registry";
  jurisdictions: JurisdictionCode[];
}): Promise<{
  checkId: string | null;
  verificationCode: string | null;
  conclusion: ConclusionDocument | null;
}> {
  try {
    const locale = resolveLocale(params.locale);
    const verificationCode = generateVerificationCode();
    const conclusion = buildConclusionDocument({
      report: params.report,
      locale,
      verificationCode,
    });
    const payloadHash = hashConclusionPayload(conclusion);
    const checkId = await insertTrademarkCheck({
      userId: params.userId ?? null,
      query: params.query,
      activityRaw: params.activity,
      activityNormalized: params.classification.activityNormalized,
      locale,
      niceClasses: params.classification.classes,
      classificationSource: params.classification.source,
      report: params.report,
      source: params.source,
      verificationCode,
      payloadHash,
      conclusionDoc: conclusion,
      jurisdictions: params.jurisdictions,
    });
    if (!checkId) {
      return { checkId: null, verificationCode: null, conclusion: null };
    }
    return { checkId, verificationCode, conclusion };
  } catch (error) {
    console.warn("[check:persist]", error);
    return { checkId: null, verificationCode: null, conclusion: null };
  }
}

const EXTERNAL_CODES: JurisdictionCode[] = ["eu", "us", "au", "kz"];

/**
 * Server-side check client.
 * Local SoT (Adliya + Madrid) + optional parallel external office searches.
 */
export async function runTrademarkCheck(
  input: CheckRequest & { userId?: string | null },
): Promise<
  CheckResponse & {
    checkId?: string | null;
    verificationCode?: string | null;
    conclusion?: ConclusionDocument | null;
  }
> {
  const query = input.query.trim();
  const activity = input.activity.trim();

  if (!query || !activity) {
    return { ok: false, error: "missing_fields" };
  }

  const locale = resolveLocale(input.locale);
  const classification = await resolveClassification(input);
  const jurisdictions = normalizeJurisdictions(input.jurisdictions);
  const niceClasses =
    classification.primaryClassNumbers.length > 0
      ? classification.primaryClassNumbers
      : classification.classes.map((c) => c.classNumber);

  if (await isDemoMode()) {
    const demo = await buildDemoSearchBundle({
      query,
      activity,
      niceClasses,
      jurisdictions,
      locale,
    });
    const report = buildReportFromMatches({
      query,
      activity,
      classification,
      locale,
      matches: demo.matches,
      externalBlocks: demo.externalBlocks,
    });
    const persisted = await persistCheck({
      query,
      activity,
      locale,
      userId: input.userId,
      classification,
      report,
      source: "mock",
      jurisdictions,
    });
    return {
      ok: true,
      source: "mock",
      report,
      checkId: persisted.checkId,
      verificationCode: persisted.verificationCode,
      conclusion: persisted.conclusion,
      demoMode: true,
    };
  }

  const upstream = process.env.BELGI_CHECK_API_URL?.trim();
  if (!upstream) {
    const matches = await searchLocalRegistry({
      query,
      niceClasses,
    });

    const externalWanted = jurisdictions.filter((j) =>
      EXTERNAL_CODES.includes(j),
    );
    const externalResults = await Promise.all(
      externalWanted.map(async (code) => {
        const result = await searchExternalJurisdiction(code, query, {
          niceClasses,
        });
        return { code, result };
      }),
    );

    const report = buildReportFromMatches({
      query,
      activity,
      classification,
      locale,
      matches,
      externalBlocks: externalResults.map(({ code, result }) => ({
        id: code,
        matches: result.matches,
        unavailable: result.unavailable,
        asOf: result.fetchedAt,
      })),
    });
    const persisted = await persistCheck({
      query,
      activity,
      locale,
      userId: input.userId,
      classification,
      report,
      source: "registry",
      jurisdictions,
    });
    return {
      ok: true,
      source: "registry",
      report,
      checkId: persisted.checkId,
      verificationCode: persisted.verificationCode,
      conclusion: persisted.conclusion,
    };
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const apiKey = process.env.BELGI_CHECK_API_KEY?.trim();
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const res = await fetch(upstream, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        activity,
        locale,
        jurisdictions,
        niceClasses: classification.classes,
        primaryClassNumbers: classification.primaryClassNumbers,
        activityNormalized: classification.activityNormalized,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, error: `upstream_${res.status}`, source: "upstream" };
    }

    const json = (await res.json()) as unknown;
    const payload =
      json && typeof json === "object" && "report" in json
        ? (json as { report: unknown }).report
        : json;

    const report = normalizeUpstream(
      payload,
      { query, activity },
      classification,
      locale,
    );
    const persisted = await persistCheck({
      query,
      activity,
      locale,
      userId: input.userId,
      classification,
      report,
      source: "upstream",
      jurisdictions,
    });

    return {
      ok: true,
      source: "upstream",
      report,
      checkId: persisted.checkId,
      verificationCode: persisted.verificationCode,
      conclusion: persisted.conclusion,
    };
  } catch (error) {
    console.error("[check:upstream]", error);
    return { ok: false, error: "upstream_failed", source: "upstream" };
  }
}
