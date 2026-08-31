import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { Statut } from "@/components/admin-ui";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/edition/paiements")({
  component: () => (
    <CrudModule
      titre="Paiements"
      singulier="Paiement"
      description="Transactions Mobile Money et carte bancaire."
      collection="paiements"
      requis={["admin"]}
      clesRecherche={["id", "commande"]}
      filtre={{ cle: "statut", label: "Statut", options: ["Payée", "En attente", "Échouée"] }}
      colonnes={[
        { cle: "id", label: "Transaction", classe: "text-muted-foreground" },
        { cle: "commande", label: "Commande" },
        { cle: "moyen", label: "Moyen", classe: "text-muted-foreground" },
        { cle: "montant", label: "Montant", rendu: (r) => `${Number(r["montant"]).toFixed(2)} $` },
        {
          cle: "date",
          label: "Date",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["date"])),
        },
        { cle: "statut", label: "Statut", rendu: (r) => <Statut valeur={String(r["statut"])} /> },
      ]}
      champs={[
        { nom: "commande", label: "Commande", requis: true, placeholder: "#10428" },
        {
          nom: "moyen",
          label: "Moyen",
          type: "select",
          options: ["Mobile Money", "Carte bancaire"],
        },
        { nom: "montant", label: "Montant ($)", type: "number" },
        {
          nom: "statut",
          label: "Statut",
          type: "select",
          options: ["Payée", "En attente", "Échouée"],
        },
        { nom: "date", label: "Date", type: "date" },
      ]}
    />
  ),
});
