import { useCallback, useEffect, useRef, useState } from "react";
import { PagesApi, ApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import type { AutosaveStatus } from "@/hooks/use-chapter-autosave";

export type { AutosaveStatus };

export interface PageDraftData {
  titre: string;
  contenu: any;
  timestamp: number;
  revision: number;
}

interface UsePageAutosaveOptions {
  pageId: string;
  initialRevision: number;
  initialTitle: string;
  initialContent: any;
  updatedAt?: string;
  debounceMs?: number;
  onSaveSuccess?: (updatedPage: any) => void;
}

function jsonEquals(a: any, b: any): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Autosave pour une Page éditoriale (titre + contenu Tiptap).
 * Même modèle que les chapitres : debounce, localStorage, révision optimiste.
 */
export function usePageAutosave({
  pageId,
  initialRevision,
  initialTitle,
  initialContent,
  updatedAt,
  debounceMs = 1500,
  onSaveSuccess,
}: UsePageAutosaveOptions) {
  const draftKey = `itobe_page_draft_${pageId}`;

  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localDraft, setLocalDraft] = useState<PageDraftData | null>(null);
  const [conflictDetails, setConflictDetails] = useState<{
    serverRevision: number;
    message?: string;
  } | null>(null);

  const currentValuesRef = useRef({
    titre: initialTitle,
    contenu: initialContent,
  });

  const lastSavedValuesRef = useRef({
    titre: initialTitle,
    contenu: initialContent,
  });

  const revisionRef = useRef<number>(initialRevision);
  useEffect(() => {
    revisionRef.current = initialRevision;
  }, [initialRevision]);

  const saveSequenceRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !pageId) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed: PageDraftData = JSON.parse(raw);
      const serverTime = updatedAt ? new Date(updatedAt).getTime() : 0;
      const isDifferent =
        parsed.titre !== initialTitle || !jsonEquals(parsed.contenu, initialContent);

      if (parsed.timestamp > serverTime && isDifferent) {
        setLocalDraft(parsed);
      } else if (!isDifferent) {
        localStorage.removeItem(draftKey);
      }
    } catch (e) {
      console.warn("[PageAutosave] Impossible de lire le brouillon local", e);
    }
  }, [draftKey, initialContent, initialTitle, pageId, updatedAt]);

  const saveToLocalStorage = useCallback(
    (titre: string, contenu: any) => {
      if (typeof window === "undefined" || !pageId) return;
      try {
        const draft: PageDraftData = {
          titre,
          contenu,
          timestamp: Date.now(),
          revision: revisionRef.current,
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch (e) {
        console.warn("[PageAutosave] Erreur localStorage", e);
      }
    },
    [draftKey, pageId],
  );

  const executeSave = useCallback(
    async (force = false) => {
      const current = currentValuesRef.current;
      const lastSaved = lastSavedValuesRef.current;

      const hasChanged =
        force ||
        current.titre !== lastSaved.titre ||
        !jsonEquals(current.contenu, lastSaved.contenu);

      if (!hasChanged) return;

      const currentSeq = ++saveSequenceRef.current;
      setStatus("saving");
      setErrorMessage(null);

      try {
        const response = await PagesApi.update(pageId, {
          titre: current.titre,
          contenu: current.contenu,
          revision: revisionRef.current,
        });

        if (currentSeq !== saveSequenceRef.current) return;

        const updatedData = response?.data ?? response;
        if (updatedData?.revision) {
          revisionRef.current = updatedData.revision;
        }

        lastSavedValuesRef.current = {
          titre: current.titre,
          contenu: current.contenu,
        };

        setStatus("saved");
        setLastSavedAt(new Date());
        setConflictDetails(null);

        try {
          localStorage.removeItem(draftKey);
          setLocalDraft(null);
        } catch {
          // ignore
        }

        onSaveSuccess?.(updatedData);
      } catch (error: any) {
        if (currentSeq !== saveSequenceRef.current) return;

        if (error instanceof ApiError && error.statusCode === 409) {
          setStatus("conflict");
          const serverRev = error.errors?.revisionActuelle ?? revisionRef.current + 1;
          setConflictDetails({
            serverRevision: serverRev,
            message: error.message || "Conflit de révision détecté",
          });
          notify.erreur("Conflit de version : la page a été modifiée ailleurs.");
        } else {
          setStatus("error");
          setErrorMessage(error?.message || "Erreur lors de la sauvegarde automatique");
        }
      }
    },
    [draftKey, onSaveSuccess, pageId],
  );

  const notifyChange = useCallback(
    (titre: string, contenu: any) => {
      currentValuesRef.current = { titre, contenu };
      saveToLocalStorage(titre, contenu);

      if (status !== "conflict") {
        setStatus("idle");
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void executeSave();
      }, debounceMs);
    },
    [debounceMs, executeSave, saveToLocalStorage, status],
  );

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    await executeSave(true);
  }, [executeSave]);

  const applyLocalDraft = useCallback(() => {
    if (!localDraft) return;
    currentValuesRef.current = {
      titre: localDraft.titre,
      contenu: localDraft.contenu,
    };
    setLocalDraft(null);
    notify.succes("Brouillon local restauré");
    void executeSave(true);
    return {
      titre: localDraft.titre,
      contenu: localDraft.contenu,
    };
  }, [executeSave, localDraft]);

  const discardLocalDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    setLocalDraft(null);
    notify.info("Brouillon local ignoré");
  }, [draftKey]);

  const resolveConflict = useCallback(
    async (action: "reload" | "force_overwrite") => {
      if (action === "reload") {
        try {
          const res = await PagesApi.getById(pageId);
          const serverPage = res?.data ?? res;
          revisionRef.current = serverPage.revision;
          lastSavedValuesRef.current = {
            titre: serverPage.titre,
            contenu: serverPage.contenu,
          };
          currentValuesRef.current = { ...lastSavedValuesRef.current };
          setStatus("saved");
          setConflictDetails(null);
          localStorage.removeItem(draftKey);
          setLocalDraft(null);
          onSaveSuccess?.(serverPage);
          notify.succes("Version serveur rechargée avec succès");
          return serverPage;
        } catch (e: any) {
          notify.erreur(e?.message || "Impossible de recharger la version distante");
          return null;
        }
      }

      if (conflictDetails?.serverRevision) {
        revisionRef.current = conflictDetails.serverRevision;
      }
      setConflictDetails(null);
      await executeSave(true);
      return null;
    },
    [conflictDetails, draftKey, executeSave, onSaveSuccess, pageId],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSavedAt,
    errorMessage,
    localDraft,
    conflictDetails,
    currentRevision: revisionRef.current,
    currentValues: currentValuesRef.current,
    notifyChange,
    saveNow,
    applyLocalDraft,
    discardLocalDraft,
    resolveConflict,
  };
}
