import { createFileRoute } from "@tanstack/react-router";
import { ChiffresArgent } from "@/components/comptabilite/chiffres-argent";

export const Route = createFileRoute("/admin/comptabilite/caisse")({
  component: CaisseComptabilite,
});

function CaisseComptabilite() {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-brand text-muted-foreground">
        Comptabilité
      </p>
      <h1 className="mt-2 font-display text-3xl">Trésorerie</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Le solde correspond aux ventes de livres déjà payées. Les commandes en attente ne sont pas encore en trésorerie.
      </p>
      <div className="mt-8">
        <ChiffresArgent />
      </div>
    </div>
  );
}
