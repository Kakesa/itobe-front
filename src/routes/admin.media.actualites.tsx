import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { categoriesMedia, formatDate } from "@/lib/data";
import { etatsModeration } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/media/actualites")({
  component: () => (
    <CrudModule
      titre="Actualités"
      singulier="Actualité"
      description="Brèves et communiqués du portail Média."
      collection="actualites"
      requis={["admin"]}
      clesRecherche={["titre"]}
      filtre={{ cle: "etat", label: "État", options: [...etatsModeration] }}
      colonnes={[
        { cle: "titre", label: "Titre" },
        { cle: "categorie", label: "Catégorie", classe: "text-muted-foreground" },
        {
          cle: "date",
          label: "Date",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["date"])),
        },
        { cle: "etat", label: "État", classe: "text-muted-foreground" },
      ]}
      champs={[
        { nom: "titre", label: "Titre", requis: true },
        { nom: "categorie", label: "Catégorie", type: "select", options: categoriesMedia },
        { nom: "date", label: "Date", type: "date" },
        { nom: "etat", label: "État", type: "select", options: [...etatsModeration] },
      ]}
    />
  ),
});
