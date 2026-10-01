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
    assert.equal(estAjustementInitial(AJUSTEMENT_INITIAL), true);
    assert.equal(estAjustementInitial({ ...AJUSTEMENT_INITIAL, zoom: 1.2 }), false);
  });
});
