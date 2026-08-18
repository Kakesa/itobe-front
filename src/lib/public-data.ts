import { AuteursApi, ArticlesApi, LivresApi } from "./api-client";

export type PublicArticle = {
  slug: string;
  titre: string;
  chapo: string;
  categorie: string;
  tags: string[];
  auteur: string;
  date: string;
  lecture: string;
  image: string;
  populaire?: boolean;
  corps: string[];
};

export type PublicLivre = {
  slug: string;
  titre: string;
  sousTitre?: string;
  auteur: string;
  isbn: string;
  resume: string;
  pages: number;
  langue: string;
  categorie: string;
  publication: string;
  formats: Array<"PDF" | "EPUB" | "Papier">;
  prix: number;
  promo?: number;
  stock: number;
  disponible: boolean;
  aLaUne?: boolean;
  couleur: string;
  couverture?: string;
  apercuPages: number;
  apercuPourcent: number;
  chapitres: { titre: string; pages: number[]; gratuit: boolean }[];
};

export type PublicAuteur = {
  slug: string;
  nom: string;
  role: string;
  bio: string;
  ville: string;
  reseaux: { label: string; url: string }[];
  ventes: number;
  lectures: number;
  telechargements: number;
};

const asArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record["data"])) return record["data"] as T[];
    if (Array.isArray(record["articles"])) return record["articles"] as T[];
    if (Array.isArray(record["livres"])) return record["livres"] as T[];
    if (Array.isArray(record["auteurs"])) return record["auteurs"] as T[];
  }
  return [];
};

const readableDate = (value: unknown): string => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const normalizeAuteurSlug = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record["slug"] === "string") return record["slug"] as string;
    if (typeof record["_id"] === "string") return record["_id"] as string;
  }
  return "espoir-kakesa";
};

const normalizeCategory = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record["nom"] === "string") return record["nom"] as string;
    if (typeof record["slug"] === "string") return record["slug"] as string;
  }
  return "Actualités";
};

export const normalizePublicArticle = (item: any): PublicArticle => ({
  slug: String(item?.slug ?? item?.["_id"] ?? "article"),
  titre: String(item?.titre ?? "Article"),
  chapo: String(item?.chapo ?? item?.resume ?? item?.contenu ?? ""),
  categorie: normalizeCategory(item?.categorie),
  tags: Array.isArray(item?.tags) ? item.tags.map((tag: unknown) => String(tag)) : [],
  auteur: normalizeAuteurSlug(item?.auteur),
  date: readableDate(item?.datePublication ?? item?.date),
  lecture: String(item?.lecture ?? "5 min"),
  image:
    typeof item?.couverture === "string" && item.couverture
      ? item.couverture
      : "linear-gradient(135deg, oklch(0.62 0.15 48), oklch(0.38 0.06 40))",
  populaire: Boolean(item?.populaire ?? item?.aLaUne ?? false),
  corps: Array.isArray(item?.corps)
    ? item.corps.map((part: unknown) => String(part))
    : [String(item?.contenu ?? item?.chapo ?? "")],
});

