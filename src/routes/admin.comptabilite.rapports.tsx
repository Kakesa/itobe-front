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
        <article className="rapport-feuille mx-auto mt-8 max-w-4xl overflow-hidden rounded-xl border border-border bg-white text-[#211c1c] shadow-sm print:mt-0 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
          <header className="bg-[#0f3d3e] px-8 py-6 text-[#d7efe8]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-2xl tracking-wide text-white">ITOBE</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em]">Comptabilité</p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl text-white">Rapport financier</p>
                <p className="mt-1 text-sm">{libelleCategorie}</p>
              </div>
            </div>
          </header>
          <div className="h-1 bg-[#d7efe8]" />
          <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-6">
            <p className="text-sm text-muted-foreground">
              Période du {rapport.debut} au {rapport.fin}
            </p>
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

          <div className="mt-6 grid gap-3 px-8 sm:grid-cols-3">
            <div className="rounded-lg bg-[#f7f6f4] px-4 py-3">
              <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">Ventes</p>
              <p className="mt-1 font-display text-2xl">{argent(rapport.totalVentes)}</p>
            </div>
            <div className="rounded-lg bg-[#f7f6f4] px-4 py-3">
              <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">Dépenses</p>
              <p className="mt-1 font-display text-2xl">{argent(rapport.totalDepenses)}</p>
            </div>
            <div className="rounded-lg bg-[#f7f6f4] px-4 py-3">
              <p className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">Total de la période</p>
              <p className="mt-1 font-display text-2xl">{argent(rapport.total)}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto px-8 pb-8">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="bg-[#0f3d3e] text-[0.7rem] uppercase tracking-wide text-[#d7efe8]">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Référence</th>
                  <th className="px-3 py-2 font-medium">Libellé</th>
                  <th className="px-3 py-2 font-medium">Catégorie</th>
                  <th className="px-3 py-2 text-right font-medium">Montant</th>
                </tr>
              </thead>
              <tbody>
                {rapport.lignes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                      {rapport.categorie === "depense"
                        ? "Aucune dépense enregistrée sur cette période."
                        : "Aucun mouvement sur cette période."}
                    </td>
                  </tr>
                ) : (
                  rapport.lignes.map((ligne, index) => (
                    <tr key={`${ligne.reference}-${ligne.date}`} className={index % 2 === 1 ? "bg-[#f7f6f4]" : ""}>
                      <td className="px-3 py-2">{ligne.date}</td>
                      <td className="px-3 py-2 text-muted-foreground">{ligne.reference}</td>
                      <td className="px-3 py-2">{ligne.libelle}</td>
                      <td className="px-3 py-2 capitalize text-muted-foreground">{ligne.categorie}</td>
                      <td className="px-3 py-2 text-right">{argent(ligne.montant)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="flex items-center justify-between border-t border-border px-8 py-4 text-xs text-muted-foreground">
            <span>Document généré le {new Date().toLocaleDateString("fr-FR")}</span>
            <span>Page 1</span>
          </footer>
        </article>
      ) : null}
    </div>
  );
}
