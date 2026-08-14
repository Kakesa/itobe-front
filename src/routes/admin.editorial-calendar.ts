// Endpoint HTTP : GET /admin/editorial-calendar?debut=AAAA-MM-JJ&fin=AAAA-MM-JJ
// Retourne les articles, actualités et livres publiés/programmés sur la période.
import { createFileRoute } from "@tanstack/react-router";
import { seedActualites, seedArticles, seedLivres } from "@/lib/admin/seeds";
import {
  bornesDuMois,
  dansPeriode,
  versElement,
  type ElementCalendrier,
  type ReponseCalendrier,
} from "@/lib/calendrier/editorial";

const EST_DATE = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export const Route = createFileRoute("/admin/editorial-calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mois = url.searchParams.get("mois");
        const defauts = bornesDuMois(
          mois && /^\d{4}-\d{2}$/.test(mois) ? mois : new Date().toISOString().slice(0, 7),
        );
        const debutParam = url.searchParams.get("debut");
        const finParam = url.searchParams.get("fin");
        const debut = EST_DATE(debutParam) ? debutParam : defauts.debut;
        const fin = EST_DATE(finParam) ? finParam : defauts.fin;

        const elements: ElementCalendrier[] = [
          ...seedArticles.map((i) => versElement("article", i)),
          ...seedActualites.map((i) => versElement("actualite", i)),
          ...seedLivres.map((i) => versElement("livre", i)),
        ]
          .filter((e): e is ElementCalendrier => e !== null)
          .filter((e) => dansPeriode(e, debut, fin))
          .sort((a, b) => a.date.localeCompare(b.date));

        const payload: ReponseCalendrier = {
          periode: { debut, fin },
          total: elements.length,
          elements,
        };
        return Response.json(payload, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
