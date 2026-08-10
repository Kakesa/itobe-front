// Système de notification centralisé (toute l'app passe par ici).
import { toast } from "sonner";

type Options = { description?: string };

export const notify = {
  succes(message: string, options?: Options) {
    toast.success(message, options);
  },
  erreur(message: string, options?: Options) {
    toast.error(message, options);
  },
  info(message: string, options?: Options) {
    toast(message, options);
  },
  attention(message: string, options?: Options) {
    toast.warning(message, options);
  },
  /* Raccourcis CRUD — libellés uniformes dans tout le back-office. */
  cree(entite: string, nom?: string) {
    toast.success(`${entite} créé(e)`, { description: nom });
  },
  modifie(entite: string, nom?: string) {
    toast.success(`${entite} mis(e) à jour`, { description: nom });
  },
  supprime(entite: string, nom?: string) {
    toast.success(`${entite} supprimé(e)`, { description: nom });
  },
  annule(message = "Action annulée") {
    toast(message);
  },
};
