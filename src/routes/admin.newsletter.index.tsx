import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { MailCheck, MousePointerClick, Send, UserMinus, Users } from "lucide-react";
import { CampagnesPanel } from "@/components/newsletter/campagnes-panel";
import { CarteStat } from "@/components/newsletter/newsletter-ui";
import { useCollection } from "@/lib/admin/store";
import { nombre, statsDe, taux } from "@/lib/newsletter/newsletter";

export const Route = createFileRoute("/admin/newsletter/")({
  component: NewsletterCampagnes,
});

function NewsletterCampagnes() {
  const { items: campagnes } = useCollection("campagnes");
  const { items: abonnes } = useCollection("abonnes");

  const cumul = useMemo(() => {
    return campagnes
      .filter((c) => c["statut"] === "SENT")
      .reduce(
        (acc, c) => {
          const s = statsDe(c);
          return {
            envoyes: acc.envoyes + s.envoyes,
            delivres: acc.delivres + s.delivres,
            ouvertures: acc.ouvertures + s.ouvertures,
            clics: acc.clics + s.clics,
            desabonnements: acc.desabonnements + s.desabonnements,
          };
        },
        { envoyes: 0, delivres: 0, ouvertures: 0, clics: 0, desabonnements: 0 },
      );
  }, [campagnes]);

  const actifs = abonnes.filter((a) => a["statut"] === "ACTIVE").length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <CarteStat label="Emails envoyés" valeur={nombre(cumul.envoyes)} icone={<Send className="size-4" />} />
        <CarteStat
          label="Délivrés"
          valeur={nombre(cumul.delivres)}
          hint={`Délivrabilité ${taux(cumul.delivres, cumul.envoyes)}`}
          icone={<MailCheck className="size-4" />}
        />
        <CarteStat
          label="Ouvertures"
          valeur={nombre(cumul.ouvertures)}
          hint={`Taux ${taux(cumul.ouvertures, cumul.delivres)}`}
          icone={<Users className="size-4" />}
        />
        <CarteStat
          label="Clics"
          valeur={nombre(cumul.clics)}
          hint={`Taux ${taux(cumul.clics, cumul.delivres)}`}
          icone={<MousePointerClick className="size-4" />}
        />
        <CarteStat
          label="Abonnés actifs"
          valeur={nombre(actifs)}
          hint={`sur ${abonnes.length} au total`}
          icone={<UserMinus className="size-4" />}
        />
      </section>

      <CampagnesPanel />
    </div>
  );
}
