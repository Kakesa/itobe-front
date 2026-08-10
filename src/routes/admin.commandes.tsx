import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { Statut } from "@/components/admin-ui";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/commandes")({
  component: () => (
    <CrudModule
      titre="Commandes"
      singulier="Commande"
      description="Suivi des achats : statut, moyen de paiement et montant."
      collection="commandes"
      requis={["admin"]}
      clesRecherche={["client", "livre", "id"]}
      filtre={{
        cle: "statut",
        label: "Statut",
        options: ["Payée", "En attente", "Échouée", "Remboursée"],
      }}
      colonnes={[
        { cle: "id", label: "Référence", classe: "text-muted-foreground" },
        { cle: "client", label: "Client" },
        { cle: "livre", label: "Ouvrage", classe: "text-muted-foreground" },
        { cle: "moyen", label: "Paiement", classe: "text-muted-foreground" },
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
        { nom: "client", label: "Client", requis: true },
        { nom: "livre", label: "Ouvrage", requis: true },
        {
          nom: "moyen",
          label: "Moyen de paiement",
          type: "select",
          options: ["Mobile Money", "Carte bancaire"],
        },
        { nom: "montant", label: "Montant ($)", type: "number" },
        {
          nom: "statut",
          label: "Statut",
          type: "select",
          options: ["Payée", "En attente", "Échouée", "Remboursée"],
        },
        { nom: "date", label: "Date", type: "date" },
      ]}
    />
  ),
});
