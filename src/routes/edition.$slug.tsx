import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { useAccesLecture } from "@/hooks/use-acces-lecture";
import { formatDate, fetchLivreBySlug, getAuteur, getLivre, livres, nomAuteur } from "@/lib/data";

export const Route = createFileRoute("/edition/$slug")({
  loader: async ({ params }) => {
    const livre = (await fetchLivreBySlug(params.slug)) ?? getLivre(params.slug);
    if (!livre) throw notFound();
    return { livre };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Livre indisponible" }, { name: "robots", content: "noindex" }] };
    }
    const l = loaderData.livre;
    return {
      meta: [
        { title: `${l.titre} — ${nomAuteur(l.auteur)} | Éditions Itobe` },
        { name: "description", content: l.resume.slice(0, 155) },
        { property: "og:title", content: l.titre },
        { property: "og:description", content: l.resume.slice(0, 155) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/edition/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/edition/${params.slug}` }],
    };
  },
  component: LivrePage,
});

type OngletContenu = "synopsis" | "details" | "avis" | "sommaire";
type FormatAchat = "numerique" | "papier";

const NB_AVIS_MOCK = 127;
const NOTE_MOCK = 4.5;

function prixDollar(usd: number, compact = false) {
  return `${usd.toLocaleString("fr-FR", {
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
  })} $`;
}

function Etoiles({ note }: { note: number }) {
  return (
    <div className="fiche-livre-v2__stars" aria-label={`${note} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const rempli = note >= i + 1 || (note > i && note < i + 1);
        return (
          <Star
            key={i}
            className={`size-4 ${rempli ? "fill-[var(--edition-orange)] text-[var(--edition-orange)]" : "text-[var(--edition-muted)]"}`}
            strokeWidth={1.5}
          />
        );
      })}
      <span className="ml-1 text-sm text-[var(--edition-brown)]/80">
        {note.toFixed(1).replace(".", ",")}/5
      </span>
      <span className="text-sm text-[var(--edition-muted)]">({NB_AVIS_MOCK} avis)</span>
    </div>
  );
}

