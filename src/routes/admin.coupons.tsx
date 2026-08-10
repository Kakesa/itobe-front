import { createFileRoute } from "@tanstack/react-router";
import { CrudModule } from "@/components/admin/crud-module";
import { formatDate } from "@/lib/data";

export const Route = createFileRoute("/admin/coupons")({
  component: () => (
    <CrudModule
      titre="Coupons"
      singulier="Coupon"
      description="Codes promo, remises et dates d'expiration."
      collection="coupons"
      requis={["admin"]}
      clesRecherche={["code"]}
      filtre={{ cle: "type", label: "Type", options: ["Pourcentage", "Montant"] }}
      colonnes={[
        { cle: "code", label: "Code" },
        {
          cle: "remise",
          label: "Remise",
          rendu: (r) =>
            r["type"] === "Montant" ? `${Number(r["remise"])} $` : `${Number(r["remise"])} %`,
        },
        { cle: "utilisations", label: "Utilisations", classe: "text-muted-foreground" },
        {
          cle: "expiration",
          label: "Expiration",
          classe: "text-muted-foreground",
          rendu: (r) => formatDate(String(r["expiration"])),
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
              {r["actif"] ? "Actif" : "Inactif"}
            </span>
          ),
        },
      ]}
      champs={[
        { nom: "code", label: "Code", requis: true, placeholder: "RENTREE26" },
        { nom: "type", label: "Type", type: "select", options: ["Pourcentage", "Montant"] },
        { nom: "remise", label: "Remise", type: "number" },
        { nom: "utilisations", label: "Utilisations", type: "number" },
        { nom: "expiration", label: "Expiration", type: "date" },
        { nom: "actif", label: "Activation", type: "switch", placeholder: "Coupon actif" },
      ]}
    />
  ),
});
