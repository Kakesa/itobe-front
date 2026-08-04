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
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [envoye, setEnvoye] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="kicker">Contact</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Parlons de votre projet</h1>

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_280px]">
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
