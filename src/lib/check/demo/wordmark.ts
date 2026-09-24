/**
 * Local SVG wordmark from mark text (no image API).
 * Returns a data:image/svg+xml URL safe for <img> and react-pdf after hydrate.
 */

function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderWordmarkImage(
  name: string,
  opts?: { width?: number; height?: number },
): string {
  const raw = name.trim() || "MARK";
  const display = raw.length > 28 ? `${raw.slice(0, 26)}…` : raw;
  const w = opts?.width ?? 240;
  const h = opts?.height ?? 120;
  const hue = hashHue(raw.toLowerCase());
  const bg = `hsl(${hue} 42% 92%)`;
  const fg = `hsl(${hue} 55% 28%)`;
  const accent = `hsl(${hue} 60% 45%)`;
  const fontSize = display.length > 14 ? 18 : display.length > 8 ? 22 : 28;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" rx="10" fill="${bg}"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="8" fill="none" stroke="${accent}" stroke-width="2"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700"
    fill="${fg}">${escapeXml(display)}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
