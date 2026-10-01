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

/** Zone conservée, en fraction de l'image orientée (après rotation). */
export type Rogne = { x: number; y: number; w: number; h: number };

export type CoinRogne = "nw" | "ne" | "sw" | "se";

export type AjustementImage = {
  rotation: 0 | 90 | 180 | 270;
  zoom: number;
  offsetX: number;
  offsetY: number;
  rogne: Rogne;
};

/** Où l'image se place dans le texte de la page. */
export type EmplacementImage = "gauche" | "centre" | "droite" | "pleine";

export function emplacementImage(valeur: unknown): EmplacementImage {
  if (valeur === "gauche" || valeur === "centre" || valeur === "droite" || valeur === "pleine") {
    return valeur;
  }
  return "pleine";
}

export const ROGNE_PLEINE: Rogne = { x: 0, y: 0, w: 1, h: 1 };

export const AJUSTEMENT_INITIAL: AjustementImage = {
  rotation: 0,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rogne: ROGNE_PLEINE,
};

export function dimensionsOrientees(imgW: number, imgH: number, rotation: number) {
  const tourne = rotation % 180 !== 0;
  return { ow: tourne ? imgH : imgW, oh: tourne ? imgW : imgH };
}

/** Plus grand rectangle au format du folio, centré dans l'image. */
export function rogneInitiale(imgW: number, imgH: number, rotation: number): Rogne {
  const { ow, oh } = dimensionsOrientees(imgW, imgH, rotation);
  if (ow <= 0 || oh <= 0) return ROGNE_PLEINE;
  const ratioImage = ow / oh;
  if (ratioImage > RATIO_PAGE_LIVRE) {
    const h = 1;
    const w = (oh * RATIO_PAGE_LIVRE) / ow;
    return { x: (1 - w) / 2, y: 0, w, h };
  }
  const w = 1;
  const h = ow / (oh * RATIO_PAGE_LIVRE);
  return { x: 0, y: (1 - h) / 2, w, h };
}

export function rognesEgales(a: Rogne, b: Rogne) {
  const pres = (n: number, m: number) => Math.abs(n - m) < 0.001;
  return pres(a.x, b.x) && pres(a.y, b.y) && pres(a.w, b.w) && pres(a.h, b.h);
}

export function estAjustementInitial(a: AjustementImage, imgW: number, imgH: number) {
  return (
    a.rotation === 0 &&
    a.zoom === 1 &&
    a.offsetX === 0 &&
    a.offsetY === 0 &&
    rognesEgales(a.rogne, rogneInitiale(imgW, imgH, 0))
  );
}

export function limiterRogne(rogne: Rogne): Rogne {
  const w = Math.min(1, Math.max(0.12, rogne.w));
  const h = Math.min(1, Math.max(0.12, rogne.h));
  return {
    w,
    h,
    x: Math.min(1 - w, Math.max(0, rogne.x)),
    y: Math.min(1 - h, Math.max(0, rogne.y)),
  };
}

export function deplacerRogne(rogne: Rogne, dx: number, dy: number): Rogne {
  return limiterRogne({ ...rogne, x: rogne.x + dx, y: rogne.y + dy });
}

/** Redimensionne en gardant le format du folio. dx/dy sont des fractions de l'image. */
export function rogneRedimensionnee(
  start: Rogne,
  coin: CoinRogne,
  dx: number,
  dy: number,
  ow: number,
  oh: number,
): Rogne {
  if (ow <= 0 || oh <= 0) return start;
  const versEst = coin === "ne" || coin === "se";
  const versSud = coin === "sw" || coin === "se";
  const ancreX = versEst ? start.x : start.x + start.w;
  const ancreY = versSud ? start.y : start.y + start.h;
  const deltaX = (versEst ? 1 : -1) * dx;
  const deltaY = (versSud ? 1 : -1) * dy;
  const wDepuisH = (start.h + deltaY) * ((oh * RATIO_PAGE_LIVRE) / ow);
  let w = Math.abs(deltaX) >= Math.abs(wDepuisH - start.w) ? start.w + deltaX : wDepuisH;
  w = Math.max(0.12, w);
  let h = (w * ow) / (oh * RATIO_PAGE_LIVRE);
  let x = versEst ? ancreX : ancreX - w;
  let y = versSud ? ancreY : ancreY - h;

  if (x < 0) {
    w += x;
    x = 0;
    h = (w * ow) / (oh * RATIO_PAGE_LIVRE);
    if (!versSud) y = ancreY - h;
  }
  if (y < 0) {
    h += y;
    y = 0;
    w = (h * oh * RATIO_PAGE_LIVRE) / ow;
    if (!versEst) x = ancreX - w;
  }
  if (x + w > 1) {
    w = 1 - x;
    h = (w * ow) / (oh * RATIO_PAGE_LIVRE);
    if (!versSud) y = ancreY - h;
  }
  if (y + h > 1) {
    h = 1 - y;
    w = (h * oh * RATIO_PAGE_LIVRE) / ow;
    if (!versEst) x = ancreX - w;
  }
  return limiterRogne({ x, y, w, h });
}

export function rectangleRogne(imgW: number, imgH: number, rotation: number, rogne: Rogne) {
  const { ow, oh } = dimensionsOrientees(imgW, imgH, rotation);
  return {
    ow,
    oh,
    sx: rogne.x * ow,
    sy: rogne.y * oh,
    sw: Math.max(1, rogne.w * ow),
    sh: Math.max(1, rogne.h * oh),
  };
}

export function tailleExportRogne(sw: number, sh: number) {
  const long = Math.max(sw, sh);
  const k = long > COTE_MAX_EXPORT ? COTE_MAX_EXPORT / long : 1;
  return {
    width: Math.max(1, Math.round(sw * k)),
    height: Math.max(1, Math.round(sh * k)),
  };
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
