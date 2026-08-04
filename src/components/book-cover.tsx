import type { Livre } from "@/lib/data";

export function BookCover({
  livre,
  className = "",
}: {
  livre: Livre;
  className?: string;
}) {
  return (
    <div
      className={`book-spine relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-sm p-4 no-select ${className}`}
      style={{ backgroundImage: livre.couleur }}
    >
      <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/70">Itobe Éditions</span>
      <div>
        <p className="font-display text-lg leading-tight text-white">{livre.titre}</p>
        {livre.sousTitre && (
          <p className="mt-1 text-[0.7rem] text-white/70">{livre.sousTitre}</p>
        )}
      </div>
    </div>
  );
}
