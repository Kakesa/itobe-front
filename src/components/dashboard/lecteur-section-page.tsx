import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Download, Heart, ShoppingBag } from "lucide-react";
import { AccesRestreint, Statut } from "@/components/admin-ui";
import { KpiCard, SectionCard, SkeletonBlock } from "@/components/dashboard/ui";
import { lecteurDashboardQuery } from "@/lib/dashboard/queries";
import type { DashboardLecteurPayload } from "@/lib/dashboard/types";
import { useRole } from "@/hooks/use-role";
import { useSession } from "@/hooks/use-session";

type SectionId =
  | "bibliotheque"
  | "favoris"
  | "historique"
  | "telechargements"
  | "marque-pages"
  | "mes-achats";

const META: Record<
  SectionId,
  { titre: string; sousTitre: string; kicker: string }
> = {
  bibliotheque: {
    kicker: "Ma lecture",
    titre: "Bibliothèque",
    sousTitre: "Tous les ouvrages disponibles dans votre espace lecteur.",
  },
  favoris: {
    kicker: "Ma lecture",
    titre: "Favoris",
    sousTitre: "Les titres que vous avez mis de côté.",
  },
  historique: {
    kicker: "Ma lecture",
    titre: "Historique",
    sousTitre: "Votre activité de lecture récente.",
  },
  telechargements: {
    kicker: "Ma lecture",
    titre: "Téléchargements",
    sousTitre: "Fichiers téléchargés sur vos appareils.",
  },
  "marque-pages": {
    kicker: "Ma lecture",
    titre: "Marque-pages",
    sousTitre: "Reprenez exactement où vous vous êtes arrêté.",
  },
  "mes-achats": {
    kicker: "Commercial",
    titre: "Mes achats",
    sousTitre: "Commandes, paiements et accès à vos livres.",
  },
};

