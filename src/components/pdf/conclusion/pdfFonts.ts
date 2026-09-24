import { Font } from "@react-pdf/renderer";
import { pdfFontFamily } from "./pdfTheme";

let fontsRegistered = false;

/**
 * DejaVu Sans — covers Latin (incl. oʻ/gʻ), Cyrillic for uz/ru/en PDFs.
 * Closest reliable print substitute while site UI uses Manrope via next/font.
 */
export function ensureConclusionPdfFonts() {
  if (fontsRegistered) return;
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";
  Font.register({
    family: pdfFontFamily,
    fonts: [
      { src: `${origin}/fonts/DejaVuSans.ttf`, fontWeight: 400 },
      { src: `${origin}/fonts/DejaVuSans-Bold.ttf`, fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}
