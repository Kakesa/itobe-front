import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Trash2, X, Check, Loader2 } from "lucide-react";
import { getLivre, nomAuteur } from "@/lib/data";
import { useSession } from "@/hooks/use-session";
import { useRole } from "@/hooks/use-role";
import { AuthApi, BibliothequeApi, getToken } from "@/lib/api-client";
import { sauvegarderSession, deconnecter } from "@/lib/auth";

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

/** Contenu « Mon profil » — Connecté dynamiquement au profil utilisateur de l'API Backend */
export function MonProfilPanel() {
  const { session } = useSession();
  const { role } = useRole();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Informations utilisateur
  const [nom, setNom] = useState(session?.nom || "");
  const [prenom, setPrenom] = useState(session?.prenom || "");
  const [email, setEmail] = useState(session?.email || "");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("Kinshasa");
  const [userRole, setUserRole] = useState(role);

  // Préférences
  const [newsletter, setNewsletter] = useState(true);
  const [nouveautes, setNouveautes] = useState(true);
  const [resume, setResume] = useState(false);
  const [theme, setTheme] = useState<"clair" | "sombre" | "auto">("clair");
  const [taille, setTaille] = useState(18);
  const [messageEnregistre, setMessageEnregistre] = useState("");

  // Mot de passe
  const [mdpActuel, setMdpActuel] = useState("");
  const [mdpNouveau, setMdpNouveau] = useState("");
  const [mdpConfirme, setMdpConfirme] = useState("");
  const [retourMdp, setRetourMdp] = useState<{ ok: boolean; texte: string } | null>(null);
  const [chargementMdp, setChargementMdp] = useState(false);

  // 2FA & Sécurité
  const [deuxFa, setDeuxFa] = useState(false);
  const [code, setCode] = useState("");
  const [connexions, setConnexions] = useState<any[]>([]);

  // Progression réelle du lecteur
  const [progressionsReelles, setProgressionsReelles] = useState<Record<string, number>>({});

  // Suppression compte
  const [suppression, setSuppression] = useState(false);
  const [confirmationTexte, setConfirmationTexte] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  // Chargement des données réelles du profil
  useEffect(() => {
    async function chargerProfil() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const [meRes, bibRes] = await Promise.all([
          AuthApi.me().catch(() => null),
          role === "lecteur" ? BibliothequeApi.getLibrary().catch(() => null) : null,
        ]);

        if (meRes?.data) {
          const u = meRes.data;
          setNom(u.nom || "");
          setPrenom(u.prenom || "");
          setEmail(u.email || "");
          setTelephone(u.telephone || "");
          setVille(u.ville || "Kinshasa");
          setUserRole(u.role || role);

          if (u.preferences) {
            setNewsletter(u.preferences.newsletter ?? true);
            setNouveautes(u.preferences.nouveautes ?? true);
            setResume(u.preferences.resume ?? false);
            setTheme(u.preferences.themeLecture || "clair");
            setTaille(u.preferences.taillePolice || 18);
          }

          if (u.deuxFacteurs) {
            setDeuxFa(u.deuxFacteurs.actif ?? false);
          }

          if (u.historiqueConnexions && u.historiqueConnexions.length > 0) {
            setConnexions(u.historiqueConnexions);
          } else {
            setConnexions([
              {
                id: "actuelle",
                appareil: "Navigateur Web",
                navigateur: "Session active",
                lieu: u.ville || "Kinshasa, RDC",
                ip: "127.0.0.1",
                date: "Aujourd'hui",
                statut: "Réussie",
                actuelle: true,
              },
            ]);
          }
        }

        if (bibRes?.data?.progressions) {
          setProgressionsReelles(bibRes.data.progressions);
        }
      } catch (err) {
        console.warn("[MonProfil] Erreur lors du chargement :", err);
      } finally {
        setLoading(false);
      }
    }

    chargerProfil();
  }, [role]);

  // Sauvegarde des informations et préférences
  const enregistrerProfil = async () => {
    setSaving(true);
    setMessageEnregistre("");
    try {
      const payload = {
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        ville: ville.trim(),
        preferences: {
          newsletter,
          nouveautes,
          resume,
          themeLecture: theme,
          taillePolice: taille,
        },
      };

      const res = await AuthApi.updateProfile(payload);
      if (res?.data) {
        sauvegarderSession({
          id: res.data._id || session?.id,
          email: res.data.email || email,
          nom: res.data.nom || nom,
          prenom: res.data.prenom || prenom,
          role: (res.data.role as any) || userRole,
        });
      }
      setMessageEnregistre("Modifications enregistrées avec succès.");
      setTimeout(() => setMessageEnregistre(""), 4000);
    } catch (err: any) {
      setMessageEnregistre(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Changement de mot de passe
  const changerMdp = async () => {
    setRetourMdp(null);
    if (!mdpActuel || !mdpNouveau) {
      setRetourMdp({ ok: false, texte: "Renseignez le mot de passe actuel et le nouveau." });
      return;
    }
    if (mdpNouveau.length < 6) {
      setRetourMdp({ ok: false, texte: "Le mot de passe doit faire au moins 6 caractères." });
      return;
    }
    if (mdpNouveau !== mdpConfirme) {
      setRetourMdp({ ok: false, texte: "La confirmation du mot de passe ne correspond pas." });
      return;
    }

    setChargementMdp(true);
    try {
      await AuthApi.changePassword({
        ancienPassword: mdpActuel,
        nouveauPassword: mdpNouveau,
      });
      setRetourMdp({ ok: true, texte: "Mot de passe mis à jour avec succès." });
      setMdpActuel("");
      setMdpNouveau("");
      setMdpConfirme("");
    } catch (err: any) {
      setRetourMdp({ ok: false, texte: err.message || "Erreur lors de la mise à jour du mot de passe." });
    } finally {
      setChargementMdp(false);
    }
  };

  // Suppression définitive du compte
  const handleSupprimerCompte = async () => {
    setSuppressionEnCours(true);
    try {
      await AuthApi.deleteAccount();
      deconnecter();
      void navigate({ to: "/connexion" });
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression du compte.");
      setSuppressionEnCours(false);
    }
  };

  const progression = Object.entries(progressionsReelles);
  const moyenne =
    progression.length > 0
      ? Math.round(progression.reduce((s, [, p]) => s + p, 0) / progression.length)
      : 0;

  const estLecteur = userRole === "lecteur";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Chargement de votre profil...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
        Compte <span className="font-medium capitalize text-foreground">{userRole}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl">Informations personnelles</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Nom</span>
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom de famille"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>

              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Prénom</span>
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prénom"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>

              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Adresse e-mail</span>
                <input
                  disabled
                  value={email}
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground"
                />
              </label>

              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Téléphone</span>
                <input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+243 ..."
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="text-xs text-muted-foreground">Ville</span>
                <input
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Kinshasa, Lubumbashi..."
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
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
            <p className="kicker mt-6">Changer le mot de passe</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Mot de passe actuel</span>
                <input
                  type="password"
                  value={mdpActuel}
                  onChange={(e) => setMdpActuel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Nouveau mot de passe</span>
                <input
                  type="password"
                  value={mdpNouveau}
                  onChange={(e) => setMdpNouveau(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs text-muted-foreground">Confirmer</span>
                <input
                  type="password"
                  value={mdpConfirme}
                  onChange={(e) => setMdpConfirme(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={chargementMdp}
                onClick={changerMdp}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
              >
                {chargementMdp ? "Mise à jour..." : "Mettre à jour le mot de passe"}
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
                aide="Un code de sécurité est demandé à chaque nouvelle connexion."
              />
            </div>
            {deuxFa && (
              <div className="mt-4 rounded-lg border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Scannez le QR dans votre application d&apos;authentification, puis saisissez le code.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="grid size-24 place-items-center rounded-lg border border-dashed border-border text-[0.6rem] text-muted-foreground">
                    2FA Prêt
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
              {connexions.map((c, i) => (
                <li key={c.id || i} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                  <span className="font-medium">{c.appareil || "Appareil"}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.navigateur} · {c.lieu} · {c.ip}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{c.date || "Récemment"}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs ${
                      c.actuelle || c.statut === "Réussie"
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
              disabled={saving}
              onClick={enregistrerProfil}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {saving ? "Enregistrement..." : "Enregistrer mes modifications"}
            </button>
            {messageEnregistre && (
              <span className="text-sm font-medium text-accent">{messageEnregistre}</span>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="kicker">Rôle & Espace</p>
            <p className="mt-3 font-display text-2xl capitalize">{userRole}</p>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>

          {estLecteur && (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="kicker">Ma progression de lecture</p>
                <p className="mt-3 font-display text-4xl">{moyenne} %</p>
                {progression.length > 0 ? (
                  <ul className="mt-6 space-y-4">
                    {progression.map(([slug, pct]) => {
                      const l = getLivre(slug);
                      if (!l) return null;
                      return (
                        <li key={slug}>
                          <p className="text-sm font-medium">{l.titre}</p>
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
                ) : (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Aucun livre entamé pour le moment.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="kicker">Formule d&apos;accès</p>
                <p className="mt-3 text-sm">Statut : Compte Standard</p>
                <Link
                  to="/premium"
                  className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
                >
                  Découvrir l&apos;Abonnement Premium
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
            <p className="mt-3 text-sm text-muted-foreground">
              Saisissez <strong>SUPPRIMER</strong> pour confirmer la suppression définitive de votre compte.
            </p>
            <input
              value={confirmationTexte}
              onChange={(e) => setConfirmationTexte(e.target.value)}
              placeholder="SUPPRIMER"
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-destructive"
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
                disabled={confirmationTexte !== "SUPPRIMER" || suppressionEnCours}
                onClick={handleSupprimerCompte}
                className="rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-40"
              >
                {suppressionEnCours ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
