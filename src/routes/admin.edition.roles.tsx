import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AccesRestreint } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";
import { ApiError, UsersApi } from "@/lib/api-client";
import type { Role } from "@/lib/admin-data";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/admin/edition/roles")({
  component: RolesEdition,
});

const ROLES: Role[] = ["admin", "editeur", "comptable", "lecteur"];

const ACCES = [
  { espace: "Admin Média", admin: "Complet", editeur: "—", comptable: "—", lecteur: "—" },
  { espace: "Admin Édition — catalogue", admin: "Complet", editeur: "Complet", comptable: "—", lecteur: "—" },
  { espace: "Admin Édition — ventes", admin: "Complet", editeur: "—", comptable: "—", lecteur: "—" },
  { espace: "Comptabilité", admin: "Complet", editeur: "—", comptable: "Opérations", lecteur: "—" },
  { espace: "Espace lecteur", admin: "—", editeur: "—", comptable: "—", lecteur: "Complet" },
  { espace: "Utilisateurs et rôles", admin: "Complet", editeur: "—", comptable: "—", lecteur: "—" },
  { espace: "Suppression des documents comptables", admin: "Interdit", editeur: "Interdit", comptable: "Interdit", lecteur: "Interdit" },
] as const;

type Compte = { id: string; nom: string; email: string; role: Role };

function RolesEdition() {
  const { role } = useRole();
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    UsersApi.fetchAll()
      .then((users) => {
        setComptes(
          users.map((user: Record<string, unknown>) => ({
            id: String(user["_id"] ?? ""),
            nom: `${String(user["prenom"] ?? "")} ${String(user["nom"] ?? "")}`.trim(),
            email: String(user["email"] ?? ""),
            role: (String(user["role"] ?? "lecteur") as Role),
          })),
        );
      })
      .catch((err) => {
        notify.erreur(
          err instanceof ApiError && err.statusCode === 401
            ? "Reconnectez-vous pour gérer les rôles."
            : "Impossible de charger les comptes.",
        );
      })
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    if (role === "admin") charger();
  }, [role]);

  if (role !== "admin") return <AccesRestreint requis={["admin"]} />;

  const changerRole = async (compte: Compte, prochain: Role) => {
    const precedent = compte.role;
    setComptes((liste) => liste.map((c) => (c.id === compte.id ? { ...c, role: prochain } : c)));
    try {
      await UsersApi.update(compte.id, { role: prochain });
      notify.succes(`Accès de ${compte.nom || compte.email} : ${prochain}.`);
    } catch (err) {
      setComptes((liste) => liste.map((c) => (c.id === compte.id ? { ...c, role: precedent } : c)));
      notify.erreur(err instanceof ApiError ? err.message : "Le rôle n'a pas été enregistré.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Rôles et permissions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          L&apos;accès se donne en changeant le rôle du compte. Le serveur refuse toute action hors de ce rôle.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Espace</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Éditeur</th>
              <th className="px-4 py-3 font-medium">Comptable</th>
              <th className="px-4 py-3 font-medium">Lecteur</th>
            </tr>
          </thead>
          <tbody>
            {ACCES.map((ligne) => (
              <tr key={ligne.espace} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{ligne.espace}</td>
                <td className="px-4 py-3 text-muted-foreground">{ligne.admin}</td>
                <td className="px-4 py-3 text-muted-foreground">{ligne.editeur}</td>
                <td className="px-4 py-3 text-muted-foreground">{ligne.comptable}</td>
                <td className="px-4 py-3 text-muted-foreground">{ligne.lecteur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="text-xl">Donner un accès</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisissez Comptable pour ouvrir la comptabilité. Le compte par défaut est comptable@itobe.cd.
        </p>
        {chargement ? (
          <p className="mt-4 text-sm text-muted-foreground">Chargement des comptes…</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {comptes.map((compte) => (
              <li key={compte.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{compte.nom || compte.email}</p>
                  <p className="text-xs text-muted-foreground">{compte.email}</p>
                </div>
                <select
                  aria-label={`Rôle de ${compte.email}`}
                  value={compte.role}
                  onChange={(e) => void changerRole(compte, e.target.value as Role)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  {ROLES.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
