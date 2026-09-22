import { createHash, randomBytes } from "crypto";
import type { Locale } from "@/i18n/config";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";
import { localePath } from "@/i18n/paths";
import type { TrademarkReport } from "@/lib/check/types";
import { getConclusionCopy } from "./copy";
import { mapRisksToVerdict } from "./mapRiskToChance";
import type {
  ConclusionDocument,
  ConclusionInternetItem,
  ConclusionMatchCard,
} from "./types";

function formatDate(d: Date, locale: Locale): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  if (locale === "en") return `${day}.${month}.${year}`;
  return `${day}.${month}.${year} y.`;
}

function parseNiceClassNumbers(niceClasses: string[]): number[] {
  const out: number[] = [];
  for (const raw of niceClasses) {
    const m = String(raw).match(/(\d{1,2})/);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 45 && !out.includes(n)) out.push(n);
    }
  }
  return out;
}

function noteForMatch(
  similarity: number | undefined,
  copyNote: string,
): string | undefined {
  if (similarity == null) return undefined;
  if (similarity >= 70) return copyNote;
  return undefined;
}

function toMatchCards(
  matches: TrademarkReport["sources"][number]["matches"],
  strongOverlapNote: string,
): ConclusionMatchCard[] {
  return matches.map((m) => ({
    id: m.id,
    name: m.name,
    owner: m.owner,
    term: [m.registeredFrom, m.registeredTo].filter(Boolean).join(" - ") || undefined,
    status: m.status,
    classesText: m.classesText,
    imageUrl: m.imageUrl,
    similarity: m.similarity,
    note: noteForMatch(m.similarity, strongOverlapNote),
  }));
}

export function generateVerificationCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 10).toUpperCase();
}

export function hashConclusionPayload(doc: ConclusionDocument): string {
  const { verification: _v, ...rest } = doc;
  const canonical = JSON.stringify(rest);
  return createHash("sha256").update(canonical).digest("hex");
}

export function buildDocNumber(issuedAt: Date, code: string): string {
  const y = issuedAt.getFullYear();
  return `BELGI-${y}-${code.slice(0, 6)}`;
}

export function buildConclusionDocument(params: {
  report: TrademarkReport;
  locale: Locale;
  verificationCode: string;
  issuedAt?: Date;
  preview?: boolean;
}): ConclusionDocument {
  const issuedAt = params.issuedAt ?? new Date();
  const reportAt = issuedAt;
  const locale = params.locale;
  const copy = getConclusionCopy(locale);
  const code = params.verificationCode;
  const site = getCanonicalSiteUrl();
  const verifyPath = localePath(locale, `/v/${code}/`);
  const url = `${site}${verifyPath}`;

  const uz = params.report.sources.find((s) => s.id === "uz");
  const madrid = params.report.sources.find(
    (s) => s.id === "wipo" || s.id === "madrid",
  );
  const internet = params.report.sources.find(
    (s) => s.id === "internet" || s.id === "web",
  );

  const internetItems: ConclusionInternetItem[] = (internet?.matches ?? []).map(
    (m) => ({
      title: m.name,
      url: m.sourceLabel?.startsWith("http") ? m.sourceLabel : undefined,
      note: m.classesText || m.owner,
    }),
  );

  const niceClasses =
    params.report.classRisks.map((r) => r.classNumber).filter((n) => n > 0)
      .length > 0
      ? params.report.classRisks.map((r) => r.classNumber)
      : parseNiceClassNumbers(params.report.niceClasses);

  return {
    docNumber: buildDocNumber(issuedAt, code),
    locale,
    issuedAt: formatDate(issuedAt, locale),
    reportAt: formatDate(reportAt, locale),
    agencyName: copy.agencyName,
    title: copy.title,
    subject: {
      appearance: copy.appearanceWord,
      mark: params.report.query,
      markType: params.report.markType,
      niceClasses,
    },
    methodology: {
      intro: copy.methodologyIntro,
      excludedTitle: copy.excludedTitle,
      excluded: copy.excluded,
    },
    sections: {
      adliyaTitle: copy.adliyaTitle,
      adliya: toMatchCards(uz?.matches ?? [], copy.strongOverlapNote),
      adliyaEmpty: copy.emptyMatches,
      madridTitle: copy.madridTitle,
      madrid: toMatchCards(madrid?.matches ?? [], copy.strongOverlapNote),
      madridEmpty: copy.emptyMatches,
      internetTitle: copy.internetTitle,
      internetSubtitle: copy.internetSubtitle,
      internet: internetItems,
      internetEmpty: copy.emptyMatches,
    },
    verdict: {
      title: copy.verdictTitle,
      lead: copy.verdictLead,
      byClass: mapRisksToVerdict(
        params.report.classRisks.length
          ? params.report.classRisks
          : niceClasses.map((classNumber) => ({
              classNumber,
              percent: 15,
            })),
      ).filter((v) => v.classNumber > 0),
    },
    disclaimer: params.report.disclaimer || copy.disclaimer,
    verification: {
      code,
      url,
      label: copy.verifyLabel,
    },
    preview: params.preview,
  };
}
