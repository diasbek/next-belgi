import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ConclusionDocument } from "@/lib/conclusion";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import { ensureConclusionPdfFonts } from "./pdfFonts";
import { pdfBrand, pdfFontFamily } from "./pdfTheme";

export { ensureConclusionPdfFonts };

const C = pdfBrand;

const styles = StyleSheet.create({
  page: {
    fontFamily: pdfFontFamily,
    fontSize: 9.5,
    paddingTop: 34,
    paddingBottom: 36,
    paddingHorizontal: 34,
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
  agency: {
    fontSize: 8,
    color: C.inkMuted,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  title: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: 0.4,
    color: C.ink,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 8.5,
    color: C.inkMuted,
  },
  subjectTable: {
    borderWidth: 1.25,
    borderColor: C.border,
    marginBottom: 8,
  },
  subjectHeader: {
    flexDirection: "row",
    backgroundColor: C.lime,
    borderBottomWidth: 1.25,
    borderBottomColor: C.border,
  },
  subjectRow: {
    flexDirection: "row",
    backgroundColor: C.surface,
  },
  cell: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 8.5,
    color: C.ink,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cAppear: { width: "34%" },
  cMark: { width: "33%" },
  cClass: { width: "33%" },
  intro: {
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 4,
    color: C.ink,
  },
  excludedTitle: {
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 2,
    marginTop: 3,
    color: C.ink,
  },
  excludedItem: {
    fontSize: 8,
    marginLeft: 6,
    marginBottom: 1,
    lineHeight: 1.3,
    color: C.inkMuted,
  },
  sectionBar: {
    backgroundColor: C.lime,
    paddingVertical: 4,
    paddingHorizontal: 7,
    marginTop: 10,
    marginBottom: 0,
    borderWidth: 1.25,
    borderColor: C.border,
    borderBottomWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionBarAccent: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: C.primary,
    marginRight: 7,
    marginLeft: -7,
    marginVertical: -4,
  },
  sectionBarText: {
    fontSize: 9.5,
    fontWeight: 700,
    color: C.ink,
  },
  matchTable: {
    borderWidth: 1.25,
    borderColor: C.border,
    borderTopWidth: 0,
    marginBottom: 5,
  },
  matchHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surfaceMuted,
  },
  matchBody: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: 56,
    backgroundColor: C.surface,
  },
  matchFoot: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: C.rowSelected,
  },
  colImg: {
    width: "32%",
    borderRightWidth: 1,
    borderRightColor: C.border,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  colOwner: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: C.border,
    padding: 6,
    justifyContent: "center",
  },
  colTerm: {
    width: "28%",
    padding: 6,
    justifyContent: "center",
  },
  headCell: {
    fontSize: 7.5,
    fontWeight: 700,
    paddingVertical: 3,
    paddingHorizontal: 5,
    color: C.ink,
  },
  logo: {
    width: 64,
    height: 48,
    objectFit: "contain",
  },
  logoFallback: {
    fontSize: 9.5,
    fontWeight: 700,
    textAlign: "center",
    color: C.ink,
  },
  matchMeta: {
    fontSize: 8,
    color: C.ink,
    marginBottom: 1,
  },
  statusPill: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: C.limeSoft,
    borderWidth: 1,
    borderColor: C.primary,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 7,
    fontWeight: 700,
    color: C.ink,
  },
  emptyBox: {
    borderWidth: 1.25,
    borderColor: C.border,
    borderTopWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 7,
    marginBottom: 5,
    backgroundColor: C.surfaceMuted,
  },
  empty: {
    fontSize: 8.5,
    color: C.inkMuted,
  },
  note: {
    fontSize: 7.5,
    marginTop: 2,
    color: C.inkMuted,
  },
  verdictBox: {
    borderWidth: 1.25,
    borderColor: C.border,
    borderTopWidth: 0,
    padding: 8,
    marginBottom: 5,
    backgroundColor: C.rowSelected,
  },
  verdictLead: {
    fontSize: 8.5,
    marginBottom: 4,
    color: C.ink,
  },
  verdictLine: {
    fontSize: 9.5,
    fontWeight: 700,
    marginBottom: 2,
    color: C.ink,
  },
  disclaimer: {
    fontSize: 7.5,
    lineHeight: 1.35,
    marginTop: 8,
    color: C.inkMuted,
    textAlign: "justify",
  },
  qrBlock: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1.25,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  qrImage: {
    width: 56,
    height: 56,
    marginRight: 10,
  },
  qrText: {
    fontSize: 8,
    lineHeight: 1.35,
    flex: 1,
    color: C.ink,
  },
  qrCode: {
    fontFamily: pdfFontFamily,
    fontWeight: 700,
    fontSize: 9,
    marginTop: 2,
    color: C.ink,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "12%",
    fontSize: 48,
    color: C.watermark,
    transform: "rotate(-30deg)",
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 34,
    right: 34,
    fontSize: 7.5,
    color: C.footer,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.borderSoft,
    paddingTop: 4,
  },
});