function EtatVide({
  icone: Icone,
  titre,
  description,
  action,
}: {
  icone: typeof Heart;
  titre: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <Icone className="mx-auto size-8 text-muted-foreground/60" />
      <p className="mt-4 font-display text-lg">{titre}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function LienCatalogue() {
  return (
    <Link
      to="/edition"
      className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
    >
      Parcourir le catalogue
    </Link>
  );
}

export function LecteurSectionPage({ section }: { section: SectionId }) {
  const { role } = useRole();
  const { connecte } = useSession();
  const { data, isLoading } = useQuery(lecteurDashboardQuery());
  const meta = META[section];

  if (role !== "lecteur") {
    return <AccesRestreint requis={["lecteur"]} />;
  }

  if (!connecte) {
    return (
      <EtatVide
        icone={ShoppingBag}
        titre="Connexion requise"
        description="Connectez-vous avec votre compte lecteur pour accéder à cette section."
        action={
          <Link
            to="/connexion"
            className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Se connecter
          </Link>
        }
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-64" />
        <SkeletonBlock className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {meta.kicker}
        </p>
        <h2 className="mt-1 font-display text-3xl">{meta.titre}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{meta.sousTitre}</p>
      </div>
      {renduSection(section, data)}
    </div>
  );
}

function renduSection(section: SectionId, data: DashboardLecteurPayload): ReactNode {
  switch (section) {
    case "bibliotheque":
      return (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard label="Ouvrages" valeur={data.bibliotheque.length} />
            <KpiCard label="En cours" valeur={data.continuer.length} />
            <KpiCard label="Temps de lecture" valeur={data.tempsLectureTotal} />
          </div>
          <SectionCard titre="Vos livres">
            {data.bibliotheque.length === 0 ? (
              <EtatVide
                icone={Heart}
                titre="Votre bibliothèque est vide"
                description="Achetez un livre pour le retrouver ici et commencer votre lecture."
                action={<LienCatalogue />}
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.bibliotheque.map((l) => (
                  <li key={l.slug}>
                    <Link
                      to="/edition/$slug"
                      params={{ slug: l.slug }}
                      className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent"
                    >
                      <div
                        className="h-16 w-12 shrink-0 rounded-md"
                        style={{ backgroundImage: l.couleur }}
                      />
                      <div>
                        <p className="font-display">{l.titre}</p>
                        <p className="mt-1 text-xs text-accent">Ouvrir →</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      );
    case "favoris":
      return (
        <SectionCard titre="Titres favoris">
          {data.favoris.length === 0 ? (
            <EtatVide
              icone={Heart}
              titre="Aucun favori"
              description="Ajoutez des livres à vos favoris depuis leur fiche produit."
              action={<LienCatalogue />}
            />
          ) : (
            <ul className="space-y-2">
              {data.favoris.map((l) => (
                <li key={l.slug} className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm">
                  <Heart className="size-4 text-accent" />
                  <div
                    className="size-8 rounded"
                    style={{ backgroundImage: l.couleur }}
                  />
                  <Link to="/edition/$slug" params={{ slug: l.slug }} className="flex-1 hover:text-accent">
                    {l.titre}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      );
    case "historique":
      return (
        <SectionCard titre="Lectures récentes">
          {data.historique.length === 0 ? (
            <EtatVide
              icone={Clock}
              titre="Pas encore d'historique"
              description="Votre historique se remplira au fur et à mesure de vos lectures."
              action={<LienCatalogue />}
            />
          ) : (
            <ul className="divide-y divide-border text-sm">
              {data.historique.map((h) => (
                <li key={h.slug + h.date} className="flex items-center gap-3 py-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <Link to="/reader/$slug" params={{ slug: h.slug }} className="flex-1 hover:text-accent">
                    {h.titre}
                  </Link>
                  <span className="text-xs text-muted-foreground">{h.date}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      );
    case "telechargements":
      return (
        <SectionCard titre="Fichiers">
          {data.telechargements.length === 0 ? (
            <EtatVide
              icone={Download}
              titre="Aucun téléchargement"
              description="Les fichiers que vous téléchargez apparaîtront ici."
              action={<LienCatalogue />}
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {data.telechargements.map((t) => (
                <li
                  key={t.slug}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
                >
                  <Download className="size-4 text-muted-foreground" />
                  <span className="flex-1">{t.titre}</span>
                  <Link to="/reader/$slug" params={{ slug: t.slug }} className="text-xs text-accent hover:underline">
                    Lire en ligne
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      );
    case "marque-pages":
      return (
        <SectionCard titre="Vos marque-pages">
          {data.marquePages.length === 0 ? (
            <EtatVide
              icone={Bookmark}
              titre="Aucun marque-page"
              description="Placez des marque-pages pendant votre lecture pour les retrouver ici."
              action={<LienCatalogue />}
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {data.marquePages.map((m) => (
                <li
                  key={m.slug + m.page}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
                >
                  <Bookmark className="size-4 text-accent" />
                  <Link to="/reader/$slug" params={{ slug: m.slug }} className="flex-1 hover:text-accent">
                    {m.titre}
                  </Link>
                  <span className="text-xs text-muted-foreground">p. {m.page}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      );
    case "mes-achats":
      return (
        <SectionCard titre="Commandes">
          {data.commandes.length === 0 ? (
            <EtatVide
              icone={ShoppingBag}
              titre="Aucun achat"
              description="Vos commandes et paiements s'afficheront ici après un achat."
              action={<LienCatalogue />}
            />
          ) : (
            <ul className="divide-y divide-border text-sm">
              {data.commandes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.titre}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.reference || c.id} · {c.format} · {c.moyen}
                    </p>
                    {c.motif && (
                      <p className="mt-1 text-xs text-destructive">{c.motif}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                  <Statut valeur={c.statut} />
                  <span className="font-medium">{c.montant} $</span>
                  {c.slug && c.statut === "Payée" && (
                    <Link
                      to="/edition/$slug"
                      params={{ slug: c.slug }}
                      className="text-xs text-accent hover:underline"
                    >
                      Accéder au livre
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      );
  }
}
