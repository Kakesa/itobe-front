import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Globe2, Sparkles } from "lucide-react";

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

const piliersVision = [
  {
    icon: BookOpen,
    image: "/images/a-propos/pillar-literature.jpg",
    alt: "Illustration Itobe — De même que",
    titre: "La littérature africaine au-delà de l'apprentissage",
    texte:
      "L'objectif est de montrer au monde que l'Afrique n'est pas qu'un continent d'histoires à méditer, mais aussi un réservoir infini de récits à savourer, qui peuvent rivaliser avec ceux de n'importe quelle autre culture.",
  },
  {
    icon: Globe2,
    image: "/images/a-propos/pillar-dialogue.png",
    alt: "Illustration Itobe — Au lieu de",
    titre: "Le dialogue universel par les récits locaux",
    texte:
      "Chaque récit devient un point de départ pour un dialogue interculturel, nous rappelant que, malgré nos différences géographiques ou sociales, nous partageons des émotions, des peurs et des aspirations communes.",
  },
  {
    icon: Sparkles,
    image: "/images/a-propos/pillar-imaginaire.jpg",
    alt: "Illustration Itobe — En somme",
    titre: "Façonner l'imaginaire collectif et changer les perspectives",
    texte:
      "La littérature africaine peut inverser cette tendance en proposant de nouvelles images, de nouveaux héros et de nouvelles perspectives.",
  },
];

function APropos() {
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
          <p className="apropos-page__hero-kicker">Notre maison</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
            Lis l&apos;Afrique.
            <br />
            <span className="text-brand-gold">Change le monde.</span>
          </h1>
        </div>
      </section>

      <section className="apropos-page__split mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="apropos-page__split-text">
          <h2 className="font-display text-2xl md:text-3xl">Notre mission</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Valoriser les talents littéraires africains et propulser leurs récits pour qu&apos;ils
            deviennent une source d&apos;inspiration pour le monde entier.
          </p>
          <blockquote className="apropos-page__quote mt-10">
            &laquo;&nbsp;Faire de l&apos;Afrique le cœur de la narration mondiale.&nbsp;&raquo;
          </blockquote>
        </div>
        <figure className="apropos-page__figure">
          <img
            src={IMG.mission}
            alt="Illustration Itobe Éditions"
            className="apropos-page__figure-img"
            loading="lazy"
          />
          <figcaption className="apropos-page__figure-cap">
            Chaque voix africaine mérite d&apos;être lue et partagée.
          </figcaption>
        </figure>
      </section>

      <section className="apropos-page__band mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl">Notre vision</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Nous croyons que chaque récit africain peut façonner l&apos;imaginaire collectif,
            dévoiler de nouvelles perspectives et stimuler un dialogue universel.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {piliersVision.map((p) => (
            <article key={p.titre} className="apropos-page__pillar overflow-hidden rounded-lg border border-brand-brown/12 bg-card shadow-soft">
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
              alt="Visuel Itobe Éditions — Beyond the Pages"
              className="size-full object-cover"
              loading="lazy"
            />
          </figure>
          <div className="apropos-page__feature-body">
            <h2 className="font-display text-2xl md:text-3xl">Chez Itobe Éditions</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Nous sommes convaincus que la littérature africaine est le prochain grand mouvement
              littéraire mondial. Chaque histoire africaine a le droit d&apos;être racontée et de
              briller sur la scène internationale, non seulement comme un héritage de notre passé,
              mais comme un puissant catalyseur de notre avenir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/edition"
                className="rounded-sm bg-brand-orange px-5 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                Voir le catalogue
              </Link>
              <Link
                to="/auteurs"
                className="rounded-sm border border-border px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                Nos auteurs
              </Link>
              <Link
                to="/contact"
                className="rounded-sm border border-border px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
