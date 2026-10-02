/**
 * Client API unifié pour communiquer avec le backend Itobe Entreprise.
 */

const API_BASE = import.meta.env["VITE_API_URL"] || "http://localhost:5000/api/v1";
const TOKEN_KEY = "itobe.token";
const REFRESH_TOKEN_KEY = "itobe.refreshToken";

function readAuthTokensFromResponse(payload: any): { token?: string; refreshToken?: string } {
  const data = payload?.data ?? payload ?? {};
  const token = data.accessToken ?? data.token ?? payload?.accessToken ?? payload?.token ?? null;
  const refreshToken =
    data.refreshToken ?? payload?.refreshToken ?? data.refresh_token ?? payload?.refresh_token ?? null;

  return { token: token ?? undefined, refreshToken: refreshToken ?? undefined };
}

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function fetchProtectedBookDocument(slug: string): Promise<string | null> {
  const token = getToken();
  if (!token) throw new ApiError("Connexion requise", 401);

  const response = await fetch(`${API_BASE}/bibliotheque/lecture/${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 204) return null;
  if (!response.ok) throw new ApiError("Document de lecture indisponible", response.status);
  if (response.headers.get("content-type")?.includes("application/json")) {
    const payload = await response.json();
    const url = payload?.data?.url;
    if (typeof url !== "string" || !url) {
      throw new ApiError("Document de lecture indisponible", 502);
    }
    return url;
  }
  return URL.createObjectURL(await response.blob());
}

export function setTokens(token: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return requestWithRefresh<T>(endpoint, options, true);
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const payload = await response.json().catch(() => ({}));
    const { token, refreshToken: nextRefreshToken } = readAuthTokensFromResponse(payload);
    if (!token) return false;
    setTokens(token, nextRefreshToken || refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function requestWithRefresh<T = any>(
  endpoint: string,
  options: RequestInit,
  allowRefresh: boolean,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 304) {
    throw new ApiError("Réponse en cache invalide — réessayez.", 304);
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && allowRefresh && !endpoint.includes("/auth/refresh-token")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return requestWithRefresh<T>(endpoint, options, false);
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || "Une erreur est survenue",
      response.status,
      data.errors ?? data.details,
    );
  }

  return data;
}

type PaginatedPayload<T = unknown> = {
  data?: T[];
  pagination?: {
    page?: number;
    totalPages?: number;
    hasNextPage?: boolean;
  };
};

/** Récupère toutes les pages d'une ressource paginée (max 500 par page, backend plafond 500). */
export async function fetchAllPages<T = unknown>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedPayload<T>>,
  pageSize = 500,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetchPage(page, pageSize);
    const batch = Array.isArray(res?.data) ? res.data : [];
    all.push(...batch);
    totalPages = Number(res?.pagination?.totalPages ?? 1);
    const hasNext = res?.pagination?.hasNextPage ?? page < totalPages;
    if (!hasNext || batch.length === 0) break;
    page += 1;
  } while (page <= totalPages && page <= 50);

  return all;
}

export const api = {
  get: <T = any>(url: string, params?: Record<string, any>) => {
    let finalUrl = url;
    if (params) {
      const search = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          search.append(k, String(v));
        }
      });
      const query = search.toString();
      if (query) finalUrl += (url.includes("?") ? "&" : "?") + query;
    }
    return request<T>(finalUrl, { method: "GET" });
  },

  post: <T = any>(url: string, body?: any) =>
    request<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(url: string, body?: any) =>
    request<T>(url, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(url: string, body?: any) =>
    request<T>(url, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(url: string) =>
    request<T>(url, { method: "DELETE" }),
};

// ----------------------------------------------------
// Services de l'API Itobe
// ----------------------------------------------------

export const AuthApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post("/auth/login", credentials);
    const { token, refreshToken } = readAuthTokensFromResponse(res);
    if (token) {
      setTokens(token, refreshToken);
    }
    return res.data ?? res;
  },

  register: async (payload: {
    nom: string;
    email: string;
    password: string;
    telephone?: string;
    adresse?: string;
    role?: string;
  }) => {
    const res = await api.post("/auth/register", payload);
    const { token, refreshToken } = readAuthTokensFromResponse(res);
    if (token) {
      setTokens(token, refreshToken);
    }
    return res.data ?? res;
  },

  me: () => api.get("/auth/me"),
  updateAvatar: (formData: FormData) => api.post("/auth/me/avatar", formData),
  updateProfile: (data: {
    nom?: string;
    prenom?: string;
    telephone?: string;
    adresse?: string;
    ville?: string;
    preferences?: any;
  }) =>
    api.put("/auth/me", data),
  changePassword: (data: { ancienPassword: string; nouveauPassword: string }) =>
    api.put("/auth/change-password", data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post("/auth/reset-password", data),
  setup2FA: () => api.post("/auth/2fa/setup"),
  verify2FA: (token: string) => api.post("/auth/2fa/verify", { token }),
  deleteAccount: () => api.delete("/auth/me"),
  logout: () => {
    clearTokens();
  },
};

export const UsersApi = {
  getAll: (params?: { page?: number; limit?: number; role?: string; statut?: string; q?: string }) =>
    api.get("/users", params),
  fetchAll: () => fetchAllPages((page, limit) => UsersApi.getAll({ page, limit })),
  getPermissions: () => api.get("/users/permissions"),
  updatePermission: (data: {
    espace: string;
    module: string;
    action: string;
    role: string;
    autorise: boolean;
  }) => api.put("/users/permissions", data),
  create: (data: Record<string, unknown>) => api.post("/users", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const ComptabiliteApi = {
  telechargerRapport: async (params: { debut: string; fin: string; categorie: string }) => {
    const search = new URLSearchParams(params);
    const token = getToken();
    const response = await fetch(`${API_BASE}/comptabilite/rapport.pdf?${search}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(data.message || "Le PDF n'a pas pu être téléchargé.", response.status);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `rapport-${params.categorie}-${params.debut}-${params.fin}.pdf`;
    lien.click();
    URL.revokeObjectURL(url);
  },
  rapport: (params: { debut: string; fin: string; categorie: string }) =>
    api.get("/comptabilite/rapport", params) as Promise<{
      data: {
        debut: string;
        fin: string;
        categorie: string;
        lignes: Array<{
          date: string;
          reference: string;
          libelle: string;
          categorie: string;
          montant: number;
        }>;
        totalVentes: number;
        totalPaiements: number;
        totalDepenses: number;
        total: number;
      };
    }>,
  clients: () =>
    api.get("/comptabilite/clients") as Promise<{
      data: Array<{
        id: string;
        nom: string;
        email: string;
        livresVendus: number;
        paye: number;
        enAttente: number;
        commandes: number;
      }>;
    }>,
  paiements: (params?: { page?: number; limit?: number; statut?: string }) =>
    api.get("/comptabilite/paiements", params) as Promise<{
      data: Array<{
        _id: string;
        reference: string;
        moyen: string;
        montant: number;
        statut: string;
        date: string;
        commande?: { reference?: string; livreTitre?: string; clientNom?: string } | string;
      }>;
    }>,
  synthese: () =>
    api.get("/comptabilite/synthese") as Promise<{
      data: {
        livresVendus: number;
        soldeCaisse: number;
        enAttente: number;
        commandesEnAttente: number;
        rembourse: number;
      };
    }>,
};

