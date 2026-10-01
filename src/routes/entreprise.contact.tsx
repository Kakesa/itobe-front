import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { ContactApi } from "@/lib/api-client";
import { useI18n } from "@/i18n";

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

const SUJETS = ["partenariat", "presse", "projet", "autre"] as const;

function EntrepriseContact() {
  const { t } = useI18n();
  const g = t.groupe;
  const sujets = [
    { value: "partenariat" as const, label: g.partenariat },
    { value: "presse" as const, label: g.presse },
    { value: "projet" as const, label: g.projet },
    { value: "autre" as const, label: g.autre },
  ];
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState<(typeof SUJETS)[number]>("partenariat");
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
      setStatut({ ok: true, texte: g.sent });
      setNom("");
      setEmail("");
      setSujet("partenariat");
      setMessage("");
    } catch {
      setStatut({
        ok: false,
        texte: g.sendError,
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
          <h1 className="entreprise-contact__title">{g.contactTitle}</h1>
          <p className="entreprise-contact__lead">{g.contactLead}</p>

          <form className="entreprise-contact__form" onSubmit={envoyer}>
            <div className="entreprise-contact__row">
              <input
                required
                name="name"
                autoComplete="name"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder={g.name}
                aria-label={g.name}
                className="entreprise-contact__field"
              />
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={g.email}
                aria-label={g.email}
                className="entreprise-contact__field"
              />
            </div>
            <select
              value={sujet}
              onChange={(e) =>
                setSujet(e.target.value as (typeof SUJETS)[number])
              }
              aria-label={g.subject}
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
              placeholder={g.message}
              aria-label={g.message}
              className="entreprise-contact__field entreprise-contact__message"
            />
            <button type="submit" disabled={envoi} className="entreprise-contact__submit">
              {envoi ? g.sending : g.send}
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
