import { resolveMediaUrl } from "@/lib/media-url";

type AuthorLike = {
  nom?: string;
  photo?: string;
};

type AuthorAvatarProps = {
  auteur?: AuthorLike | null;
  nom?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClass = {
  sm: "size-8 text-[0.65rem]",
  md: "size-10 text-xs",
  lg: "size-16 text-xl",
  xl: "size-[11rem] text-4xl md:size-[13.5rem]",
} as const;

export function initialesAuteur(nom: string) {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
}

export function AuthorAvatar({ auteur, nom, size = "md", className = "" }: AuthorAvatarProps) {
  const label = auteur?.nom ?? nom ?? "";
  const photo = resolveMediaUrl(auteur?.photo);
  const shell = `shrink-0 overflow-hidden rounded-full object-cover ${sizeClass[size]} ${className}`.trim();

  if (photo) {
    return <img src={photo} alt={label} className={`block ${shell}`} />;
  }

  return (
    <span
      className={`grid place-items-center rounded-full bg-muted font-semibold text-muted-foreground ${sizeClass[size]} ${className}`.trim()}
      aria-hidden
    >
      {initialesAuteur(label) || "A"}
    </span>
  );
}
