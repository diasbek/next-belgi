import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/config";
import type { LegalDocMeta } from "@/data/legal/catalog";
import {
  formatLegalDocumentDate,
  formatLegalExportDateTime,
  getLegalPdfCopy,
} from "@/lib/legal/pdf-copy";
import {
  parseLegalMarkdown,
  type LegalMdBlock,
} from "@/lib/legal/parse-markdown";
import { ensureConclusionPdfFonts } from "@/components/pdf/conclusion/pdfFonts";
import { pdfBrand, pdfFontFamily } from "@/components/pdf/conclusion/pdfTheme";

export { ensureConclusionPdfFonts as ensureLegalPdfFonts };

const C = pdfBrand;

const styles = StyleSheet.create({
  page: {
    fontFamily: pdfFontFamily,
    fontSize: 9.5,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    color: C.ink,
    backgroundColor: C.surface,
  },
  brandBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: C.lime,
  },
  brand: {
    fontSize: 8,
    color: C.inkMuted,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: C.ink,
    lineHeight: 1.25,
  },
  metaBox: {
    borderWidth: 1,
    borderColor: C.borderSoft,
    backgroundColor: C.surfaceMuted,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  metaLabel: {
    width: "38%",
    fontSize: 8,
    color: C.inkMuted,
  },
  metaValue: {
    width: "62%",
    fontSize: 8.5,
    color: C.ink,
    fontWeight: 700,
  },
  h1: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 6,
  },
  h2: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 5,
  },
  h3: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 4,
  },
  p: {
    fontSize: 9.5,
    lineHeight: 1.45,
    marginBottom: 7,
    textAlign: "justify",
  },
  quote: {
    fontSize: 8.5,
    lineHeight: 1.4,
    marginBottom: 8,
    marginTop: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.limeSoft,
    borderLeftWidth: 3,
    borderLeftColor: C.lime,
    color: C.inkMuted,
  },
  li: {
    fontSize: 9.5,
    lineHeight: 1.4,
    marginBottom: 3,
    paddingLeft: 4,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
    marginVertical: 10,
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.footer,
  },
});

function BlockView({ block }: { block: LegalMdBlock }) {
  switch (block.type) {
    case "h1":
      return <Text style={styles.h1}>{block.text}</Text>;
    case "h2":
      return <Text style={styles.h2}>{block.text}</Text>;
    case "h3":
      return <Text style={styles.h3}>{block.text}</Text>;
    case "p":
      return <Text style={styles.p}>{block.text}</Text>;
    case "quote":
      return <Text style={styles.quote}>{block.text}</Text>;
    case "ul":
      return (
        <View style={{ marginBottom: 6 }}>
          {block.items.map((item, idx) => (
            <Text key={idx} style={styles.li}>
              • {item}
            </Text>
          ))}
        </View>
      );
    case "ol":
      return (
        <View style={{ marginBottom: 6 }}>
          {block.items.map((item, idx) => (
            <Text key={idx} style={styles.li}>
              {idx + 1}. {item}
            </Text>
          ))}
        </View>
      );
    case "hr":
      return <View style={styles.hr} />;
    default:
      return null;
  }
}

export type LegalPdfProps = {
  locale: Locale;
  title: string;
  markdown: string;
  meta: Pick<LegalDocMeta, "slug" | "version" | "documentDate" | "footerLabel">;
  /** Instant when the PDF is generated */
  exportedAt: Date;
};

export function LegalPdfDocument({
  locale,
  title,
  markdown,
  meta,
  exportedAt,
}: LegalPdfProps) {
  ensureConclusionPdfFonts();
  const copy = getLegalPdfCopy(locale);
  const blocks = parseLegalMarkdown(markdown);
  const docDate = formatLegalDocumentDate(meta.documentDate, locale);
  const exported = formatLegalExportDateTime(exportedAt, locale);

  return (
    <Document
      title={title}
      author="Belgi.ai"
      subject={`${meta.footerLabel[locale]} v${meta.version}`}
      creator="Belgi.ai"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.brandBar} fixed />
        <Text style={styles.brand}>{copy.brandLine}</Text>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{copy.versionLabel}</Text>
            <Text style={styles.metaValue}>{meta.version}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{copy.documentDateLabel}</Text>
            <Text style={styles.metaValue}>{docDate}</Text>
          </View>
          <View style={[styles.metaRow, { marginBottom: 0 }]}>
            <Text style={styles.metaLabel}>{copy.exportedAtLabel}</Text>
            <Text style={styles.metaValue}>{exported}</Text>
          </View>
        </View>

        {blocks.map((block, idx) => (
          <BlockView key={idx} block={block} />
        ))}

        <View style={styles.footer} fixed>
          <Text>
            Belgi.ai · {meta.slug} · v{meta.version}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              copy.pageOf
                .replace("{page}", String(pageNumber))
                .replace("{total}", String(totalPages))
            }
          />
        </View>
      </Page>
    </Document>
  );
}
