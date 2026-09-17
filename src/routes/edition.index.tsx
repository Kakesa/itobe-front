import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { CatalogueLivresSkeleton } from "@/components/book-skeletons";
import { EditionCoverHero } from "@/components/edition/cover-hero";
import { Skeleton } from "@/components/ui/skeleton";
import { useLivres } from "@/hooks/use-livres";
import { categoriesLivres } from "@/lib/data";
import { useI18n } from "@/i18n";

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

type OngletCatalogue = "catalogue" | "nouveautes" | "paraitre";

const JOURS_NOUVEAUTE = 180;

function timestampParution(date: string) {
  const t = Date.parse(date);
  return Number.isFinite(t) ? t : 0;
}

function Catalogue() {
  const { locale, t } = useI18n();
  const h = t.editionHome;
  const { livres, loading } = useLivres();
  const [onglet, setOnglet] = useState<OngletCatalogue>("catalogue");
  const [cat, setCat] = useState("Toutes");
  const [format, setFormat] = useState("Tous");
  const [tri, setTri] = useState("recent");

  useEffect(() => {
    document.title = h.metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", h.metaDescription);
  }, [h.metaTitle, h.metaDescription, locale]);

  const liste = useMemo(() => {
    const maintenant = Date.now();
    let l = [...livres];

    if (onglet === "paraitre") {
      l = l.filter((b) => timestampParution(b.publication) > maintenant || !b.disponible);
    } else {
      l = l.filter((b) => b.disponible && timestampParution(b.publication) <= maintenant);
      if (onglet === "nouveautes") {
        const recentes = l.filter(
          (b) => maintenant - timestampParution(b.publication) <= JOURS_NOUVEAUTE * 86400000,
        );
        l = recentes.length > 0 ? recentes : [...l].sort((a, b) => b.publication.localeCompare(a.publication)).slice(0, 8);
      }
    }

    if (cat !== "Toutes") l = l.filter((b) => b.categorie === cat);
    if (format !== "Tous") l = l.filter((b) => b.formats.includes(format as "PDF"));
    if (tri === "prix") l = [...l].sort((a, b) => (a.promo ?? a.prix) - (b.promo ?? b.prix));
    if (tri === "recent")
      l = [...l].sort((a, b) => b.publication.localeCompare(a.publication));
    if (tri === "titre") l = [...l].sort((a, b) => a.titre.localeCompare(b.titre));
    return l;
  }, [cat, format, tri, livres, onglet]);

  const promos = livres.filter((l) => l.promo);
  const onglets: { id: OngletCatalogue; label: string }[] = [
    { id: "catalogue", label: h.tabCatalogue },
    { id: "nouveautes", label: h.tabNouveautes },
    { id: "paraitre", label: h.tabParaitre },
  ];
  const titreOnglet = onglets.find((o) => o.id === onglet)?.label ?? h.tabCatalogue;
  const n = onglet === "catalogue" ? livres.length : liste.length;
  const lead =
    onglet === "nouveautes"
      ? h.nouveautesLead
      : onglet === "paraitre"
        ? h.paraitreLead
        : locale === "fr"
          ? `${n} ouvrage${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""} en PDF, EPUB et papier. ${h.catalogueLead}`
          : `${n} title${n > 1 ? "s" : ""} available in PDF, EPUB, and print. ${h.catalogueLead}`;
  const vide =
    onglet === "nouveautes"
      ? h.emptyNouveautes
      : onglet === "paraitre"
        ? h.emptyParaitre
        : h.emptyCatalogue;

  return (
    <div>
      <EditionCoverHero livres={livres} loading={loading} />

      <div id="catalogue" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="text-center md:text-left">
          <p className="kicker animate-book-fade-up">Maison d&apos;édition</p>
          <h2
            className="mt-3 text-3xl md:text-4xl animate-book-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            {titreOnglet}
          </h2>
          <nav className="edition-tabs justify-center md:justify-start" aria-label={h.tabCatalogue}>
            {onglets.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`edition-tabs__btn${onglet === o.id ? " is-active" : ""}`}
                aria-pressed={onglet === o.id}
                onClick={() => setOnglet(o.id)}
              >
                {o.label}
              </button>
            ))}
          </nav>
          <div className="mx-auto mt-4 max-w-xl text-muted-foreground md:mx-0">
            {loading ? (
              <Skeleton className="mx-auto h-4 w-72 max-w-full md:mx-0" />
            ) : (
              lead
            )}
          </div>
        </div>

        {loading ? null : promos.length > 0 && (
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
            {loading && <CatalogueLivresSkeleton count={9} />}
            {!loading && liste.length === 0 && livres.length > 0 && onglet === "catalogue" && (
              <p className="col-span-full text-sm text-muted-foreground">{h.emptyFilters}</p>
            )}
            {!loading && liste.length === 0 && (livres.length === 0 || onglet !== "catalogue") && (
              <p className="col-span-full text-sm text-muted-foreground">{vide}</p>
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
