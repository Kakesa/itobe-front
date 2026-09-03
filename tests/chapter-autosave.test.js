import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Mock minimal de l'environnement Browser (localStorage, window, setTimeout)
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe("🖥️ Tests Frontend : Autosave, Debounce, Brouillon Local & Conflits 409", () => {
  let localStorage;

  beforeEach(() => {
    localStorage = new LocalStorageMock();
  });

  it("1. Devrait comparer et détecter si le contenu JSON Tiptap a réellement changé (Dirty Checking)", () => {
    const jsonA = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Bonjour" }] }],
    };
    const jsonB = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Bonjour" }] }],
    };
    const jsonC = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Bonsoir" }] }],
    };

    const isIdentique = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    assert.equal(isIdentique(jsonA, jsonB), true, "Deux contenus identiques ne doivent pas déclencher d'appel API");
    assert.equal(isIdentique(jsonA, jsonC), false, "Une modification de texte doit être détectée");
  });

  it("2. Devrait simuler le debounce pour regrouper les frappes clavier", async () => {
    let callCount = 0;
    const debounceMs = 50;

    let timer = null;
    const triggerChange = (val) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callCount++;
      }, debounceMs);
    };

    // Simulation de 5 frappes rapides
    triggerChange("A");
    triggerChange("Ab");
    triggerChange("Abc");
    triggerChange("Abcd");
    triggerChange("Abcde");

    assert.equal(callCount, 0, "Aucun appel immédiat avant expiration du debounce");

    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.equal(callCount, 1, "Un seul appel API doit avoir été émis après debounce");
  });

  it("3. Devrait persister un brouillon local et le restaurer après rechargement", () => {
    const chapterId = "chap-123";
    const draftKey = `itobe_chapter_draft_${chapterId}`;

    const draftData = {
      titre: "Mon chapitre en cours",
      contenu: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Texte non sauvé" }] }] },
      timestamp: Date.now(),
      revision: 1,
    };

    localStorage.setItem(draftKey, JSON.stringify(draftData));

    // Simulation de réouverture / rechargement
    const stored = localStorage.getItem(draftKey);
    assert.ok(stored);

    const parsed = JSON.parse(stored);
    assert.equal(parsed.titre, "Mon chapitre en cours");
    assert.equal(parsed.contenu.content[0].content[0].text, "Texte non sauvé");

    // Après synchronisation réussie, le brouillon est supprimé
    localStorage.removeItem(draftKey);
    assert.equal(localStorage.getItem(draftKey), null);
  });

  it("4. Devrait gérer le statut d'erreur et capturer l'exception API", async () => {
    let status = "idle";
    let errorMessage = null;

    const mockApiUpdate = async () => {
      status = "saving";
      throw new Error("Erreur réseau temporaire 500");
    };

    try {
      await mockApiUpdate();
    } catch (e) {
      status = "error";
      errorMessage = e.message;
    }

    assert.equal(status, "error");
    assert.equal(errorMessage, "Erreur réseau temporaire 500");
  });

  it("5. Devrait intercepter le code 409 et basculer en mode conflit", async () => {
    let status = "idle";
    let conflictDetails = null;

    const mockApiConflict = async () => {
      status = "saving";
      const err = new Error("Conflit de révision");
      err.statusCode = 409;
      err.errors = { revisionActuelle: 3 };
      throw err;
    };

    try {
      await mockApiConflict();
    } catch (err) {
      if (err.statusCode === 409) {
        status = "conflict";
        conflictDetails = { serverRevision: err.errors?.revisionActuelle || 2 };
      }
    }

    assert.equal(status, "conflict");
    assert.equal(conflictDetails.serverRevision, 3);
  });
});
