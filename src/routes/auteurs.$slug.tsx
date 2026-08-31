import { createFileRoute, notFound } from "@tanstack/react-router";
import { AuteurProfilePage } from "@/components/auteur/auteur-profile-page";
import { articles, getAuteur, livres } from "@/lib/data";
import {
  fetchPublicAuteurBySlug,
  normalizePublicAuteur,
  normalizePublicArticle,
  normalizePublicLivre,
  type PublicArticle,
  type PublicAuteur,
  type PublicLivre,
} from "@/lib/public-data";

export const Route = createFileRoute("/auteurs/$slug")({
  loader: async ({ params }) => {
    const api = await fetchPublicAuteurBySlug(params.slug);

    if (api.auteur) {
      return {
        auteur: api.auteur,
        livres: api.livres,
        articles: api.articles,
      };
    }

    const local = getAuteur(params.slug);
    if (!local) throw notFound();

    return {
      auteur: normalizePublicAuteur(local),
      livres: livres
        .filter((l) => l.auteur === params.slug)
        .map((l) => normalizePublicLivre(l)),
      articles: articles
        .filter((a) => a.auteur === params.slug)
        .map((a) => normalizePublicArticle(a)),
    };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.auteur;
    if (!a) {
      return { meta: [{ title: "Auteur introuvable" }, { name: "robots", content: "noindex" }] };
    }
    const desc = a.bio.replace(/\n+/g, " ").slice(0, 155);
    return {
      meta: [
        { title: `${a.nom} — ${a.role} | Itobe` },
        { name: "description", content: desc },
        { property: "og:title", content: `${a.nom} | Itobe` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `/auteurs/${params.slug}` },
        ...(a.photo ? [{ property: "og:image", content: a.photo }] : []),
      ],
      links: [{ rel: "canonical", href: `/auteurs/${params.slug}` }],
    };
  },
  component: AuteurRoutePage,
});

function AuteurRoutePage() {
  const data = Route.useLoaderData() as {
    auteur: PublicAuteur;
    livres: PublicLivre[];
    articles: PublicArticle[];
  };

  return <AuteurProfilePage auteur={data.auteur} livres={data.livres} articles={data.articles} />;
}
