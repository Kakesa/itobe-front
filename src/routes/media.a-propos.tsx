import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const IMG = {
  hero: "/images/a-propos/hero.jpg",
  mission: "/images/a-propos/mission.png",
  formats: "/images/a-propos/chez-itobe.png",
} as const;

export const Route = createFileRoute("/media/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — Neno" },
      {
        name: "description",
        content:
          "Neno est un voyage à travers les histoires remarquables de l’Afrique, les personnes qui ont façonné sa culture et les créations qui continuent d’influencer le continent et le monde.",
      },
      { property: "og:title", content: "À propos — Neno" },
      {
        property: "og:description",
        content:
          "Nous explorons l’Afrique à travers son histoire, sa littérature, son cinéma, ses innovations, sa musique et son art.",
      },
      { property: "og:url", content: "/media/a-propos" },
      { property: "og:image", content: IMG.hero },
    ],
    links: [{ rel: "canonical", href: "/media/a-propos" }],
  }),
  component: AProposMedia,
});

const formats = [
  {
    num: "01",
    titre: "Analyses & chroniques",
    texte:
      "Articles de fond et décryptages sur la culture, l’économie et la société — pour comprendre sans simplifier.",
  },
  {
    num: "02",
    titre: "Entretiens & voix",
    texte:
      "Auteurs, artistes, entrepreneurs et penseurs : la parole à celles et ceux qui font bouger l’Afrique et sa diaspora.",
  },
  {
    num: "03",
    titre: "Débats & lectures",
    texte:
      "Idées croisées, critiques et conversations qui nourrissent le débat public africain et international.",
  },
];

function AProposMedia() {
  return (
    <div className="media-about">
      {/* Hero : une composition — marque, titre, phrase, CTA */}
      <section className="media-about__hero">
        <img
          src={IMG.hero}
          alt=""
          className="media-about__hero-img"
          fetchPriority="high"
        />
        <div className="media-about__hero-veil" aria-hidden />
        <div className="media-about__hero-inner">
          <p className="media-about__brand">Neno</p>
          <h1 className="media-about__title">
            À propos
          </h1>
          <p className="media-about__lead">
            Un voyage à travers les histoires remarquables de l’Afrique.
          </p>
          <Link to="/media" className="media-about__cta">
            Lire le blog
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Mission : texte éditorial à gauche, citation en grand à droite */}
      <section className="media-about__mission">
        <div className="media-about__mission-copy">
          <p className="media-about__eyebrow">À propos</p>
          <h2 className="media-about__heading">Neno</h2>
          <p className="media-about__body">
            Neno est un voyage à travers les histoires remarquables de l’Afrique, les personnes qui
            ont façonné sa culture et les créations qui continuent d’influencer la manière dont le
            continent se perçoit et dont le monde le regarde.
          </p>
          <p className="media-about__body">
            Nous explorons l’Afrique à travers son histoire, sa littérature, son cinéma, ses
            innovations, ses révolutions, sa musique, son art et celles et ceux qui les font vivre.
          </p>
          <p className="media-about__body">
            À travers des conversations, des reportages, des témoignages et des découvertes, nous
            voulons rendre la culture africaine plus accessible, mieux comprise et, surtout, plus
            captivante à explorer.
          </p>
        </div>
        <aside className="media-about__mission-aside">
          <blockquote className="media-about__quote">
            Rendre la culture africaine plus accessible, mieux comprise et plus captivante à
            explorer.
          </blockquote>
        </aside>
      </section>

      {/* Visuel plein largeur — ancre visuelle réelle */}
      <figure className="media-about__bleed">
        <img
          src={IMG.mission}
          alt="Univers éditorial Neno"
          className="media-about__bleed-img"
          loading="lazy"
        />
        <figcaption className="media-about__bleed-cap">
          Des récits pour élargir le regard — au rythme de l&apos;actualité et des conversations.
        </figcaption>
      </figure>

      {/* Formats : liste numérotée verticale, pas de cartes */}
      <section className="media-about__formats">
        <header className="media-about__formats-head">
          <p className="media-about__eyebrow">Ce que nous publions</p>
          <h2 className="media-about__heading">Trois formats, une même exigence</h2>
        </header>
        <ol className="media-about__format-list">
          {formats.map((f) => (
            <li key={f.num} className="media-about__format-row">
              <span className="media-about__format-num" aria-hidden>
                {f.num}
              </span>
              <div className="media-about__format-text">
                <h3 className="media-about__format-title">{f.titre}</h3>
                <p className="media-about__body media-about__body--tight">{f.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Clôture : image en fond + texte + actions */}
      <section className="media-about__close">
        <img
          src={IMG.formats}
          alt=""
          className="media-about__close-img"
          loading="lazy"
        />
        <div className="media-about__close-veil" aria-hidden />
        <div className="media-about__close-inner">
          <p className="media-about__eyebrow media-about__eyebrow--light">Chez Neno</p>
          <h2 className="media-about__close-title">
            La culture africaine, à explorer
          </h2>
          <p className="media-about__close-text">
            Conversations, reportages, témoignages et découvertes — pour rendre l’Afrique plus
            accessible, mieux comprise et plus captivante.
          </p>
          <div className="media-about__close-actions">
            <Link to="/media" className="media-about__cta media-about__cta--solid">
              Explorer les articles
            </Link>
            <Link to="/contact" className="media-about__cta-ghost">
              Nous écrire
            </Link>
            <Link to="/a-propos" className="media-about__cta-ghost">
              Maison d&apos;édition
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
