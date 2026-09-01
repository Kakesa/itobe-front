import type { NavigateOptions } from "@tanstack/react-router";
import type { Role } from "@/lib/admin-data";

/** Construit l'URL de retour après connexion pour le checkout d'un livre. */
export function buildAchatRedirect(slug: string, format?: "numerique" | "papier"): string {
  const q = format ? `?format=${format}` : "";
  return `/achat/${slug}${q}`;
}

/** Parse une URL interne (/achat/slug?format=…) en options TanStack Router. */
export function parseRedirectPath(redirect: string): NavigateOptions | null {
  if (!redirect.startsWith("/")) return null;

  try {
    const url = new URL(redirect, "http://local");
    const path = url.pathname;

    const achat = path.match(/^\/achat\/([^/]+)$/);
    if (achat?.[1]) {
      const format = url.searchParams.get("format");
      return {
        to: "/achat/$slug",
        params: { slug: achat[1] },
        ...(format === "numerique" || format === "papier"
          ? { search: { format } as { format: "numerique" | "papier" } }
          : {}),
      };
    }

    const reader = path.match(/^\/reader\/([^/]+)$/);
    if (reader?.[1]) {
      return { to: "/reader/$slug", params: { slug: reader[1] } };
    }

    const edition = path.match(/^\/edition\/([^/]+)$/);
    if (edition?.[1]) {
      return { to: "/edition/$slug", params: { slug: edition[1] } };
    }

    if (path === "/panier") return { to: "/panier" };
    if (path === "/edition") return { to: "/edition" };
    if (path === "/admin" || path.startsWith("/admin/")) return { to: path as "/admin" };

    return { to: path as "/" };
  } catch {
    return null;
  }
}

/** Destination par défaut après connexion (hors parcours d'achat). */
export function destinationApresConnexion(role: Role): string {
  if (role === "admin") return "/admin/media";
  if (role === "editeur") return "/admin/edition";
  return "/edition";
}

/** Espace personnel (back-office ou espace lecteur). */
export function destinationMonEspace(role: Role): string {
  if (role === "admin") return "/admin/media";
  if (role === "editeur") return "/admin/edition";
  return "/admin";
}

/** Libellé du bouton « Mon espace » selon le rôle. */
export function labelMonEspace(role: Role): string {
  if (role === "admin") return "Espace admin";
  if (role === "editeur") return "Mon espace éditeur";
  return "Mon espace";
}

/** Page Mon profil dans l'espace correspondant au rôle. */
export function destinationMonProfil(role: Role): "/admin/media/mon-profil" | "/admin/edition/mon-profil" | "/admin/mon-profil" {
  if (role === "admin") return "/admin/media/mon-profil";
  if (role === "editeur") return "/admin/edition/mon-profil";
  return "/admin/mon-profil";
}
