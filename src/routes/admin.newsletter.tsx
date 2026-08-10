import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/newsletter")({
  component: () => (
    <CrudModule
      titre="Newsletter"
      singulier="Abonné"
      description="Liste des inscrits et segments d'envoi."
      collection="newsletter"
      requis={["admin"]}
      clesRecherche={["email"]}
      filtre={{ cle: "segment", label: "Segment", options: ["Média", "Édition"] }}
      colonnes={[
        { cle: "email", label: "E-mail" },
        { cle: "segment", label: "Segment", classe: "text-muted-foreground" },
        {
          cle: "statut",
          label: "Statut",
          rendu: (r) => (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${
                r["statut"] === "Abonné"
                  ? "bg-accent/15 text-accent"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {String(r["statut"])}
            </span>
          ),
        },
        {
          cle: "date",
          label: "Inscription",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["date"])),
        },
      ]}
      champs={[
        { nom: "email", label: "E-mail", requis: true },
        { nom: "segment", label: "Segment", type: "select", options: ["Média", "Édition"] },
        { nom: "statut", label: "Statut", type: "select", options: ["Abonné", "Désabonné"] },
        { nom: "date", label: "Inscription", type: "date" },
      ]}
    />
  ),
});
