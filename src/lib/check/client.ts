import { classifyActivity } from "@/lib/classify";
import {
  classRisksFromClassification,
  niceClassesFromClassification,
} from "@/lib/classify";
import type { ActivityClassification } from "@/lib/classify";
import { insertTrademarkCheck } from "@/lib/db";
import { buildMockReport } from "./mock";
import type { CheckRequest, CheckResponse, TrademarkReport } from "./types";

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
): TrademarkReport {
  if (!raw || typeof raw !== "object") {
    return buildMockReport(fallback.query, fallback.activity, classification);
  }

  const data = raw as Partial<TrademarkReport> & Record<string, unknown>;
  const base = buildMockReport(
    fallback.query,
    fallback.activity,
    classification,
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
  source: "mock" | "upstream";
}): Promise<string | null> {
  try {
    return await insertTrademarkCheck({
      userId: params.userId ?? null,
      query: params.query,
      activityRaw: params.activity,
      activityNormalized: params.classification.activityNormalized,
      locale: params.locale ?? "uz",
      niceClasses: params.classification.classes,
      classificationSource: params.classification.source,
      report: params.report,
      source: params.source,
    });
  } catch (error) {
    console.warn("[check:persist]", error);
    return null;
  }
}

/**
 * Server-side check client.
 * 1) Classify activity → Nice classes (OpenAI / cache / fallback)
 * 2) When BELGI_CHECK_API_URL is set, proxies to upstream; otherwise mock.
 * 3) Persist check row when Supabase service role is configured.
 */
export async function runTrademarkCheck(
  input: CheckRequest & { userId?: string | null },
): Promise<CheckResponse & { checkId?: string | null }> {
  const query = input.query.trim();
  const activity = input.activity.trim();

  if (!query || !activity) {
    return { ok: false, error: "missing_fields" };
  }

  const classification = await classifyActivity({
    activity,
    locale: input.locale,
  });

  const upstream = process.env.BELGI_CHECK_API_URL?.trim();
  if (!upstream) {
    const report = buildMockReport(query, activity, classification);
    const checkId = await persistCheck({
      query,
      activity,
      locale: input.locale,
      userId: input.userId,
      classification,
      report,
      source: "mock",
    });
    return {
      ok: true,
      source: "mock",
      report,
      checkId,
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
        locale: input.locale ?? "uz",
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
    );
    const checkId = await persistCheck({
      query,
      activity,
      locale: input.locale,
      userId: input.userId,
      classification,
      report,
      source: "upstream",
    });

    return {
      ok: true,
      source: "upstream",
      report,
      checkId,
    };
  } catch (error) {
    console.error("[check:upstream]", error);
    return { ok: false, error: "upstream_failed", source: "upstream" };
  }
}
