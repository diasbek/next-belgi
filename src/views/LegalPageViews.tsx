import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import {
  LEGAL_GROUPS,
  docsInGroup,
  getLegalGroup,
  relatedDocs,
  type LegalDocMeta,
} from "@/data/legal/catalog";
import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { PageContainer } from "@/components/atoms/PageContainer";
import { PageHero } from "@/components/molecules/PageHero";
import { LegalPdfButton } from "@/components/pdf/legal/LegalPdfButton";
import { sectionDense } from "@/styles/ui";
import {
  extractLegalDescription,
  extractLegalTitle,
  loadLegalMarkdown,
  stripLeadingLegalH1,
} from "@/lib/legal/load";
import {
  formatLegalDocumentDate,
  getLegalPdfCopy,
} from "@/lib/legal/pdf-copy";

const indexCopy = {
  uz: {
    title: "Yuridik hujjatlar",
    lead: "Hujjatlar maʼno boʻyicha guruhlangan. Matnlar shablon — nashrdan oldin yurist bilan kelishiladi.",
    related: "Shu boʻlimdagi boshqa hujjatlar",
    internalNote: "Ichki reglamentlar asosan jamoa uchun; ommaviy foydalanish shart emas.",
    allDocs: "Barcha hujjatlar",
    templateNote:
      "Ishchi shablon. Nashrdan oldin rekvizitlarni toʻldiring va yurist bilan kelishing.",
  },
  ru: {
    title: "Юридические документы",
    lead: "Документы сгруппированы по смыслу. Тексты — шаблоны; до публикации согласуйте с юристом.",
    related: "Другие документы в этом разделе",
    internalNote:
      "Внутренние регламенты в основном для команды; публиковать их не обязательно.",
    allDocs: "Все документы",
    templateNote:
      "Рабочий шаблон. Перед публикацией заполните реквизиты и согласуйте с юристом.",
  },
  en: {
    title: "Legal documents",
    lead: "Documents grouped by topic. Texts are templates — agree them with a lawyer before publishing.",
    related: "Other documents in this section",
    internalNote:
      "Internal policies are mainly for the team; publishing them is optional.",
    allDocs: "All documents",
    templateNote:
      "Working template. Fill in the details and agree with a lawyer before publishing.",
  },
};

export function LegalDocPageView({
  locale,
  meta,
  markdown,
}: {
  locale: Locale;
  meta: LegalDocMeta;
  markdown: string;
}) {
  const group = getLegalGroup(meta.group);
  const related = relatedDocs(meta);
  const indexHref = localePath(locale, "/legal/");
  const groupHref = localePath(locale, `/legal/#${meta.group}`);
  const title = extractLegalTitle(markdown, meta.footerLabel[locale]);
  const lead = extractLegalDescription(markdown, group.lead[locale]);
  const bodyMd = stripLeadingLegalH1(markdown);
  const pdfCopy = getLegalPdfCopy(locale);
  const docDateLabel = formatLegalDocumentDate(meta.documentDate, locale);

  return (
    <>
      <PageHero
        title={title}
        lead={lead}
        titleMaxCh={28}
        breadcrumb={
          <>
            <Link href={indexHref} className="underline-offset-2 hover:underline">
              {indexCopy[locale].allDocs}
            </Link>
            <span aria-hidden> › </span>
            <Link href={groupHref} className="underline-offset-2 hover:underline">
              {group.title[locale]}
            </Link>
          </>
        }
        actions={
          <LegalPdfButton
            locale={locale}
            title={title}
            markdown={markdown}
            meta={meta}
          />
        }
      />

      <section className={`${sectionDense} bg-white`}>
        <PageContainer measure="copy">
          <p className="m-0 mb-6 text-xs text-ink-muted sm:mb-8">
            {pdfCopy.versionLabel}: <strong className="text-ink">{meta.version}</strong>
            {" · "}
            {pdfCopy.documentDateLabel}:{" "}
            <strong className="text-ink">{docDateLabel}</strong>
          </p>

          <LegalMarkdown content={bodyMd} />

          {related.length ? (
            <div className="mt-8 border-t border-black/5 pt-5 sm:mt-10 sm:pt-6">
              <h2 className="m-0 text-base font-semibold text-ink">
                {indexCopy[locale].related}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {related.map((doc) => (
                  <li key={doc.slug}>
                    <Link
                      href={localePath(locale, `/legal/${doc.slug}/`)}
                      className="text-sm font-medium text-ink underline-offset-2 hover:underline"
                    >
                      {doc.footerLabel[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-8 text-xs text-ink-muted sm:mt-10">
            {indexCopy[locale].templateNote}
          </p>
        </PageContainer>
      </section>
    </>
  );
}

export function LegalIndexPageView({ locale }: { locale: Locale }) {
  const copy = indexCopy[locale];

  return (
    <>
      <PageHero eyebrow="Belgi.ai" title={copy.title} lead={copy.lead} />

      <section className={`${sectionDense} bg-white`}>
        <PageContainer measure="copy">
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Sections"
          >
            {LEGAL_GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-black/10 bg-[#f3f4f1] px-3 py-1.5 text-sm font-medium text-ink hover:bg-lime"
              >
                {group.title[locale]}
              </a>
            ))}
          </nav>

          {LEGAL_GROUPS.map((group) => {
            const docs = docsInGroup(group.id);
            return (
              <div
                key={group.id}
                id={group.id}
                className="mt-8 scroll-mt-[calc(var(--header-height)+0.75rem)] sm:mt-12"
              >
                <h2 className="m-0 text-lg font-semibold text-ink">
                  {group.title[locale]}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">{group.lead[locale]}</p>
                {!group.public ? (
                  <p className="mt-2 text-xs text-ink-muted">{copy.internalNote}</p>
                ) : null}
                <ul className="mt-4 divide-y divide-black/5 border-y border-black/5">
                  {docs.map((doc) => (
                    <LegalIndexRow key={doc.slug} locale={locale} doc={doc} />
                  ))}
                </ul>
              </div>
            );
          })}
        </PageContainer>
      </section>
    </>
  );
}

function LegalIndexRow({
  locale,
  doc,
}: {
  locale: Locale;
  doc: LegalDocMeta;
}) {
  const md = loadLegalMarkdown(locale, doc);
  const title = md
    ? extractLegalTitle(md, doc.footerLabel[locale])
    : doc.footerLabel[locale];

  return (
    <li>
      <Link
        href={localePath(locale, `/legal/${doc.slug}/`)}
        className="flex items-start justify-between gap-3 py-3 text-sm text-ink transition-colors hover:text-ink-muted"
      >
        <span className="min-w-0">
          <span className="font-medium">{title}</span>
          <span className="mt-0.5 block text-xs text-ink-muted">
            {doc.footerLabel[locale]}
          </span>
        </span>
        <span className="shrink-0 text-ink-muted" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}
