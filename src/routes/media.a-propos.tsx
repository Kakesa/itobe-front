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
      { title: "À propos — Itobe Média" },
      {
        name: "description",
        content:
          "Itobe Média : analyses, chroniques et entretiens pour éclairer la culture, la société et les idées africaines contemporaines.",
      },
      { property: "og:title", content: "À propos — Itobe Média" },
      {
        property: "og:description",
        content:
          "Un média panafricain d’idées : enquêtes, culture, débats et interviews.",
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
          <p className="media-about__brand">Itobe Média</p>
          <h1 className="media-about__title">
            Informer.
            <br />
            Éclairer.
            <br />
            Faire dialoguer.
          </h1>
          <p className="media-about__lead">
            Analyses, chroniques et entretiens autour de la culture et des idées africaines
            contemporaines.
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
          <p className="media-about__eyebrow">Mission</p>
          <h2 className="media-about__heading">
            Une information exigeante sur l&apos;Afrique qui pense et crée
          </h2>
          <p className="media-about__body">
            Nous produisons des récits journalistiques sur la culture, l&apos;innovation et la
            société — pour un public curieux, connecté au monde, et fatigué du bruit.
          </p>
          <p className="media-about__body">
            Profondeur plutôt que viralité. Contexte plutôt que sensationnel. Des voix multiples
            plutôt qu&apos;une seule narration.
          </p>
        </div>
        <aside className="media-about__mission-aside">
          <blockquote className="media-about__quote">
            Raconter l&apos;Afrique qui pense, crée et transforme.
          </blockquote>
        </aside>
      </section>

      {/* Visuel plein largeur — ancre visuelle réelle */}
      <figure className="media-about__bleed">
        <img
          src={IMG.mission}
          alt="Univers éditorial Itobe Média"
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
          <p className="media-about__eyebrow media-about__eyebrow--light">Chez Itobe Média</p>
          <h2 className="media-about__close-title">
            Le prolongement écrit des conversations Itobe
          </h2>
          <p className="media-about__close-text">
            La maison d&apos;édition porte les livres ; le portail Média porte le rythme du débat,
            des interviews et des chroniques.
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
