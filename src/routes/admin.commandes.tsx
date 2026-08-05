import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { commandes } from "@/lib/admin-data";
import { formatDate } from "@/lib/data";
import { AccesRestreint, BarreOutils, Statut, Tableau } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/commandes")({
  component: AdminCommandes,
});

const statuts = ["Toutes", "Payée", "En attente", "Remboursée"] as const;

function AdminCommandes() {
  const { role } = useRole();
  const [statut, setStatut] = useState<(typeof statuts)[number]>("Toutes");

  if (role !== "admin" && role !== "vendeur") {
    return <AccesRestreint requis={["admin", "vendeur"]} />;
  }

  const liste = commandes.filter((c) => statut === "Toutes" || c.statut === statut);
  const total = liste
    .filter((c) => c.statut === "Payée")
    .reduce((s, c) => s + c.montant, 0);

  return (
    <div>
      <BarreOutils titre="Commandes" action="Exporter CSV">
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value as (typeof statuts)[number])}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm"
        >
          {statuts.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </BarreOutils>

      <p className="mt-3 text-sm text-muted-foreground">
        {liste.length} commande(s) — {total.toFixed(2)} $ encaissés
      </p>

      <Tableau entetes={["Référence", "Client", "Ouvrage", "Paiement", "Montant", "Date", "Statut", ""]}>
        {liste.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 text-muted-foreground">{c.id}</td>
            <td className="px-4 py-3">{c.client}</td>
            <td className="px-4 py-3 text-muted-foreground">{c.livre}</td>
            <td className="px-4 py-3 text-muted-foreground">{c.moyen}</td>
            <td className="px-4 py-3">{c.montant.toFixed(2)} $</td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(c.date)}</td>
            <td className="px-4 py-3">
              <Statut valeur={c.statut} />
            </td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-3 text-xs">
                <button type="button" className="text-accent hover:underline">
                  Détail
                </button>
                <button type="button" className="text-destructive hover:underline">
                  Rembourser
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Tableau>
    </div>
  );
}
