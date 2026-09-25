import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ApiError, ComptabiliteApi } from "@/lib/api-client";

export const Route = createFileRoute("/admin/comptabilite/clients")({
  component: ClientsComptabilite,
});

function argent(montant: number) {
  return `${Number(montant).toFixed(2)} $`;
}

function ClientsComptabilite() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["comptabilite", "clients"],
    queryFn: () => ComptabiliteApi.clients(),
  });
  const clients = data?.data ?? [];

  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-brand text-muted-foreground">
        Comptabilité
      </p>
      <h1 className="mt-2 font-display text-3xl">Clients</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Chaque acheteur de livres, avec le nombre de livres payés et les montants.
      </p>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Chargement des clients…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-destructive">
          {error instanceof ApiError ? error.message : "Les clients n'ont pas pu être chargés."}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Livres vendus</th>
                <th className="px-4 py-3 font-medium">Payé</th>
                <th className="px-4 py-3 font-medium">En attente</th>
                <th className="px-4 py-3 font-medium">Commandes</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun client pour le moment.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p>{client.nom}</p>
                      {client.email ? (
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{client.livresVendus}</td>
                    <td className="px-4 py-3">{argent(client.paye)}</td>
                    <td className="px-4 py-3">{argent(client.enAttente)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{client.commandes}</td>
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
