import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookCover } from "@/components/book-cover";
import { getLivre, livres, nomAuteur } from "@/lib/data";
import { BibliothequeApi } from "@/lib/api-client";
import { lireSession } from "@/lib/auth";

export const Route = createFileRoute("/bibliotheque")({
  head: () => ({
    meta: [
      { title: "Ma bibliothèque numérique | Itobe" },
      {
        name: "description",
        content:
          "Retrouvez vos livres achetés, vos favoris, vos téléchargements et votre progression de lecture synchronisée sur tous vos appareils.",
      },
      { property: "og:title", content: "Ma bibliothèque numérique | Itobe" },
      { property: "og:description", content: "Vos livres, favoris et progression de lecture." },
      { property: "og:url", content: "/bibliotheque" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/bibliotheque" }],
  }),
  component: Bibliotheque,
});

const onglets = [
  { id: "achetes", label: "Achetés" },
  { id: "favoris", label: "Favoris" },
  { id: "telecharges", label: "Téléchargements" },
  { id: "historique", label: "Historique de lecture" },
] as const;

function Bibliotheque() {
  const [onglet, setOnglet] = useState<(typeof onglets)[number]["id"]>("achetes");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    achetes: string[];
    favoris: string[];
    telecharges: string[];
    progressions: Record<string, number>;
  }>({
    achetes: [],
    favoris: [],
    telecharges: [],
    progressions: {},
  });

  const session = lireSession();

  useEffect(() => {
    async function loadBiblio() {
      try {
        const res = await BibliothequeApi.getLibrary();
        if (res?.data) {
          setData({
            achetes: (res.data.achetes || []).map((l: any) => l.slug),
            favoris: (res.data.favoris || []).map((l: any) => l.slug),
            telecharges: (res.data.telecharges || []).map((l: any) => l.slug),
            progressions: res.data.progressions || {},
          });
        }
      } catch (err) {
        console.warn("[Bibliotheque] Données non chargées :", err);
      } finally {
        setLoading(false);
      }
    }
    loadBiblio();
  }, []);

  const slugs =
    onglet === "historique"
      ? Object.keys(data.progressions)
      : data[onglet as "achetes" | "favoris" | "telecharges"] || [];

  const enCours = Object.entries(data.progressions).slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="kicker">Espace lecteur</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Ma bibliothèque</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        {session ? `Bonjour ${session.prenom || session.nom}. ` : ""}
        Vos ouvrages, vos favoris et votre progression, synchronisés entre ordinateur, tablette et mobile.
      </p>

      {/* Reprendre la lecture */}
      {enCours.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl">Reprendre la lecture</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {enCours.map(([slug, pct]) => {
              const l = getLivre(slug);
              if (!l) return null;
              return (
                <div
                  key={slug}
                  className="flex gap-5 rounded-sm border border-border bg-card p-5"
                >
                  <BookCover livre={l} className="w-24 shrink-0" />
                  <div className="flex flex-1 flex-col">
                    <p className="font-display text-lg leading-snug">{l.titre}</p>
                    <p className="text-xs text-muted-foreground">{nomAuteur(l.auteur)}</p>
                    <div className="mt-4 h-1.5 w-full rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{pct} % lu</p>
                    <Link
                      to="/reader/$slug"
                      params={{ slug: l.slug }}
                      className="mt-auto pt-4 text-sm text-accent hover:underline"
                    >
                      Continuer la lecture →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Onglets */}
      <section className="mt-16">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {onglets.map((o) => (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                onglet === o.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {slugs.map((s) => {
            const l = getLivre(s);
            if (!l) return null;
            return (
              <Link key={s} to="/reader/$slug" params={{ slug: s }} className="group">
                <BookCover livre={l} className="transition-transform group-hover:-translate-y-1" />
                <p className="mt-3 font-display leading-snug group-hover:text-accent">{l.titre}</p>
                <p className="text-xs text-muted-foreground">{nomAuteur(l.auteur)}</p>
              </Link>
            );
          })}
          {!loading && slugs.length === 0 && (
            <div className="col-span-full py-8 text-muted-foreground">
              <p className="text-sm">Votre espace personnel ne contient aucun livre dans cette section pour le moment.</p>
              <Link to="/edition" className="mt-3 inline-block text-sm text-accent hover:underline">
                Découvrir le catalogue de la maison d&apos;édition →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl">Suggestions du catalogue</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {livres.slice(0, 4).map((l) => (
            <Link key={l.slug} to="/edition/$slug" params={{ slug: l.slug }} className="group">
              <BookCover livre={l} className="transition-transform group-hover:-translate-y-1" />
              <p className="mt-3 font-display leading-snug group-hover:text-accent">{l.titre}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