function LivrePage() {
  const { livre } = Route.useLoaderData();
  const auteur = getAuteur(livre.auteur);
  const [onglet, setOnglet] = useState<OngletContenu>("synopsis");
  const [formatChoisi, setFormatChoisi] = useState<FormatAchat>("numerique");
  const [favori, setFavori] = useState(false);
  const [indexCollection, setIndexCollection] = useState(0);
  const { accesComplet, dejaAchete } = useAccesLecture(livre.slug, livre.apercuPages);
  const accesSansAchat = accesComplet && !dejaAchete;

  const prixBase = livre.promo ?? livre.prix;
  const prixNumerique = Number((prixBase * 0.55).toFixed(2));
  const prixPapier = prixBase;
  const prixAffiche = formatChoisi === "numerique" ? prixNumerique : prixPapier;

  const collection = useMemo(
    () => livres.filter((l) => l.categorie === livre.categorie && l.slug !== livre.slug),
    [livre.categorie, livre.slug],
  );

  const collectionVisible = collection.slice(indexCollection, indexCollection + 4);
  const peutReculer = indexCollection > 0;
  const peutAvancer = indexCollection + 4 < collection.length;

  const initialesAuteur =
    auteur?.nom
      .split(" ")
      .map((m) => m[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "IT";

  return (
    <div className="fiche-livre-v2">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        {/* Hero */}
        <div className="fiche-livre-v2__hero">
          <aside className="fiche-livre-v2__preview">
            <div className="fiche-livre-v2__book-showcase book-showcase">
              <BookCover livre={livre} realistic animated variant="reveal" tilt="face" />
            </div>
          </aside>

          <div className="fiche-livre-v2__info">
            <nav className="fiche-livre-v2__crumb" aria-label="Fil d'Ariane">
              <Link to="/edition">Maison d&apos;édition</Link>
              <span aria-hidden>/</span>
              <span>{livre.categorie}</span>
            </nav>

            <h1 className="fiche-livre-v2__title">{livre.titre}</h1>

            {auteur && (
              <p className="fiche-livre-v2__author">
                Par{" "}
                <Link to="/auteurs/$slug" params={{ slug: auteur.slug }}>
                  {auteur.nom}
                </Link>
              </p>
            )}

            <Etoiles note={NOTE_MOCK} />

            <div className="fiche-livre-v2__price-block">
              <p className="fiche-livre-v2__price">{prixDollar(prixAffiche)}</p>
              <p className="fiche-livre-v2__price-note">TVA incluse</p>
            </div>

            {dejaAchete ? (
              <div className="fiche-livre-v2__owned">
                <p className="font-medium">Vous possédez déjà cet ouvrage.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to="/reader/$slug" params={{ slug: livre.slug }} className="fiche-livre-v2__buy">
                    Lire maintenant
                  </Link>
                  <Link to="/bibliotheque" className="fiche-livre-v2__preview-btn">
                    Ma bibliothèque
                  </Link>
                </div>
              </div>
            ) : accesSansAchat ? (
              <div className="fiche-livre-v2__owned">
                <p className="font-medium">Accès complet via votre abonnement Premium.</p>
                <Link to="/reader/$slug" params={{ slug: livre.slug }} className="fiche-livre-v2__buy mt-4">
                  Lire maintenant
                </Link>
              </div>
            ) : (
              <>
                <p className="fiche-livre-v2__format-title">Choisir le format :</p>
                <div className="fiche-livre-v2__formats">
                  <button
                    type="button"
                    onClick={() => setFormatChoisi("numerique")}
                    className={`fiche-livre-v2__format-opt ${formatChoisi === "numerique" ? "is-active" : ""}`}
                  >
                    Numérique {prixDollar(prixNumerique, true)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormatChoisi("papier")}
                    className={`fiche-livre-v2__format-opt ${formatChoisi === "papier" ? "is-active" : ""}`}
                  >
                    Papier {prixDollar(prixPapier, true)}
                  </button>
                </div>

                <div className="fiche-livre-v2__actions">
                  {livre.disponible ? (
                    <Link
                      to="/achat/$slug"
                      params={{ slug: livre.slug }}
                      search={{ format: formatChoisi }}
                      className="fiche-livre-v2__buy"
                    >
                      Acheter maintenant
                    </Link>
                  ) : (
                    <span className="fiche-livre-v2__buy is-disabled">Indisponible</span>
                  )}
                  <div className="fiche-livre-v2__secondary-actions">
                    <Link to="/reader/$slug" params={{ slug: livre.slug }} className="fiche-livre-v2__preview-btn">
                      <BookOpen className="size-4" />
                      Lire un aperçu
                    </Link>
                    <button
                      type="button"
                      onClick={() => setFavori((v) => !v)}
                      aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
                      className={`fiche-livre-v2__wishlist ${favori ? "is-active" : ""}`}
                    >
                      <Heart className={`size-4 ${favori ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              </>
            )}

            <dl className="fiche-livre-v2__meta-box">
              <div>
                <dt>ISBN</dt>
                <dd>{livre.isbn}</dd>
              </div>
              <div>
                <dt>Nombre de pages</dt>
                <dd>{livre.pages} pages</dd>
              </div>
              <div>
                <dt>Langue</dt>
                <dd>{livre.langue}</dd>
              </div>
              <div>
                <dt>Date de publication</dt>
                <dd>{formatDate(livre.publication)}</dd>
              </div>
              <div>
                <dt>Éditeur</dt>
                <dd>Itobe Éditions</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Onglets */}
        <div className="fiche-livre-v2__tabs">
          {(
            [
              ["synopsis", "Synopsis"],
              ["details", "Détails du livre"],
              ["avis", `Avis des lecteurs (${NB_AVIS_MOCK})`],
              ["sommaire", "Table des matières"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setOnglet(id)}
              className={`fiche-livre-v2__tab ${onglet === id ? "is-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="fiche-livre-v2__panel">
          {onglet === "synopsis" && (
            <div className="fiche-livre-v2__synopsis space-y-4 text-[0.95rem] leading-relaxed text-[var(--edition-brown)]/90">
              {livre.resume.split(/\n\n+/).map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
            </div>
          )}

          {onglet === "details" && (
            <dl className="fiche-livre-v2__details-list">
              <div>
                <dt>ISBN</dt>
                <dd>{livre.isbn}</dd>
              </div>
              <div>
                <dt>Pages</dt>
                <dd>{livre.pages}</dd>
              </div>
              <div>
                <dt>Langue</dt>
                <dd>{livre.langue}</dd>
              </div>
              <div>
                <dt>Catégorie</dt>
                <dd>{livre.categorie}</dd>
              </div>
              <div>
                <dt>Publication</dt>
                <dd>{formatDate(livre.publication)}</dd>
              </div>
              <div>
                <dt>Formats</dt>
                <dd>Numérique, Papier</dd>
              </div>
              <div>
                <dt>Aperçu gratuit</dt>
                <dd>
                  {livre.apercuPages} pages ({livre.apercuPourcent} %)
                </dd>
              </div>
            </dl>
          )}

          {onglet === "avis" && (
            <div className="py-6 text-center text-sm text-[var(--edition-muted)]">
              <Etoiles note={NOTE_MOCK} />
              <p className="mt-4">Les avis lecteurs seront bientôt disponibles sur cette fiche.</p>
            </div>
          )}

          {onglet === "sommaire" && (
            <ol className="fiche-livre-v2__sommaire">
              {livre.chapitres.map((c, i) => (
                <li key={c.titre}>
                  <span className="text-[var(--edition-muted)]">{i + 1}.</span>
                  <span>{c.titre}</span>
                  {accesComplet || c.gratuit ? (
                    <span className="fiche-livre-v2__sommaire-tag">Gratuit</span>
                  ) : (
                    <span className="fiche-livre-v2__sommaire-tag fiche-livre-v2__sommaire-tag--lock">Verrouillé</span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Auteur */}
        {auteur && (
          <section className="fiche-livre-v2__author-box">
            <div className="fiche-livre-v2__author-avatar">{initialesAuteur}</div>
            <div>
              <h2 className="fiche-livre-v2__author-box-title">À propos de l&apos;auteur : {auteur.nom}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--edition-brown)]/85">{auteur.bio}</p>
              <Link to="/auteurs/$slug" params={{ slug: auteur.slug }} className="fiche-livre-v2__author-link">
                Voir tous ses livres →
              </Link>
            </div>
          </section>
        )}

        {/* Collection */}
        {collection.length > 0 && (
          <section className="fiche-livre-v2__collection">
            <div className="fiche-livre-v2__collection-head">
              <h2 className="fiche-livre-v2__collection-title">Dans la même collection</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!peutReculer}
                  onClick={() => setIndexCollection((i) => Math.max(0, i - 1))}
                  className="fiche-livre-v2__carousel-btn"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={!peutAvancer}
                  onClick={() => setIndexCollection((i) => i + 1)}
                  className="fiche-livre-v2__carousel-btn"
                  aria-label="Suivant"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {(collectionVisible.length > 0 ? collectionVisible : collection.slice(0, 4)).map((l, i) => (
                <BookCard key={l.slug} livre={l} index={i} showPrix showAuteur={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
