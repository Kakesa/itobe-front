import { Link } from "@tanstack/react-router";
import { Calendar, Clock } from "lucide-react";
import { ArticleCover } from "@/components/article-cover";
import { ArticleHtmlBody, richTextIsEmpty } from "@/components/admin/article-rich-editor";
import type { Auteur } from "@/lib/data";
import { formatDate } from "@/lib/data";
import { resolveMediaUrl } from "@/lib/media-url";
import type { PublicArticle } from "@/lib/public-data";

type ArticleBlogViewProps = {
  article: PublicArticle;
  auteur?: Auteur | null;
};

function AuthorAvatar({ auteur, nomFallback }: { auteur?: Auteur | null; nomFallback: string }) {
  const nom = auteur?.nom ?? nomFallback;
  const photo = resolveMediaUrl(auteur?.photo);
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join("");

  if (photo) {
    return <img src={photo} alt={nom} className="size-14 rounded-full object-cover" />;
  }

  return (
    <span className="grid size-14 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
      {initiales || "?"}
    </span>
  );
}

function youtubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^&]+&)*v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

function articleHasMainBody(article: PublicArticle): boolean {
  const contenu = article.contenu?.trim() ?? "";
  if (contenu && !richTextIsEmpty(contenu)) return true;
  return article.corps.some((p) => p.trim());
}

/** Fiche article complète : résumé, contenu, médias et métadonnées. */
export function ArticleBlogView({ article, auteur }: ArticleBlogViewProps) {
  const nomAuteur = auteur?.nom ?? "Rédaction Itobe";
  const corps = article.corps.filter((p) => p.trim());
  const aCorps = articleHasMainBody(article);
  const galerie = (article.galerie ?? [])
    .map((src) => resolveMediaUrl(src))
    .filter(Boolean) as string[];
  const youtubeId = article.youtube ? youtubeVideoId(article.youtube) : null;

  return (
    <article className="article-blog">
      <header>
        <p className="kicker">{article.categorie}</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.12] md:text-5xl">{article.titre}</h1>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-border py-5">
          {auteur ? (
            <Link
              to="/auteurs/$slug"
              params={{ slug: auteur.slug }}
              className="flex min-w-0 items-center gap-3 hover:opacity-90"
            >
              <AuthorAvatar auteur={auteur} nomFallback={nomAuteur} />
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{auteur.nom}</p>
                <p className="truncate text-sm text-muted-foreground">{auteur.role}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <AuthorAvatar auteur={null} nomFallback={nomAuteur} />
              <div>
                <p className="font-semibold">{nomAuteur}</p>
                <p className="text-sm text-muted-foreground">Itobe Média</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:ml-auto">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0" aria-hidden />
              {formatDate(article.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" aria-hidden />
              {article.lecture} de lecture
            </span>
          </div>
        </div>
      </header>

      <figure className="mt-8 overflow-hidden rounded-sm">
        <div className="aspect-[16/10] w-full">
          <ArticleCover src={article.couverture ?? article.image} alt={article.titre} />
        </div>
      </figure>

      {youtubeId && (
        <div className="mt-10 aspect-video overflow-hidden rounded-sm border border-border">
          <iframe
            title={`Vidéo — ${article.titre}`}
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="article-blog__body mt-10">
        {aCorps ? (
          <ArticleHtmlBody html={article.contenu} fallbackParagraphs={corps} />
        ) : (
          <p className="text-muted-foreground italic">
            Le corps de l&apos;article sera bientôt disponible.
          </p>
        )}
      </div>

      {galerie.length > 0 && (
        <section className="mt-12">
          <p className="kicker">Galerie</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {galerie.map((src) => (
              <figure key={src} className="overflow-hidden rounded-sm border border-border">
                <img src={src} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              </figure>
            ))}
          </div>
        </section>
      )}

      {article.tags.length > 0 && (
        <footer className="mt-12 border-t border-border pt-8">
          <p className="kicker">Sujets</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-sm text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>
      )}

      {auteur && auteur.bio && (
        <aside className="mt-12 rounded-sm border border-border bg-card p-6">
          <p className="kicker">À propos de l&apos;auteur</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <AuthorAvatar auteur={auteur} nomFallback={auteur.nom} />
            <div className="min-w-0 flex-1">
              <Link
                to="/auteurs/$slug"
                params={{ slug: auteur.slug }}
                className="font-display text-xl hover:text-accent"
              >
                {auteur.nom}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{auteur.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{auteur.bio}</p>
              <Link
                to="/auteurs/$slug"
                params={{ slug: auteur.slug }}
                className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              >
                Voir le profil complet →
              </Link>
            </div>
          </div>
        </aside>
      )}
    </article>
  );
}
