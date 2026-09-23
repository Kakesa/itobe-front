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
    <div className="entreprise-contact">
      <div className="entreprise-contact__grid">
        <div>
          <p className="entreprise-contact__eyebrow">Contact</p>
          <h1 className="entreprise-contact__title">Écrire au groupe</h1>
          <p className="entreprise-contact__lead">
            Partenariats, presse, recrutement ou projet transversal : ce formulaire
            s&apos;adresse à ITOBE Entreprises, pas aux portails.
          </p>

          <form className="entreprise-contact__form" onSubmit={envoyer}>
            <div className="entreprise-contact__row">
              <input
                required
                name="name"
                autoComplete="name"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom"
                aria-label="Nom"
                className="entreprise-contact__field"
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
                className="entreprise-contact__field"
              />
            </div>
            <select
              value={sujet}
              onChange={(e) =>
                setSujet(e.target.value as (typeof sujets)[number]["value"])
              }
              aria-label="Sujet"
              className="entreprise-contact__field"
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
              className="entreprise-contact__field entreprise-contact__message"
            />
            <button type="submit" disabled={envoi} className="entreprise-contact__submit">
              {envoi ? "Envoi…" : "Envoyer"}
            </button>
            {statut && (
              <p
                className={
                  statut.ok
                    ? "entreprise-contact__status entreprise-contact__status--ok"
                    : "entreprise-contact__status entreprise-contact__status--err"
                }
                role="status"
              >
                {statut.texte}
              </p>
            )}
          </form>
        </div>

        <aside className="entreprise-contact__aside">
          <div className="entreprise-contact__meta">
            <MapPin className="size-4 shrink-0 opacity-60" aria-hidden />
            <p>
              Avenue de la Libération
              <br />
              Kinshasa, RDC
            </p>
          </div>
          <div className="entreprise-contact__meta">
            <Mail className="size-4 shrink-0 opacity-60" aria-hidden />
            <a href="mailto:contact@itobe.cd">contact@itobe.cd</a>
          </div>
          <div className="entreprise-contact__meta">
            <Phone className="size-4 shrink-0 opacity-60" aria-hidden />
            <p>+243 000 000 000</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
