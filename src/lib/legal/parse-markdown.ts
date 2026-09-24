/**
 * Lightweight markdown → blocks for @react-pdf (no HTML).
 * Supports headings, paragraphs, blockquotes, lists, hr, basic **bold** stripping.
 */

export type LegalMdBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "hr" };

export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .trim();
}

export function parseLegalMarkdown(markdown: string): LegalMdBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: LegalMdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: stripInlineMarkdown(trimmed.slice(2)) });
      i += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: stripInlineMarkdown(trimmed.slice(3)) });
      i += 1;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: stripInlineMarkdown(trimmed.slice(4)) });
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith(">")) {
        parts.push(stripInlineMarkdown((lines[i] ?? "").replace(/^>\s?/, "")));
        i += 1;
      }
      blocks.push({ type: "quote", text: parts.filter(Boolean).join(" ") });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test((lines[i] ?? "").trim())) {
        items.push(stripInlineMarkdown((lines[i] ?? "").trim().replace(/^[-*]\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? "").trim())) {
        items.push(
          stripInlineMarkdown((lines[i] ?? "").trim().replace(/^\d+\.\s+/, "")),
        );
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const parts: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = (lines[i] ?? "").trim();
      if (
        !next ||
        next.startsWith("#") ||
        next.startsWith(">") ||
        /^[-*]\s+/.test(next) ||
        /^\d+\.\s+/.test(next) ||
        /^---+$/.test(next)
      ) {
        break;
      }
      parts.push(next);
      i += 1;
    }
    blocks.push({ type: "p", text: stripInlineMarkdown(parts.join(" ")) });
  }

  return blocks;
}
