import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Itobe Entreprise" },
      {
        name: "description",
        content:
          "Quelles données Itobe collecte, pourquoi, combien de temps elles sont gardées, et comment les consulter ou les supprimer.",
      },
      { property: "og:title", content: "Politique de confidentialité — Itobe" },
      { property: "og:url", content: "/confidentialite" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "/confidentialite" }],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  const { locale } = useI18n();
  const anglais = locale === "en";

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ITOBE Entreprise</p>
      <h1 className="mt-2 font-display text-4xl">
        {anglais ? "Privacy policy" : "Politique de confidentialité"}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {anglais
          ? "This page describes the data the site actually collects. It does not promise practices the application does not implement."
          : "Cette page décrit les données que le site collecte vraiment. Elle ne promet pas de pratiques que l'application ne met pas en œuvre."}
      </p>

      <Section titre={anglais ? "Who is responsible" : "Responsable"}>
        {anglais
          ? "ITOBE Entreprise, Kinshasa. For a request about your data, write to contact@itobe.cd or use the contact form."
          : "ITOBE Entreprise, Kinshasa. Pour une demande sur vos données, écrivez à contact@itobe.cd ou utilisez le formulaire de contact."}
      </Section>

      <Section titre={anglais ? "What we collect" : "Données collectées"}>
        {anglais ? (
          <ul className="list-disc space-y-2 pl-5">
            <li>Account: name, email, hashed password, role, and the profile fields you fill in (phone, address, city, photo).</li>
            <li>Contact form: name, email, subject and message.</li>
            <li>Newsletter: email address, and your name if you provide it.</li>
            <li>Orders and library: the books you buy or save, linked to your account.</li>
            <li>A random visitor identifier stored in your browser, used to count visits. It is not your name.</li>
          </ul>
        ) : (
          <ul className="list-disc space-y-2 pl-5">
            <li>Compte : nom, e-mail, mot de passe haché, rôle, et les champs de profil que vous remplissez (téléphone, adresse, ville, photo).</li>
            <li>Formulaire de contact : nom, e-mail, sujet et message.</li>
            <li>Newsletter : adresse e-mail, et le nom si vous le donnez.</li>
            <li>Commandes et bibliothèque : les livres achetés ou enregistrés, liés à votre compte.</li>
            <li>Un identifiant de visite aléatoire dans le navigateur, pour compter les visites. Ce n'est pas votre nom.</li>
          </ul>
        )}
      </Section>

      <Section titre={anglais ? "Why" : "Pourquoi"}>
        {anglais
          ? "To create your account, answer your messages, send the newsletter you requested, deliver the books you buy, and understand which pages are visited."
          : "Pour créer votre compte, répondre à vos messages, envoyer la newsletter que vous avez demandée, livrer les livres achetés, et savoir quelles pages sont visitées."}
      </Section>

      <Section titre={anglais ? "How long" : "Conservation"}>
        {anglais
          ? "Account data stays while the account exists. You can delete your account from your profile. Contact messages and newsletter addresses stay until an administrator deletes them. The site does not state a shorter automatic deletion delay, because none is programmed."
          : "Les données du compte restent tant que le compte existe. Vous pouvez supprimer le compte depuis votre profil. Les messages de contact et les adresses de newsletter restent jusqu'à ce qu'un administrateur les supprime. Le site n'annonce pas de délai plus court, parce qu'aucun effacement automatique n'est programmé."}
      </Section>

      <Section titre={anglais ? "Security" : "Sécurité"}>
        {anglais
          ? "Passwords are stored as a hash, not in clear text. Access to administration requires a signed token. The connection token is kept in the browser's local storage: a script running on the page could read it. That is a limit of the current setup, not a certificate of invulnerability."
          : "Les mots de passe sont stockés sous forme de hash, pas en clair. L'accès à l'administration exige un jeton signé. Ce jeton de connexion est gardé dans le stockage local du navigateur : un script exécuté sur la page pourrait le lire. C'est une limite du dispositif actuel, pas un certificat d'invulnérabilité."}
      </Section>

      <Section titre={anglais ? "Third parties" : "Services tiers"}>
        {anglais
          ? "Images uploaded by the team can be stored on Cloudinary when that service is configured. The media portal can display videos from YouTube. The site loads its fonts from Google Fonts. These services receive the technical data needed to deliver the file, the video or the font."
          : "Les images téléversées par l'équipe peuvent être stockées sur Cloudinary lorsque ce service est configuré. Le portail média peut afficher des vidéos YouTube. Le site charge ses polices depuis Google Fonts. Ces services reçoivent les données techniques nécessaires pour fournir le fichier, la vidéo ou la police."}
      </Section>

      <Section titre={anglais ? "Your rights" : "Vos droits"}>
        {anglais
          ? "You can ask what data is attached to your email, ask for a correction, or ask for deletion. Account deletion is available in the profile. Other requests go to contact@itobe.cd. The site does not sell your data."
          : "Vous pouvez demander quelles données sont liées à votre e-mail, demander une correction, ou demander la suppression. La suppression du compte est disponible dans le profil. Les autres demandes se font à contact@itobe.cd. Le site ne vend pas vos données."}
      </Section>

      <p className="mt-10">
        <Link to="/" className="text-sm underline-offset-2 hover:underline">
          {anglais ? "Back to home" : "Retour à l'accueil"}
        </Link>
      </p>
    </article>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">{titre}</h2>
      <div className="mt-3 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
