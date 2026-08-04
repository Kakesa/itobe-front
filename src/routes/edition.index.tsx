import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookCover } from "@/components/book-cover";
import { categoriesLivres, livres, nomAuteur, prixAffiche } from "@/lib/data";

export const Route = createFileRoute("/edition/")({
  head: () => ({
    meta: [
      { title: "Maison d'édition — Itobe" },
      {
        name: "description",
        content:
          "Romans, essais, poésie et jeunesse. Découvrez le catalogue des éditions Itobe en PDF, EPUB et papier, avec aperçu gratuit avant achat.",
      },
      { property: "og:title", content: "Maison d'édition — Itobe" },
      {
        property: "og:description",
        content: "Romans, essais, poésie et jeunesse en PDF, EPUB et papier.",
      },
      { property: "og:url", content: "/edition" },
    ],
    links: [{ rel: "canonical", href: "/edition" }],
  }),
  component: Catalogue,
});

const HERO_IMG =
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=80";

function Catalogue() {
  const [cat, setCat] = useState("Toutes");
  const [format, setFormat] = useState("Tous");
  const [tri, setTri] = useState("recent");
  const [prixMax, setPrixMax] = useState(30);

  const liste = useMemo(() => {
    let l = livres.filter((b) => (b.promo ?? b.prix) <= prixMax);
    if (cat !== "Toutes") l = l.filter((b) => b.categorie === cat);
    if (format !== "Tous") l = l.filter((b) => b.formats.includes(format as "PDF"));
    if (tri === "prix") l = [...l].sort((a, b) => (a.promo ?? a.prix) - (b.promo ?? b.prix));
    if (tri === "recent")
      l = [...l].sort((a, b) => b.publication.localeCompare(a.publication));
    if (tri === "titre") l = [...l].sort((a, b) => a.titre.localeCompare(b.titre));
    return l;
  }, [cat, format, tri, prixMax]);

  const promos = livres.filter((l) => l.promo);

  return (
    <div>
      {/* Hero façon maison d'édition institutionnelle */}
      <section className="relative flex min-h-[78vh] items-end overflow-hidden md:min-h-[85vh]">
        <img
          src={HERO_IMG}
          alt=""
          className="absolute inset-0 size-full object-cover animate-[edition-hero-zoom_18s_ease-out_forwards]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent" />

        <div className="relative z-10 w-full px-6 pb-16 pt-28 md:px-12 md:pb-24 lg:px-16">
          <p className="font-display text-2xl tracking-tight text-white md:text-3xl">
            Itobe<span className="text-ochre">.</span>
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.08] text-white md:text-6xl lg:text-7xl">
            Un monde de lecture, d&apos;édition et de découverte
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75 md:text-lg">
            Romans, essais, poésie et jeunesse — publier, lire et partager autrement.
          </p>
          <a
            href="#catalogue"
            className="mt-9 inline-flex items-center rounded-sm bg-white px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-ochre hover:text-ink"
          >
            Découvrir le catalogue
          </a>
        </div>
      </section>

      <div id="catalogue" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <p className="kicker">Maison d&apos;édition</p>
        <h2 className="mt-3 text-3xl md:text-4xl">Catalogue</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {livres.length} ouvrages disponibles en PDF, EPUB et papier. Chaque livre propose un
          aperçu gratuit avant l&apos;achat.
        </p>

        {promos.length > 0 && (
          <div className="mt-8 border border-accent/40 bg-accent/10 p-4 text-sm">
            <span className="kicker">Promotions</span>{" "}
            <span className="ml-2">
              {promos.map((p) => p.titre).join(" · ")} — jusqu&apos;à -33 % ce mois-ci.
            </span>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-8">
            <div>
              <p className="kicker">Catégorie</p>
              <div className="mt-3 space-y-1">
                {["Toutes", ...categoriesLivres].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`block w-full text-left text-sm ${
                      cat === c ? "font-medium text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="kicker">Format</p>
              <div className="mt-3 space-y-1">
                {["Tous", "PDF", "EPUB", "Papier"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`block w-full text-left text-sm ${
                      format === f ? "font-medium text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="kicker">Prix max : {prixMax} $</p>
              <input
                type="range"
                min={5}
                max={30}
                value={prixMax}
                onChange={(e) => setPrixMax(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--accent)]"
              />
            </div>

            <div>
              <p className="kicker">Trier par</p>
              <select
                value={tri}
                onChange={(e) => setTri(e.target.value)}
                className="mt-3 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm"
              >
                <option value="recent">Plus récents</option>
                <option value="prix">Prix croissant</option>
                <option value="titre">Titre A–Z</option>
              </select>
            </div>
          </aside>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {liste.map((l) => (
              <Link key={l.slug} to="/edition/$slug" params={{ slug: l.slug }} className="group">
                <div className="relative">
                  <BookCover livre={l} className="transition-transform group-hover:-translate-y-1" />
                  {l.promo && (
                    <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-medium text-accent-foreground">
                      Promo
                    </span>
                  )}
                </div>
                <p className="mt-3 font-display leading-snug group-hover:text-accent">{l.titre}</p>
                <p className="text-xs text-muted-foreground">{nomAuteur(l.auteur)}</p>
                <p className="mt-1 text-sm">
                  {prixAffiche(l)}
                  {l.promo && (
                    <span className="ml-2 text-xs text-muted-foreground line-through">
                      {l.prix.toFixed(2)} $
                    </span>
                  )}
                </p>
              </Link>
            ))}
            {liste.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun livre ne correspond aux filtres.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
