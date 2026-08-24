import { Link } from "@tanstack/react-router";
import { BookCover } from "@/components/book-cover";
import type { Livre } from "@/lib/data";
import { nomAuteur, prixAffiche } from "@/lib/data";

type BookCardProps = {
  livre: Livre;
  index?: number;
  showAuteur?: boolean;
  showPrix?: boolean;
  to?: "/edition/$slug" | "/reader/$slug";
};

export function BookCard({
  livre,
  index = 0,
  showAuteur = true,
  showPrix = false,
  to = "/edition/$slug",
}: BookCardProps) {
  return (
    <Link
      to={to}
      params={{ slug: livre.slug }}
      className="book-card-stagger group block"
      style={{ animationDelay: `${Math.min(index, 12) * 70}ms` }}
    >
      <div className="book-cover-wrap relative">
        <BookCover livre={livre} animated />
        {livre.promo && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-medium text-accent-foreground animate-book-badge-pop">
            Promo
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
        <p className="mt-1 text-sm">
          {prixAffiche(livre)}
          {livre.promo && (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              {livre.prix.toFixed(2)} $
            </span>
          )}
        </p>
      )}
    </Link>
  );
}
