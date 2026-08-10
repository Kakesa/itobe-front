import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Trash2, X } from "lucide-react";
import { bibliotheque, getLivre, nomAuteur } from "@/lib/data";
import { connexions } from "@/lib/admin-data";
import { useSession } from "@/hooks/use-session";
import { useRole } from "@/hooks/use-role";

function Interrupteur({
  actif,
  onChange,
  label,
  aide,
}: {
  actif: boolean;
  onChange: (v: boolean) => void;
  label: string;
  aide: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{aide}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        aria-label={label}
        onClick={() => onChange(!actif)}
        className={`mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
          actif ? "bg-accent" : "bg-secondary"
        }`}
      >
        <span
          className={`block size-5 rounded-full bg-background transition-transform ${
            actif ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/** Contenu « Mon profil » — tous les rôles (admin, éditeur, lecteur). */
export function MonProfilPanel() {
  const { session } = useSession();
  const { role } = useRole();

  const nomDefaut = session
    ? `${session.prenom} ${session.nom}`
    : role === "admin"
      ? "Espoir Kakesa"
      : role === "editeur"
        ? "Christopher Bigo's"
        : "Nadia Kabeya";
  const emailDefaut =
    session?.email ??
    (role === "admin"
      ? "admin@itobe.cd"
      : role === "editeur"
        ? "editeur@itobe.cd"
        : "nadia.kabeya@example.cd");

  const [newsletter, setNewsletter] = useState(true);
  const [nouveautes, setNouveautes] = useState(true);
  const [resume, setResume] = useState(false);
  const [theme, setTheme] = useState<"clair" | "sombre" | "auto">("clair");
  const [taille, setTaille] = useState(18);
  const [enregistre, setEnregistre] = useState(false);

  const [mdpActuel, setMdpActuel] = useState("");
  const [mdpNouveau, setMdpNouveau] = useState("");
  const [mdpConfirme, setMdpConfirme] = useState("");
  const [retourMdp, setRetourMdp] = useState<{ ok: boolean; texte: string } | null>(null);
  const [deuxFa, setDeuxFa] = useState(false);
  const [code, setCode] = useState("");
  const [suppression, setSuppression] = useState(false);
  const [confirmationTexte, setConfirmationTexte] = useState("");
  const [compteSupprime, setCompteSupprime] = useState(false);

  const changerMdp = () => {
    if (!mdpActuel || !mdpNouveau) {
      setRetourMdp({ ok: false, texte: "Renseignez le mot de passe actuel et le nouveau." });
      return;
    }
    if (mdpNouveau.length < 8) {
      setRetourMdp({ ok: false, texte: "8 caractères minimum." });
      return;
    }
    if (mdpNouveau !== mdpConfirme) {
      setRetourMdp({ ok: false, texte: "La confirmation ne correspond pas." });
      return;
    }
    setRetourMdp({ ok: true, texte: "Mot de passe mis à jour." });
    setMdpActuel("");
    setMdpNouveau("");
    setMdpConfirme("");
  };

  const progression = Object.entries(bibliotheque.progression);
  const moyenne = Math.round(
    progression.reduce((s, [, p]) => s + p, 0) / Math.max(progression.length, 1),
  );
  const estLecteur = role === "lecteur";

  return (
    <div>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
        Compte <span className="font-medium capitalize text-foreground">{role}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl">Informations</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Nom complet", nomDefaut],
                ["Adresse e-mail", emailDefaut],
                ["Téléphone", "+243 81 000 00 00"],
                ["Ville", "Kinshasa"],
              ].map(([label, valeur]) => (
                <label key={label} className="block text-sm">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <input
                    defaultValue={valeur}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl">Notifications</h2>
            <div className="mt-3">
              <Interrupteur
                actif={newsletter}
                onChange={setNewsletter}
                label="Newsletter hebdomadaire"
                aide="Le meilleur du portail Média, chaque vendredi."
              />
              <Interrupteur
                actif={nouveautes}
                onChange={setNouveautes}
                label="Nouveautés du catalogue"
                aide="Alerte à chaque nouvelle parution ou promotion."
              />
              <Interrupteur
                actif={resume}
                onChange={setResume}
                label="Résumé d'activité mensuel"
                aide="Un récapitulatif envoyé par e-mail chaque mois."
              />
            </div>
          </section>

          {estLecteur && (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-xl">Préférences de lecture</h2>
              <p className="mt-5 text-xs text-muted-foreground">Thème du lecteur</p>
              <div className="mt-2 flex gap-2">
                {(["clair", "sombre", "auto"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                      theme === t
                        ? "bg-accent text-accent-foreground"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">Taille du texte — {taille} px</p>
              <input
                type="range"
                min={14}
                max={26}
                step={1}
                value={taille}
                onChange={(e) => setTaille(Number(e.target.value))}
                aria-label="Taille du texte"
                className="mt-2 w-full accent-[var(--accent)]"
              />
              <p
                className="mt-4 rounded-lg border border-border bg-background p-4 leading-relaxed"
                style={{ fontSize: `${taille}px` }}
              >
                Le matin se levait lentement sur le fleuve, et la ville, encore engourdie, semblait
                relire ses propres pages.
              </p>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent" />
              <h2 className="text-xl">Sécurité du compte</h2>
            </div>
            <p className="kicker mt-6">Mot de passe</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {["Mot de passe actuel", "Nouveau mot de passe", "Confirmer"].map((l, i) => (
                <label key={l} className="block text-sm">
                  <span className="text-xs text-muted-foreground">{l}</span>
                  <input
                    type="password"
                    value={i === 0 ? mdpActuel : i === 1 ? mdpNouveau : mdpConfirme}
                    onChange={(e) =>
                      i === 0
                        ? setMdpActuel(e.target.value)
                        : i === 1
                          ? setMdpNouveau(e.target.value)
                          : setMdpConfirme(e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={changerMdp}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                Mettre à jour le mot de passe
              </button>
              {retourMdp && (
                <span className={`text-sm ${retourMdp.ok ? "text-accent" : "text-destructive"}`}>
                  {retourMdp.texte}
                </span>
              )}
            </div>

            <p className="kicker mt-8">Double authentification (2FA)</p>
            <div className="mt-3">
              <Interrupteur
                actif={deuxFa}
                onChange={(v) => {
                  setDeuxFa(v);
                  setCode("");
                }}
                label="Vérification en deux étapes"
                aide="Un code à 6 chiffres est demandé à chaque nouvelle connexion."
              />
            </div>
            {deuxFa && (
              <div className="mt-4 rounded-lg border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Scannez le QR dans votre application d&apos;authentification, puis saisissez le
                  code.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="grid size-24 place-items-center rounded-lg border border-dashed border-border text-[0.6rem] text-muted-foreground">
                    QR code
                  </div>
                  <div>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      placeholder="000000"
                      aria-label="Code de vérification"
                      className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-center text-sm tracking-[0.3em]"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {code.length === 6 ? "Code valide — 2FA active." : "6 chiffres requis."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="kicker mt-8">Historique des connexions</p>
            <ul className="mt-3 divide-y divide-border text-sm">
              {connexions.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                  <span className="font-medium">{c.appareil}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.navigateur} · {c.lieu} · {c.ip}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{c.date}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs ${
                      c.statut === "Réussie"
                        ? "bg-accent/15 text-accent"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {c.actuelle ? "Session actuelle" : c.statut}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <div className="flex items-center gap-2">
                <Trash2 className="size-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">Supprimer mon compte</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Suppression définitive du compte et des données associées.
              </p>
              <button
                type="button"
                onClick={() => setSuppression(true)}
                className="mt-3 rounded-lg border border-destructive/50 px-4 py-2 text-sm text-destructive"
              >
                Supprimer définitivement
              </button>
            </div>
          </section>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setEnregistre(true)}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Enregistrer mes préférences
            </button>
            {enregistre && <span className="text-sm text-accent">Préférences enregistrées.</span>}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="kicker">Rôle</p>
            <p className="mt-3 font-display text-2xl capitalize">{role}</p>
            <p className="mt-1 text-sm text-muted-foreground">{emailDefaut}</p>
          </div>

          {estLecteur && (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="kicker">Ma progression</p>
                <p className="mt-3 font-display text-4xl">{moyenne} %</p>
                <ul className="mt-6 space-y-4">
                  {progression.map(([slug, pct]) => {
                    const l = getLivre(slug);
                    if (!l) return null;
                    return (
                      <li key={slug}>
                        <p className="text-sm">{l.titre}</p>
                        <p className="text-xs text-muted-foreground">{nomAuteur(l.auteur)}</p>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="kicker">Abonnement</p>
                <p className="mt-3 text-sm">Formule actuelle : Gratuite</p>
                <Link
                  to="/premium"
                  className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
                >
                  Passer à Premium
                </Link>
              </div>
            </>
          )}
        </aside>
      </div>

      {suppression && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-book">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl">Supprimer mon compte</h3>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setSuppression(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            {compteSupprime ? (
              <p className="mt-4 text-sm">Demande enregistrée.</p>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">
                  Saisissez <strong>SUPPRIMER</strong> pour confirmer.
                </p>
                <input
                  value={confirmationTexte}
                  onChange={(e) => setConfirmationTexte(e.target.value)}
                  className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSuppression(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={confirmationTexte !== "SUPPRIMER"}
                    onClick={() => setCompteSupprime(true)}
                    className="rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-40"
                  >
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
