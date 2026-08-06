import { createFileRoute, Link } from "@tanstack/react-router";
import { AccesRestreint, BarreOutils } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";
import type { Role } from "@/lib/admin-data";

function ModulePlaceholder({
  titre,
  description,
  requis = ["admin"] as Role[],
}: {
  titre: string;
  description: string;
  requis?: Role[];
}) {
  const { role } = useRole();
  if (!requis.includes(role)) return <AccesRestreint requis={requis} />;
  return (
    <div>
      <BarreOutils titre={titre} action="Créer" />
      <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="font-display text-xl">{titre}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Module prévu — prêt à brancher sur l&apos;API backend.
        </p>
        <Link to="/admin" className="mt-6 inline-block text-sm text-accent hover:underline">
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  );
}

export { ModulePlaceholder };
