import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ApiError, ComptabiliteApi } from "@/lib/api-client";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/admin/comptabilite/rapports")({
  component: RapportsComptabilite,
});

const CATEGORIES = [
  { id: "toutes", label: "Toutes" },
  { id: "vente", label: "Ventes" },
  { id: "paiement", label: "Paiements" },
  { id: "depense", label: "Dépenses" },
];

type LigneRapport = {
  date: string;
  reference: string;
  libelle: string;
  categorie: string;
  montant: number;
};

type Rapport = {
  debut: string;
  fin: string;
  categorie: string;
  lignes: LigneRapport[];
  totalVentes: number;
  totalPaiements: number;
  totalDepenses: number;
  total: number;
};

function argent(montant: number) {
  return `${Number(montant).toFixed(2)} $`;
}

function dateDuJour() {
  return new Date().toISOString().slice(0, 10);
}

function debutDuMois() {
  const maintenant = new Date();
  return new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).toISOString().slice(0, 10);
}

function RapportsComptabilite() {
  const [debut, setDebut] = useState(debutDuMois);
  const [fin, setFin] = useState(dateDuJour);
  const [categorie, setCategorie] = useState("toutes");
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [chargement, setChargement] = useState(false);

  const creer = async () => {
    setChargement(true);
    try {
      const reponse = await ComptabiliteApi.rapport({ debut, fin, categorie });
      setRapport(reponse.data);
    } catch (err) {
      notify.erreur(err instanceof ApiError ? err.message : "Le rapport n'a pas pu être créé.");
    } finally {
      setChargement(false);
    }
  };

  const libelleCategorie = CATEGORIES.find((item) => item.id === rapport?.categorie)?.label ?? "Toutes";

  return (
    <div>
      <div className="print:hidden">
        <p className="text-[0.7rem] font-semibold uppercase tracking-brand text-muted-foreground">
          Comptabilité
        </p>
        <h1 className="mt-2 font-display text-3xl">Rapports</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Choisissez une période et une catégorie, puis enregistrez le rapport en PDF.
        </p>
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Du
            <input
              type="date"
              value={debut}
              onChange={(e) => setDebut(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-1.5"
            />
          </label>
          <label className="text-sm">
            Au
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-1.5"
            />
          </label>
          <label className="text-sm">
            Catégorie
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-1.5"
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void creer()}
            disabled={chargement}
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-60"
          >
            {chargement ? "Création…" : "Créer le rapport"}
          </button>
        </div>
      </div>

      {rapport ? (
        <article className="rapport-feuille mt-8 rounded-xl border border-border bg-card p-6 print:mt-0 print:border-0 print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">ITOBE · Comptabilité</p>
              <h2 className="mt-1 font-display text-2xl">Rapport {libelleCategorie.toLowerCase()}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Du {rapport.debut} au {rapport.fin}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                type="button"
                onClick={() =>
                  void ComptabiliteApi.telechargerRapport({
                    debut: rapport.debut,
                    fin: rapport.fin,
                    categorie: rapport.categorie,
                  }).catch((err) =>
                    notify.erreur(err instanceof ApiError ? err.message : "Le PDF n'a pas pu être téléchargé."),
                  )
                }
                className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
              >
                Télécharger le PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Imprimer
              </button>
            </div>
          </div>

          <p className="mt-6 font-display text-3xl">{argent(rapport.total)}</p>
          <p className="text-sm text-muted-foreground">
            {rapport.categorie === "depense"
              ? "Total des dépenses sur la période"
              : rapport.categorie === "paiement"
                ? "Total des paiements encaissés"
                : "Total des ventes, moins les dépenses"}
          </p>

          {rapport.categorie === "toutes" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Ventes {argent(rapport.totalVentes)} · Dépenses {argent(rapport.totalDepenses)}
            </p>
          ) : null}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Référence</th>
                  <th className="py-2 pr-3 font-medium">Libellé</th>
                  <th className="py-2 pr-3 font-medium">Catégorie</th>
                  <th className="py-2 font-medium">Montant</th>
                </tr>
              </thead>
              <tbody>
                {rapport.lignes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-muted-foreground">
                      {rapport.categorie === "depense"
                        ? "Aucune dépense enregistrée sur cette période."
                        : "Aucun mouvement sur cette période."}
                    </td>
                  </tr>
                ) : (
                  rapport.lignes.map((ligne) => (
                    <tr key={`${ligne.reference}-${ligne.date}`} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3">{ligne.date}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{ligne.reference}</td>
                      <td className="py-2 pr-3">{ligne.libelle}</td>
                      <td className="py-2 pr-3 capitalize">{ligne.categorie}</td>
                      <td className="py-2">{argent(ligne.montant)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}
    </div>
  );
}
