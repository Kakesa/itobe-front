/** Fausses couvertures SVG (data-URL) pour la démo catalogue. */
function couvertureSvg(opts: {
  titre: string;
  sousTitre?: string;
  fond: string;
  accent: string;
}) {
  const titre = opts.titre.replace(/&/g, "&amp;");
  const sous = (opts.sousTitre ?? "Itobe Éditions").replace(/&/g, "&amp;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <rect width="400" height="600" fill="${opts.fond}"/>
  <rect x="0" y="0" width="14" height="600" fill="#000" opacity="0.25"/>
  <rect x="28" y="48" width="60" height="6" fill="${opts.accent}"/>
  <text x="28" y="120" fill="#fdfaf4" font-family="Georgia, serif" font-size="28" font-weight="700">${wrapSvgText(titre, 28, 120, 340, 34)}</text>
  <text x="28" y="520" fill="#fdfaf4" font-family="system-ui,sans-serif" font-size="14" opacity="0.75">${sous}</text>
  <text x="28" y="560" fill="${opts.accent}" font-family="system-ui,sans-serif" font-size="12" letter-spacing="2">ITOBE ÉDITIONS</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function wrapSvgText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  // Découpe simple pour SVG (mots) — max ~3 lignes
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length > 18) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines
    .slice(0, 4)
    .map((l, i) => `<tspan x="${x}" y="${y + i * lineHeight}">${l}</tspan>`)
    .join("");
}

export const faussesCouvertures = {
  "le-fleuve-et-la-page": couvertureSvg({
    titre: "Le Fleuve et la Page",
    sousTitre: "Récits d'une ville qui écrit",
    fond: "#ea5312",
    accent: "#ffd37d",
  }),
  "nuit-blanche-a-matonge": couvertureSvg({
    titre: "Nuit blanche à Matonge",
    sousTitre: "Roman",
    fond: "#1e3a5f",
    accent: "#70a2e1",
  }),
  "grammaire-du-courage": couvertureSvg({
    titre: "Grammaire du courage",
    fond: "#6b4f2a",
    accent: "#ffd37d",
  }),
  "poemes-du-quatrieme-jour": couvertureSvg({
    titre: "Poèmes du quatrième jour",
    fond: "#7a2e1e",
    accent: "#ffbaba",
  }),
  "histoire-des-presses": couvertureSvg({
    titre: "Histoire des presses africaines",
    sousTitre: "1950–2025",
    fond: "#1a3d32",
    accent: "#79c4b5",
  }),
  "le-cartable-de-kimia": couvertureSvg({
    titre: "Le cartable de Kimia",
    sousTitre: "Jeunesse",
    fond: "#2d6a4f",
    accent: "#ffd37d",
  }),
} as const;
