import { useCallback, useEffect, useRef, useState } from "react";
import { ChapitresApi, ApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";

export interface ChapterDraftData {
  titre: string;
  contenu: any;
  statut?: string;
  gratuit?: boolean;
  timestamp: number;
  revision: number;
}

interface UseChapterAutosaveOptions {
  chapterId: string;
  livreIdOrSlug: string;
  initialRevision: number;
  initialTitle: string;
  initialContent: any;
  initialStatut?: string;
  initialGratuit?: boolean;
  updatedAt?: string;
  debounceMs?: number;
  onSaveSuccess?: (updatedChapter: any) => void;
}

function jsonEquals(a: any, b: any): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function useChapterAutosave({
  chapterId,
  livreIdOrSlug,
  initialRevision,
  initialTitle,
  initialContent,
  initialStatut = "Brouillon",
  initialGratuit = false,
  updatedAt,
  debounceMs = 1500,
  onSaveSuccess,
}: UseChapterAutosaveOptions) {
  const draftKey = `itobe_chapter_draft_${chapterId}`;

  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localDraft, setLocalDraft] = useState<ChapterDraftData | null>(null);
  const [conflictDetails, setConflictDetails] = useState<{
    serverRevision: number;
    message?: string;
  } | null>(null);

  // Valeurs actuelles en mémoire
  const currentValuesRef = useRef({
    titre: initialTitle,
    contenu: initialContent,
    statut: initialStatut,
    gratuit: initialGratuit,
  });

  // Dernière version confirmée sauvegardée sur le serveur
  const lastSavedValuesRef = useRef({
    titre: initialTitle,
    contenu: initialContent,
    statut: initialStatut,
    gratuit: initialGratuit,
  });

  // Révision actuelle du chapitre
  const revisionRef = useRef<number>(initialRevision);
  useEffect(() => {
    revisionRef.current = initialRevision;
  }, [initialRevision]);

  // Jeton de séquence pour éviter les race conditions
  const saveSequenceRef = useRef<number>(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Vérifier la présence d'un brouillon local sauvegardé dans localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !chapterId) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed: ChapterDraftData = JSON.parse(raw);
        const serverTime = updatedAt ? new Date(updatedAt).getTime() : 0;
        // Si le brouillon est plus récent que la dernière date serveur et contient du contenu différent
        const isDifferent =
          parsed.titre !== initialTitle || !jsonEquals(parsed.contenu, initialContent);

        if (parsed.timestamp > serverTime && isDifferent) {
          setLocalDraft(parsed);
        } else if (!isDifferent) {
          localStorage.removeItem(draftKey);
        }
      }
    } catch (e) {
      console.warn("[Autosave] Impossible de lire le brouillon local", e);
    }
  }, [chapterId, draftKey, initialContent, initialTitle, updatedAt]);

  // Sauvegarder dans le localStorage à chaque modification
  const saveToLocalStorage = useCallback(
    (titre: string, contenu: any, statut?: string, gratuit?: boolean) => {
      if (typeof window === "undefined" || !chapterId) return;
      try {
        const draft: ChapterDraftData = {
          titre,
          contenu,
          statut: statut ?? currentValuesRef.current.statut,
          gratuit: gratuit ?? currentValuesRef.current.gratuit,
          timestamp: Date.now(),
          revision: revisionRef.current,
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch (e) {
        console.warn("[Autosave] Erreur localStorage", e);
      }
    },
    [chapterId, draftKey]
  );

  // Fonction centrale de sauvegarde vers le serveur
  const executeSave = useCallback(
    async (force = false) => {
      const current = currentValuesRef.current;
      const lastSaved = lastSavedValuesRef.current;

      const hasChanged =
        force ||
        current.titre !== lastSaved.titre ||
        current.statut !== lastSaved.statut ||
        current.gratuit !== lastSaved.gratuit ||
        !jsonEquals(current.contenu, lastSaved.contenu);

      if (!hasChanged) {
        return;
      }

      const currentSeq = ++saveSequenceRef.current;
      setStatus("saving");
      setErrorMessage(null);

      try {
        const response = await ChapitresApi.update(chapterId, {
          titre: current.titre,
          contenu: current.contenu,
          statut: current.statut,
          gratuit: current.gratuit,
          revision: revisionRef.current,
        });

        // Vérification de séquence pour ignorer les réponses obsolètes
        if (currentSeq !== saveSequenceRef.current) return;

        const updatedData = response?.data ?? response;
        if (updatedData?.revision) {
          revisionRef.current = updatedData.revision;
        }

        lastSavedValuesRef.current = {
          titre: current.titre,
          contenu: current.contenu,
          statut: current.statut,
          gratuit: current.gratuit,
        };

        setStatus("saved");
        setLastSavedAt(new Date());
        setConflictDetails(null);

        // Nettoyage du brouillon local car synchronisé
        try {
          localStorage.removeItem(draftKey);
          setLocalDraft(null);
        } catch {
          // ignore
        }

        if (onSaveSuccess) {
          onSaveSuccess(updatedData);
        }
      } catch (error: any) {
        if (currentSeq !== saveSequenceRef.current) return;

        if (error instanceof ApiError && error.statusCode === 409) {
          setStatus("conflict");
          const serverRev = error.errors?.revisionActuelle ?? revisionRef.current + 1;
          setConflictDetails({
            serverRevision: serverRev,
            message: error.message || "Conflit de révision détecté",
          });
          notify.erreur("Conflit de version : le chapitre a été modifié ailleurs.");
        } else {
          setStatus("error");
          setErrorMessage(error?.message || "Erreur lors de la sauvegarde automatique");
        }
      }
    },
    [chapterId, draftKey, onSaveSuccess]
  );

  // Déclencher une modification avec debounce
  const notifyChange = useCallback(
    (titre: string, contenu: any, statut?: string, gratuit?: boolean) => {
      currentValuesRef.current = {
        titre,
        contenu,
        statut: statut ?? currentValuesRef.current.statut,
        gratuit: gratuit ?? currentValuesRef.current.gratuit,
      };

      // Sauvegarde immédiate dans localStorage
      saveToLocalStorage(titre, contenu, statut, gratuit);

      // Si en statut d'erreur ou conflit, ne pas écraser l'affichage tant que l'utilisateur n'a pas résolu
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
    [debounceMs, executeSave, saveToLocalStorage, status]
  );

  // Forcer une sauvegarde immédiate sans attendre le debounce
  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    await executeSave(true);
  }, [executeSave]);

  // Appliquer le brouillon local
  const applyLocalDraft = useCallback(() => {
    if (!localDraft) return;
    currentValuesRef.current = {
      titre: localDraft.titre,
      contenu: localDraft.contenu,
      statut: localDraft.statut ?? initialStatut,
      gratuit: localDraft.gratuit ?? initialGratuit,
    };
    setLocalDraft(null);
    notify.succes("Brouillon local restauré");
    void executeSave(true);
  }, [executeSave, initialGratuit, initialStatut, localDraft]);

  // Ignorer le brouillon local
  const discardLocalDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    setLocalDraft(null);
    notify.info("Brouillon local ignoré");
  }, [draftKey]);

  // Résoudre un conflit de révision
  const resolveConflict = useCallback(
    async (action: "reload" | "force_overwrite") => {
      if (action === "reload") {
        try {
          const res = await ChapitresApi.getById(chapterId);
          const serverChapter = res?.data ?? res;
          revisionRef.current = serverChapter.revision;
          lastSavedValuesRef.current = {
            titre: serverChapter.titre,
            contenu: serverChapter.contenu,
            statut: serverChapter.statut,
            gratuit: serverChapter.gratuit,
          };
          currentValuesRef.current = { ...lastSavedValuesRef.current };
          setStatus("saved");
          setConflictDetails(null);
          localStorage.removeItem(draftKey);
          setLocalDraft(null);
          if (onSaveSuccess) onSaveSuccess(serverChapter);
          notify.succes("Version serveur rechargée avec succès");
        } catch (e: any) {
          notify.erreur(e?.message || "Impossible de recharger la version distante");
        }
      } else if (action === "force_overwrite") {
        // Mettre à jour la révision locale avec celle du serveur pour forcer l'enregistrement
        if (conflictDetails?.serverRevision) {
          revisionRef.current = conflictDetails.serverRevision;
        }
        setConflictDetails(null);
        await executeSave(true);
      }
    },
    [chapterId, conflictDetails, draftKey, executeSave, onSaveSuccess]
  );

  // Nettoyage du timer à l'unmount
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
    currentValues: currentValuesRef.current,
    notifyChange,
    saveNow,
    applyLocalDraft,
    discardLocalDraft,
    resolveConflict,
  };
}
