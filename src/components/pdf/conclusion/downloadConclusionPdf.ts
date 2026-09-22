import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import QRCode from "qrcode";
import type { ConclusionDocument } from "@/lib/conclusion";
import {
  ConclusionPdfDocument,
  ensureConclusionPdfFonts,
} from "./ConclusionPdfDocument";
import { hydrateConclusionImages } from "./hydrateConclusionImages";

export async function downloadConclusionPdf(
  data: ConclusionDocument,
): Promise<void> {
  ensureConclusionPdfFonts();

  const withImages = await hydrateConclusionImages(data);

  let qrDataUrl: string | null = null;
  if (!withImages.preview && withImages.verification?.url) {
    try {
      qrDataUrl = await QRCode.toDataURL(withImages.verification.url, {
        margin: 1,
        width: 256,
        errorCorrectionLevel: "M",
      });
    } catch (e) {
      console.warn("[pdf:qr]", e);
    }
  }

  const doc = createElement(ConclusionPdfDocument, {
    data: withImages,
    qrDataUrl,
  });
  const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob();
  const safeNumber = (withImages.docNumber || "BELGI").replace(
    /[^\w\-./а-яА-ЯёЁ]+/gi,
    "_",
  );
  const { triggerBlobDownload } = await import("./triggerBlobDownload");
  await triggerBlobDownload(blob, `${safeNumber}.pdf`, "application/pdf");
}
