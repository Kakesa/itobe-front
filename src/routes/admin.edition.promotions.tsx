import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { categoriesLivres, formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/edition/promotions")({
  component: () => (
    <CrudModule
      titre="Promotions"
      singulier="Promotion"
      description="Campagnes catalogue et opérations saisonnières."
      collection="promotions"
      requis={["admin", "editeur"]}
      clesRecherche={["nom", "cible"]}
      colonnes={[
        { cle: "nom", label: "Campagne" },
        { cle: "cible", label: "Cible", classe: "text-muted-foreground" },
        { cle: "remise", label: "Remise", rendu: (r) => `${Number(r["remise"])} %` },
        {
          cle: "debut",
          label: "Début",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["debut"])),
        },
        {
          cle: "fin",
          label: "Fin",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["fin"])),
        },
        {
          cle: "actif",
          label: "État",
          rendu: (r) => (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${
                r["actif"] ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
              }`}
            >
              {r["actif"] ? "En cours" : "Programmée"}
            </span>
          ),
        },
      ]}
      champs={[
        { nom: "nom", label: "Nom de la campagne", requis: true },
        { nom: "cible", label: "Catégorie ciblée", type: "select", options: categoriesLivres },
        { nom: "remise", label: "Remise (%)", type: "number" },
        { nom: "debut", label: "Début", type: "date" },
        { nom: "fin", label: "Fin", type: "date" },
        { nom: "actif", label: "Activation", type: "switch", placeholder: "Campagne active" },
      ]}
    />
  ),
});
