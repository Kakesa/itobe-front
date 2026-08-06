import type { PeriodeFiltre } from "@/lib/dashboard/types";

const OPTIONS: { id: PeriodeFiltre; label: string }[] = [
  { id: "aujourd-hui", label: "Aujourd'hui" },
  { id: "7j", label: "7 jours" },
  { id: "30j", label: "30 jours" },
  { id: "3m", label: "3 mois" },
  { id: "6m", label: "6 mois" },
  { id: "annee", label: "Cette année" },
  { id: "perso", label: "Personnalisé" },
];

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodeFiltre;
  onChange: (v: PeriodeFiltre) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            value === o.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
