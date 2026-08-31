import { z } from "zod";

/** Caractères autorisés pendant la saisie */
export function filtrerSaisieTelephone(valeur: string) {
  return valeur.replace(/[^\d+\s()-]/g, "");
}

/** Valide un numéro RDC : +243XXXXXXXXX ou 0XXXXXXXXX (9 chiffres après indicatif) */
export function normaliserTelephoneRdc(valeur: string) {
  const chiffres = valeur.replace(/\D/g, "");

  if (chiffres.startsWith("243") && chiffres.length === 12) {
    return `+${chiffres}`;
  }

  if (chiffres.startsWith("0") && chiffres.length === 10) {
    return `+243${chiffres.slice(1)}`;
  }

  if (chiffres.length === 9) {
    return `+243${chiffres}`;
  }

  return null;
}

const telephoneSchema = z
  .string()
  .trim()
  .min(1, "Le numéro de téléphone est obligatoire.")
  .refine((valeur) => normaliserTelephoneRdc(valeur) !== null, {
    message: "Numéro invalide. Utilisez +243 81 234 5678 ou 081 234 5678.",
  });

export const connexionSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'adresse e-mail est obligatoire.")
    .email("Adresse e-mail invalide."),
  password: z.string().min(1, "Le mot de passe est obligatoire."),
});

export const inscriptionSchema = z
  .object({
    nom: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(80, "Le nom ne peut pas dépasser 80 caractères."),
    email: z
      .string()
      .trim()
      .min(1, "L'adresse e-mail est obligatoire.")
      .email("Adresse e-mail invalide."),
    telephone: telephoneSchema,
    adresse: z
      .string()
      .trim()
      .min(10, "L'adresse doit contenir au moins 10 caractères.")
      .max(250, "L'adresse ne peut pas dépasser 250 caractères."),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères.")
      .max(128, "Le mot de passe est trop long."),
    confirmation: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmation, {
    message: "La confirmation du mot de passe ne correspond pas.",
    path: ["confirmation"],
  });

export type InscriptionFormValues = z.infer<typeof inscriptionSchema>;

export function erreursParChamp(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}

export function classeChamp(invalide: boolean) {
  return `mt-1 w-full rounded-sm border bg-background px-3 py-3 text-sm outline-none focus:border-accent ${
    invalide ? "border-destructive focus:border-destructive" : "border-border"
  }`;
}
