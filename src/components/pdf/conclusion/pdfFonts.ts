import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

export function ensureConclusionPdfFonts() {
  if (fontsRegistered) return;
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";
  Font.register({
    family: "DejaVu",
    fonts: [
      { src: `${origin}/fonts/DejaVuSans.ttf`, fontWeight: 400 },
      { src: `${origin}/fonts/DejaVuSans-Bold.ttf`, fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}
