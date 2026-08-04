import { createFileRoute } from "@tanstack/react-router";
import { livres, articles, serieMensuelle, statsDashboard, nomAuteur } from "@/lib/data";

export const Route = createFileRoute("/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Administration Itobe" },
      {
        name: "description",
        content:
          "Suivi des articles, livres, ventes, revenus, lectures en ligne, téléchargements et croissance des utilisateurs.",
      },
      { property: "og:title", content: "Tableau de bord — Administration Itobe" },
      { property: "og:description", content: "Statistiques éditoriales et commerciales." },
      { property: "og:url", content: "/tableau-de-bord" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/tableau-de-bord" }],
  }),
  component: Dashboard,
});

function Bars({
  data,
  cle,
  couleur,
  titre,
}: {
  data: typeof serieMensuelle;
  cle: "revenus" | "ventes" | "lectures" | "telechargements";
  couleur: string;
  titre: string;
}) {
  const max = Math.max(...data.map((d) => d[cle]));
  return (
    <div className="rounded-sm border border-border bg-card p-5">
      <p className="kicker">{titre}</p>
      <div className="mt-6 flex h-40 items-end gap-2">
        {data.map((d) => (
          <div key={d.mois} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-sm"
              style={{ height: `${(d[cle] / max) * 100}%`, backgroundColor: couleur }}
              title={`${d.mois} : ${d[cle]}`}
            />
            <span className="text-[0.65rem] text-muted-foreground">{d.mois}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const meilleursLivres = [...livres].slice(0, 5);
  const meilleursArticles = articles.filter((a) => a.populaire);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="kicker">Administration</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Tableau de bord</h1>
      <p className="mt-4 text-muted-foreground">Vue d'ensemble — juillet 2026</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsDashboard.map((s) => (
          <div key={s.label} className="rounded-sm border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.valeur}</p>
            <p className="mt-1 text-xs text-accent">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Bars data={serieMensuelle} cle="revenus" couleur="var(--accent)" titre="Revenus" />
        <Bars data={serieMensuelle} cle="ventes" couleur="var(--ochre)" titre="Ventes" />
        <Bars data={serieMensuelle} cle="lectures" couleur="var(--terracotta)" titre="Lectures en ligne" />
        <Bars
          data={serieMensuelle}
          cle="telechargements"
          couleur="var(--chart-3)"
          titre="Téléchargements"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-border bg-card p-5">
          <p className="kicker">Livres les plus vendus</p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2 font-normal">Titre</th>
                <th className="pb-2 font-normal">Auteur</th>
                <th className="pb-2 text-right font-normal">Ventes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {meilleursLivres.map((l, i) => (
                <tr key={l.slug}>
                  <td className="py-2 pr-3">{l.titre}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{nomAuteur(l.auteur)}</td>
                  <td className="py-2 text-right">{420 - i * 63}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-sm border border-border bg-card p-5">
          <p className="kicker">Articles les plus consultés</p>
          <ul className="mt-4 divide-y divide-border text-sm">
            {meilleursArticles.map((a, i) => (
              <li key={a.slug} className="flex justify-between gap-4 py-2">
                <span className="truncate">{a.titre}</span>
                <span className="shrink-0 text-muted-foreground">
                  {(9800 - i * 1750).toLocaleString("fr-FR")} vues
                </span>
              </li>
            ))}
          </ul>

          <p className="kicker mt-8">Commandes récentes</p>
          <ul className="mt-4 divide-y divide-border text-sm">
            {[
              ["#10428", "Le Fleuve et la Page", "Mobile Money", "12,00 $"],
              ["#10427", "Grammaire du courage", "Carte bancaire", "12,00 $"],
              ["#10426", "Histoire des presses africaines", "Mobile Money", "21,00 $"],
            ].map(([id, titre, moyen, montant]) => (
              <li key={id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-muted-foreground">{id}</span>
                <span className="flex-1 truncate">{titre}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{moyen}</span>
                <span>{montant}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
