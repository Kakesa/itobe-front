/**
 * Client API unifié pour communiquer avec le backend Itobe Entreprise.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const TOKEN_KEY = "itobe.token";
const REFRESH_TOKEN_KEY = "itobe.refreshToken";

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
    if (res.data?.token) {
      setTokens(res.data.token, res.data.refreshToken);
    }
    return res.data;
  },

  register: async (payload: { nom: string; email: string; password: string; role?: string }) => {
    const res = await api.post("/auth/register", payload);
    if (res.data?.token) {
      setTokens(res.data.token, res.data.refreshToken);
    }
    return res.data;
  },

  me: () => api.get("/auth/me"),
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
