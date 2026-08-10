import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { Statut } from "@/components/admin-ui";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/commentaires")({
  component: () => (
    <CrudModule
      titre="Commentaires"
      singulier="Commentaire"
      description="Modération des contributions de la communauté."
      collection="commentaires"
      requis={["admin"]}
      clesRecherche={["auteur", "contenu"]}
      filtre={{ cle: "statut", label: "Statut", options: ["Publié", "En attente", "Rejeté"] }}
      colonnes={[
        { cle: "auteur", label: "Auteur" },
        { cle: "contenu", label: "Commentaire", classe: "text-muted-foreground" },
        { cle: "cible", label: "Contenu visé", classe: "text-muted-foreground" },
        {
          cle: "date",
          label: "Date",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["date"])),
        },
        { cle: "statut", label: "Statut", rendu: (r) => <Statut valeur={String(r["statut"])} /> },
      ]}
      champs={[
        { nom: "auteur", label: "Auteur", requis: true },
        { nom: "contenu", label: "Commentaire", type: "textarea", requis: true },
        { nom: "cible", label: "Contenu visé" },
        {
          nom: "statut",
          label: "Statut",
          type: "select",
          options: ["Publié", "En attente", "Rejeté"],
        },
        { nom: "date", label: "Date", type: "date" },
      ]}
    />
  ),
});
