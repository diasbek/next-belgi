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

const styles = StyleSheet.create({
  page: {
    fontFamily: "DejaVu",
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    color: "#111",
  },
  agency: {
    fontSize: 8,
    color: "#444",
    marginBottom: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 8,
  },
  subjectTable: {
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  subjectRow: {
    flexDirection: "row",
  },
  cell: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#222",
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cAppear: { width: "28%" },
  cMark: { width: "44%" },
  cClass: { width: "28%" },
  intro: {
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 8,
  },
  excludedTitle: {
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 2,
  },
  excludedItem: {
    fontSize: 8,
    marginLeft: 8,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
  },
  matchCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: "row",
    gap: 8,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  matchName: {
    fontSize: 10,
    fontWeight: 700,
  },
  matchMeta: {
    fontSize: 8,
    color: "#333",
    marginTop: 2,
  },
  note: {
    fontSize: 7.5,
    marginTop: 4,
    color: "#444",
  },
  empty: {
    fontSize: 8,
    marginBottom: 6,
    color: "#333",
  },
  verdictTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 4,
  },
  verdictLead: {
    fontSize: 8,
    marginBottom: 4,
  },
  verdictLine: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 2,
  },
  disclaimer: {
    fontSize: 7.5,
    lineHeight: 1.35,
    marginTop: 10,
    color: "#333",
    textAlign: "justify",
  },
  qrBlock: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  qrImage: {
    width: 72,
    height: 72,
  },
  qrText: {
    fontSize: 8,
    lineHeight: 1.35,
    flex: 1,
  },
  qrCode: {
    fontFamily: "DejaVu",
    fontWeight: 700,
    fontSize: 9,
    marginTop: 2,
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
    bottom: 18,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#888",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function MatchCards({
  cards,
  empty,
  ownerLabel,
  termLabel,
}: {
  cards: ConclusionDocument["sections"]["adliya"];
  empty: string;
  ownerLabel: string;
  termLabel: string;
}) {
  if (!cards.length) {
    return <Text style={styles.empty}>{empty}</Text>;
  }
  return (
    <>
      {cards.map((m) => (
        <View key={m.id} style={styles.matchCard} wrap={false}>
          <View style={styles.matchRow}>
            {m.imageUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={m.imageUrl} style={styles.logo} />
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.matchName}>{m.name}</Text>
              {m.owner ? (
                <Text style={styles.matchMeta}>
                  {ownerLabel}: {m.owner}
                </Text>
              ) : null}
              {m.term ? (
                <Text style={styles.matchMeta}>
                  {termLabel}: {m.term}
                </Text>
              ) : null}
              {m.status ? (
                <Text style={styles.matchMeta}>[{m.status}]</Text>
              ) : null}
              {m.classesText ? (
                <Text style={styles.matchMeta}>{m.classesText}</Text>
              ) : null}
              {m.similarity != null ? (
                <Text style={styles.matchMeta}>{m.similarity}%</Text>
              ) : null}
              {m.note ? <Text style={styles.note}>{m.note}</Text> : null}
            </View>
          </View>
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
      <Page size="A4" style={styles.page}>
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
            <Text style={[styles.cell, styles.cAppear]}>
              {data.subject.appearance}
            </Text>
            <Text style={[styles.cell, styles.cMark]}>{data.subject.mark}</Text>
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
            - {line}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>{data.sections.adliyaTitle}</Text>
        <MatchCards
          cards={data.sections.adliya}
          empty={data.sections.adliyaEmpty}
          ownerLabel={copy.ownerLabel}
          termLabel={copy.termLabel}
        />

        <Text style={styles.footer}>
          <Text>{data.docNumber}</Text>
          <Text>1</Text>
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        {data.preview ? (
          <Text style={styles.watermark}>{copy.previewWatermark}</Text>
        ) : null}

        <Text style={styles.agency}>{data.agencyName}</Text>

        <Text style={styles.sectionTitle}>{data.sections.madridTitle}</Text>
        <MatchCards
          cards={data.sections.madrid}
          empty={data.sections.madridEmpty}
          ownerLabel={copy.ownerLabel}
          termLabel={copy.termLabel}
        />

        <Text style={styles.sectionTitle}>{data.sections.internetTitle}</Text>
        <Text style={[styles.empty, { marginBottom: 4 }]}>
          {data.sections.internetSubtitle}
        </Text>
        {data.sections.internet.length === 0 ? (
          <Text style={styles.empty}>{data.sections.internetEmpty}</Text>
        ) : (
          data.sections.internet.map((item, i) => (
            <View key={`${item.title}-${i}`} style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 9, fontWeight: 700 }}>
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

        <Text style={styles.verdictTitle}>{data.verdict.title}</Text>
        <Text style={styles.verdictLead}>{data.verdict.lead}</Text>
        {data.verdict.byClass.map((v) => (
          <Text key={v.classNumber} style={styles.verdictLine}>
            {copy.classLabel} {v.classNumber} — {v.chanceLabel}
          </Text>
        ))}

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

        <Text style={styles.footer}>
          <Text>{data.docNumber}</Text>
          <Text>2</Text>
        </Text>
      </Page>
    </Document>
  );
}
