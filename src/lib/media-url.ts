const API_ORIGIN = (
  import.meta.env["VITE_API_URL"] || "http://localhost:5000/api/v1"
).replace(/\/api\/v1\/?$/, "");

/** Extrait l'URL brute depuis une valeur couverture / image / css url() / objet Cloudinary. */
export function extractCoverSource(value?: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "object") {
    const rec = value as Record<string, unknown>;
    return extractCoverSource(rec["url"] ?? rec["secure_url"] ?? rec["src"] ?? rec["photo"]);
  }
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  if (!raw || raw.startsWith("linear-gradient")) return undefined;
  if (raw.startsWith("url(")) {
    return raw.slice(4, -1).replace(/^["']|["']$/g, "");
  }
  return raw;
}

/** Résout une URL média (absolue, data URL ou chemin /uploads backend). */
export function resolveMediaUrl(value?: unknown): string | undefined {
  const raw = extractCoverSource(value);
  if (!raw) return undefined;
  if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  if (raw.startsWith("/uploads/")) return `${API_ORIGIN}${raw}`;
  if (raw.startsWith("uploads/")) return `${API_ORIGIN}/${raw}`;
  return raw;
}

export const ARTICLE_COVER_FALLBACK =
  "linear-gradient(135deg, oklch(0.62 0.15 48), oklch(0.38 0.06 40))";
