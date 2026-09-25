import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { AccesRestreint } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";
import { ApiError, UsersApi } from "@/lib/api-client";
import type { Role } from "@/lib/admin-data";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/admin/edition/roles")({
  component: RolesEdition,
});

const LIBELLES_ROLES: Record<Role, string> = {
  admin: "Admin",
  editeur: "Éditeur",
  comptable: "Comptable",
  lecteur: "Lecteur",
};

type Compte = { id: string; nom: string; email: string; role: Role };
type Action = "creer" | "lire" | "modifier" | "supprimer";
type LigneModule = {
  espace: string;
  module: string;
  actions: Record<Action, Record<Role, boolean | null>>;
};

const ACTIONS: { id: Action; label: string }[] = [
  { id: "creer", label: "Créer" },
  { id: "lire", label: "Lire" },
  { id: "modifier", label: "Modifier" },
  { id: "supprimer", label: "Supprimer" },
];

function RolesEdition() {
  const { role, pret } = useRole();
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [modules, setModules] = useState<LigneModule[]>([]);
  const [roles, setRoles] = useState<Role[]>(["admin", "editeur", "comptable", "lecteur"]);
  const [roleVu, setRoleVu] = useState<Role>("editeur");
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    Promise.all([UsersApi.fetchAll(), UsersApi.getPermissions()])
      .then(([users, acces]) => {
        const data = acces?.data ?? acces;
        const prochains = (data?.roles as Role[]) ?? roles;
        setRoles(prochains);
        setModules((data?.modules as LigneModule[]) ?? []);
        setRoleVu((actuel) => (prochains.includes(actuel) ? actuel : prochains[0] ?? "editeur"));
        setComptes(
          users.map((user: Record<string, unknown>) => ({
            id: String(user["_id"] ?? ""),
            nom: `${String(user["prenom"] ?? "")} ${String(user["nom"] ?? "")}`.trim(),
            email: String(user["email"] ?? ""),
            role: String(user["role"] ?? "lecteur") as Role,
          })),
        );
      })
      .catch((err) => {
        notify.erreur(
          err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)
            ? "Reconnectez-vous avec le compte administrateur pour gérer les rôles."
            : "Impossible de charger les rôles et les comptes.",
        );
      })
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    if (!pret) return;
    if (role === "admin" || role === "editeur") charger();
    else setChargement(false);
  }, [role, pret]);

  if (!pret) return null;
  if (role !== "admin" && role !== "editeur") return <AccesRestreint requis={["admin", "editeur"]} />;

  const changerDroit = async (ligne: LigneModule, action: Action, autorise: boolean) => {
    if (roleVu === "admin") return;
    const precedent = ligne.actions[action]?.[roleVu];
    setModules((liste) =>
      liste.map((item) =>
        item.espace === ligne.espace && item.module === ligne.module
          ? { ...item, actions: { ...item.actions, [action]: { ...item.actions[action], [roleVu]: autorise } } }
          : item,
      ),
    );
    try {
      await UsersApi.updatePermission({
        espace: ligne.espace,
        module: ligne.module,
        action,
        role: roleVu,
        autorise,
      });
    } catch (err) {
      setModules((liste) =>
        liste.map((item) =>
          item.espace === ligne.espace && item.module === ligne.module
            ? { ...item, actions: { ...item.actions, [action]: { ...item.actions[action], [roleVu]: precedent } } }
            : item,
        ),
      );
      notify.erreur(err instanceof ApiError ? err.message : "Le droit n'a pas été enregistré.");
    }
  };

  const changerRole = async (compte: Compte, prochain: Role) => {
    const precedent = compte.role;
    setComptes((liste) => liste.map((c) => (c.id === compte.id ? { ...c, role: prochain } : c)));
    try {
      await UsersApi.update(compte.id, { role: prochain });
      notify.succes(`Accès de ${compte.nom || compte.email} : ${LIBELLES_ROLES[prochain]}.`);
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
          Cochez les cases pour modifier les droits du rôle affiché. L&apos;administrateur garde tous les
          droits. Changer le rôle d&apos;un compte change ses accès.
        </p>
      </div>

      {chargement ? (
        <p className="text-sm text-muted-foreground">Chargement des permissions et des comptes…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {roles.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setRoleVu(id)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  roleVu === id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {LIBELLES_ROLES[id]}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Module</th>
                  {ACTIONS.map((action) => (
                    <th key={action.id} className="px-4 py-3 font-medium">
                      {action.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((ligne, index) => {
                  const groupe = index === 0 || modules[index - 1]?.espace !== ligne.espace;
                  return (
                    <Fragment key={`${ligne.espace}-${ligne.module}`}>
                      {groupe ? (
                        <tr className="bg-muted/40">
                          <td colSpan={5} className="px-4 py-2 text-xs font-medium uppercase tracking-wide">
                            {ligne.espace}
                          </td>
                        </tr>
                      ) : null}
                      <tr className="border-b border-border last:border-0">
                        <td className="px-4 py-3">{ligne.module}</td>
                        {ACTIONS.map((action) => {
                          const valeur = ligne.actions[action.id]?.[roleVu];
                          return (
                            <td key={action.id} className="px-4 py-3">
                              {valeur == null ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                <input
                                  type="checkbox"
                                  aria-label={`${action.label} ${ligne.module} pour ${LIBELLES_ROLES[roleVu]}`}
                                  checked={valeur}
                                  disabled={roleVu === "admin"}
                                  onChange={(e) => void changerDroit(ligne, action.id, e.target.checked)}
                                  className="size-4 accent-foreground disabled:opacity-60"
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <section>
            <h2 className="text-xl">Comptes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {comptes.length} compte{comptes.length > 1 ? "s" : ""} enregistré{comptes.length > 1 ? "s" : ""}. Le
              comptable par défaut est comptable@itobe.cd.
            </p>
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
                    {roles.map((id) => (
                      <option key={id} value={id}>
                        {LIBELLES_ROLES[id]}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
