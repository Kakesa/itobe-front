/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/media/utilisateurs")({
  component: () => (
    <CrudModule
      titre="Utilisateurs"
      singulier="Utilisateur"
      description="Comptes lecteurs, éditeurs et administrateurs."
      collection="utilisateurs"
      requis={["admin"]}
      clesRecherche={["nom", "email"]}
      filtre={{ cle: "role", label: "Rôle", options: ["admin", "editeur", "lecteur"] }}
      colonnes={[
        { cle: "nom", label: "Nom" },
        { cle: "email", label: "E-mail", classe: "text-muted-foreground" },
        { cle: "role", label: "Rôle", classe: "text-muted-foreground" },
        {
          cle: "statut",
          label: "Statut",
          rendu: (r) => (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${
                r["statut"] === "Actif"
                  ? "bg-accent/15 text-accent"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {String(r["statut"])}
            </span>
          ),
        },
        {
          cle: "inscription",
          label: "Inscription",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["inscription"])),
        },
      ]}
      champs={[
        { nom: "nom", label: "Nom", requis: true },
        { nom: "email", label: "E-mail", requis: true },
        { nom: "role", label: "Rôle", type: "select", options: ["admin", "editeur", "lecteur"] },
        { nom: "statut", label: "Statut", type: "select", options: ["Actif", "Suspendu"] },
        { nom: "inscription", label: "Inscription", type: "date" },
      ]}
    />
  ),
});