export const DashboardApi = {
  getStats: () => api.get("/dashboard"),
  getVisitorStats: (period = "7j") => api.get("/dashboard/visitors", { period }),
  trackVisitor: (visitorId: string, path: string) => api.post("/dashboard/visitors", { visitorId, path }),
};

export const ArticlesApi = {
  getAll: (params?: { page?: number; limit?: number; categorie?: string; tag?: string; populaire?: boolean; q?: string }) =>
    api.get("/articles", params),
  getBySlug: (slug: string) => api.get(`/articles/${slug}`),
  create: (data: any) => api.post("/articles", data),
  update: (id: string, data: any) => api.put(`/articles/${id}`, data),
  delete: (id: string) => api.delete(`/articles/${id}`),
};

export const LivresApi = {
  getAll: (params?: { page?: number; limit?: number; categorie?: string; format?: string; q?: string }) =>
    api.get("/livres", params),
  getAllAdmin: (params?: { page?: number; limit?: number; categorie?: string; format?: string; q?: string }) =>
    api.get("/livres/admin/all", params),
  fetchAll: () =>
    fetchAllPages((page, limit) => LivresApi.getAll({ page, limit })),
  fetchAllAdmin: () =>
    fetchAllPages((page, limit) => LivresApi.getAllAdmin({ page, limit })),
  getBySlug: (slug: string) => api.get(`/livres/${slug}`),
  create: (data: any) => api.post("/livres", data),
  update: (id: string, data: any) => api.put(`/livres/${id}`, data),
  delete: (id: string) => api.delete(`/livres/${id}`),
  uploadFichier: (id: string, format: "pdf" | "epub", file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);
    return api.post(`/livres/${id}/fichier`, formData);
  },
};

