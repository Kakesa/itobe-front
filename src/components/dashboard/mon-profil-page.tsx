import { MonProfilPanel } from "@/components/dashboard/mon-profil-panel";

export function MonProfilPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Paramètres
        </p>
        <h2 className="mt-1 font-display text-3xl">Mon profil</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Informations personnelles, notifications et sécurité — disponible pour tous les comptes.
        </p>
      </div>
      <MonProfilPanel />
    </div>
  );
}
