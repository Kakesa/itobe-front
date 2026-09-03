import { AlertTriangle, Download, RefreshCw, Upload } from "lucide-react";

interface ChapterConflictDialogProps {
  ouvert: boolean;
  onFermer: () => void;
  onRecharger: () => void;
  onForcerEcrasement: () => void;
  serverRevision?: number;
}

export function ChapterConflictDialog({
  ouvert,
  onFermer,
  onRecharger,
  onForcerEcrasement,
  serverRevision,
}: ChapterConflictDialogProps) {
  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <div className="grid size-10 place-items-center rounded-full bg-amber-500/10">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-xl text-foreground">Conflit de révision détecté</h3>
            <p className="text-xs text-muted-foreground">
              {serverRevision ? `Le serveur est actuellement à la révision v${serverRevision}.` : ""}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Ce chapitre a été modifié dans un autre onglet ou par une autre session depuis votre dernière
          synchronisation. Pour éviter d'écraser silencieusement le travail en cours, veuillez choisir
          une action :
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => {
              onRecharger();
              onFermer();
            }}
            className="flex w-full items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition hover:border-accent hover:bg-secondary/50"
          >
            <Download className="size-5 shrink-0 text-accent mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Recharger la version serveur</p>
              <p className="text-xs text-muted-foreground">
                Récupère le contenu le plus récent depuis la base de données.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onForcerEcrasement();
              onFermer();
            }}
            className="flex w-full items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition hover:border-destructive hover:bg-destructive/10"
          >
            <Upload className="size-5 shrink-0 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Forcer la sauvegarde locale</p>
              <p className="text-xs text-muted-foreground">
                Écrase la version distante avec le contenu actuellement affiché dans votre éditeur.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
