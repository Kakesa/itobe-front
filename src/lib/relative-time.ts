/** Affichage relatif façon réseau social (ex. « 2 h », « 3 j »). */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} j`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} sem`;

  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Variante « il y a 16 h » pour les fils d’actualités. */
export function formatRelativeTimeAgo(iso: string): string {
  const rel = formatRelativeTime(iso);
  if (!rel) return "";
  if (rel === "À l'instant") return "À l'instant";
  return `il y a ${rel}`;
}