export const AuteursApi = {
  getAll: (params?: { page?: number; limit?: number; q?: string }) =>
    api.get("/auteurs", params),
  fetchAll: () => fetchAllPages((page, limit) => AuteursApi.getAll({ page, limit })),
  getBySlug: (slug: string) => api.get(`/auteurs/${slug}`),
  getMyProfile: () => api.get("/auteurs/me/profile"),
  updateMyBio: (bio: string) => api.patch("/auteurs/me/bio", { bio }),
  create: (data: any) => api.post("/auteurs", data),
  update: (id: string, data: any) => api.put(`/auteurs/${id}`, data),
  delete: (id: string) => api.delete(`/auteurs/${id}`),
};

export const CategoriesApi = {
  getAll: (type?: "media" | "livre") => api.get("/categories", type ? { type } : undefined),
  create: (data: { nom: string; type: "media" | "livre"; visibilite?: string; description?: string }) =>
    api.post("/categories", data),
  update: (id: string, data: { nom?: string; type?: "media" | "livre"; visibilite?: string }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export type CategorieApi = {
  id: string;
  nom: string;
  visibilite: string;
  type: string;
};

export function lireCategories(payload: unknown): CategorieApi[] {
  const source = payload && typeof payload === "object" ? (payload as { data?: unknown }).data ?? payload : payload;
  const brut = Array.isArray(source) ? source : [];
  return brut
    .map((item) => {
      const row = item as { _id?: string; id?: string; nom?: string; visibilite?: string; type?: string };
      return {
        id: String(row._id ?? row.id ?? ""),
        nom: String(row.nom ?? "").trim(),
        visibilite: String(row.visibilite ?? "Publique"),
        type: String(row.type ?? ""),
      };
    })
    .filter((item) => item.id && item.nom);
}

export const MediasApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; q?: string }) =>
    api.get("/medias", params),
  upload: (formData: FormData) => api.post("/medias/upload", formData),
  delete: (id: string) => api.delete(`/medias/${id}`),
};

export const ContactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post("/contact", data),
};

export const RechercheApi = {
  search: (q: string) => api.get("/recherche", { q }),
};

export const NewsletterApi = {
  subscribe: (email: string) => api.post("/newsletter/subscribe", { email }),
};

export const YoutubeApi = {
  getVideos: (limit = 50, playlist?: string) =>
    api.get("/youtube/videos", playlist ? { limit, playlist } : { limit }),
  getStatus: () => api.get("/youtube/status"),
};

export const BibliothequeApi = {
  getLibrary: () => api.get("/bibliotheque"),
  toggleFavori: (slug: string) => api.post(`/bibliotheque/favoris/${slug}`),
  registerDownload: (slug: string) => api.post(`/bibliotheque/telechargements/${slug}`),
  updateProgress: (data: { slug: string; page?: number; pourcentage?: number }) =>
    api.put("/bibliotheque/progression", data),
  manageBookmark: (data: { slug: string; page: number; note?: string }) =>
    api.post("/bibliotheque/marque-pages", data),
  checkAccess: (slug: string) => api.get(`/bibliotheque/acces/${slug}`),
};

