import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { ContactApi } from "@/lib/api-client";

export const Route = createFileRoute("/entreprise/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ITOBE Entreprises" },
      {
        name: "description",
        content:
          "Contactez ITOBE Entreprises pour un partenariat, une demande presse ou un projet à l'échelle du groupe.",
      },
      { property: "og:title", content: "Contact — ITOBE Entreprises" },
      {
        property: "og:description",
        content: "Partenariats, presse et projets groupe — ITOBE Entreprises.",
      },
      { property: "og:url", content: "/entreprise/contact" },
    ],
    links: [{ rel: "canonical", href: "/entreprise/contact" }],
  }),
  component: EntrepriseContact,
});

const sujets = [
  { value: "partenariat", label: "Partenariat" },
  { value: "presse", label: "Presse" },
  { value: "projet", label: "Projet de groupe" },
  { value: "autre", label: "Autre" },
] as const;

function EntrepriseContact() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState<(typeof sujets)[number]["value"]>("partenariat");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [statut, setStatut] = useState<{ ok: boolean; texte: string } | null>(null);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatut(null);
    setEnvoi(true);
    const sujetLabel = sujets.find((s) => s.value === sujet)?.label ?? sujet;
    try {
      await ContactApi.send({
        name: nom.trim(),
        email: email.trim(),
        subject: `ITOBE Entreprises — ${sujetLabel}`,
        message: message.trim(),
      });
      setStatut({ ok: true, texte: "Message envoyé. Nous vous répondrons bientôt." });
      setNom("");
      setEmail("");
      setSujet("partenariat");
      setMessage("");
    } catch {
      setStatut({
        ok: false,
        texte: "L'envoi a échoué. Réessayez ou écrivez-nous à contact@itobe.cd.",
      });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-[1fr_240px]">
      <div>
        <p className="text-[0.78rem] font-semibold uppercase tracking-brand text-muted-foreground">
          Contact
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
          Écrire au groupe
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Partenariats, presse, recrutement ou projet transversal : ce formulaire
          s&apos;adresse à ITOBE Entreprises, pas aux portails.
        </p>

        <form className="mt-10 space-y-4" onSubmit={envoyer}>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              name="name"
              autoComplete="name"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom"
              aria-label="Nom"
              className="rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-foreground"
            />
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              className="rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <select
            value={sujet}
            onChange={(e) =>
              setSujet(e.target.value as (typeof sujets)[number]["value"])
            }
            aria-label="Sujet"
            className="w-full rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-foreground"
          >
            {sujets.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <textarea
            required
            name="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Votre message"
            aria-label="Message"
            className="w-full rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            disabled={envoi}
            className="rounded-sm bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-60"
          >
            {envoi ? "Envoi…" : "Envoyer"}
          </button>
          {statut && (
            <p
              className={statut.ok ? "text-sm text-foreground" : "text-sm text-destructive"}
              role="status"
            >
              {statut.texte}
            </p>
          )}
        </form>
      </div>

      <aside className="space-y-6 text-sm md:pt-24">
        <div className="flex gap-3">
          <MapPin className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            Avenue de la Libération
            <br />
            Kinshasa, RDC
          </p>
        </div>
        <div className="flex gap-3">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <a href="mailto:contact@itobe.cd" className="text-muted-foreground hover:text-foreground">
            contact@itobe.cd
          </a>
        </div>
        <div className="flex gap-3">
          <Phone className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">+243 000 000 000</p>
        </div>
      </aside>
    </div>
  );
}
