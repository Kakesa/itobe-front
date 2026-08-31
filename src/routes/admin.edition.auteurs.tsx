import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";

export const Route = createFileRoute("/admin/edition/auteurs")({
  component: () => (
    <CrudModule
      titre="Auteurs"
      singulier="Auteur"
      description="Fiches auteurs, biographies et performances de vente."
      collection="auteurs"
      requis={["admin", "editeur"]}
      clesRecherche={["nom", "ville"]}
      colonnes={[
        { cle: "nom", label: "Nom" },
        { cle: "role", label: "Rôle", classe: "text-muted-foreground" },
        { cle: "ville", label: "Ville", classe: "text-muted-foreground" },
        {
          cle: "ventes",
          label: "Ventes",
          rendu: (r) => Number(r["ventes"] ?? 0).toLocaleString("fr-FR"),
        },
      ]}
      champs={[
        { nom: "nom", label: "Nom", requis: true },
        { nom: "role", label: "Rôle", placeholder: "Romancière" },
        { nom: "ville", label: "Ville" },
        { nom: "photo", label: "Photo (URL)", placeholder: "https://…" },
        { nom: "bio", label: "Biographie détaillée", type: "textarea" },
      ]}
    />
  ),
});
