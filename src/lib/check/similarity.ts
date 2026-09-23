/**
 * Lightweight similarity (0–100) for external API hits.
 * Prefer exact / contains / shared trigrams — no pg dependency.
 */

function trigrams(s: string): Set<string> {
  const n = s.toLowerCase().replace(/[^a-z0-9а-яёўқғҳʼ']/gi, "");
  if (n.length < 2) return new Set(n ? [n] : []);
  const padded = `  ${n} `;
  const out = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    out.add(padded.slice(i, i + 3));
  }
  return out;
}

export function markSimilarity(query: string, candidate: string): number {
  const q = query.trim();
  const c = candidate.trim();
  if (!q || !c) return 0;
  const ql = q.toLowerCase();
  const cl = c.toLowerCase();
  if (ql === cl) return 100;
  if (cl.includes(ql) || ql.includes(cl)) {
    const ratio = Math.min(ql.length, cl.length) / Math.max(ql.length, cl.length);
    return Math.round(70 + ratio * 25);
  }
  const a = trigrams(ql);
  const b = trigrams(cl);
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return Math.round((inter / union) * 100);
}
