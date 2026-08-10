import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  ouvert,
  titre,
  message,
  confirmer = "Supprimer",
  onConfirmer,
  onAnnuler,
  destructif = true,
}: {
  ouvert: boolean;
  titre: string;
  message: string;
  confirmer?: string;
  onConfirmer: () => void;
  onAnnuler: () => void;
  destructif?: boolean;
}) {
  useEffect(() => {
    if (!ouvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onAnnuler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ouvert, onAnnuler]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0" onClick={onAnnuler} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={titre}
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-full ${
              destructif ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"
            }`}
          >
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-xl">{titre}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-lg border border-border px-4 py-2 text-sm"
          >
            Annuler
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirmer}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              destructif
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {confirmer}
          </button>
        </div>
      </div>
    </div>
  );
}
