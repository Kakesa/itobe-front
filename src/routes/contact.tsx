/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { useI18n } from "@/i18n";
import { usePortailActif } from "@/hooks/use-portail";
import { ContactApi } from "@/lib/api-client";

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

function IconeTikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.76-.3 2.89 2.89 0 0 1 2.88-2.9c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.33 6.33A6.34 6.34 0 0 0 10.34 22a6.34 6.34 0 0 0 6.33-6.33V8.73a8.18 8.18 0 0 0 4.77 1.52V6.79a4.84 4.84 0 0 1-1.85-.1z" />
    </svg>
  );
}

const reseaux = [
  { label: "TikTok", href: "https://www.tiktok.com", Icon: IconeTikTok },
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
] as const;

function Contact() {
  const portail = usePortailActif();
  if (portail === "media") return <MediaContact />;
  return <EditionContact />;
}

function MediaContact() {
  const { locale, t } = useI18n();
  const c = t.contact;
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [statut, setStatut] = useState<{ ok: boolean; texte: string } | null>(null);

  useEffect(() => {
    document.title = c.metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", c.metaDescription);
  }, [c.metaTitle, c.metaDescription, locale]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatut(null);
    setEnvoi(true);
    try {
      const piege = new FormData(e.currentTarget).get("company_website");
      await ContactApi.send({
        name: nom.trim(),
        email: email.trim(),
        subject: "Contact Neno",
        message: message.trim(),
        company_website: typeof piege === "string" ? piege : "",
      });
      setStatut({ ok: true, texte: c.success });
      setNom("");
      setEmail("");
      setMessage("");
    } catch {
      setStatut({ ok: false, texte: c.mediaError });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="media-contact">
      <div className="media-contact__inner">
        <h1 className="media-contact__title">{c.mediaTitle}</h1>
        <p className="media-contact__notice">{c.mediaNotice}</p>
        <form className="media-contact__form" onSubmit={envoyer}>
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <input
            required
            name="name"
            autoComplete="name"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder={c.mediaName}
            aria-label={c.mediaName}
            className="media-contact__field"
          />
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.mediaEmail}
            aria-label={c.mediaEmail}
            className="media-contact__field"
          />
          <textarea
            required
            name="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={c.mediaMessage}
            aria-label={c.mediaMessage}
            className="media-contact__field media-contact__message"
          />
          <button type="submit" disabled={envoi} className="media-contact__submit">
            {envoi ? "…" : c.mediaSend}
          </button>
          {statut && (
            <p
              className={`media-contact__status ${statut.ok ? "media-contact__status--ok" : "media-contact__status--err"}`}
              role="status"
            >
              {statut.texte}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function EditionContact() {
  const { locale, t } = useI18n();
  const c = t.contact;
  const [envoye, setEnvoye] = useState(false);
  const [ouvert, setOuvert] = useState<number | null>(0);

  useEffect(() => {
    document.title = c.faqMetaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", c.faqMetaDescription);
  }, [c.faqMetaTitle, c.faqMetaDescription, locale]);

  const questions = [
    { q: c.faqQ1, a: c.faqA1 },
    { q: c.faqQ2, a: c.faqA2 },
    { q: c.faqQ3, a: c.faqA3 },
  ];

  const sujets = [
    { key: "redaction", label: c.sujets.redaction },
    { key: "manuscrit", label: c.sujets.manuscrit },
    { key: "partenariat", label: c.sujets.partenariat },
    { key: "support", label: c.sujets.support },
  ] as const;

  return (
    <div className="contact-page theme-edition">
      <div className="mx-auto max-w-3xl px-4 pt-12 md:pt-16">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">{c.faqTitle}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{c.faqIntro}</p>
        <div className="edition-faq">
          {questions.map((item, i) => {
            const estOuvert = ouvert === i;
            return (
              <div key={item.q} className="edition-faq__item">
                <button
                  type="button"
                  className="edition-faq__question"
                  aria-expanded={estOuvert}
                  onClick={() => setOuvert(estOuvert ? null : i)}
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`edition-faq__chevron${estOuvert ? " is-open" : ""}`} aria-hidden />
                </button>
                {estOuvert ? <p className="edition-faq__answer">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-14 md:pt-20">
        <h2 className="font-display text-3xl leading-tight md:text-4xl">{c.faqNotFound}</h2>
      </div>

      <div className="mx-auto grid max-w-5xl gap-12 px-4 py-8 md:grid-cols-[1fr_280px] md:py-10">
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
              placeholder={c.namePlaceholder}
              className="rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              required
              type="email"
              placeholder={c.emailPlaceholder}
              className="rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <select
            className="w-full rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
            defaultValue="redaction"
          >
            {sujets.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <textarea
            required
            rows={6}
            placeholder={c.messagePlaceholder}
            className="w-full rounded-sm border border-border bg-card px-3 py-3 text-sm outline-none focus:border-accent"
          />
          <button className="rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">
            {c.submit}
          </button>
          {envoye && <p className="text-sm text-accent">{c.success}</p>}
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
          <div>
            <p className="font-display">{c.socials}</p>
            <div className="contact-page__socials mt-3">
              {reseaux.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="contact-page__social"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-border bg-card p-4">
            <p className="font-display">{c.hoursTitle}</p>
            <p className="mt-2 text-muted-foreground">{c.hours}</p>
            <p className="mt-2 text-muted-foreground">{c.hoursReply}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
