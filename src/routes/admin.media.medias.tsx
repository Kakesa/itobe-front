import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/media/medias")({
  component: () => (
    <CrudModule
      titre="Médiathèque"
      singulier="Fichier"
      description="Bibliothèque de fichiers partagés : images de couverture, audio, PDF et documents réutilisables dans les articles et les livres."
      collection="medias"
      requis={["admin"]}
      clesRecherche={["nom"]}
      filtre={{ cle: "type", label: "Type", options: ["Image", "Audio", "Document"] }}
      colonnes={[
        { cle: "nom", label: "Fichier" },
        { cle: "type", label: "Type", classe: "text-muted-foreground" },
        { cle: "poids", label: "Poids", classe: "text-muted-foreground" },
        {
          cle: "date",
          label: "Ajouté le",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["date"])),
        },
      ]}
      champs={[
        { nom: "nom", label: "Nom du fichier", requis: true },
        { nom: "type", label: "Type", type: "select", options: ["Image", "Audio", "Document"] },
        { nom: "poids", label: "Poids", placeholder: "480 Ko" },
        { nom: "date", label: "Date", type: "date" },
      ]}
    />
  ),
});
