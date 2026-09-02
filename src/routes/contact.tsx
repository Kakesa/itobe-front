import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Itobe Entreprise" },
      {
        name: "description",
        content:
          "Contactez la rédaction ou le service édition d'Itobe : proposition d'article, manuscrit, partenariat ou support lecteur.",
      },
      { property: "og:title", content: "Contact — Itobe Entreprise" },
      { property: "og:description", content: "Rédaction, édition, partenariats et support." },
      { property: "og:url", content: "/contact" },
      { property: "og:image", content: "/images/a-propos/hero.jpg" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [envoye, setEnvoye] = useState(false);

  return (
    <div className="contact-page theme-edition">
      <section className="apropos-page__hero contact-page__hero">
        <img src="/images/a-propos/hero.jpg" alt="" className="apropos-page__hero-bg" fetchPriority="high" />
        <div className="apropos-page__hero-overlay" aria-hidden />
        <div className="apropos-page__hero-content mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <p className="apropos-page__hero-kicker">Contact</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
            Parlons de votre projet.
            <br />
            <span className="text-brand-gold">Construisons la suite ensemble.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-14 md:grid-cols-[1fr_280px]">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setEnvoye(true);
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Nom complet"
              className="rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              required
              type="email"
              placeholder="Adresse e-mail"
              className="rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <select
            className="w-full rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
            defaultValue="Rédaction"
          >
            {["Rédaction", "Proposer un manuscrit", "Partenariat", "Support lecteur"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <textarea
            required
            rows={6}
            placeholder="Votre message…"
            className="w-full rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
          />
          <button className="rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">
            Envoyer le message
          </button>
          {envoye && (
            <p className="text-sm text-accent">Merci, votre message a bien été enregistré.</p>
          )}
        </form>

        <aside className="space-y-6 text-sm">
          <div className="flex gap-3">
            <MapPin className="size-4 shrink-0 text-accent" />
            <p className="text-muted-foreground">
              Avenue de la Libération
              <br />
              Kinshasa, RDC
            </p>
          </div>
          <div className="flex gap-3">
            <Mail className="size-4 shrink-0 text-accent" />
            <p className="text-muted-foreground">contact@itobe.cd</p>
          </div>
          <div className="flex gap-3">
            <Phone className="size-4 shrink-0 text-accent" />
            <p className="text-muted-foreground">+243 000 000 000</p>
          </div>
          <div className="rounded-sm border border-border bg-card p-4">
            <p className="font-display">Horaires</p>
            <p className="mt-2 text-muted-foreground">Lundi – vendredi, 8h – 17h</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
