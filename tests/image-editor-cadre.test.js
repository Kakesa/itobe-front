import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  RATIO_PAGE_LIVRE,
  LARGEUR_FOLIO_PX,
  HAUTEUR_FOLIO_PX,
  bornesDeplacement,
  estAjustementInitial,
  facteurCouverture,
  limiterDeplacement,
  tailleExport,
  rogneInitiale,
  deplacerRogne,
  rogneRedimensionnee,
  ROGNE_PLEINE,
  AJUSTEMENT_INITIAL,
} from "../src/components/admin/image-editor/cadre-page.ts";

describe("cadre d'une page de livre", () => {
  it("reprend le folio du lecteur (40rem / hauteur utile)", () => {
    assert.equal(LARGEUR_FOLIO_PX, 640);
    assert.equal(HAUTEUR_FOLIO_PX, 716);
    assert.equal(RATIO_PAGE_LIVRE, 640 / 716);
  });

  it("couvre le cadre sans étirer une image plus large", () => {
    const cover = facteurCouverture(640, 716, 2000, 1000, 0);
    assert.ok(2000 * cover >= 640);
    assert.ok(1000 * cover >= 716);
    assert.equal(cover, 716 / 1000);
  });

  it("autorise un déplacement seulement après zoom", () => {
    const repos = bornesDeplacement(640, 716, 2000, 1000, AJUSTEMENT_INITIAL);
    assert.equal(repos.maxY, 0);
    const zoome = bornesDeplacement(640, 716, 2000, 1000, { ...AJUSTEMENT_INITIAL, zoom: 2 });
    assert.ok(zoome.maxX > 0);
    assert.ok(zoome.maxY > 0);
  });

  it("limite le déplacement au cadre", () => {
    assert.deepEqual(limiterDeplacement(80, -40, 20, 10), { offsetX: 20, offsetY: -10 });
  });

  it("n'agrandit pas l'export au-delà des pixels visibles", () => {
    const taille = tailleExport(640, 716, 4000, 3000, AJUSTEMENT_INITIAL);
    assert.ok(Math.max(taille.width, taille.height) <= 3200);
    assert.ok(taille.width >= 1 && taille.height >= 1);
  });

  it("reconnaît l'état initial pour éviter un ré-upload", () => {
    const rogne = rogneInitiale(2000, 1000, 0);
    assert.equal(estAjustementInitial({ ...AJUSTEMENT_INITIAL, rogne }, 2000, 1000), true);
    assert.equal(estAjustementInitial({ ...AJUSTEMENT_INITIAL, rogne, zoom: 1.2 }, 2000, 1000), false);
  });

  it("propose un rognage au format de la page, déplaçable et redimensionnable", () => {
    const rogne = rogneInitiale(2000, 1000, 0);
    assert.ok(rogne.w < 1);
    assert.equal(rogne.h, 1);
    assert.ok(rogne.x > 0);
    const deplacee = deplacerRogne(rogne, 0.1, 0);
    assert.ok(deplacee.x > rogne.x);
    assert.equal(deplacee.w, rogne.w);
    const reduite = rogneRedimensionnee(rogne, "se", -0.1, 0, 2000, 1000);
    assert.ok(reduite.w < rogne.w);
    assert.ok(reduite.h < rogne.h);
    const ratio = (reduite.w * 2000) / (reduite.h * 1000);
    assert.ok(Math.abs(ratio - RATIO_PAGE_LIVRE) < 0.02);
  });

  it("laisse un motif entier pour que l'écrit s'adapte autour", () => {
    assert.equal(estAjustementInitial({ ...AJUSTEMENT_INITIAL, rogne: ROGNE_PLEINE }, 900, 700, "decor"), true);
    const reduit = rogneRedimensionnee(ROGNE_PLEINE, "se", -0.25, 0, 900, 700, 900 / 700);
    const ratio = (reduit.w * 900) / (reduit.h * 700);
    assert.ok(Math.abs(ratio - 900 / 700) < 0.02);
    assert.ok(reduit.w < 1);
  });
});
