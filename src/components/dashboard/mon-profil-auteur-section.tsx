import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Loader2 } from "lucide-react";
import { AuteursApi } from "@/lib/api-client";
import { AuthorAvatar } from "@/components/author-avatar";
import { hydratePublicData } from "@/lib/data";
import { resolveMediaUrl } from "@/lib/media-url";

type FicheAuteur = {
  slug: string;
  nom: string;
  role: string;
  bio: string;
  photo?: string;
};

export function MonProfilAuteurSection() {
  const [fiche, setFiche] = useState<FicheAuteur | null>(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let actif = true;
    void (async () => {
      try {
        const res = await AuteursApi.getMyProfile();
        const a = res?.data ?? res;
        if (!actif || !a?.slug) return;
        setFiche({
          slug: String(a.slug),
          nom: String(a.nom ?? ""),
          role: String(a.role ?? ""),
          bio: String(a.bio ?? ""),
          ...(resolveMediaUrl(a.photo) ? { photo: resolveMediaUrl(a.photo) } : {}),
        });
        setBio(String(a.bio ?? ""));
      } catch {
        if (actif) setFiche(null);
      } finally {
        if (actif) setLoading(false);
      }
    })();
    return () => {
      actif = false;
    };
  }, []);

  const enregistrerBio = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await AuteursApi.updateMyBio(bio.trim());
      const a = res?.data ?? res;
      if (a?.bio !== undefined) {
        setBio(String(a.bio));
        setFiche((prev) => (prev ? { ...prev, bio: String(a.bio) } : prev));
      }
      await hydratePublicData();
      setMessage("Biographie enregistrée — visible sur votre fiche publique.");
    } catch {
      setMessage("Impossible d'enregistrer la biographie. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement de votre fiche auteur…
        </div>
      </section>
    );
  }

  if (!fiche) return null;

  return (
    <section className="rounded-xl border border-brand-gold/25 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AuthorAvatar auteur={fiche} />
          <div>
            <h2 className="text-xl">Ma fiche auteur</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {fiche.nom} · {fiche.role}
            </p>
          </div>
        </div>
        <Link
          to="/auteurs/$slug"
          params={{ slug: fiche.slug }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-gold hover:underline"
        >
          Voir la fiche publique
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      <label className="mt-5 block text-sm">
        <span className="text-xs text-muted-foreground">Biographie détaillée</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          Séparez les paragraphes par une ligne vide. Ce texte apparaît sur votre page auteur.
        </span>
        <textarea
          rows={8}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Présentez votre parcours, vos thèmes d'écriture, vos publications…"
          className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand-gold"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void enregistrerBio()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-sm bg-brand-gold px-4 py-2 text-sm font-medium text-brand-brown hover:opacity-90 disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Enregistrer la biographie
        </button>
        {message && (
          <p className={`text-xs ${message.includes("Impossible") ? "text-destructive" : "text-brand-gold"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
