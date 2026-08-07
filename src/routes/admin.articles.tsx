import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { articles, formatDate, nomAuteur, categoriesMedia } from "@/lib/data";
import { AccesRestreint, BarreOutils, Tableau } from "@/components/admin-ui";
import { etatsModeration, transitions, type EtatModeration } from "@/lib/admin-data";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/articles")({
  component: AdminArticles,
});

const TON: Record<EtatModeration, string> = {
  Brouillon: "bg-secondary text-muted-foreground",
  "En revue": "bg-ochre/20 text-ochre-foreground",
  Publié: "bg-accent/15 text-accent",
  Rejeté: "bg-destructive/10 text-destructive",
};

function etatInitial(i: number, populaire: boolean): EtatModeration {
  if (populaire) return "Publié";
  return (["Brouillon", "En revue", "Rejeté", "En revue"] as EtatModeration[])[i % 4];
}

function AdminArticles() {
  const { role } = useRole();
  const [filtre, setFiltre] = useState("Toutes");
  const [etatFiltre, setEtatFiltre] = useState<"Tous" | EtatModeration>("Tous");
  const [q, setQ] = useState("");
  const [etats, setEtats] = useState<Record<string, EtatModeration>>(() =>
    Object.fromEntries(articles.map((a, i) => [a.slug, etatInitial(i, a.populaire)])),
  );
  const [journal, setJournal] = useState<string[]>([]);
  const [rejet, setRejet] = useState<{ slug: string; titre: string } | null>(null);
  const [motif, setMotif] = useState("");

  const compteurs = useMemo(
    () =>
      etatsModeration.map((e) => ({
        etat: e,
        n: Object.values(etats).filter((v) => v === e).length,
      })),
    [etats],
  );

  if (role !== "admin" && role !== "editeur") {
    return <AccesRestreint requis={["admin", "editeur"]} />;
  }

  const appliquer = (slug: string, titre: string, cible: EtatModeration, note?: string) => {
    setEtats((prev) => ({ ...prev, [slug]: cible }));
    setJournal((j) =>
      [`${titre} → ${cible}${note ? ` — ${note}` : ""} (${role})`, ...j].slice(0, 6),
    );
  };

  const liste = articles.filter((a) => {
    const etat = etats[a.slug]!;
    return (
      (filtre === "Toutes" || a.categorie === filtre) &&
      (etatFiltre === "Tous" || etat === etatFiltre) &&
      a.titre.toLowerCase().includes(q.toLowerCase())
    );
  });

  return (
    <div>
      <BarreOutils titre="Articles" action="Nouvel article">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un titre…"
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm"
        />
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm"
        >
          {["Toutes", ...categoriesMedia].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </BarreOutils>

      <p className="mt-4 text-sm text-muted-foreground">
        Workflow éditorial :{" "}
        {role === "admin"
          ? "vous pouvez publier, rejeter ou renvoyer en brouillon."
          : "vous pouvez soumettre vos brouillons en revue ; la publication revient à l'administrateur."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["Tous", ...etatsModeration] as const).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEtatFiltre(e)}
            className={`rounded-full px-3 py-1 text-xs ${
              etatFiltre === e
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {e}
            {e !== "Tous" && ` · ${compteurs.find((c) => c.etat === e)?.n ?? 0}`}
          </button>
        ))}
      </div>

      <Tableau entetes={["Titre", "Catégorie", "Auteur", "Date", "État", "Transitions"]}>
        {liste.map((a) => {
          const etat = etats[a.slug]!;
          const cibles = transitions[role][etat] ?? [];
          return (
            <tr key={a.slug}>
              <td className="px-4 py-3">{a.titre}</td>
              <td className="px-4 py-3 text-muted-foreground">{a.categorie}</td>
              <td className="px-4 py-3 text-muted-foreground">{nomAuteur(a.auteur)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(a.date)}</td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${TON[etat]}`}>
                  {etat}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap justify-end gap-2 text-xs">
                  {cibles.length === 0 && (
                    <span className="text-muted-foreground">Aucune action disponible</span>
                  )}
                  {cibles.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        c === "Rejeté"
                          ? (setRejet({ slug: a.slug, titre: a.titre }), setMotif(""))
                          : appliquer(a.slug, a.titre, c)
                      }
                      className={`rounded-full border px-2.5 py-1 ${
                        c === "Rejeté"
                          ? "border-destructive/40 text-destructive"
                          : "border-border text-foreground hover:bg-secondary"
                      }`}
                    >
                      {c === "En revue"
                        ? "Soumettre en revue"
                        : c === "Publié"
                          ? "Publier"
                          : c === "Rejeté"
                            ? "Rejeter"
                            : "Repasser en brouillon"}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          );
        })}
      </Tableau>
      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun article ne correspond.</p>
      )}

      {journal.length > 0 && (
        <section className="mt-8 rounded-sm border border-border bg-card p-5">
          <p className="kicker">Journal de modération</p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {journal.map((l, i) => (
              <li key={`${l}-${i}`}>— {l}</li>
            ))}
          </ul>
        </section>
      )}

      {rejet && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Motif de rejet"
            className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-book"
          >
            <h3 className="font-display text-xl">Rejeter « {rejet.titre} »</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Le motif est renvoyé à l'auteur, qui pourra corriger et resoumettre.
            </p>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={4}
              aria-label="Motif de rejet"
              placeholder="Sources insuffisantes, ton à revoir…"
              className="mt-4 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejet(null)}
                className="rounded-sm border border-border px-4 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={motif.trim().length < 4}
                onClick={() => {
                  appliquer(rejet.slug, rejet.titre, "Rejeté", motif.trim());
                  setRejet(null);
                }}
                className="rounded-sm bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-40"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
