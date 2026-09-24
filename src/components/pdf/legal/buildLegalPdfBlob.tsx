import { pdf } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/config";
import type { LegalDocMeta } from "@/data/legal/catalog";
import { LegalPdfDocument } from "./LegalPdfDocument";

export async function buildLegalPdfBlob(params: {
  locale: Locale;
  title: string;
  markdown: string;
  meta: LegalDocMeta;
  exportedAt?: Date;
}): Promise<{ blob: Blob; filename: string; exportedAt: Date }> {
  const exportedAt = params.exportedAt ?? new Date();
  const stamp = exportedAt
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const filename = `belgi-legal-${params.meta.slug}-v${params.meta.version}-${stamp}.pdf`;

  const blob = await pdf(
    <LegalPdfDocument
      locale={params.locale}
      title={params.title}
      markdown={params.markdown}
      meta={params.meta}
      exportedAt={exportedAt}
    />,
  ).toBlob();

  return { blob, filename, exportedAt };
}
