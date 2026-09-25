import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Statut } from "@/components/admin-ui";
import { ApiError, ComptabiliteApi } from "@/lib/api-client";

export const Route = createFileRoute("/admin/comptabilite/paiements")({
  component: PaiementsComptabilite,
});

function commandeDe(paiement: {
  commande?: { reference?: string; livreTitre?: string; clientNom?: string } | string;
}) {
  const commande = paiement.commande;
  if (!commande || typeof commande === "string") return "—";
  return [commande.reference, commande.livreTitre].filter(Boolean).join(" · ") || "—";
}

function PaiementsComptabilite() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["comptabilite", "paiements"],
    queryFn: () => ComptabiliteApi.paiements({ page: 1, limit: 200 }),
  });
  const paiements = data?.data ?? [];

  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-brand text-muted-foreground">
        Comptabilité
      </p>
      <h1 className="mt-2 font-display text-3xl">Paiements</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Encaissements des ventes de livres : Mobile Money et carte bancaire.
      </p>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement des paiements…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-destructive">
          {error instanceof ApiError ? error.message : "Les paiements n'ont pas pu être chargés."}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Transaction</th>
                <th className="px-4 py-3 font-medium">Commande</th>
                <th className="px-4 py-3 font-medium">Moyen</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {paiements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun paiement enregistré.
                  </td>
                </tr>
              ) : (
                paiements.map((paiement) => (
                  <tr key={paiement._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{paiement.reference}</td>
                    <td className="px-4 py-3">{commandeDe(paiement)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{paiement.moyen}</td>
                    <td className="px-4 py-3">{Number(paiement.montant).toFixed(2)} $</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {paiement.date
                        ? new Date(paiement.date).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Statut valeur={paiement.statut} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
