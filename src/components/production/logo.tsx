type ProductionLogoProps = {
  on: "dark" | "light";
  className?: string;
};

export function ProductionLogo({ on, className = "" }: ProductionLogoProps) {
  const src = on === "dark" ? "/images/itobe-prod-mark-white.png" : "/images/itobe-prod-mark-black.png";
  return (
    <img
      src={src}
      alt="Itobe Productions"
      className={["prod-logo", className].filter(Boolean).join(" ")}
    />
  );
}
