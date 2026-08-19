import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, RefreshCw, Search } from "lucide-react";
import { AccesRestreint, Statut } from "@/components/admin-ui";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import { useRole } from "@/hooks/use-role";
import { CommandesApi, getToken } from "@/lib/api-client";
import { formatDate } from "@/lib/data";
import { notify } from "@/lib/notify";

type CommandeAdmin = {
  id: string;
  reference: string;
  client: string;
  livre: string;
  moyen: string;
  montant: number;
  statut: string;
  date: string;
  motif?: string;
};

const STATUTS = ["Payée", "En attente", "Échouée", "Remboursée"] as const;
const MOYENS = ["Mobile Money", "Carte bancaire"] as const;

function mapperCommandeAdmin(c: {
  _id?: string;
  reference?: string;
  clientNom?: string;
  user?: { nom?: string; prenom?: string; email?: string };
  livreTitre?: string;
  livre?: { titre?: string };
  moyen?: string;
  montant?: number;
  statut?: string;
  date?: string;
  motif?: string;
}): CommandeAdmin {
  const user = c.user;
  const client =
    c.clientNom?.trim() ||
    [user?.prenom, user?.nom].filter(Boolean).join(" ").trim() ||
    user?.email ||
    "—";
  return {
    id: String(c._id ?? ""),
    reference: String(c.reference ?? ""),
    client,
    livre: String(c.livreTitre ?? c.livre?.titre ?? "—"),
    moyen: String(c.moyen ?? "—"),
    montant: Number(c.montant ?? 0),
    statut: String(c.statut ?? "En attente"),
    date: c.date ? new Date(String(c.date)).toISOString().slice(0, 10) : "",
    ...(c.motif ? { motif: c.motif } : {}),
  };
}

export function CommandesAdminPanel() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [statut, setStatut] = useState("Tous");
  const [moyen, setMoyen] = useState("Tous");
  const [page, setPage] = useState(1);
  const [edition, setEdition] = useState<CommandeAdmin | null>(null);
  const [nouveauStatut, setNouveauStatut] = useState("");
  const [motif, setMotif] = useState("");

  const apiDisponible = typeof window !== "undefined" && Boolean(getToken());

  const requete = useQuery({
    queryKey: ["admin-commandes", page, statut, moyen, q],
    queryFn: async () => {
      const res = await CommandesApi.getAll({
        page,
        limit: 20,
        statut: statut !== "Tous" ? statut : undefined,
        moyen: moyen !== "Tous" ? moyen : undefined,
        q: q.trim() || undefined,
      });
      const raw = Array.isArray(res?.data) ? res.data : [];
      const pagination = res?.pagination ?? {};
      return {
        commandes: (raw as Parameters<typeof mapperCommandeAdmin>[0][]).map(mapperCommandeAdmin),
        pagination,
      };
    },
    enabled: apiDisponible && role === "admin",
  });

  const mutation = useMutation({
    mutationFn: async ({
      id,
      statut: s,
      motif: m,
    }: {
      id: string;
      statut: string;
      motif?: string;
    }) => {
      const payload: { statut: string; motif?: string } = { statut: s };
      if (m?.trim()) payload.motif = m.trim();
      return CommandesApi.updateStatus(id, payload);
    },
    onSuccess: () => {
      notify.modifie("Commande", edition?.reference ?? "");
      void queryClient.invalidateQueries({ queryKey: ["admin-commandes"] });
      setEdition(null);
    },
    onError: (err: Error) => notify.erreur(err.message),
  });

  const liste = requete.data?.commandes ?? [];
  const pagination = requete.data?.pagination ?? {};

  const stats = useMemo(() => {
    const payees = liste.filter((c) => c.statut === "Payée");
    return {
      total: pagination.total ?? liste.length,
      montantPage: payees.reduce((s, c) => s + c.montant, 0),
      enAttente: liste.filter((c) => c.statut === "En attente").length,
    };
  }, [liste, pagination.total]);

  if (role !== "admin") return <AccesRestreint requis={["admin"]} />;

  if (!apiDisponible) {
    return (
      <div>
        <h2 className="text-2xl">Commandes</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Connectez-vous via l&apos;API (compte admin avec JWT) pour afficher les commandes MongoDB.
          Les comptes demo locaux n&apos;ont pas accès à cette vue.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-2xl">Commandes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivi des achats depuis MongoDB — statut, moyen de paiement et montant.
          </p>
        </div>

        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher…"
            className="rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm"
          />
        </div>

        <select
          value={statut}
          onChange={(e) => {
            setStatut(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {["Tous", ...STATUTS].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={moyen}
          onChange={(e) => {
            setMoyen(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {["Tous", ...MOYENS].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => void requete.refetch()}
          className="grid size-9 place-items-center rounded-lg border border-border"
          aria-label="Actualiser"
        >
          <RefreshCw className={`size-4 ${requete.isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total (filtre)</p>
          <p className="mt-1 font-display text-2xl">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Payées (page)</p>
          <p className="mt-1 font-display text-2xl">{stats.montantPage.toFixed(2)} $</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">En attente (page)</p>
          <p className="mt-1 font-display text-2xl">{stats.enAttente}</p>
        </div>
      </div>

      {requete.isLoading && (
        <p className="mt-6 text-sm text-muted-foreground">Chargement des commandes…</p>
      )}

      {requete.isError && (
        <p className="mt-6 text-sm text-destructive">
          {(requete.error as Error)?.message ?? "Erreur de chargement."}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-normal">Référence</th>
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Ouvrage</th>
              <th className="px-4 py-3 font-normal">Paiement</th>
              <th className="px-4 py-3 font-normal">Montant</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {liste.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-muted-foreground">{c.reference}</td>
                <td className="px-4 py-3">{c.client}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.livre}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.moyen}</td>
                <td className="px-4 py-3">{c.montant.toFixed(2)} $</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.date ? formatDate(c.date) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Statut valeur={c.statut} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActionsMenu
                      actions={[
                        {
                          label: "Modifier le statut",
                          icon: Pencil,
                          onClick: () => {
                            setEdition(c);
                            setNouveauStatut(c.statut);
                            setMotif(c.motif ?? "");
                          },
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {liste.length === 0 && !requete.isLoading && (
        <p className="mt-6 text-sm text-muted-foreground">Aucune commande trouvée.</p>
      )}

      {(pagination.totalPages ?? 1) > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-muted-foreground">
            Page {page} / {pagination.totalPages ?? 1}
          </span>
          <button
            type="button"
            disabled={page >= (pagination.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      {edition && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0"
            onClick={() => setEdition(null)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void mutation.mutateAsync({
                id: edition.id,
                statut: nouveauStatut,
                motif,
              });
            }}
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h3 className="font-display text-xl">Statut — {edition.reference}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {edition.livre} · {edition.client}
            </p>
            <div className="mt-5 grid gap-4">
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Statut</span>
                <select
                  value={nouveauStatut}
                  onChange={(e) => setNouveauStatut(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {STATUTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Motif (optionnel)</span>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEdition(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