function SectionBar({ title }: { title: string }) {
  return (
    <View style={styles.sectionBar} wrap={false}>
      <View style={styles.sectionBarAccent} />
      <Text style={styles.sectionBarText}>{title}</Text>
    </View>
  );
}

function MatchCards({
  cards,
  empty,
  ownerLabel,
  termLabel,
  viewColLabel,
}: {
  cards: ConclusionDocument["sections"]["adliya"];
  empty: string;
  ownerLabel: string;
  termLabel: string;
  viewColLabel: string;
}) {
  if (!cards.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.empty}>{empty}</Text>
      </View>
    );
  }
  return (
    <>
      {cards.map((m) => (
        <View key={m.id} style={styles.matchTable} wrap={false}>
          <View style={styles.matchHead}>
            <View style={[styles.colImg, { paddingVertical: 3 }]}>
              <Text style={styles.headCell}>{viewColLabel}</Text>
            </View>
            <View style={[styles.colOwner, { paddingVertical: 3 }]}>
              <Text style={styles.headCell}>{ownerLabel}</Text>
            </View>
            <View style={[styles.colTerm, { paddingVertical: 3 }]}>
              <Text style={styles.headCell}>{termLabel}</Text>
            </View>
          </View>
          <View style={styles.matchBody}>
            <View style={styles.colImg}>
              {m.imageUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={m.imageUrl} style={styles.logo} />
              ) : (
                <Text style={styles.logoFallback}>{m.name}</Text>
              )}
            </View>
            <View style={styles.colOwner}>
              <Text style={styles.matchMeta}>{m.owner || "—"}</Text>
              {m.similarity != null ? (
                <Text style={styles.matchMeta}>{m.similarity}%</Text>
              ) : null}
            </View>
            <View style={styles.colTerm}>
              <Text style={styles.matchMeta}>{m.term || "—"}</Text>
              {m.status ? (
                <Text style={styles.statusPill}>{m.status}</Text>
              ) : null}
            </View>
          </View>
          {m.classesText || m.note ? (
            <View style={styles.matchFoot}>
              {m.classesText ? (
                <Text style={styles.matchMeta}>{m.classesText}</Text>
              ) : null}
              {m.note ? <Text style={styles.note}>{m.note}</Text> : null}
            </View>
          ) : null}
        </View>
      ))}
    </>
  );
}

