/**
 * Nettoie le texte collé depuis un PDF / lecteur PDF
 * (retours ligne = wraps, tirets de coupure, espaces parasites).
 */

export function normalizePastedPlainText(raw: string): string {
  if (!raw) return "";

  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Tirets de coupure en fin de ligne : informa-\ntion → information
  text = text.replace(/(\p{L})-\n(\p{L})/gu, "$1$2");
  // Soft hyphens
  text = text.replace(/\u00AD/g, "");

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\n+/g, " ").replace(/[ \t\f\v]+/g, " ").trim())
    .filter((block) => block.length > 0);

  return paragraphs.join("\n\n");
}

/** Texte brut typique d’un PDF : beaucoup de lignes courtes, peu de vrais paragraphes. */
export function looksLikePdfWrappedText(raw: string): boolean {
  if (!raw?.trim()) return false;

  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return false;

  if (/(\p{L})-\n(\p{L})/u.test(text)) return true;

  const paragraphCount = text.split(/\n\s*\n/).filter((b) => b.trim()).length;
  const avgLen = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;

  return lines.length >= 4 && paragraphCount <= Math.ceil(lines.length / 3) && avgLen < 100;
}

/** HTML collé depuis un viewer PDF : une balise <p> (ou <div>) par ligne visuelle. */
export function looksLikePdfHtml(html: string): boolean {
  if (!html) return false;

  const blocks = [
    ...html.matchAll(/<(?:p|div)(?:\s[^>]*)?>([\s\S]*?)<\/(?:p|div)>/gi),
  ]
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (blocks.length < 4) return false;

  const avg = blocks.reduce((sum, t) => sum + t.length, 0) / blocks.length;
  return avg < 90;
}

export function pastedTextToParagraphHtml(normalized: string): string {
  return normalized
    .split(/\n\n/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
