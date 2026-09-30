import { createFileRoute } from "@tanstack/react-router";
import { ChiffresArgent } from "@/components/comptabilite/chiffres-argent";

export const Route = createFileRoute("/admin/comptabilite/")({
  component: TableauComptabilite,
});

function TableauComptabilite() {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-brand text-muted-foreground">
        Comptabilité
      </p>
      <h1 className="mt-2 font-display text-3xl">Tableau de bord</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Livres vendus et argent encaissé. Le solde de trésorerie reprend les commandes payées.
      </p>
      <div className="mt-8">
        <ChiffresArgent />
      </div>
    </div>
  );
}
