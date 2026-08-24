import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { useLivres } from "@/hooks/use-livres";
import { categoriesLivres } from "@/lib/data";

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

const selectFiltreClass =
  "mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm";

function FiltresCatalogue({
  cat,
  format,
  tri,
  onCat,
  onFormat,
  onTri,
  variant,
}: {
  cat: string;
  format: string;
  tri: string;
  onCat: (v: string) => void;
  onFormat: (v: string) => void;
  onTri: (v: string) => void;
  variant: "mobile" | "desktop";
}) {
  if (variant === "mobile") {
    return (
      <div className="grid gap-4 rounded-lg border border-border bg-card p-4 lg:hidden">
        <label className="block">
          <span className="kicker">Catégorie</span>
          <select
            value={cat}
            onChange={(e) => onCat(e.target.value)}
            className={selectFiltreClass}
            aria-label="Filtrer par catégorie"
          >
            {["Toutes", ...categoriesLivres].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="kicker">Format</span>
          <select
            value={format}
            onChange={(e) => onFormat(e.target.value)}
            className={selectFiltreClass}
            aria-label="Filtrer par format"
          >
            {["Tous", "PDF", "EPUB", "Papier"].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="kicker">Trier par</span>
          <select
            value={tri}
            onChange={(e) => onTri(e.target.value)}
            className={selectFiltreClass}
            aria-label="Trier le catalogue"
          >
            <option value="recent">Plus récents</option>
            <option value="prix">Prix croissant</option>
            <option value="titre">Titre A–Z</option>
          </select>
        </label>
      </div>
    );
  }

  return (
    <aside className="hidden space-y-8 lg:block">
      <div>
        <p className="kicker">Catégorie</p>
        <div className="mt-3 space-y-1">
          {["Toutes", ...categoriesLivres].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCat(c)}
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
              type="button"
              onClick={() => onFormat(f)}
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
        <p className="kicker">Trier par</p>
        <select
          value={tri}
          onChange={(e) => onTri(e.target.value)}
          className={selectFiltreClass}
          aria-label="Trier le catalogue"
        >
          <option value="recent">Plus récents</option>
          <option value="prix">Prix croissant</option>
          <option value="titre">Titre A–Z</option>
        </select>
      </div>
    </aside>
  );
}

function Catalogue() {
  const { livres, loading } = useLivres();
  const [cat, setCat] = useState("Toutes");
  const [format, setFormat] = useState("Tous");
  const [tri, setTri] = useState("recent");

  const liste = useMemo(() => {
    let l = [...livres];
    if (cat !== "Toutes") l = l.filter((b) => b.categorie === cat);
    if (format !== "Tous") l = l.filter((b) => b.formats.includes(format as "PDF"));
    if (tri === "prix") l = [...l].sort((a, b) => (a.promo ?? a.prix) - (b.promo ?? b.prix));
    if (tri === "recent")
      l = [...l].sort((a, b) => b.publication.localeCompare(a.publication));
    if (tri === "titre") l = [...l].sort((a, b) => a.titre.localeCompare(b.titre));
    return l;
  }, [cat, format, tri, livres]);

  const promos = livres.filter((l) => l.promo);

  return (
    <div>
      {/* Hero façon maison d'édition institutionnelle */}
      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden md:min-h-[85vh]">
        <img
          src={HERO_IMG}
          alt=""
          className="absolute inset-0 size-full object-cover animate-[edition-hero-zoom_18s_ease-out_forwards]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/30" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-28 text-center md:px-12">
          <p
            className="font-display text-2xl tracking-tight text-white md:text-3xl animate-hero-in"
            style={{ animationDelay: "0.15s" }}
          >
            Itobe<span className="text-[var(--edition-orange)]">.</span>
          </p>
          <h1
            className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-[1.08] text-white md:text-6xl lg:text-7xl animate-hero-in"
            style={{ animationDelay: "0.3s" }}
          >
            Un monde de lecture, d&apos;édition et de découverte
          </h1>
          <p
            className="mx-auto mt-5 max-w-xl text-base text-white/75 md:text-lg animate-hero-in"
            style={{ animationDelay: "0.45s" }}
          >
            Faire de l&apos;Afrique le cœur de la narration mondiale — romans, essais et jeunesse.
          </p>
          <a
            href="#catalogue"
            className="mt-9 inline-flex items-center rounded-sm bg-[var(--edition-orange)] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-[#d4480f] hover:-translate-y-0.5 animate-hero-in"
            style={{ animationDelay: "0.6s" }}
          >
            Découvrir le catalogue
          </a>
        </div>
      </section>

      <div id="catalogue" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <p className="kicker animate-book-fade-up">Maison d&apos;édition</p>
        <h2 className="mt-3 text-3xl md:text-4xl animate-book-fade-up" style={{ animationDelay: "80ms" }}>
          Catalogue
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {loading
            ? "Chargement du catalogue…"
            : `${livres.length} ouvrage${livres.length > 1 ? "s" : ""} disponible${livres.length > 1 ? "s" : ""} en PDF, EPUB et papier. Chaque livre propose un aperçu gratuit avant l'achat.`}
        </p>

        {promos.length > 0 && (
          <div className="mt-8 border border-accent/40 bg-accent/10 p-4 text-sm">
            <span className="kicker">Promotions</span>{" "}
            <span className="ml-2">
              {promos.map((p) => p.titre).join(" · ")} — jusqu&apos;à -33 % ce mois-ci.
            </span>
          </div>
        )}

        <FiltresCatalogue
          variant="mobile"
          cat={cat}
          format={format}
          tri={tri}
          onCat={setCat}
          onFormat={setFormat}
          onTri={setTri}
        />

        <div className="mt-6 grid gap-10 lg:mt-10 lg:grid-cols-[220px_1fr]">
          <FiltresCatalogue
            variant="desktop"
            cat={cat}
            format={format}
            tri={tri}
            onCat={setCat}
            onFormat={setFormat}
            onTri={setTri}
          />

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {loading && (
              <p className="col-span-full text-sm text-muted-foreground">Chargement du catalogue…</p>
            )}
            {!loading && liste.length === 0 && livres.length > 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                Aucun livre ne correspond aux filtres ({livres.length} ouvrage{livres.length > 1 ? "s" : ""} au
                catalogue). Essayez de choisir « Toutes » les catégories ou « Tous » les formats.
              </p>
            )}
            {!loading && liste.length === 0 && livres.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                Aucun livre disponible pour le moment.
              </p>
            )}
            {liste.map((l, i) => (
              <BookCard key={l.slug} livre={l} index={i} showPrix />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
