import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Select value={value} onValueChange={(v) => onChange(v as PeriodeFiltre)}>
      <SelectTrigger className="h-9 w-[11.5rem] bg-background text-sm">
        <SelectValue placeholder="Période" />
      </SelectTrigger>
      <SelectContent align="end">
        {OPTIONS.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