export function ConclusionPdfDocument({
  data,
  qrDataUrl,
}: {
  data: ConclusionDocument;
  qrDataUrl?: string | null;
}) {
  ensureConclusionPdfFonts();
  const copy = getConclusionCopy(data.locale);
  const showQr = Boolean(qrDataUrl) && !data.preview;

  return (
    <Document
      title={data.docNumber}
      author="Belgi.ai"
      subject={data.subject.mark}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.brandBar} fixed />

        {data.preview ? (
          <Text style={styles.watermark}>{copy.previewWatermark}</Text>
        ) : null}

        <Text style={styles.agency}>{data.agencyName}</Text>
        <Text style={styles.title}>{data.title}</Text>

        <View style={styles.metaRow}>
          <Text>
            {copy.issuedLabel}: {data.issuedAt}
          </Text>
          <Text>
            {copy.reportLabel}: {data.reportAt}
          </Text>
        </View>

        <View style={styles.subjectTable}>
          <View style={styles.subjectHeader}>
            <Text style={[styles.cell, styles.cAppear, { fontWeight: 700 }]}>
              {copy.viewLabel}
            </Text>
            <Text style={[styles.cell, styles.cMark, { fontWeight: 700 }]}>
              {copy.markLabel}
            </Text>
            <Text
              style={[
                styles.cell,
                styles.cClass,
                styles.cellLast,
                { fontWeight: 700 },
              ]}
            >
              {copy.classLabel}
            </Text>
          </View>
          <View style={styles.subjectRow}>
            <Text style={[styles.cell, styles.cAppear, { fontWeight: 700 }]}>
              {data.subject.mark}
            </Text>
            <Text style={[styles.cell, styles.cMark]}>
              {data.subject.markType || data.subject.appearance}
            </Text>
            <Text style={[styles.cell, styles.cClass, styles.cellLast]}>
              {data.subject.niceClasses.join(", ") || "—"}
            </Text>
          </View>
        </View>

        <Text style={styles.intro}>{data.methodology.intro}</Text>
        <Text style={styles.excludedTitle}>
          {data.methodology.excludedTitle}
        </Text>
        {data.methodology.excluded.map((line) => (
          <Text key={line} style={styles.excludedItem}>
            — {line}
          </Text>
        ))}

        <SectionBar title={data.sections.adliyaTitle} />
        <MatchCards
          cards={data.sections.adliya}
          empty={data.sections.adliyaEmpty}
          ownerLabel={copy.ownerLabel}
          termLabel={copy.termLabel}
          viewColLabel={copy.viewLabel}
        />

        <SectionBar title={data.sections.madridTitle} />
        <MatchCards
          cards={data.sections.madrid}
          empty={data.sections.madridEmpty}
          ownerLabel={copy.ownerLabel}
          termLabel={copy.termLabel}
          viewColLabel={copy.viewLabel}
        />

        {(data.sections.extras || []).map((extra) => (
          <View key={extra.id}>
            <SectionBar title={extra.title} />
            {extra.asOf ? (
              <Text style={[styles.empty, { marginBottom: 2 }]}>
                {extra.asOf}
              </Text>
            ) : null}
            <MatchCards
              cards={extra.matches}
              empty={extra.empty}
              ownerLabel={copy.ownerLabel}
              termLabel={copy.termLabel}
              viewColLabel={copy.viewLabel}
            />
          </View>
        ))}

        <SectionBar title={data.sections.internetTitle} />
        <View style={styles.emptyBox}>
          <Text style={[styles.empty, { marginBottom: 2, color: C.ink }]}>
            {data.sections.internetSubtitle}
          </Text>
          {data.sections.internet.length === 0 ? (
            <Text style={styles.empty}>{data.sections.internetEmpty}</Text>
          ) : (
            data.sections.internet.map((item, i) => (
              <View key={`${item.title}-${i}`} style={{ marginBottom: 2 }}>
                <Text style={{ fontSize: 8.5, fontWeight: 700, color: C.ink }}>
                  {i + 1}. {item.title}
                </Text>
                {item.note ? (
                  <Text style={styles.matchMeta}>{item.note}</Text>
                ) : null}
                {item.url ? (
                  <Text style={styles.matchMeta}>{item.url}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>

        <SectionBar title={data.verdict.title} />
        <View style={styles.verdictBox}>
          <Text style={styles.verdictLead}>{data.verdict.lead}</Text>
          {data.verdict.byClass.map((v) => (
            <Text key={v.classNumber} style={styles.verdictLine}>
              {copy.classLabel} {v.classNumber} — {v.chanceLabel}
            </Text>
          ))}
        </View>

        <Text style={styles.disclaimer}>{data.disclaimer}</Text>

        {showQr ? (
          <View style={styles.qrBlock} wrap={false}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qrDataUrl!} style={styles.qrImage} />
            <View style={styles.qrText}>
              <Text>{data.verification.label}</Text>
              <Text style={styles.qrCode}>{data.verification.code}</Text>
              <Text>{data.verification.url}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>{data.docNumber}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
