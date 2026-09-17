type ProductionLogoProps = {
  on: "dark" | "light";
  className?: string;
};

export function ProductionLogo({ on, className = "" }: ProductionLogoProps) {
  const src = on === "dark" ? "/images/itobe-prod-black.png" : "/images/itobe-prod-white.png";
  return (
    <img
      src={src}
      alt="Itobe Productions"
      className={["prod-logo", on === "dark" ? "prod-logo--dark" : "prod-logo--light", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
