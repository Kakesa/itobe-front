import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { categoriesLivres, nomAuteur, auteurs } from "@/lib/data";
import { Statut } from "@/components/admin-ui";
import { useNotifierAbonnes } from "@/hooks/use-notifier-abonnes";

export const Route = createFileRoute("/admin/livres")({
  component: AdminLivres,
});

function AdminLivres() {
  const { notifierSiPublication } = useNotifierAbonnes();

  return (
    <CrudModule
      titre="Livres"
      singulier="Livre"
      description="Catalogue de la maison d'édition : couverture, prix, stock et disponibilité. La mise en vente notifie tous les abonnés ACTIVE par e-mail."
      collection="livres"
      requis={["admin", "editeur"]}
      clesRecherche={["titre"]}
      filtre={{ cle: "categorie", label: "Catégorie", options: categoriesLivres }}
      onApresEnregistrement={({ avant, apres }) => {
        notifierSiPublication("livre", avant, apres);
      }}
      colonnes={[
        {
          cle: "couverture",
          label: "Couverture",
          rendu: (r) =>
            r["couverture"] ? (
              <img
                src={String(r["couverture"])}
                alt=""
                className="h-14 w-10 rounded object-cover"
              />
            ) : (
              <div
                className="h-14 w-10 rounded"
                style={{
                  backgroundImage: String(
                    r["couleur"] ?? "linear-gradient(160deg,#383030,#211c1c)",
                  ),
                }}
              />
            ),
        },
        { cle: "titre", label: "Titre" },
        {
          cle: "auteur",
          label: "Auteur",
          classe: "text-muted-foreground",
          rendu: (r) => nomAuteur(String(r["auteur"])),
        },
        { cle: "categorie", label: "Catégorie", classe: "text-muted-foreground" },
        { cle: "formats", label: "Formats", classe: "text-muted-foreground" },
        {
          cle: "prix",
          label: "Prix",
          rendu: (r) =>
            Number(r["promo"]) > 0
              ? `${Number(r["promo"]).toFixed(2)} $`
              : `${Number(r["prix"]).toFixed(2)} $`,
        },
        { cle: "stock", label: "Stock", classe: "text-muted-foreground" },
        {
          cle: "disponible",
          label: "Statut",
          rendu: (r) => <Statut valeur={r["disponible"] ? "En vente" : "Épuisé"} />,
        },
      ]}
      champs={[
        { nom: "titre", label: "Titre", requis: true },
        {
          nom: "couverture",
          label: "Image de couverture",
          type: "image",
          placeholder: "URL de la couverture",
        },
        { nom: "auteur", label: "Auteur", type: "select", options: auteurs.map((a) => a.slug) },
        { nom: "categorie", label: "Catégorie", type: "select", options: categoriesLivres },
        { nom: "formats", label: "Formats", placeholder: "PDF, EPUB, Papier" },
        { nom: "prix", label: "Prix ($)", type: "number" },
        { nom: "promo", label: "Prix promo ($)", type: "number" },
        { nom: "stock", label: "Stock", type: "number" },
        { nom: "disponible", label: "Publier (en vente)", type: "switch", placeholder: "En vente" },
      ]}
    />
  );
}
