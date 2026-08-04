const STORAGE_KEY = "itobe-portail";

export type Portail = "media" | "edition";

export function lirePortail(): Portail {
  if (typeof window === "undefined") return "media";
  const v = window.sessionStorage.getItem(STORAGE_KEY);
  return v === "edition" || v === "media" ? v : "media";
}

export function ecrirePortail(portail: Portail) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, portail);
}

/** Déduit le portail depuis l'URL, ou conserve le dernier portail visité. */
export function portailDepuisChemin(pathname: string): Portail | null {
  if (pathname.startsWith("/media")) return "media";
  if (
    pathname.startsWith("/edition") ||
    pathname.startsWith("/bibliotheque") ||
    pathname.startsWith("/reader")
  ) {
    return "edition";
  }
  return null;
}
