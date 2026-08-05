import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { livres, nomAuteur, categoriesLivres, prixAffiche } from "@/lib/data";
import { AccesRestreint, Actions, BarreOutils, Statut, Tableau } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/livres")({
  component: AdminLivres,
});

function AdminLivres() {
  const { role } = useRole();
  const [filtre, setFiltre] = useState("Toutes");
  const [q, setQ] = useState("");

  if (role !== "admin" && role !== "editeur") {
    return <AccesRestreint requis={["admin", "editeur"]} />;
  }

  const liste = livres.filter(
    (l) =>
      (filtre === "Toutes" || l.categorie === filtre) &&
      l.titre.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <BarreOutils titre="Livres" action="Ajouter un livre">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un titre…"
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm"
        />
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm"
        >
          {["Toutes", ...categoriesLivres].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </BarreOutils>

      <Tableau entetes={["Titre", "Auteur", "Catégorie", "Formats", "Prix", "Stock", "Statut", ""]}>
        {liste.map((l) => (
          <tr key={l.slug}>
            <td className="px-4 py-3">{l.titre}</td>
            <td className="px-4 py-3 text-muted-foreground">{nomAuteur(l.auteur)}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.categorie}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.formats.join(", ")}</td>
            <td className="px-4 py-3">{prixAffiche(l)}</td>
            <td className="px-4 py-3 text-muted-foreground">{l.stock}</td>
            <td className="px-4 py-3">
              <Statut valeur={l.disponible ? "En vente" : "Épuisé"} />
            </td>
            <td className="px-4 py-3">
              <Actions />
            </td>
          </tr>
        ))}
      </Tableau>
      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun livre ne correspond.</p>
      )}
    </div>
  );
}
