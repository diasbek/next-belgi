/**
 * Print-oriented Belgi.ai palette for @react-pdf.
 * Lime accents stay high-contrast with ink text; body text stays near-black on white.
 * (Screen tokens from src/styles/tokens.css.)
 */
export const pdfBrand = {
  ink: "#1a1c18",
  inkMuted: "#2e322c",
  primary: "#4a4d46",
  primaryHover: "#2f322e",
  lime: "#dfff9e",
  limeSoft: "#e8ffb8",
  surface: "#ffffff",
  surfaceMuted: "#f3f4f1",
  rowSelected: "#f4fbe6",
  border: "#4a4d46",
  borderSoft: "#9ea398",
  /** Watermark / non-critical chrome — still visible but not body copy */
  watermark: "#c5cdb8",
  footer: "#5a5f56",
} as const;

export const pdfFontFamily = "DejaVu";
