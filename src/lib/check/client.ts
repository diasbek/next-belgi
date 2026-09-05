import { buildMockReport } from "./mock";
import type { CheckRequest, CheckResponse, TrademarkReport } from "./types";

function normalizeUpstream(raw: unknown, fallback: CheckRequest): TrademarkReport {
  if (!raw || typeof raw !== "object") {
    return buildMockReport(fallback.query, fallback.activity);
  }

  const data = raw as Partial<TrademarkReport> & Record<string, unknown>;
  const base = buildMockReport(fallback.query, fallback.activity);

  return {
    ...base,
    ...data,
    query: typeof data.query === "string" ? data.query : fallback.query,
    activity:
      typeof data.activity === "string" ? data.activity : fallback.activity,
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
  };
}

/**
 * Server-side check client.
 * When BELGI_CHECK_API_URL is set, proxies to upstream; otherwise returns mock.
 */
export async function runTrademarkCheck(
  input: CheckRequest,
): Promise<CheckResponse> {
  const query = input.query.trim();
  const activity = input.activity.trim();

  if (!query || !activity) {
    return { ok: false, error: "missing_fields" };
  }

  const upstream = process.env.BELGI_CHECK_API_URL?.trim();
  if (!upstream) {
    return {
      ok: true,
      source: "mock",
      report: buildMockReport(query, activity),
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

    return {
      ok: true,
      source: "upstream",
      report: normalizeUpstream(payload, { query, activity }),
    };
  } catch (error) {
    console.error("[check:upstream]", error);
    return { ok: false, error: "upstream_failed", source: "upstream" };
  }
}
