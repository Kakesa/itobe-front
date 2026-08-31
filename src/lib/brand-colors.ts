/** Palette principale ITOBE — source unique pour le code TS/JS. */
export const BRAND = {
  orange: "#EA5312",
  gold: "#FFD37D",
  brown: "#383030",
  blue: "#70A2E1",
} as const;

export type BrandColor = (typeof BRAND)[keyof typeof BRAND];
