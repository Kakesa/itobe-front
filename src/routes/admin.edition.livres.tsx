import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { categoriesLivres, nomAuteur, auteurs } from "@/lib/data";
import { Statut } from "@/components/admin-ui";
import { useNotifierAbonnes } from "@/hooks/use-notifier-abonnes";

export const Route = createFileRoute("/admin/edition/livres")({
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
          rendu: (r) => {
            const num = Number(r["promo"]) > 0 ? Number(r["promo"]) : Number(r["prix"]);
            const papier = Number(r["prixPapier"]);
            const numStr = `${num.toFixed(2)} $ num.`;
            if (papier > 0) return `${numStr} · ${papier.toFixed(2)} $ pap.`;
            return numStr;
          },
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
          nom: "resume",
          label: "Résumé / synopsis",
          type: "richtext",
          requis: true,
          placeholder: "Description de l'ouvrage affichée sur la fiche livre",
        },
        {
          nom: "couverture",
          label: "Image de couverture",
          type: "image",
          placeholder: "URL de la couverture",
        },
        { nom: "auteur", label: "Auteur", type: "select", options: auteurs.map((a) => a.slug) },
        { nom: "categorie", label: "Catégorie", type: "select", options: categoriesLivres },
        { nom: "formats", label: "Formats", placeholder: "PDF, EPUB, Papier" },
        { nom: "prix", label: "Prix numérique ($)", type: "number" },
        { nom: "prixPapier", label: "Prix papier ($)", type: "number" },
        { nom: "promo", label: "Prix promo numérique ($)", type: "number" },
        { nom: "pages", label: "Nombre de pages", type: "number" },
        { nom: "stock", label: "Stock", type: "number" },
        { nom: "disponible", label: "Publier (en vente)", type: "switch", placeholder: "En vente", defaut: true },
      ]}
    />
  );
}
