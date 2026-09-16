import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";

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
      { property: "og:image", content: "/images/a-propos/hero.jpg" },
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

  return (
    <div className="media-about">
      <section className="media-about__hero">
        <div className="media-about__hero-inner">
          <p className="media-about__brand">Neno</p>
          <h1 className="media-about__title">{a.heroTitle}</h1>
          <p className="media-about__lead">{a.p1}</p>
          <p className="media-about__lead">{a.p2}</p>
          <p className="media-about__lead">{a.p3}</p>
          <Link to="/media" className="media-about__cta">
            {a.ctaBlog}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
