import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import {
  LEGAL_DOCS,
  type LegalDocMeta,
  type LegalGroup,
} from "@/data/legal/catalog";
import { LegalMarkdown } from "@/components/legal/LegalMarkdown";
import { PageContainer } from "@/components/atoms/PageContainer";
import { section, sectionLead, sectionTitle } from "@/styles/ui";
import {
  extractLegalTitle,
  loadLegalMarkdown,
} from "@/lib/legal/load";

const groupTitles: Record<
  LegalGroup,
  { uz: string; ru: string }
> = {
  public: {
    uz: "Ommaviy hujjatlar",
    ru: "Публичные документы",
  },
  filing: {
    uz: "Ariza topshirish",
    ru: "Подача заявки",
  },
  internal: {
    uz: "Ichki reglamentlar",
    ru: "Внутренние регламенты",
  },
};

const indexCopy = {
  uz: {
    title: "Yuridik hujjatlar",
    lead: "Belgi.ai ommaviy shartlari, ariza hujjatlari va ichki reglamentlar. Matnlar shablon; nashrdan oldin yurist bilan kelishiladi.",
  },
  ru: {
    title: "Юридические документы",
    lead: "Публичные условия Belgi.ai, документы для подачи заявки и внутренние регламенты. Тексты — шаблоны; до публикации согласуйте с юристом.",
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
  const indexHref = localePath(locale, "/legal/");

  return (
    <section className={`${section} bg-white`}>
      <PageContainer measure="copy">
        <p className="mb-4 text-sm text-ink-muted">
          <Link
            href={indexHref}
            className="underline-offset-2 hover:underline"
          >
            {locale === "ru" ? "Все документы" : "Barcha hujjatlar"}
          </Link>
          <span aria-hidden> · </span>
          <span>{meta.footerLabel[locale]}</span>
        </p>
        <LegalMarkdown content={markdown} />
        <p className="mt-10 text-xs text-ink-muted">
          {locale === "ru"
            ? "Рабочий шаблон. Перед публикацией заполните реквизиты и согласуйте с юристом."
            : "Ishchi shablon. Nashrdan oldin rekvizitlarni toʻldiring va yurist bilan kelishing."}
        </p>
      </PageContainer>
    </section>
  );
}

export function LegalIndexPageView({ locale }: { locale: Locale }) {
  const copy = indexCopy[locale];
  const groups: LegalGroup[] = ["public", "filing", "internal"];

  return (
    <section className={`${section} bg-white`}>
      <PageContainer measure="copy">
        <h1 className={sectionTitle}>{copy.title}</h1>
        <p className={sectionLead}>{copy.lead}</p>

        {groups.map((group) => {
          const docs = LEGAL_DOCS.filter((d) => d.group === group);
          return (
            <div key={group} className="mt-10">
              <h2 className="m-0 text-lg font-semibold text-ink">
                {groupTitles[group][locale]}
              </h2>
              <ul className="mt-4 divide-y divide-black/5 border-y border-black/5">
                {docs.map((doc) => (
                  <LegalIndexRow
                    key={doc.slug}
                    locale={locale}
                    doc={doc}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </PageContainer>
    </section>
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
        <span className="font-medium">{title}</span>
        <span className="shrink-0 text-ink-muted" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}
