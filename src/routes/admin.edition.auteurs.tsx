import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { resolveMediaUrl } from "@/lib/media-url";

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
        {
          cle: "photo",
          label: "Photo",
          rendu: (r) => {
            const src = resolveMediaUrl(r["photo"]);
            return src ? (
              <img
                src={src}
                alt=""
                className="size-10 rounded-full object-cover object-[center_20%] ring-2 ring-brand-gold/35"
              />
            ) : (
              "—"
            );
          },
        },
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
        {
          nom: "photo",
          label: "Photo",
          type: "image",
          apercu: "avatar",
          placeholder: "https://…",
        },
        { nom: "bio", label: "Biographie détaillée", type: "textarea" },
      ]}
    />
  ),
});
