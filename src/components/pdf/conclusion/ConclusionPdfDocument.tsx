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

export { ensureConclusionPdfFonts };

const BLUE = "#c5daf5";
const BORDER = "#222";

const styles = StyleSheet.create({
  page: {
    fontFamily: "DejaVu",
    fontSize: 9,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 32,
    color: "#111",
  },
  agency: {
    fontSize: 7.5,
    color: "#444",
    marginBottom: 4,
  },
  title: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 8,
  },
  subjectTable: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 6,
  },
  subjectHeader: {
    flexDirection: "row",
    backgroundColor: BLUE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  subjectRow: {
    flexDirection: "row",
  },
  cell: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cAppear: { width: "34%" },
  cMark: { width: "33%" },
  cClass: { width: "33%" },
  intro: {
    fontSize: 7.5,
    lineHeight: 1.25,
    textAlign: "justify",
    marginBottom: 3,
  },
  excludedTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    marginBottom: 1,
    marginTop: 2,
  },
  excludedItem: {
    fontSize: 7.5,
    marginLeft: 6,
    marginBottom: 0,
    lineHeight: 1.2,
  },
  sectionBar: {
    backgroundColor: BLUE,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 8,
    marginBottom: 0,
  },
  sectionBarText: {
    fontSize: 9,
    fontWeight: 700,
  },
  matchTable: {
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 0,
    marginBottom: 4,
  },
  matchHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "#f7f7f7",
  },
  matchBody: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    minHeight: 56,
  },
  matchFoot: {
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 7.5,
  },
  colImg: {
    width: "32%",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  colOwner: {
    width: "40%",
    borderRightWidth: 1,
    borderRightColor: BORDER,
    padding: 5,
    justifyContent: "center",
  },
  colTerm: {
    width: "28%",
    padding: 5,
    justifyContent: "center",
  },
  headCell: {
    fontSize: 7,
    fontWeight: 700,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  logo: {
    width: 64,
    height: 48,
    objectFit: "contain",
  },
  logoFallback: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
  },
  matchMeta: {
    fontSize: 7.5,
    color: "#222",
    marginBottom: 1,
  },
  statusPill: {
    marginTop: 3,
    alignSelf: "flex-start",
    backgroundColor: "#ececec",
    paddingVertical: 1,
    paddingHorizontal: 4,
    fontSize: 6.5,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 0,
    paddingVertical: 5,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  empty: {
    fontSize: 8,
    color: "#333",
  },
  note: {
    fontSize: 7,
    marginTop: 2,
    color: "#444",
  },
  verdictBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 0,
    padding: 6,
    marginBottom: 4,
  },
  verdictLead: {
    fontSize: 8,
    marginBottom: 3,
  },
  verdictLine: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
  },
  disclaimer: {
    fontSize: 7,
    lineHeight: 1.25,
    marginTop: 6,
    color: "#333",
    textAlign: "justify",
  },
  qrBlock: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 6,
  },
  qrImage: {
    width: 56,
    height: 56,
    marginRight: 10,
  },
  qrText: {
    fontSize: 7.5,
    lineHeight: 1.3,
    flex: 1,
  },
  qrCode: {
    fontFamily: "DejaVu",
    fontWeight: 700,
    fontSize: 8,
    marginTop: 1,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "15%",
    fontSize: 48,
    color: "#e8e8e8",
    transform: "rotate(-30deg)",
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#888",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function SectionBar({ title }: { title: string }) {
  return (
    <View style={styles.sectionBar} wrap={false}>
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

        <SectionBar title={data.sections.internetTitle} />
        <View style={styles.emptyBox}>
          <Text style={[styles.empty, { marginBottom: 2 }]}>
            {data.sections.internetSubtitle}
          </Text>
          {data.sections.internet.length === 0 ? (
            <Text style={styles.empty}>{data.sections.internetEmpty}</Text>
          ) : (
            data.sections.internet.map((item, i) => (
              <View key={`${item.title}-${i}`} style={{ marginBottom: 2 }}>
                <Text style={{ fontSize: 8, fontWeight: 700 }}>
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
