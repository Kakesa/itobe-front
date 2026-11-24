/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/production/motion-reveal";
import { studio } from "@/lib/production/studio-data";
import { useProductionCopy } from "@/lib/production/copy";
import { ContactApi } from "@/lib/api-client";

export const Route = createFileRoute("/production/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Itobe Production" },
      {
        name: "description",
        content:
          "Contact Itobe Production in Kinshasa to start a conversation about production, partnerships, and projects in development.",
      },
      { property: "og:title", content: "Contact — Itobe Production" },
      { property: "og:url", content: "/production/contact" },
    ],
    links: [{ rel: "canonical", href: "/production/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const t = useProductionCopy();
  const [sent, setSent] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const donnees = new FormData(form);
    const name = String(donnees.get("name") ?? "").trim();
    const email = String(donnees.get("email") ?? "").trim();
    const subject = String(donnees.get("subject") ?? "").trim();
    const message = String(donnees.get("message") ?? "").trim();
    const company = String(donnees.get("company") ?? "").trim();
    if (name.length < 2 || subject.length < 2 || message.length < 10 || !email.includes("@")) {
      setErreur("Vérifiez les champs obligatoires.");
      return;
    }
    setErreur("");
    setEnvoi(true);
    try {
      await ContactApi.send({
        name,
        email,
        subject: company ? `${subject} — ${company}` : subject,
        message,
        company_website: String(donnees.get("company_website") ?? ""),
      });
      setSent(true);
      form.reset();
    } catch {
      setErreur("L'envoi a échoué. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  }
  return (
    <div className="page-shell">
      <section className="mx-auto max-w-screen-2xl px-5 pb-10 pt-40 md:px-10 md:pb-14 md:pt-52 lg:px-14">
        <h1 className="section-label inline-flex items-center gap-2.5">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          {t.contact.kicker}
        </h1>
      </section>
      <section className="mx-auto grid max-w-screen-2xl gap-20 px-5 pb-32 md:grid-cols-[0.85fr_1.5fr] md:px-10 md:pb-44 lg:px-14">
        <Reveal className="space-y-10 text-sm">
          <div>
            <p className="max-w-sm text-lg leading-8 text-muted-foreground">{t.contact.business}</p>
            <a href={`mailto:${studio.email}`} className="mt-3 block text-base">
              {studio.email}
            </a>
          </div>
          <div>
            <p className="section-label">{t.contact.studio}</p>
            <p className="mt-3 max-w-xs leading-7">
              {t.studio.address}
              <br />
              {studio.phone}
            </p>
          </div>
          <div>
            <p className="section-label">{t.contact.follow}</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              {["Instagram", "LinkedIn", "YouTube"].map((label) => (
                <a
                  key={label}
                  href={`https://${label.toLowerCase()}.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  {label}
                  <ArrowUpRight className="size-3" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal>
          <form onSubmit={handleSubmit} className="grid gap-x-6 gap-y-8 md:grid-cols-2">
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <Field label={t.contact.name} name="name" required />
            <Field label={t.contact.email} name="email" type="email" required />
            <Field label={t.contact.company} name="company" />
            <Field label={t.contact.subject} name="subject" required />
            <label className="form-field md:col-span-2">
              <span>{t.contact.message} *</span>
              <textarea name="message" rows={5} required />
            </label>
            <div className="md:col-span-2">
              {sent ? (
                <p className="flex items-center gap-2 text-sm" role="status">
                  <Check className="size-4" /> {t.contact.thanks}
                </p>
              ) : (
                <Button type="submit" variant="cinematic" size="lg" disabled={envoi}>
                  {envoi ? "…" : t.contact.send}
                </Button>
              )}
              {erreur ? <p className="mt-3 text-sm text-destructive" role="status">{erreur}</p> : null}
              <p className="mt-5 max-w-lg text-xs leading-5 text-muted-foreground">{t.contact.note}</p>
            </div>
          </form>
        </Reveal>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="form-field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <input name={name} type={type} required={required} />
    </label>
  );
}
