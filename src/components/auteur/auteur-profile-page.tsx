import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { BookCard } from "@/components/book-card";
import type { Livre } from "@/lib/data";
import { formatDate } from "@/lib/data";
import type { PublicArticle, PublicAuteur, PublicLivre } from "@/lib/public-data";

function initiales(nom: string) {
  return nom
    .split(" ")
    .map((m) => m[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function paragraphesBio(bio: string) {
  return bio
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

type Props = {
  auteur: PublicAuteur;
  livres: PublicLivre[];
  articles: PublicArticle[];
};

export function AuteurProfilePage({ auteur, livres, articles }: Props) {
  const bioParts = paragraphesBio(auteur.bio);

  return (
    <div className="auteur-fiche theme-edition">
      <div className="auteur-fiche__inner mx-auto max-w-5xl px-4 py-10 md:py-14">
        <nav className="auteur-fiche__crumb" aria-label="Fil d'Ariane">
          <Link to="/">Accueil</Link>
          <span aria-hidden>/</span>
          <Link to="/auteurs">Auteurs</Link>
          <span aria-hidden>/</span>
          <span>{auteur.nom}</span>
        </nav>

        <header className="auteur-fiche__hero">
          <div className="auteur-fiche__portrait">
            {auteur.photo ? (
              <img
                src={auteur.photo}
                alt={auteur.nom}
                className="auteur-fiche__photo"
                loading="eager"
              />
            ) : (
              <div className="auteur-fiche__avatar-fallback" aria-hidden>
                {initiales(auteur.nom)}
              </div>
            )}
          </div>
          <div className="auteur-fiche__intro">
            <p className="auteur-fiche__kicker">{auteur.role}</p>
            <h1 className="auteur-fiche__name">{auteur.nom}</h1>
            {auteur.ville && (
              <p className="auteur-fiche__ville">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {auteur.ville}
              </p>
            )}
            {auteur.reseaux.length > 0 && (
              <div className="auteur-fiche__reseaux">
                {auteur.reseaux.map((r) => (
                  <a
                    key={r.label + r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="auteur-fiche__reseau-link"
                  >
                    {r.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        {bioParts.length > 0 && (
          <section className="auteur-fiche__bio">
            <h2 className="auteur-fiche__section-title">Biographie</h2>
            <div className="auteur-fiche__bio-text">
              {bioParts.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {livres.length > 0 && (
          <section className="auteur-fiche__works">
            <h2 className="auteur-fiche__section-title">Livres publiés</h2>
            <p className="auteur-fiche__section-lead">
              {livres.length} ouvrage{livres.length > 1 ? "s" : ""} disponible
              {livres.length > 1 ? "s" : ""} sur Itobe Éditions
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {livres.map((l, i) => (
                <BookCard key={l.slug} livre={l as Livre} index={i} showAuteur={false} />
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section className="auteur-fiche__articles">
            <h2 className="auteur-fiche__section-title">Articles & chroniques</h2>
            <ul className="auteur-fiche__article-list">
              {articles.map((a) => (
                <li key={a.slug} className="auteur-fiche__article-item">
                  <Link to="/media/$slug" params={{ slug: a.slug }} className="auteur-fiche__article-title">
                    {a.titre}
                  </Link>
                  {a.chapo && <p className="auteur-fiche__article-chapo">{a.chapo}</p>}
                  <p className="auteur-fiche__article-meta">
                    {a.categorie} · {formatDate(a.date)} · {a.lecture}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="auteur-fiche__footer">
          <Link to="/auteurs" className="auteur-fiche__cta auteur-fiche__cta--outline">
            ← Tous les auteurs
          </Link>
          <Link to="/edition" className="auteur-fiche__cta">
            Explorer le catalogue
          </Link>
        </footer>
      </div>
    </div>
  );
}
