/**
 * Cadre d'une page du lecteur.
 *
 * Une page occupe une colonne de `.reader-book__open`
 * (styles.css : `grid-template-columns: 1fr 1fr`,
 * `min-height: calc(100dvh - 11.5rem)`).
 * La feuille est limitée par `.reader-page-sheet { max-width: 80rem }`,
 * donc une page fait au plus 40rem (640px).
 * 11.5rem = 184px. Sur la hauteur de référence du livre ouvert (900px),
 * la zone utile vaut 900 - 184 = 716px.
 *
 * Les images dans `.reader-book__page img` gardent leurs proportions
 * (`max-width: 100%`). Le cadre ci-dessous est celui d'un folio, pas un ratio inventé.
 */
export const LARGEUR_FOLIO_PX = 640;
export const HAUTEUR_FOLIO_PX = 716;
export const RATIO_PAGE_LIVRE = LARGEUR_FOLIO_PX / HAUTEUR_FOLIO_PX;

/** Côté long max de l'export : assez pour une page retina, sous la limite d'upload (50 Mo). */
export const COTE_MAX_EXPORT = 3200;

export type AjustementImage = {
  rotation: 0 | 90 | 180 | 270;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export const AJUSTEMENT_INITIAL: AjustementImage = {
  rotation: 0,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export function estAjustementInitial(a: AjustementImage) {
  return a.rotation === 0 && a.zoom === 1 && a.offsetX === 0 && a.offsetY === 0;
}

export function facteurCouverture(
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
  rotation: number,
) {
  const tourne = rotation % 180 !== 0;
  const iw = tourne ? imgH : imgW;
  const ih = tourne ? imgW : imgH;
  if (iw <= 0 || ih <= 0) return 1;
  return Math.max(frameW / iw, frameH / ih);
}

export function bornesDeplacement(
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
  ajustement: AjustementImage,
) {
  const cover = facteurCouverture(frameW, frameH, imgW, imgH, ajustement.rotation);
  const tourne = ajustement.rotation % 180 !== 0;
  const visW = (tourne ? imgH : imgW) * cover * ajustement.zoom;
  const visH = (tourne ? imgW : imgH) * cover * ajustement.zoom;
  return {
    cover,
    maxX: Math.max(0, (visW - frameW) / 2),
    maxY: Math.max(0, (visH - frameH) / 2),
  };
}

export function limiterDeplacement(
  offsetX: number,
  offsetY: number,
  maxX: number,
  maxY: number,
) {
  return {
    offsetX: Math.min(maxX, Math.max(-maxX, offsetX)),
    offsetY: Math.min(maxY, Math.max(-maxY, offsetY)),
  };
}

export function tailleExport(
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
  ajustement: AjustementImage,
) {
  const cover = facteurCouverture(frameW, frameH, imgW, imgH, ajustement.rotation);
  const srcW = frameW / (cover * ajustement.zoom);
  const srcH = frameH / (cover * ajustement.zoom);
  const long = Math.max(srcW, srcH);
  const k = long > COTE_MAX_EXPORT ? COTE_MAX_EXPORT / long : 1;
  return {
    width: Math.max(1, Math.round(srcW * k)),
    height: Math.max(1, Math.round(srcH * k)),
  };
}

export function dessinerImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  imgW: number,
  imgH: number,
  frameW: number,
  frameH: number,
  ajustement: AjustementImage,
) {
  const cover = facteurCouverture(frameW, frameH, imgW, imgH, ajustement.rotation);
  const drawW = imgW * cover * ajustement.zoom;
  const drawH = imgH * cover * ajustement.zoom;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, frameW, frameH);
  ctx.clip();
  ctx.translate(frameW / 2 + ajustement.offsetX, frameH / 2 + ajustement.offsetY);
  ctx.rotate((ajustement.rotation * Math.PI) / 180);
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}
