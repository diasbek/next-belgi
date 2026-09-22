/** Isomorphic helpers — safe for client and server. */

export const PASTE_IMPORT_MAX_ITEMS = 20_000;
export const PASTE_IMPORT_CHUNK_SIZE = 250;

/** Extract raw list rows from Adliya page JSON or a bare array. */
export function extractAdliyaListRaw(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const root = raw as Record<string, unknown>;
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root.content)) return root.content;
  if (Array.isArray(root.items)) return root.items;
  if (Array.isArray(root.results)) return root.results;
  return [];
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