export const normalizePublicLivre = (item: any): PublicLivre => {
  const promoValue =
    item?.promo !== undefined && item?.promo !== null && Number(item.promo) > 0 ? Number(item.promo) : undefined;

  return {
    slug: String(item?.slug ?? item?.["_id"] ?? "livre"),
    titre: String(item?.titre ?? "Livre"),
    ...(typeof item?.sousTitre === "string" ? { sousTitre: item.sousTitre } : {}),
    auteur: normalizeAuteurSlug(item?.auteur),
    isbn: String(item?.isbn ?? ""),
    resume: String(item?.resume ?? ""),
    pages: Number(item?.pages ?? 200),
    langue: String(item?.langue ?? "Français"),
    categorie: normalizeCategory(item?.categorie),
    publication: readableDate(item?.publication ?? item?.datePublication),
    formats: Array.isArray(item?.formats)
      ? (item.formats.filter((f: unknown) => ["PDF", "EPUB", "Papier"].includes(String(f))) as Array<"PDF" | "EPUB" | "Papier">)
      : ["PDF"],
    prix: Number(item?.prix ?? 0),
    ...(promoValue !== undefined ? { promo: promoValue } : {}),
    stock: Number(item?.stock ?? 0),
    disponible: Boolean(item?.disponible ?? true),
    aLaUne: Boolean(item?.aLaUne ?? false),
    couleur: String(item?.couleur ?? "linear-gradient(160deg, oklch(0.62 0.15 48), oklch(0.3 0.05 40))"),
    ...(typeof item?.couverture === "string" ? { couverture: item.couverture } : {}),
    apercuPages: Number(item?.apercuPages ?? 10),
    apercuPourcent: Number(item?.apercuPourcent ?? 10),
    chapitres: Array.isArray(item?.chapitres)
      ? item.chapitres.map((chapter: any) => ({
          titre: String(chapter?.titre ?? "Chapitre"),
          pages: Array.isArray(chapter?.pages) ? chapter.pages.map((page: unknown) => Number(page)) : [],
          gratuit: Boolean(chapter?.gratuit ?? false),
        }))
      : [],
  };
};

export const normalizePublicAuteur = (item: any): PublicAuteur => ({
  slug: String(item?.slug ?? item?._id ?? "auteur"),
  nom: String(item?.nom ?? "Auteur"),
  role: String(item?.role ?? "Auteur"),
  bio: String(item?.bio ?? ""),
  ville: String(item?.ville ?? ""),
  reseaux: Array.isArray(item?.reseaux)
    ? item.reseaux.map((network: any) => ({
        label: String(network?.label ?? "Link"),
        url: String(network?.url ?? "#"),
      }))
    : [],
  ventes: Number(item?.ventes ?? 0),
  lectures: Number(item?.lectures ?? 0),
  telechargements: Number(item?.telechargements ?? 0),
});

export async function fetchPublicArticles(): Promise<PublicArticle[]> {
  try {
    const response = await ArticlesApi.getAll({ page: 1, limit: 200 });
    return asArray<any>(response).map(normalizePublicArticle);
  } catch {
    return [];
  }
}

export async function fetchPublicLivres(): Promise<PublicLivre[]> {
  try {
    const response = await LivresApi.getAll({ page: 1, limit: 200 });
    return asArray<any>(response).map(normalizePublicLivre);
  } catch {
    return [];
  }
}

export async function fetchPublicAuteurs(): Promise<PublicAuteur[]> {
  try {
    const response = await AuteursApi.getAll({ page: 1, limit: 200 });
    return asArray<any>(response).map(normalizePublicAuteur);
  } catch {
    return [];
  }
}

export async function fetchPublicArticleBySlug(slug: string) {
  try {
    const response = await ArticlesApi.getBySlug(slug);
    const article = response?.data?.article ?? response?.article ?? null;
    const suite = asArray<any>(response?.data?.suite ?? response?.suite ?? []).map(normalizePublicArticle);
    return {
      article: article ? normalizePublicArticle(article) : null,
      suite,
    };
  } catch {
    return { article: null, suite: [] };
  }
}

export async function fetchPublicLivreBySlug(slug: string) {
  try {
    const response = await LivresApi.getBySlug(slug);
    const livre = response?.data?.livre ?? response?.livre ?? null;
    return { livre: livre ? normalizePublicLivre(livre) : null };
  } catch {
    return { livre: null };
  }
}

export async function fetchPublicAuteurBySlug(slug: string) {
  try {
    const response = await AuteursApi.getBySlug(slug);
    const auteur = response?.data?.auteur ?? response?.auteur ?? null;
    return { auteur: auteur ? normalizePublicAuteur(auteur) : null };
  } catch {
    return { auteur: null };
  }
}
