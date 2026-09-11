import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";

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

function AProposMedia() {
  const { locale, t } = useI18n();
  const a = t.mediaAbout;

  useEffect(() => {
    document.title = a.metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", a.metaDescription);
  }, [a.metaTitle, a.metaDescription, locale]);

  const formats = [
    { num: "01", ...a.formats.analyses },
    { num: "02", ...a.formats.entretiens },
    { num: "03", ...a.formats.debats },
  ];

  return (
    <div className="media-about">
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
          <h1 className="media-about__title">{a.heroTitle}</h1>
          <p className="media-about__lead">{a.heroLead}</p>
          <Link to="/media" className="media-about__cta">
            {a.ctaBlog}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="media-about__mission">
        <div className="media-about__mission-copy">
          <p className="media-about__eyebrow">{a.eyebrow}</p>
          <h2 className="media-about__heading">{a.heading}</h2>
          <p className="media-about__body">{a.p1}</p>
          <p className="media-about__body">{a.p2}</p>
          <p className="media-about__body">{a.p3}</p>
        </div>
        <aside className="media-about__mission-aside">
          <blockquote className="media-about__quote">{a.quote}</blockquote>
        </aside>
      </section>

      <figure className="media-about__bleed">
        <img
          src={IMG.mission}
          alt={a.bleedAlt}
          className="media-about__bleed-img"
          loading="lazy"
        />
        <figcaption className="media-about__bleed-cap">{a.bleedCap}</figcaption>
      </figure>

      <section className="media-about__formats">
        <header className="media-about__formats-head">
          <p className="media-about__eyebrow">{a.formatsEyebrow}</p>
          <h2 className="media-about__heading">{a.formatsTitle}</h2>
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

      <section className="media-about__close">
        <img src={IMG.formats} alt="" className="media-about__close-img" loading="lazy" />
        <div className="media-about__close-veil" aria-hidden />
        <div className="media-about__close-inner">
          <p className="media-about__eyebrow media-about__eyebrow--light">{a.closeEyebrow}</p>
          <h2 className="media-about__close-title">{a.closeTitle}</h2>
          <p className="media-about__close-text">{a.closeText}</p>
          <div className="media-about__close-actions">
            <Link to="/media" className="media-about__cta media-about__cta--solid">
              {a.ctaArticles}
            </Link>
            <Link to="/contact" className="media-about__cta-ghost">
              {a.ctaWrite}
            </Link>
            <Link to="/a-propos" className="media-about__cta-ghost">
              {a.ctaEdition}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
