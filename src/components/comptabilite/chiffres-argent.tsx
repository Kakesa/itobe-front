import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Wallet } from "lucide-react";
import { KpiCard } from "@/components/dashboard/ui";
import { ApiError, ComptabiliteApi } from "@/lib/api-client";

function argent(montant: number) {
  return `${montant.toFixed(2)} $`;
}

export function ChiffresArgent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["comptabilite", "synthese"],
    queryFn: () => ComptabiliteApi.synthese(),
  });
  const chiffres = data?.data;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des chiffres…</p>;
  }
  if (error || !chiffres) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof ApiError ? error.message : "Les chiffres d'argent n'ont pas pu être chargés."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <KpiCard
        label="Livres vendus"
        valeur={chiffres.livresVendus}
        hint="Commandes payées"
        icon={BookOpen}
      />
      <KpiCard
        label="Solde de trésorerie"
        valeur={argent(chiffres.soldeCaisse)}
        hint={chiffres.rembourse > 0 ? `Remboursé : ${argent(chiffres.rembourse)}` : "Encaissements payés"}
        icon={Wallet}
      />
      <KpiCard
        label="En attente"
        valeur={argent(chiffres.enAttente)}
        hint={`${chiffres.commandesEnAttente} commande${chiffres.commandesEnAttente > 1 ? "s" : ""} non encaissée${chiffres.commandesEnAttente > 1 ? "s" : ""}`}
        icon={Clock}
      />
    </div>
  );
}
