import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookOpen, Globe2, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n";

/** Visuels repris de itobeeditions.com */
const IMG = {
  hero: "/images/a-propos/hero.jpg",
  mission: "/images/a-propos/mission.png",
  chezItobe: "/images/a-propos/chez-itobe.png",
} as const;

/** Page À propos — portail Maison d'édition (Itobe Éditions).
 *  Le portail Média a sa propre page : `/media/a-propos`.
 */
export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "Notre maison — Itobe Éditions" },
      {
        name: "description",
        content:
          "Lis l'Afrique. Change le monde. Découvrez la mission et la vision d'Itobe Éditions : valoriser les talents littéraires africains.",
      },
      { property: "og:title", content: "Notre maison — Itobe Éditions" },
      {
        property: "og:description",
        content:
          "Faire de l'Afrique le cœur de la narration mondiale — mission et vision d'Itobe Éditions.",
      },
      { property: "og:url", content: "/a-propos" },
      { property: "og:image", content: IMG.hero },
    ],
    links: [{ rel: "canonical", href: "/a-propos" }],
  }),
  component: APropos,
});

function APropos() {
  const { locale, t } = useI18n();
  const a = t.editionAbout;

  useEffect(() => {
    document.title = a.metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", a.metaDescription);
  }, [a.metaTitle, a.metaDescription, locale]);

  const piliersVision = [
    {
      icon: BookOpen,
      image: "/images/a-propos/pillar-literature.jpg",
      alt: a.pillars.literature.alt,
      titre: a.pillars.literature.title,
      texte: a.pillars.literature.text,
    },
    {
      icon: Globe2,
      image: "/images/a-propos/pillar-dialogue.png",
      alt: a.pillars.dialogue.alt,
      titre: a.pillars.dialogue.title,
      texte: a.pillars.dialogue.text,
    },
    {
      icon: Sparkles,
      image: "/images/a-propos/pillar-imaginaire.jpg",
      alt: a.pillars.imaginaire.alt,
      titre: a.pillars.imaginaire.title,
      texte: a.pillars.imaginaire.text,
    },
  ];

  return (
    <div className="apropos-page theme-edition">
      <section className="apropos-page__hero">
        <img
          src={IMG.hero}
          alt=""
          className="apropos-page__hero-bg"
          fetchPriority="high"
        />
        <div className="apropos-page__hero-overlay" aria-hidden />
        <div className="apropos-page__hero-content mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <p className="apropos-page__hero-kicker">{a.heroKicker}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
            {a.heroLine1}
            <br />
            <span className="text-brand-gold">{a.heroLine2}</span>
          </h1>
        </div>
      </section>

      <section className="apropos-page__split mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="apropos-page__split-text">
          <h2 className="font-display text-2xl md:text-3xl">{a.missionTitle}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{a.missionText}</p>
          <blockquote className="apropos-page__quote mt-10">
            &laquo;&nbsp;{a.missionQuote}&nbsp;&raquo;
          </blockquote>
        </div>
        <figure className="apropos-page__figure">
          <img
            src={IMG.mission}
            alt={a.missionImageAlt}
            className="apropos-page__figure-img"
            loading="lazy"
          />
          <figcaption className="apropos-page__figure-cap">{a.missionCaption}</figcaption>
        </figure>
      </section>

      <section className="apropos-page__band mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl">{a.visionTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{a.visionIntro}</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {piliersVision.map((p) => (
            <article
              key={p.titre}
              className="apropos-page__pillar overflow-hidden rounded-lg border border-brand-brown/12 bg-card shadow-soft"
            >
              <div className="apropos-page__pillar-media">
                <img src={p.image} alt={p.alt} className="size-full object-cover" loading="lazy" />
              </div>
              <div className="p-6">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-gold/35 text-brand-orange">
                  <p.icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-lg leading-snug">{p.titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.texte}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="apropos-page__feature mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <div className="apropos-page__feature-grid overflow-hidden rounded-xl border border-brand-brown/12 bg-card shadow-soft">
          <figure className="apropos-page__feature-media">
            <img
              src={IMG.chezItobe}
              alt={a.featureImageAlt}
              className="size-full object-cover"
              loading="lazy"
            />
          </figure>
          <div className="apropos-page__feature-body">
            <h2 className="font-display text-2xl md:text-3xl">{a.chezTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{a.chezText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/edition"
                className="rounded-sm bg-brand-orange px-5 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                {a.ctaCatalogue}
              </Link>
              <Link
                to="/auteurs"
                className="rounded-sm border border-border px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                {a.ctaAuteurs}
              </Link>
              <Link
                to="/contact"
                className="rounded-sm border border-border px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                {a.ctaContact}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
