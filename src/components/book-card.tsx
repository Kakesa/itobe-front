import { Link } from "@tanstack/react-router";
import { BookCover } from "@/components/book-cover";
import { useI18n } from "@/i18n";
import type { Livre } from "@/lib/data";
import { nomAuteur, tarifLivre } from "@/lib/data";

type BookCardProps = {
  livre: Livre;
  index?: number;
  showAuteur?: boolean;
  showPrix?: boolean;
  prixEnFcfa?: boolean;
  to?: "/edition/$slug" | "/reader/$slug";
};

function formatPrix(n: number, locale: string) {
  return `${n.toFixed(2).replace(".", locale === "en" ? "." : ",")} $`;
}

export function BookCard({
  livre,
  index = 0,
  showAuteur = true,
  showPrix = false,
  prixEnFcfa = false,
  to = "/edition/$slug",
}: BookCardProps) {
  const { locale } = useI18n();
  const tarif = tarifLivre(livre);
  const prixLabel = prixEnFcfa
    ? `${Math.round(tarif.current * 2800).toLocaleString("fr-FR")} FCFA`
    : formatPrix(tarif.current, locale);

  return (
    <Link
      to={to}
      params={{ slug: livre.slug }}
      className="book-card-stagger group block"
      style={{ animationDelay: `${Math.min(index, 12) * 70}ms` }}
    >
      <div className="book-cover-wrap relative">
        <BookCover livre={livre} realistic animated tilt="face" size="card" />
        {tarif.percent > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-sm bg-edition-orange px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-[#211c1c] animate-book-badge-pop">
            −{tarif.percent} %
          </span>
        )}
      </div>
      <p className="mt-3 font-display leading-snug transition-colors duration-300 group-hover:text-accent">
        {livre.titre}
      </p>
      {showAuteur && (
        <p className="text-xs text-muted-foreground transition-opacity duration-300 group-hover:opacity-80">
          {nomAuteur(livre.auteur)}
        </p>
      )}
      {showPrix && (
        <p className={`mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm ${prixEnFcfa ? "font-semibold text-edition-orange" : ""}`}>
          <span className="font-semibold">{prixLabel}</span>
          {tarif.previous && !prixEnFcfa ? (
            <s className="text-xs text-muted-foreground">{formatPrix(tarif.previous, locale)}</s>
          ) : null}
        </p>
      )}
    </Link>
  );
}
