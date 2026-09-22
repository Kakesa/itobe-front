import type { ReactNode } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import type { Role } from "@/lib/admin-data";
import { roles } from "@/lib/admin-data";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";

export function AccesRestreint({ requis }: { requis: Role[] }) {
  const labels = roles.filter((r) => requis.includes(r.id)).map((r) => r.label);
  return (
    <div className="rounded-sm border border-dashed border-border bg-card p-8 text-center">
      <p className="font-display text-xl">Accès restreint</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Cette section est réservée aux rôles : {labels.join(", ")}.
      </p>
    </div>
  );
}

export function BarreOutils({
  titre,
  action,
  onAction,
  children,
}: {
  titre: string;
  action: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-2xl">{titre}</h2>
      {children}
      <button
        type="button"
        onClick={onAction}
        className="ml-auto rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {action}
      </button>
    </div>
  );
}

export function Statut({ valeur }: { valeur: string }) {
  const ton =
    valeur === "Publié" || valeur === "Payée" || valeur === "En vente"
      ? "bg-accent/15 text-accent"
      : valeur === "Remboursée" || valeur === "Épuisé" || valeur === "Échouée"
        ? "bg-destructive/10 text-destructive"
        : valeur === "En attente" || valeur === "Programmé"
          ? "bg-ochre/15 text-ochre-foreground"
          : "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${ton}`}>{valeur}</span>
  );
}

export function Tableau({
  entetes,
  children,
}: {
  entetes: string[];
  children: ReactNode;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            {entetes.map((e) => (
              <th key={e} className="px-4 py-3 font-normal">
                {e}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Actions() {
  return (
    <div className="flex justify-end">
      <RowActionsMenu
        actions={[
          { label: "Modifier", icon: Pencil, onClick: () => undefined },
          { label: "Dupliquer", icon: Copy, onClick: () => undefined },
          {
            label: "Supprimer",
            icon: Trash2,
            destructive: true,
            separatorBefore: true,
            onClick: () => undefined,
          },
        ]}
      />
    </div>
  );
}
