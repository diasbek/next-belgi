import type { ConclusionDocument } from "@/lib/conclusion";

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function urlToDataUrl(url: string): Promise<string | null> {
  if (!url || url.startsWith("data:")) return url || null;
  try {
    const proxy = `/api/media/fetch/?u=${encodeURIComponent(url)}`;
    const res = await fetch(proxy, { credentials: "same-origin" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size || !blob.type.startsWith("image/")) {
      // Some CDNs return octet-stream
      if (!blob.type.startsWith("image/") && blob.size > 0) {
        return blobToDataUrl(blob);
      }
      if (!blob.size) return null;
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
        return dataUrl ? { ...card, imageUrl: dataUrl } : { ...card, imageUrl: undefined };
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
