import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Book,
  BookOpen,
  Copy,
  Eye,
  Monitor,
} from "lucide-react";
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: l.titre,
            isbn: l.isbn,
            numberOfPages: l.pages,
            inLanguage: l.langue,
            author: { "@type": "Person", name: nomAuteur(l.auteur) },
            offers: {
              "@type": "Offer",
              price: l.promo ?? l.prix,
              priceCurrency: "USD",
              availability: l.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  component: LivrePage,
});

type OngletContenu = "descriptif" | "details" | "avis";
type OngletDecouvrir = "auteur" | "categorie" | "selection";

type FormatAchat = "numerique" | "papier";

const LABELS_ACHAT: Record<FormatAchat, string> = {
  numerique: "Numérique",
  papier: "Papier",
};

const ORDRE_FORMATS: FormatAchat[] = ["papier", "numerique"];

const ICONES_FORMAT: Record<FormatAchat, typeof Book> = {
  papier: Book,
  numerique: Monitor,
};

function prixAfficheFiche(prix: number) {
  return `${prix.toFixed(2).replace(".", ",")} $`;
}

function FilAriane({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="fiche-livre__breadcrumb" aria-label="Fil d'Ariane">
      {items.map((item, i) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground/50" aria-hidden>•</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-foreground hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function LivrePage() {
  const { livre } = Route.useLoaderData();
  const auteur = getAuteur(livre.auteur);
  const prix = livre.promo ?? livre.prix;
  const estNouveaute = livre.aLaUne || livre.publication >= "2025-01-01";
  const [onglet, setOnglet] = useState<OngletContenu>("descriptif");
  const [ongletDecouvrir, setOngletDecouvrir] = useState<OngletDecouvrir>("auteur");
  const [lienCopie, setLienCopie] = useState(false);
  const { accesComplet, dejaAchete } = useAccesLecture(livre.slug, livre.apercuPages);
  const accesSansAchat = accesComplet && !dejaAchete;

  const memeAuteur = livres.filter((l) => l.auteur === livre.auteur && l.slug !== livre.slug);
  const memeCategorie = livres.filter(
    (l) => l.categorie === livre.categorie && l.slug !== livre.slug,
  );
  const selection = livres.filter((l) => l.slug !== livre.slug).slice(0, 4);

  const livresDecouvrir = useMemo(() => {
    if (ongletDecouvrir === "auteur") return memeAuteur;
    if (ongletDecouvrir === "categorie") return memeCategorie;
    return selection;
  }, [ongletDecouvrir, memeAuteur, memeCategorie, selection]);

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const fiche: [string, string][] = [
    ["ISBN", livre.isbn],
    ["Pages", String(livre.pages)],
    ["Langue", livre.langue],
    ["Catégorie", livre.categorie],
    ["Publication", formatDate(livre.publication)],
    ["Formats disponibles", "Numérique, Papier"],
    ["Stock papier", livre.stock > 0 ? `${livre.stock} exemplaires` : "Numérique uniquement"],
    ["Aperçu gratuit", `${livre.apercuPages} pages (${livre.apercuPourcent} %)`],
  ];

  return (
    <div className="fiche-livre">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <FilAriane
          items={[
            { label: "Accueil", to: "/" },
            { label: "Itobe Éditions", to: "/edition" },
            { label: livre.categorie },
            { label: livre.titre },
          ]}
        />

        {/* Hero — style maison d'édition */}
        <div className="fiche-livre__hero mt-10">
          <aside className="fiche-livre__covers">
            <div className="fiche-livre__cover-main">
              <BookCover livre={livre} className="fiche-livre__cover-flat" />
            </div>
            <div className="fiche-livre__cover-alt">
              <BookCover livre={livre} className="fiche-livre__cover-flat fiche-livre__cover-flat--small" />
            </div>
          </aside>

          <div className="fiche-livre__buybox">
            {(estNouveaute || livre.promo) && (
              <span className="fiche-livre__badge">
                {livre.promo ? "Promotion" : "Nouveauté"}
              </span>
            )}

            <h1 className="fiche-livre__title">{livre.titre}</h1>
            {livre.sousTitre && <p className="fiche-livre__subtitle">{livre.sousTitre}</p>}

            {auteur && (
              <h2 className="fiche-livre__author">
                <Link to="/auteurs/$slug" params={{ slug: auteur.slug }} className="hover:underline">
                  {auteur.nom}
                </Link>
              </h2>
            )}

            <p className="fiche-livre__meta">
              <span>{formatDate(livre.publication)}</span>
              <span aria-hidden> · </span>
              <span>{livre.categorie}</span>
            </p>

            {dejaAchete ? (
              <div className="fiche-livre__owned mt-8">
                <p className="font-medium">Vous possédez déjà cet ouvrage.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to="/reader/$slug"
                    params={{ slug: livre.slug }}
                    className="fiche-livre__btn fiche-livre__btn--primary"
                  >
                    <BookOpen className="size-4" />
                    Lire maintenant
                  </Link>
                  <Link to="/bibliotheque" className="fiche-livre__btn fiche-livre__btn--outline">
                    Ma bibliothèque
                  </Link>
                </div>
              </div>
            ) : accesSansAchat ? (
              <div className="fiche-livre__owned mt-8">
                <p className="font-medium">Accès complet via votre abonnement Premium.</p>
                <Link
                  to="/reader/$slug"
                  params={{ slug: livre.slug }}
                  className="fiche-livre__btn fiche-livre__btn--primary mt-4"
                >
                  <BookOpen className="size-4" />
                  Lire maintenant
                </Link>
              </div>
            ) : (
              <div className="fiche-livre__achat mt-8">
                <p className="fiche-livre__format-label">Commander selon votre format</p>

                <div className="fiche-livre__format-row">
                  {ORDRE_FORMATS.map((f) => {
                    const Icone = ICONES_FORMAT[f];
                    const contenu = (
                      <>
                        <span className="fiche-livre__format-btn-label">
                          <Icone className="size-5 shrink-0" strokeWidth={1.75} />
                          {LABELS_ACHAT[f]}
                        </span>
                        <span className="fiche-livre__format-btn-price">{prixAfficheFiche(prix)}</span>
                      </>
                    );

                    if (!livre.disponible) {
                      return (
                        <div
                          key={f}
                          className="fiche-livre__format-btn is-disabled"
                          title="Ouvrage indisponible"
                        >
                          {contenu}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={f}
                        to="/achat/$slug"
                        params={{ slug: livre.slug }}
                        search={{ format: f }}
                        className={`fiche-livre__format-btn ${f === "papier" ? "is-active" : ""}`}
                      >
                        {contenu}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  to="/reader/$slug"
                  params={{ slug: livre.slug }}
                  className="fiche-livre__feuilleter"
                >
                  <Eye className="size-4" strokeWidth={1.75} />
                  Feuilleter
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Onglets Descriptif / Détails / Avis */}
        <div className="fiche-livre__tabs mt-16">
          {(
            [
              ["descriptif", "Descriptif"],
              ["details", "Détails"],
              ["avis", "Avis"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setOnglet(id)}
              className={`fiche-livre__tab ${onglet === id ? "is-active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="fiche-livre__tab-panel">
          {onglet === "descriptif" && (
            <div className="fiche-livre__descriptif">
              <span className="fiche-livre__langue">{livre.langue.slice(0, 4).toUpperCase()}</span>
              <div className="prose-book mt-6 space-y-4 text-[0.95rem] leading-relaxed text-foreground/90">
                {livre.resume.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
              {!accesComplet && (
                <div className="mt-10 rounded-sm border border-border bg-secondary/30 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Aperçu gratuit
                  </p>
                  <p className="mt-2 text-sm">
                    {livre.apercuPages} pages accessibles via « Feuilleter », soit {livre.apercuPourcent} % de
                    l&apos;ouvrage.
                  </p>
                </div>
              )}
            </div>
          )}

          {onglet === "details" && (
            <dl className="fiche-livre__details">
              {fiche.map(([k, v]) => (
                <div key={k} className="fiche-livre__detail-row">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {onglet === "avis" && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p>Aucun avis lecteur pour le moment.</p>
              <p className="mt-2">Soyez le premier à partager votre opinion après lecture.</p>
            </div>
          )}
        </div>

        {/* Découvrir plus — comme Calmann-Lévy */}
        <section className="fiche-livre__discover mt-20 border-t border-border pt-14">
          <h2 className="fiche-livre__discover-title">Découvrir plus de livres</h2>
          <div className="fiche-livre__discover-tabs mt-6">
            {(
              [
                ["auteur", "Du même auteur"],
                ["categorie", "Du même thème"],
                ["selection", "Sélection"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setOngletDecouvrir(id)}
                className={`fiche-livre__discover-tab ${ongletDecouvrir === id ? "is-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          {livresDecouvrir.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {livresDecouvrir.slice(0, 4).map((l, i) => (
                <BookCard key={l.slug} livre={l} index={i} showPrix />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Aucune suggestion dans cette rubrique pour le moment.
            </p>
          )}
        </section>

        {/* Partage */}
        <div className="fiche-livre__share mt-14 flex flex-wrap items-center gap-4 border-t border-border pt-8">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Partager</span>
          <button
            type="button"
            onClick={() => void copierLien()}
            className="fiche-livre__share-btn"
          >
            <Copy className="size-3.5" />
            {lienCopie ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
      </div>
    </div>
  );
}
