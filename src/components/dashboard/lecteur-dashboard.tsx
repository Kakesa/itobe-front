import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Download, Heart } from "lucide-react";
import { lecteurDashboardQuery } from "@/lib/dashboard/queries";
import type { DashboardLecteurPayload } from "@/lib/dashboard/types";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import { useRole } from "@/hooks/use-role";
import { AccesRestreint } from "@/components/admin-ui";

/** Dashboard lecteur — contenu principal de `/admin` pour le rôle lecteur. */
export function LecteurDashboard() {
  const { role } = useRole();
  const { data, isLoading } = useQuery(lecteurDashboardQuery());

  if (role !== "lecteur") {
    return <AccesRestreint requis={["lecteur"]} />;
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-12 w-72" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Espace lecteur
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          Bienvenue, {data.prenom}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Reprenez votre lecture, explorez vos favoris et découvrez les nouveautés.
        </p>
      </div>
      <DashboardVue data={data} />
    </div>
  );
}

function DashboardVue({ data }: { data: DashboardLecteurPayload }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Temps total de lecture" valeur={data.tempsLectureTotal} />
        <KpiCard label="Livres en bibliothèque" valeur={data.bibliotheque.length} />
        <KpiCard label="Favoris" valeur={data.favoris.length} />
      </div>

      <SectionCard titre="Continuer la lecture">
        {data.continuer.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune lecture en cours.{" "}
            <Link to="/edition" className="text-accent hover:underline">
              Découvrir le catalogue
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.continuer.map((l) => (
            <Link
              key={l.slug}
              to="/reader/$slug"
              params={{ slug: l.slug }}
              className="rounded-xl border border-border p-4 transition-colors hover:border-accent"
            >
              <div className="flex gap-3">
                <div
                  className="h-20 w-14 shrink-0 rounded-md"
                  style={{ backgroundImage: l.couleur }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display">{l.titre}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{l.progression}% lu</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${l.progression}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          titre="Bibliothèque"
          action={
            <Link to="/admin/ma-bibliotheque" className="text-xs text-accent hover:underline">
              Voir tout
            </Link>
          }
        >
          {data.bibliotheque.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun livre acheté pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {data.bibliotheque.map((l) => (
              <li key={l.slug} className="flex items-center gap-3 text-sm">
                <div className="size-8 rounded" style={{ backgroundImage: l.couleur }} />
                <Link to="/edition/$slug" params={{ slug: l.slug }} className="hover:text-accent">
                  {l.titre}
                </Link>
              </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          titre="Favoris"
          action={
            <Link to="/admin/favoris" className="text-xs text-accent hover:underline">
              Voir tout
            </Link>
          }
        >
          {data.favoris.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun favori enregistré.</p>
          ) : (
            <ul className="space-y-2">
              {data.favoris.map((l) => (
              <li key={l.slug} className="flex items-center gap-3 text-sm">
                <Heart className="size-3.5 text-accent" />
                <Link to="/edition/$slug" params={{ slug: l.slug }} className="hover:text-accent">
                  {l.titre}
                </Link>
              </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          titre="Derniers achats"
          action={
            <Link to="/admin/mes-achats" className="text-xs text-accent hover:underline">
              Voir tout
            </Link>
          }
        >
          {data.derniersAchats.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun achat récent.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {data.derniersAchats.map((a) => (
                <li key={a.slug} className="flex justify-between py-2">
                  <span>{a.titre}</span>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          titre="Historique"
          action={
            <Link to="/admin/historique" className="text-xs text-accent hover:underline">
              Voir tout
            </Link>
          }
        >
          {data.historique.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune lecture récente.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {data.historique.map((h) => (
                <li key={h.slug + h.date} className="flex items-center gap-2 py-2">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span className="flex-1">{h.titre}</span>
                  <span className="text-xs text-muted-foreground">{h.date}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard titre="Recommandations">
          <div className="grid grid-cols-3 gap-3">
            {data.recommandations.map((l) => (
              <Link key={l.slug} to="/edition/$slug" params={{ slug: l.slug }} className="group">
                <div
                  className="aspect-[3/4] rounded-lg transition-transform group-hover:-translate-y-0.5"
                  style={{ backgroundImage: l.couleur }}
                />
                <p className="mt-2 text-xs leading-snug">{l.titre}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard titre="Nouveautés">
          <div className="grid grid-cols-3 gap-3">
            {data.nouveautes.map((l) => (
              <Link key={l.slug} to="/edition/$slug" params={{ slug: l.slug }} className="group">
                <div
                  className="aspect-[3/4] rounded-lg transition-transform group-hover:-translate-y-0.5"
                  style={{ backgroundImage: l.couleur }}
                />
                <p className="mt-2 text-xs leading-snug">{l.titre}</p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          titre="Derniers téléchargements"
          action={
            <Link to="/admin/telechargements" className="text-xs text-accent hover:underline">
              Voir tout
            </Link>
          }
        >
          {data.telechargements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun téléchargement.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.telechargements.map((t) => (
                <li key={t.slug} className="flex items-center gap-2">
                  <Download className="size-3.5 text-muted-foreground" />
                  {t.titre}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          titre="Marque-pages"
          action={
            <Link to="/admin/marque-pages" className="text-xs text-accent hover:underline">
              Voir tout
            </Link>
          }
        >
          {data.marquePages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun marque-page.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.marquePages.map((m) => (
                <li key={m.slug + m.page} className="flex items-center gap-2">
                  <Bookmark className="size-3.5 text-accent" />
                  <Link
                    to="/reader/$slug"
                    params={{ slug: m.slug }}
                    className="flex-1 hover:text-accent"
                  >
                    {m.titre}
                  </Link>
                  <span className="text-xs text-muted-foreground">p. {m.page}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