export const PanierApi = {
  get: () => api.get("/panier"),
  addItem: (data: {
    livreSlugOrId?: string;
    livreId?: string;
    quantity?: number;
    format?: string;
  }) => api.post("/panier/items", data),
  updateItem: (livreId: string, data: { quantity?: number; format?: string }) =>
    api.patch(`/panier/items/${livreId}`, data),
  removeItem: (livreId: string) => api.delete(`/panier/items/${livreId}`),
  clear: () => api.delete("/panier"),
  merge: (items: Array<{ slug?: string; livreId?: string; quantity?: number; format?: string }>) =>
    api.post("/panier/fusionner", { items }),
  checkout: (data: {
    moyen?: string;
    operateur?: string;
    telephone?: string;
    couponCode?: string;
  }) => api.post("/panier/checkout", data),
};

export const CommandesApi = {
  getMine: (statut?: string) =>
    api.get("/commandes/mes-commandes", statut && statut !== "Toutes" ? { statut } : undefined),
  getAll: (params?: { page?: number; limit?: number; statut?: string | undefined; moyen?: string | undefined; q?: string | undefined }) =>
    api.get("/commandes", params),
  getById: (id: string) => api.get(`/commandes/${id}`),
  updateStatus: (id: string, data: { statut: string; motif?: string }) =>
    api.put(`/commandes/${id}/statut`, data),
  create: (data: {
    livreSlugOrId: string;
    moyen?: string;
    format?: string;
    operateur?: string;
    telephone?: string;
    couponCode?: string;
  }) => api.post("/commandes", data),
  cancel: (id: string) => api.post(`/commandes/${id}/cancel`),
};

export const ChapitresApi = {
  getByLivre: (livreIdOrSlug: string) =>
    api.get(`/livres/${encodeURIComponent(livreIdOrSlug)}/chapitres`),
  getById: (id: string) => api.get(`/chapitres/${id}`),
  create: (livreIdOrSlug: string, data: any) =>
    api.post(`/livres/${encodeURIComponent(livreIdOrSlug)}/chapitres`, data),
  update: (id: string, data: any) => api.put(`/chapitres/${id}`, data),
  delete: (id: string) => api.delete(`/chapitres/${id}`),
  reorder: (livreIdOrSlug: string, chapitres: Array<{ id: string; ordre: number }>) =>
    api.put(`/livres/${encodeURIComponent(livreIdOrSlug)}/chapitres/reordonner`, { chapitres }),
  createVersion: (id: string, data?: { description?: string }) =>
    api.post(`/chapitres/${id}/versions`, data || {}),
  getVersions: (id: string) => api.get(`/chapitres/${id}/versions`),
  restoreVersion: (id: string, versionId: string) =>
    api.post(`/chapitres/${id}/versions/${versionId}/restaurer`),
};

/** Pages éditoriales (Livre → Chapitre → Page → blocs Tiptap) */
export const PagesApi = {
  getByChapitre: (chapitreId: string) =>
    api.get(`/chapitres/${encodeURIComponent(chapitreId)}/pages`),
  getById: (id: string) => api.get(`/pages/${id}`),
  create: (chapitreId: string, data: { titre?: string; ordre?: number; contenu?: unknown }) =>
    api.post(`/chapitres/${encodeURIComponent(chapitreId)}/pages`, data),
  update: (
    id: string,
    data: { titre?: string; contenu?: unknown; ordre?: number; revision?: number },
  ) => api.put(`/pages/${id}`, data),
  delete: (id: string) => api.delete(`/pages/${id}`),
  reorder: (chapitreId: string, pages: Array<{ id: string; ordre: number }>) =>
    api.put(`/chapitres/${encodeURIComponent(chapitreId)}/pages/reordonner`, { pages }),
};
