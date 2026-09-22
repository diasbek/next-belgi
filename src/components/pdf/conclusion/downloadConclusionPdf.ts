import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import QRCode from "qrcode";
import type { ConclusionDocument } from "@/lib/conclusion";
import {
  ConclusionPdfDocument,
  ensureConclusionPdfFonts,
} from "./ConclusionPdfDocument";

export async function downloadConclusionPdf(
  data: ConclusionDocument,
): Promise<void> {
  ensureConclusionPdfFonts();

  let qrDataUrl: string | null = null;
  if (!data.preview && data.verification?.url) {
    try {
      qrDataUrl = await QRCode.toDataURL(data.verification.url, {
        margin: 1,
        width: 256,
        errorCorrectionLevel: "M",
      });
    } catch (e) {
      console.warn("[pdf:qr]", e);
    }
  }

  const doc = createElement(ConclusionPdfDocument, {
    data,
    qrDataUrl,
  });
  const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob();
  const safeNumber = (data.docNumber || "BELGI").replace(
    /[^\w\-./а-яА-ЯёЁ]+/gi,
    "_",
  );
  const { triggerBlobDownload } = await import("./triggerBlobDownload");
  await triggerBlobDownload(blob, `${safeNumber}.pdf`, "application/pdf");
}
