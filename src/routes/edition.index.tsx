import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookCard } from "@/components/book-card";
import { BookCover } from "@/components/book-cover";
import { CatalogueLivresSkeleton } from "@/components/book-skeletons";
import { EditionCoverHero } from "@/components/edition/cover-hero";
import { Skeleton } from "@/components/ui/skeleton";
import { useLivres } from "@/hooks/use-livres";
import { categoriesLivres, nomAuteur, tarifLivre, type Livre } from "@/lib/data";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/edition/")({
  head: () => ({
    meta: [
      { title: "Maison d'édition — Itobe" },
      {
        name: "description",
        content:
          "Romans, essais, poésie et jeunesse. Découvrez le catalogue des éditions Itobe en PDF et papier, avec aperçu gratuit avant achat.",
      },
      { property: "og:title", content: "Maison d'édition — Itobe" },
      {
        property: "og:description",
        content: "Romans, essais, poésie et jeunesse en PDF et papier.",
      },
      { property: "og:url", content: "/edition" },
    ],
    links: [{ rel: "canonical", href: "/edition" }],
  }),
  component: Catalogue,
});

function formatPrix(n: number, locale: string) {
  return `${n.toFixed(2).replace(".", locale === "en" ? "." : ",")} $`;
}

function FiltresCatalogue({
  cat,
  format,
  tri,
  onCat,
  onFormat,
  onTri,
  variant,
  labels,
}: {
  cat: string;
  format: string;
  tri: string;
  onCat: (v: string) => void;
  onFormat: (v: string) => void;
  onTri: (v: string) => void;
  variant: "mobile" | "desktop";
  labels: {
    category: string;
    format: string;
    sort: string;
    allCats: string;
    allFormats: string;
    sortRecent: string;
    sortPrice: string;
    sortTitle: string;
  };
}) {
  const categories = [
    { value: "Toutes", label: labels.allCats },
    ...categoriesLivres.map((c) => ({ value: c, label: c })),
  ];
  const formats = [
    { value: "Tous", label: labels.allFormats },
    { value: "PDF", label: "PDF" },
    { value: "Papier", label: labels.format === "Format" ? "Papier" : "Print" },
  ];

  if (variant === "mobile") {
    return (
      <div className="edition-filters edition-filters--mobile lg:hidden">
        <label className="edition-filters__field">
          <span>{labels.category}</span>
          <select value={cat} onChange={(e) => onCat(e.target.value)} aria-label={labels.category}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="edition-filters__field">
          <span>{labels.format}</span>
          <select value={format} onChange={(e) => onFormat(e.target.value)} aria-label={labels.format}>
            {formats.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="edition-filters__field">
          <span>{labels.sort}</span>
          <select value={tri} onChange={(e) => onTri(e.target.value)} aria-label={labels.sort}>
            <option value="recent">{labels.sortRecent}</option>
            <option value="prix">{labels.sortPrice}</option>
            <option value="titre">{labels.sortTitle}</option>
          </select>
        </label>
      </div>
    );
  }

  return (
    <aside className="edition-filters edition-filters--desktop hidden lg:block">
      <div>
        <p className="edition-filters__label">{labels.category}</p>
        <div className="edition-filters__chips">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onCat(c.value)}
              className={`edition-chip${cat === c.value ? " is-active" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="edition-filters__label">{labels.format}</p>
        <div className="edition-filters__chips">
          {formats.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFormat(f.value)}
              className={`edition-chip${format === f.value ? " is-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="edition-filters__label">{labels.sort}</p>
        <select
          value={tri}
          onChange={(e) => onTri(e.target.value)}
          className="edition-filters__select"
          aria-label={labels.sort}
        >
          <option value="recent">{labels.sortRecent}</option>
          <option value="prix">{labels.sortPrice}</option>
          <option value="titre">{labels.sortTitle}</option>
        </select>
      </div>
    </aside>
  );
}

function PromoRail({ livres, locale, title, upto }: { livres: Livre[]; locale: string; title: string; upto: string }) {
  const maxOff = livres.reduce((m, l) => Math.max(m, tarifLivre(l).percent), 0);
  return (
    <section className="edition-promo" aria-labelledby="edition-promo-title">
      <header className="edition-promo__head">
        <h3 id="edition-promo-title">{title}</h3>
        {maxOff > 0 ? <p>{upto.replace("{n}", String(maxOff))}</p> : null}
      </header>
      <div className="edition-promo__grid">
        {livres.map((livre) => {
          const tarif = tarifLivre(livre);
          return (
            <Link
              key={livre.slug}
              to="/edition/$slug"
              params={{ slug: livre.slug }}
              className="edition-promo__card"
            >
              <div className="edition-promo__cover">
                <BookCover livre={livre} realistic tilt="face" size="card" />
              </div>
              <div className="edition-promo__copy">
                {tarif.percent > 0 ? (
                  <span className="edition-promo__badge">−{tarif.percent} %</span>
                ) : (
                  <span className="edition-promo__badge">Promo</span>
                )}
                <p className="edition-promo__title">{livre.titre}</p>
                <p className="edition-promo__author">{nomAuteur(livre.auteur)}</p>
                <p className="edition-promo__price">
                  <strong>{formatPrix(tarif.current, locale)}</strong>
                  {tarif.previous ? <s>{formatPrix(tarif.previous, locale)}</s> : null}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
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

  const allCats = locale === "en" ? "All" : "Toutes";
  const allFormats = locale === "en" ? "All" : "Tous";

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
    if (tri === "prix") l = [...l].sort((a, b) => tarifLivre(a).current - tarifLivre(b).current);
    if (tri === "recent")
      l = [...l].sort((a, b) => b.publication.localeCompare(a.publication));
    if (tri === "titre") l = [...l].sort((a, b) => a.titre.localeCompare(b.titre));
    return l;
  }, [cat, format, tri, livres, onglet]);

  const promos = useMemo(
    () => livres.filter((l) => tarifLivre(l).percent > 0),
    [livres],
  );
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
          ? `${n} ouvrage${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""} en PDF et papier. ${h.catalogueLead}`
          : `${n} title${n > 1 ? "s" : ""} available in PDF and print. ${h.catalogueLead}`;
  const vide =
    onglet === "nouveautes"
      ? h.emptyNouveautes
      : onglet === "paraitre"
        ? h.emptyParaitre
        : h.emptyCatalogue;

  const filterLabels = {
    category: h.filterCategory,
    format: h.filterFormat,
    sort: h.filterSort,
    allCats,
    allFormats,
    sortRecent: h.sortRecent,
    sortPrice: h.sortPrice,
    sortTitle: h.sortTitle,
  };

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
            {loading ? <Skeleton className="mx-auto h-4 w-72 max-w-full md:mx-0" /> : lead}
          </div>
        </div>

        {loading ? null : promos.length > 0 && onglet === "catalogue" ? (
          <PromoRail livres={promos} locale={locale} title={h.promotions} upto={h.promotionsUpto} />
        ) : null}

        <FiltresCatalogue
          variant="mobile"
          cat={cat}
          format={format}
          tri={tri}
          onCat={setCat}
          onFormat={setFormat}
          onTri={setTri}
          labels={filterLabels}
        />

        <div className="mt-6 grid gap-10 lg:mt-10 lg:grid-cols-[240px_1fr]">
          <FiltresCatalogue
            variant="desktop"
            cat={cat}
            format={format}
            tri={tri}
            onCat={setCat}
            onFormat={setFormat}
            onTri={setTri}
            labels={filterLabels}
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
