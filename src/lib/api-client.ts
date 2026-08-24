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
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || "Une erreur est survenue", response.status, data.errors);
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

/** Récupère toutes les pages d'une ressource paginée. */
export async function fetchAllPages<T = unknown>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedPayload<T>>,
  pageSize = 100,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetchPage(page, pageSize);
    const batch = Array.isArray(res?.data) ? res.data : [];
    all.push(...batch);
    totalPages = Number(res?.pagination?.totalPages ?? 1);
    page += 1;
  } while (page <= totalPages && page <= 100);

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

export const DashboardApi = {
  getStats: () => api.get("/dashboard"),
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
};

export const AuteursApi = {
  getAll: (params?: { page?: number; limit?: number; q?: string }) =>
    api.get("/auteurs", params),
  getBySlug: (slug: string) => api.get(`/auteurs/${slug}`),
  create: (data: any) => api.post("/auteurs", data),
  update: (id: string, data: any) => api.put(`/auteurs/${id}`, data),
  delete: (id: string) => api.delete(`/auteurs/${id}`),
};

export const CategoriesApi = {
  getAll: (type?: "media" | "livre") => api.get("/categories", type ? { type } : undefined),
  create: (data: { nom: string; type: "media" | "livre"; description?: string }) =>
    api.post("/categories", data),
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

export const BibliothequeApi = {
  getLibrary: () => api.get("/bibliotheque"),
  toggleFavori: (slug: string) => api.post(`/bibliotheque/favoris/${slug}`),
  updateProgress: (data: { slug: string; page?: number; pourcentage?: number }) =>
    api.put("/bibliotheque/progression", data),
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
  getAll: (params?: { page?: number; limit?: number; statut?: string; moyen?: string; q?: string }) =>
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
