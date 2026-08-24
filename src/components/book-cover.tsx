import type { Livre } from "@/lib/data";

type BookCoverProps = {
  livre: Pick<Livre, "titre" | "sousTitre" | "couleur"> & { couverture?: string };
  className?: string;
  /** Effet 3D au survol + reflet */
  animated?: boolean;
  /** Animation d'entrée ou flottement */
  variant?: "default" | "reveal" | "float";
  /** Présentation réaliste (fiche produit) : reliure, coins arrondis, tranche */
  realistic?: boolean;
  /** Taille d'affichage */
  size?: "default" | "card";
  /** Inclinaison 3D pour la galerie fiche livre */
  tilt?: "face" | "spine" | "edge";
};

const variantClass: Record<NonNullable<BookCoverProps["variant"]>, string> = {
  default: "",
  reveal: "animate-book-cover-reveal",
  float: "animate-book-float",
};

const tiltClass: Record<NonNullable<BookCoverProps["tilt"]>, string> = {
  face: "book-realistic--tilt-face",
  spine: "book-realistic--tilt-spine",
  edge: "book-realistic--tilt-edge",
};

function CoverContent({
  livre,
  image,
}: {
  livre: Pick<Livre, "titre" | "sousTitre" | "couleur">;
  image?: string;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={`Couverture — ${livre.titre}`}
        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        draggable={false}
      />
    );
  }

  return (
    <>
      <span className="relative z-1 text-[0.6rem] uppercase tracking-[0.2em] text-white/70">
        Itobe Éditions
      </span>
      <div className="relative z-1">
        <p className="font-display text-lg leading-tight text-white">{livre.titre}</p>
        {livre.sousTitre && <p className="mt-1 text-[0.7rem] text-white/70">{livre.sousTitre}</p>}
      </div>
    </>
  );
}

export function BookCover({
  livre,
  className = "",
  animated = false,
  variant = "default",
  realistic = false,
  size = "default",
  tilt = "face",
}: BookCoverProps) {
  const image = livre.couverture?.trim();
  const sizeClass = size === "card" ? "book-realistic--card" : "";

  if (realistic) {
    return (
      <div
        className={[
          "book-realistic group",
          sizeClass,
          tiltClass[tilt],
          animated ? "book-realistic-wrap book-realistic--interactive" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="book-realistic__stage" aria-hidden />
        <div
          className={["book-realistic__body", variantClass[variant], className].filter(Boolean).join(" ")}
        >
          <div className="book-realistic__spine" aria-hidden>
            <span className="book-realistic__spine-groove" />
          </div>

          <div
            className={`book-realistic__cover ${!image ? "flex flex-col justify-between p-4" : ""}`}
            style={!image ? { backgroundImage: livre.couleur } : undefined}
          >
            <CoverContent livre={livre} image={image} />
            <span className="book-realistic__spine-fold" aria-hidden />
            <span className="book-realistic__gloss" aria-hidden />
            {animated && (
              <span aria-hidden className="book-cover-shine book-realistic__shine pointer-events-none absolute inset-0 z-2" />
            )}
            <span className="book-realistic__corner book-realistic__corner--tr" aria-hidden />
            <span className="book-realistic__corner book-realistic__corner--br" aria-hidden />
          </div>

          <div className="book-realistic__fore-edge" aria-hidden>
            <span className="book-realistic__fore-highlight" />
          </div>
          <div className="book-realistic__pages-top" aria-hidden />
          <div className="book-realistic__pages-bottom" aria-hidden>
            <span className="book-realistic__pages-layer" />
          </div>
        </div>
        <div className="book-realistic__shadow" aria-hidden />
        <div className="book-realistic__shadow book-realistic__shadow--soft" aria-hidden />
      </div>
    );
  }

  const shellClass = [
    "book-spine relative aspect-[2/3] overflow-hidden rounded-sm no-select",
    animated ? "book-cover-3d" : "",
    variantClass[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const shine = animated ? (
    <span aria-hidden className="book-cover-shine pointer-events-none absolute inset-0 z-2" />
  ) : null;

  if (image) {
    return (
      <div className={shellClass}>
        <CoverContent livre={livre} image={image} />
        {shine}
      </div>
    );
  }

  return (
    <div
      className={`${shellClass} flex flex-col justify-between p-4`}
      style={{ backgroundImage: livre.couleur }}
    >
      <CoverContent livre={livre} />
      {shine}
    </div>
  );
}

type BookCoverThumbProps = {
  livre: Pick<Livre, "couleur"> & { couverture?: string };
  className?: string;
  active?: boolean;
  label?: string;
  onClick?: () => void;
};

/** Miniature réaliste pour la galerie sous la couverture principale */
export function BookCoverThumb({
  livre,
  className = "",
  active = false,
  label,
  onClick,
}: BookCoverThumbProps) {
  const image = livre.couverture?.trim();
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={label}
      aria-pressed={onClick ? active : undefined}
      className={[
        "book-realistic-thumb",
        active ? "book-realistic-thumb--active" : "",
        onClick ? "book-realistic-thumb--clickable" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="book-realistic-thumb__spine" aria-hidden />
      <div
        className="book-realistic-thumb__face"
        style={
          image
            ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundImage: livre.couleur }
        }
      />
      <div className="book-realistic-thumb__edge" aria-hidden />
      <span className="book-realistic-thumb__gloss" aria-hidden />
    </Tag>
  );
}
