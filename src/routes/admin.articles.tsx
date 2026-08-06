import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { articles, formatDate, nomAuteur, categoriesMedia } from "@/lib/data";
import { AccesRestreint, Actions, BarreOutils, Statut, Tableau } from "@/components/admin-ui";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/admin/articles")({
  component: AdminArticles,
});

function AdminArticles() {
  const { role } = useRole();
  const [filtre, setFiltre] = useState("Toutes");
  const [q, setQ] = useState("");

  if (role !== "admin") {
    return <AccesRestreint requis={["admin"]} />;
  }

  const liste = articles.filter(
    (a) =>
      (filtre === "Toutes" || a.categorie === filtre) &&
      a.titre.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <BarreOutils titre="Articles" action="Nouvel article">
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
          {["Toutes", ...categoriesMedia].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </BarreOutils>

      <Tableau entetes={["Titre", "Catégorie", "Auteur", "Date", "Statut", ""]}>
        {liste.map((a) => (
          <tr key={a.slug}>
            <td className="px-4 py-3">{a.titre}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.categorie}</td>
            <td className="px-4 py-3 text-muted-foreground">{nomAuteur(a.auteur)}</td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(a.date)}</td>
            <td className="px-4 py-3">
              <Statut valeur={a.populaire ? "Publié" : "Brouillon"} />
            </td>
            <td className="px-4 py-3">
              <Actions />
            </td>
          </tr>
        ))}
      </Tableau>
      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun article ne correspond.</p>
      )}
    </div>
  );
}
