import type { ConclusionDocument } from "@/lib/conclusion";

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Rasterize SVG data URL to PNG for react-pdf (no native SVG support). */
async function svgDataUrlToPng(dataUrl: string): Promise<string | null> {
  if (typeof document === "undefined") {
    // Server: keep SVG; PDF path is client-only today.
    return dataUrl;
  }
  try {
    const img = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg_load_failed"));
    });
    img.src = dataUrl;
    await loaded;
    const w = Math.max(1, img.naturalWidth || 240);
    const h = Math.max(1, img.naturalHeight || 120);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("[pdf:svg]", e);
    return null;
  }
}

async function urlToDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:image/svg+xml")) {
    return svgDataUrlToPng(url);
  }
  if (url.startsWith("data:")) return url;
  try {
    const proxy = `/api/media/fetch/?u=${encodeURIComponent(url)}`;
    const res = await fetch(proxy, { credentials: "same-origin" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    if (blob.type.includes("svg")) {
      const svgData = await blobToDataUrl(blob);
      return svgDataUrlToPng(svgData);
    }
    if (!blob.type.startsWith("image/") && blob.size > 0) {
      return blobToDataUrl(blob);
    }
    return blobToDataUrl(blob);
  } catch (e) {
    console.warn("[pdf:image]", url, e);
    return null;
  }
}

/** Embed match logos as data URLs so react-pdf can render them reliably. */
export async function hydrateConclusionImages(
  data: ConclusionDocument,
): Promise<ConclusionDocument> {
  const hydrateCards = async (
    cards: ConclusionDocument["sections"]["adliya"],
  ) =>
    Promise.all(
      cards.map(async (card) => {
        if (!card.imageUrl) return card;
        const dataUrl = await urlToDataUrl(card.imageUrl);
        return dataUrl
          ? { ...card, imageUrl: dataUrl }
          : { ...card, imageUrl: undefined };
      }),
    );

  const [adliya, madrid] = await Promise.all([
    hydrateCards(data.sections.adliya),
    hydrateCards(data.sections.madrid),
  ]);

  return {
    ...data,
    sections: {
      ...data.sections,
      adliya,
      madrid,
    },
  };
}
