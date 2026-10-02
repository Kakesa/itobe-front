import { useMemo, useState, useRef, useEffect, type ReactNode } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { AccesRestreint } from "@/components/admin-ui";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { RowActionsMenu, type RowAction } from "@/components/admin/row-actions-menu";
import { useRole } from "@/hooks/use-role";
import type { Role } from "@/lib/admin-data";
import { ArticlesApi, AuteursApi, CategoriesApi, LivresApi, UsersApi, ApiError, lireCategories } from "@/lib/api-client";
import { hydratePublicData } from "@/lib/data";
import { resolveMediaUrl } from "@/lib/media-url";
import { useCollection, type NomCollection } from "@/lib/admin/store";
import type { Item } from "@/lib/admin/seeds";
import { notify } from "@/lib/notify";
import { uploadMediaImage } from "@/lib/upload-media";
import {
  ArticleRichEditor,
  plainTextToHtml,
  richTextIsEmpty,
} from "@/components/admin/article-rich-editor";

export type Colonne = {
  cle: string;
  label: string;
  rendu?: (row: Item) => ReactNode;
  classe?: string;
};

export type Champ = {
  nom: string;
  label: string;
  type?: "text" | "textarea" | "richtext" | "number" | "select" | "switch" | "date" | "image" | "file" | "password";
  /** Affiché seulement à la création. */
  creationSeulement?: boolean;
  options?: string[];
  requis?: boolean;
  placeholder?: string;
  defaut?: boolean | string | number;
  /** Aperçu image : couverture livre (2/3) ou photo auteur (rond). */
  apercu?: "cover" | "avatar";
};

const ADMIN_STORAGE_KEY = "itobe.admin.data.v5";

function lireAuteursAdminLocaux(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!brut) return [];
    const parsed = JSON.parse(brut) as { auteurs?: Item[] };
    return Array.isArray(parsed.auteurs) ? parsed.auteurs : [];
  } catch {
    return [];
  }
}

function fusionnerPhotosAuteursLocales(remote: Item[], locaux: Item[]): Item[] {
  return remote.map((r) => {
    const slug = String(r["slug"] ?? "");
    const nom = String(r["nom"] ?? "").trim().toLowerCase();
    const loc = locaux.find((l) => {
      const slugLocal = String(l["slug"] ?? "");
      const nomLocal = String(l["nom"] ?? "").trim().toLowerCase();
      return (
        (slug && (slugLocal === slug || l.id === slug)) ||
        (nom && nomLocal === nom)
      );
    });
    const photoLocale = resolveMediaUrl(loc?.["photo"]);
    const photoDistante = resolveMediaUrl(r["photo"]);
    if (
      photoLocale &&
      photoLocale !== photoDistante &&
      !photoLocale.includes("images.unsplash.com")
    ) {
      return { ...r, photo: photoLocale };
    }
    return r;
  });
}

export function CrudModule({
  titre,
  singulier,
  description,
  collection,
  requis = ["admin"],
  colonnes,
  champs,
  clesRecherche = [],
  filtre,
  actionsLigne,
  entetePersonnalisee,
  lectureSeule = false,
  onApresEnregistrement,
}: {
  titre: string;
  singulier: string;
  description?: string;
  collection: NomCollection;
  requis?: Role[];
  colonnes: Colonne[];
  champs: Champ[];
  clesRecherche?: string[];
  filtre?: { cle: string; label: string; options: string[] };
  actionsLigne?: (row: Item) => RowAction[];
  entetePersonnalisee?: ReactNode;
  lectureSeule?: boolean;
  /** Appelé après création ou modification réussie. */
  onApresEnregistrement?: (ctx: {
    avant: Item | null;
    apres: Item;
    creation: boolean;
  }) => void;
}) {
  const { role, pret } = useRole();
  const { items, creer, modifier, supprimer, definir } = useCollection(collection);
  const [q, setQ] = useState("");
  const [valeurFiltre, setValeurFiltre] = useState("Tous");
  const [edition, setEdition] = useState<{ row: Item | null } | null>(null);
  const [aSupprimer, setASupprimer] = useState<Item | null>(null);

  const mapperLivresAdmin = (payload: unknown): Item[] => {
    const raw = Array.isArray(payload) ? payload : normaliserValeurApi(payload);
    return raw.map((entry: Record<string, unknown>) => ({
      id: String(entry["_id"] ?? entry["slug"] ?? ""),
      publication: entry["publication"]
        ? new Date(String(entry["publication"])).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      titre: String(entry["titre"] ?? ""),
      resume: String(entry["resume"] ?? ""),
      pages: Number(entry["pages"] ?? 200),
      nombreChapitres: Number(entry["nombreChapitres"] ?? entry["chapitres"]?.length ?? 6),
      auteur: String(
        (entry["auteur"] as { slug?: string } | undefined)?.slug ?? entry["auteur"] ?? "",
      ),
      categorie: String(
        (entry["categorie"] as { nom?: string } | undefined)?.nom ?? entry["categorie"] ?? "",
      ),
      formats: Array.isArray(entry["formats"])
        ? (entry["formats"] as string[]).join(", ")
        : "PDF, EPUB",
      prix: Number(entry["prix"] ?? 0),
      prixPapier: Number(entry["prixPapier"] ?? 0),
      promo: Number(entry["promo"] ?? 0),
      stock: Number(entry["stock"] ?? 0),
      disponible: Boolean(entry["disponible"] ?? true),
      couverture: String(entry["couverture"] ?? ""),
      couleur: String(
        entry["couleur"] ??
          "linear-gradient(160deg, oklch(0.62 0.15 48), oklch(0.3 0.05 40))",
      ),
      pdfUrl: String((entry["fichiers"] as { pdfUrl?: string } | undefined)?.pdfUrl ?? ""),
      epubUrl: String((entry["fichiers"] as { epubUrl?: string } | undefined)?.epubUrl ?? ""),
    }));
  };

  const normaliserValeurApi = (payload: unknown): Record<string, unknown>[] => {
    if (Array.isArray(payload)) return payload as Record<string, unknown>[];
    if (payload && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      if (Array.isArray(record["data"])) return record["data"] as Record<string, unknown>[];
    }
    return [];
  };

  const mapperAuteursAdmin = (payload: unknown): Item[] => {
    const raw = Array.isArray(payload) ? payload : normaliserValeurApi(payload);
    return raw.map((entry: Record<string, unknown>) => {
      const photo = resolveMediaUrl(entry["photo"] ?? entry["image"]);
      return {
        id: String(entry["_id"] ?? entry["slug"] ?? ""),
        slug: String(entry["slug"] ?? ""),
        nom: String(entry["nom"] ?? ""),
        role: String(entry["role"] ?? ""),
        ville: String(entry["ville"] ?? ""),
        bio: String(entry["bio"] ?? ""),
        ...(photo ? { photo } : {}),
        ventes: Number(entry["ventes"] ?? 0),
      };
    });
  };

  const rechargerLivresAdmin = async () => {
    const raw = await LivresApi.fetchAllAdmin();
    definir(mapperLivresAdmin(raw));
    await hydratePublicData();
  };

  const rechargerAuteursAdmin = async () => {
    const raw = await AuteursApi.fetchAll();
    definir(mapperAuteursAdmin(raw));
    await hydratePublicData();
  };

  const preparerPayloadAuteur = (valeurs: Record<string, unknown>) => {
    const photo = resolveMediaUrl(valeurs["photo"]);
    return {
      nom: String(valeurs["nom"] ?? "").trim(),
      role: String(valeurs["role"] ?? "").trim(),
      ville: String(valeurs["ville"] ?? "").trim(),
      bio: String(valeurs["bio"] ?? ""),
      photo: photo ?? "",
    };
  };

  const rechargerCategoriesMedia = async () => {
    const brut = await CategoriesApi.getAll("media");
    definir(
      lireCategories(brut).map((item) => ({
        id: item.id,
        nom: item.nom,
        visibilite: item.visibilite,
      })),
    );
  };

  useEffect(() => {
    if (collection !== "categoriesMedia") return;
    let annule = false;
    CategoriesApi.getAll("media")
      .then((brut) => {
        if (annule) return;
        definir(
          lireCategories(brut).map((item) => ({
            id: item.id,
            nom: item.nom,
            visibilite: item.visibilite,
          })),
        );
      })
      .catch((err) => {
        if (!annule) {
          notify.erreur(
            err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)
              ? "Reconnectez-vous pour charger les catégories."
              : "Impossible de charger les catégories du média.",
          );
        }
      });
    return () => {
      annule = true;
    };
  }, [collection, definir]);

  useEffect(() => {
    if (collection !== "livres") return;

    let annule = false;
    LivresApi.fetchAllAdmin()
      .then((raw) => {
        if (annule) return;
        definir(mapperLivresAdmin(raw));
      })
      .catch((err) => {
        if (!annule) {
          notify.erreur(
            err instanceof ApiError && err.statusCode === 401
              ? "Reconnectez-vous pour charger tous les livres."
              : "Impossible de charger la liste complète des livres.",
          );
        }
      });

    return () => {
      annule = true;
    };
  }, [collection, definir]);

  useEffect(() => {
    if (collection !== "auteurs") return;

    let annule = false;
    const locaux = lireAuteursAdminLocaux();

    void (async () => {
      try {
        const raw = await AuteursApi.fetchAll();
        if (annule) return;
        const remote = mapperAuteursAdmin(raw);
        const merged = fusionnerPhotosAuteursLocales(remote, locaux);
        definir(merged);

        const aSynchroniser = merged.filter((item) => {
          const orig = remote.find((r) => r.id === item.id);
          return Boolean(item["photo"] && orig && String(item["photo"]) !== String(orig["photo"] ?? ""));
        });

        for (const item of aSynchroniser) {
          if (annule) return;
          await AuteursApi.update(String(item.id), {
            nom: String(item["nom"] ?? "").trim(),
            role: String(item["role"] ?? "").trim(),
            ville: String(item["ville"] ?? "").trim(),
            bio: String(item["bio"] ?? ""),
            photo: resolveMediaUrl(item["photo"]) ?? "",
          });
        }

        if (annule) return;
        if (aSynchroniser.length > 0) {
          await rechargerAuteursAdmin();
          notify.succes("Les nouvelles photos d’auteurs ont été enregistrées sur le serveur.");
        } else {
          await hydratePublicData();
        }
      } catch (err) {
        if (!annule) {
          notify.erreur(
            err instanceof ApiError && err.statusCode === 401
              ? "Reconnectez-vous pour charger les auteurs."
              : "Impossible de charger les auteurs depuis le serveur.",
          );
        }
      }
    })();

    return () => {
      annule = true;
    };
  }, [collection, definir]);

  useEffect(() => {
    if (collection !== "utilisateurs" || !pret || !requis.includes(role)) return;

    let annule = false;
    UsersApi.fetchAll()
      .then((users) => {
        if (annule) return;
        definir(
          users.map((user: Record<string, unknown>) => ({
            id: String(user["_id"] ?? ""),
            nom: `${String(user["prenom"] ?? "")} ${String(user["nom"] ?? "")}`.trim(),
            email: String(user["email"] ?? ""),
            role: String(user["role"] ?? "lecteur"),
            statut: String(user["statut"] ?? "Actif"),
            inscription: String(user["createdAt"] ?? "").slice(0, 10),
          })),
        );
      })
      .catch((err) => {
        if (!annule) {
          notify.erreur(
            err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)
              ? "Reconnectez-vous avec le compte administrateur pour charger les utilisateurs."
              : "Impossible de charger les utilisateurs.",
          );
        }
      });

    return () => {
      annule = true;
    };
  }, [collection, definir, pret, role, requis]);

  const liste = useMemo(() => {
    const texte = q.trim().toLowerCase();
    return items.filter((row) => {
      const okFiltre =
        !filtre || valeurFiltre === "Tous" || String(row[filtre.cle] ?? "") === valeurFiltre;
      const okTexte =
        !texte ||
        clesRecherche.length === 0 ||
        clesRecherche.some((c) => String(row[c] ?? "").toLowerCase().includes(texte));
      return okFiltre && okTexte;
    });
  }, [items, q, valeurFiltre, filtre, clesRecherche]);

  if (!pret) return null;
  if (!requis.includes(role)) return <AccesRestreint requis={requis} />;

  const libelle = (row: Item) =>
    String(row["titre"] ?? row["nom"] ?? row["code"] ?? row["email"] ?? row.id);

  const normaliserReponseApi = (payload: any): Item => {
    const item = payload?.data ?? payload ?? {};
    const id = String(item?.id ?? item?._id ?? crypto.randomUUID());
    return { ...(item ?? {}), id } as Item;
  };

  const preparerPayloadLivre = (valeurs: Record<string, unknown>) => {
    const payload = { ...valeurs };
    if (!String(payload["resume"] ?? "").trim()) {
      payload["resume"] = "Résumé à compléter.";
    }
    if (!payload["pages"] || Number(payload["pages"]) < 1) {
      payload["pages"] = 200;
    }
    if (!String(payload["formats"] ?? "").trim()) {
      payload["formats"] = "PDF, EPUB";
    }
    if (!payload["promo"] || Number(payload["promo"]) <= 0) {
      delete payload["promo"];
    }
    if (!payload["prixPapier"] || Number(payload["prixPapier"]) <= 0) {
      delete payload["prixPapier"];
    }
    return payload;
  };

  const messageErreurApi = (error: unknown) => {
    if (error instanceof ApiError) {
      if (Array.isArray(error.errors) && error.errors.length > 0) {
        return error.errors.join(" · ");
      }
      return error.message;
    }
    return error instanceof Error ? error.message : "Erreur lors de l'enregistrement";
  };

  const enregistrer = async (valeurs: Record<string, unknown>) => {
    try {
      if (collection === "articles") {
        if (edition?.row) {
          await ArticlesApi.update(String(edition.row.id), valeurs);
        } else {
          const response = await ArticlesApi.create(valeurs);
          const item = normaliserReponseApi(response);
          creer(item);
          notify.cree(singulier, libelle(item));
          onApresEnregistrement?.({ avant: null, apres: item, creation: true });
          setEdition(null);
          return;
        }
      }

      if (collection === "livres") {
        const payload = preparerPayloadLivre(valeurs);
        if (edition?.row) {
          await LivresApi.update(String(edition.row.id), payload);
          await rechargerLivresAdmin();
          const apres = { ...edition.row, ...payload } as Item;
          notify.modifie(singulier, String(valeurs["titre"] ?? edition.row.id));
          onApresEnregistrement?.({ avant: edition.row, apres, creation: false });
          setEdition(null);
          return;
        }

        const response = await LivresApi.create(payload);
        const item = normaliserReponseApi(response);
        await rechargerLivresAdmin();
        notify.cree(singulier, libelle(item));
        onApresEnregistrement?.({ avant: null, apres: item, creation: true });
        setEdition(null);
        return;
      }

      if (collection === "utilisateurs") {
        const nomComplet = String(valeurs["nom"] ?? "").trim();
        const morceaux = nomComplet.split(/\s+/).filter(Boolean);
        const prenom = morceaux.length > 1 ? morceaux[0] : "";
        const nom = morceaux.length > 1 ? morceaux.slice(1).join(" ") : nomComplet;
        const payload: Record<string, unknown> = {
          nom,
          prenom,
          email: String(valeurs["email"] ?? "").trim(),
          role: String(valeurs["role"] ?? "lecteur"),
          statut: String(valeurs["statut"] ?? "Actif"),
        };
        if (edition?.row) {
          await UsersApi.update(String(edition.row.id), payload);
        } else {
          const password = String(valeurs["password"] ?? "");
          if (password.length < 6) {
            notify.erreur("Le mot de passe doit contenir au moins 6 caractères.");
            return;
          }
          await UsersApi.create({ ...payload, password });
        }
        const users = await UsersApi.fetchAll();
        definir(
          users.map((user: Record<string, unknown>) => ({
            id: String(user["_id"] ?? ""),
            nom: `${String(user["prenom"] ?? "")} ${String(user["nom"] ?? "")}`.trim(),
            email: String(user["email"] ?? ""),
            role: String(user["role"] ?? "lecteur"),
            statut: String(user["statut"] ?? "Actif"),
            inscription: String(user["createdAt"] ?? "").slice(0, 10),
          })),
        );
        notify.succes(edition?.row ? "Rôle et accès mis à jour." : "Utilisateur créé.");
        setEdition(null);
        return;
      }

      if (collection === "categoriesMedia") {
        const payload = {
          nom: String(valeurs["nom"] ?? "").trim(),
          type: "media" as const,
          visibilite: String(valeurs["visibilite"] ?? "Publique") || "Publique",
        };
        if (!payload.nom) {
          notify.erreur("Indiquez le nom de la catégorie.");
          return;
        }
        if (edition?.row) {
          await CategoriesApi.update(String(edition.row.id), payload);
        } else {
          await CategoriesApi.create(payload);
        }
        await rechargerCategoriesMedia();
        if (edition?.row) notify.modifie(singulier, payload.nom);
        else notify.cree(singulier, payload.nom);
        setEdition(null);
        return;
      }

      if (collection === "auteurs") {
        const payload = preparerPayloadAuteur(valeurs);
        if (edition?.row) {
          await AuteursApi.update(String(edition.row.id), payload);
          await rechargerAuteursAdmin();
          const apres = { ...edition.row, ...payload } as Item;
          notify.modifie(singulier, String(valeurs["nom"] ?? edition.row.id));
          onApresEnregistrement?.({ avant: edition.row, apres, creation: false });
          setEdition(null);
          return;
        }

        const response = await AuteursApi.create(payload);
        const item = normaliserReponseApi(response);
        await rechargerAuteursAdmin();
        notify.cree(singulier, libelle(item));
        onApresEnregistrement?.({ avant: null, apres: item, creation: true });
        setEdition(null);
        return;
      }

      if (edition?.row) {
        modifier(edition.row.id, valeurs);
        const apres = { ...edition.row, ...valeurs } as Item;
        notify.modifie(singulier, String(valeurs["titre"] ?? valeurs["nom"] ?? edition.row.id));
        onApresEnregistrement?.({ avant: edition.row, apres, creation: false });
      } else {
        const item = creer(valeurs as Omit<Item, "id"> & { id?: string });
        notify.cree(singulier, libelle(item));
        onApresEnregistrement?.({ avant: null, apres: item, creation: true });
      }
    } catch (error) {
      notify.erreur(messageErreurApi(error));
      return;
    }

    setEdition(null);
  };

  const confirmerSuppression = async () => {
    if (!aSupprimer) return;

    const nom = libelle(aSupprimer);
    try {
      if (collection === "livres") {
        await LivresApi.delete(aSupprimer.id);
        await rechargerLivresAdmin();
      } else if (collection === "categoriesMedia") {
        await CategoriesApi.delete(aSupprimer.id);
        await rechargerCategoriesMedia();
      } else if (collection === "auteurs") {
        await AuteursApi.delete(aSupprimer.id);
        await rechargerAuteursAdmin();
      } else if (collection === "utilisateurs") {
        await UsersApi.delete(aSupprimer.id);
        supprimer(aSupprimer.id);
      } else {
        supprimer(aSupprimer.id);
      }
      notify.supprime(singulier, nom);
    } catch (error) {
      notify.erreur(messageErreurApi(error));
    } finally {
      setASupprimer(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-2xl">{titre}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {clesRecherche.length > 0 && (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            aria-label={`Rechercher dans ${titre}`}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
        )}
        {filtre && (
          <select
            value={valeurFiltre}
            onChange={(e) => setValeurFiltre(e.target.value)}
            aria-label={filtre.label}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            {["Tous", ...filtre.options].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        )}
        {!lectureSeule && (
          <button
            type="button"
            onClick={() => setEdition({ row: null })}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> Ajouter
          </button>
        )}
      </div>

      {entetePersonnalisee}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {colonnes.map((c) => (
                <th key={c.cle} className="px-4 py-3 font-normal">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {liste.map((row) => (
              <tr key={row.id}>
                {colonnes.map((c) => (
                  <td key={c.cle} className={`px-4 py-3 ${c.classe ?? ""}`}>
                    {c.rendu ? c.rendu(row) : String(row[c.cle] ?? "—")}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {!lectureSeule && (
                      <RowActionsMenu
                        actions={[
                          ...(actionsLigne?.(row) ?? []),
                          {
                            label: "Modifier",
                            icon: Pencil,
                            onClick: () => setEdition({ row }),
                          },
                          {
                            label: "Supprimer",
                            icon: Trash2,
                            destructive: true,
                            separatorBefore: true,
                            onClick: () => setASupprimer(row),
                          },
                        ]}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {liste.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Aucun élément ne correspond.</p>
      )}

      {edition && (
        <FormulaireDialog
          titre={edition.row ? `Modifier ${singulier.toLowerCase()}` : `Nouveau ${singulier.toLowerCase()}`}
          champs={champs.filter((c) => !c.creationSeulement || !edition.row)}
          valeursInitiales={edition.row ?? {}}
          fichierLivreId={collection === "livres" ? edition.row?.id : undefined}
          onAnnuler={() => setEdition(null)}
          onEnregistrer={enregistrer}
        />
      )}

      <ConfirmDialog
        ouvert={!!aSupprimer}
        titre={`Supprimer ${singulier.toLowerCase()} ?`}
        message={
          aSupprimer
            ? `« ${libelle(aSupprimer)} » sera définitivement retiré de la liste. Cette action est irréversible.`
            : ""
        }
        onAnnuler={() => {
          setASupprimer(null);
          notify.annule("Suppression annulée");
        }}
        onConfirmer={() => void confirmerSuppression()}
      />
    </div>
  );
}

function FormulaireDialog({
  titre,
  champs,
  valeursInitiales,
  onAnnuler,
  onEnregistrer,
  fichierLivreId,
}: {
  titre: string;
  champs: Champ[];
  valeursInitiales: Partial<Item>;
  onAnnuler: () => void;
  onEnregistrer: (v: Record<string, unknown>) => void;
  fichierLivreId?: string;
}) {
  const [valeurs, setValeurs] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(
      champs.map((c) => [
        c.nom,
        valeurInitiale(valeursInitiales[c.nom], c),
      ]),
    ),
  );

  const manquant = champs.some((c) => {
    if (!c.requis) return false;
    const val = valeurs[c.nom];
    if (c.type === "richtext") return richTextIsEmpty(String(val ?? ""));
    return String(val ?? "").trim() === "";
  });

  const largeForm = champs.some((c) => c.type === "richtext");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0" onClick={onAnnuler} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manquant) {
            notify.erreur("Champs obligatoires manquants");
            return;
          }
          onEnregistrer(valeurs);
        }}
        className={`relative max-h-[85vh] w-full overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl ${largeForm ? "max-w-3xl" : "max-w-lg"}`}
      >
        <h3 className="font-display text-xl">{titre}</h3>
        <div className="mt-5 grid gap-4">
          {champs.map((c) => {
            const id = `champ-${c.nom}`;
            const commun =
              "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
            return (
              <div key={c.nom}>
                <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
                  {c.label}
                  {c.requis && " *"}
                </label>
                {c.type === "richtext" ? (
                  <ArticleRichEditor
                    value={String(valeurs[c.nom] ?? "")}
                    onChange={(html) => setValeurs((v) => ({ ...v, [c.nom]: html }))}
                    placeholder={c.placeholder ?? "Rédigez la description…"}
                  />
                ) : c.type === "textarea" ? (
                  <textarea
                    id={id}
                    rows={3}
                    value={String(valeurs[c.nom] ?? "")}
                    placeholder={c.placeholder}
                    onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.value }))}
                    className={commun}
                  />
                ) : c.type === "select" ? (
                  <select
                    id={id}
                    value={String(valeurs[c.nom] ?? "")}
                    onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.value }))}
                    className={commun}
                  >
                    {(c.options ?? []).map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : c.type === "switch" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      id={id}
                      type="checkbox"
                      checked={Boolean(valeurs[c.nom])}
                      onChange={(e) => setValeurs((v) => ({ ...v, [c.nom]: e.target.checked }))}
                      className="size-4"
                    />
                    {c.placeholder ?? "Activé"}
                  </label>
                ) : c.type === "image" ? (
                  <ChampImage
                    id={id}
                    valeur={String(valeurs[c.nom] ?? "")}
                    placeholder={c.placeholder}
                    apercu={c.apercu ?? (c.nom === "photo" ? "avatar" : "cover")}
                    onChange={(url) => setValeurs((v) => ({ ...v, [c.nom]: url }))}
                  />
                ) : c.type === "file" ? (
                  <ChampFichier
                    format={c.nom === "epubUrl" ? "epub" : "pdf"}
                    valeur={String(valeurs[c.nom] ?? "")}
                    livreId={fichierLivreId}
                    onChange={(url) => setValeurs((v) => ({ ...v, [c.nom]: url }))}
                  />
                ) : (
                  <input
                    id={id}
                    type={
                      c.type === "number" ? "number" : c.type === "date" ? "date" : c.type === "password" ? "password" : "text"
                    }
                    value={String(valeurs[c.nom] ?? "")}
                    placeholder={c.placeholder}
                    onChange={(e) =>
                      setValeurs((v) => ({
                        ...v,
                        [c.nom]: c.type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className={commun}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-lg border border-border px-4 py-2 text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

function valeurInitiale(valeur: unknown, champ: Champ): unknown {
  if (valeur !== undefined && valeur !== null) {
    if (champ.type === "richtext") return plainTextToHtml(String(valeur));
    return valeur;
  }
  if (champ.defaut !== undefined) return champ.defaut;
  if (champ.type === "switch") return false;
  if (champ.type === "number") return 0;
  if (champ.type === "select") return champ.options?.[0] ?? "";
  return "";
}

function ChampImage({
  id,
  valeur,
  placeholder,
  apercu = "cover",
  onChange,
}: {
  id: string;
  valeur: string;
  placeholder?: string | undefined;
  apercu?: "cover" | "avatar";
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const src = resolveMediaUrl(valeur) ?? valeur;
  const urlAffichee = valeur.startsWith("data:") ? "" : valeur;
  const estAvatar = apercu === "avatar";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          type="text"
          value={urlAffichee}
          placeholder={placeholder ?? "URL Cloudinary ou lien externe"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setUploading(true);
            void uploadMediaImage(f)
              .then((url) => {
                onChange(url);
                notify.succes("Image téléversée sur Cloudinary");
              })
              .catch((error) => {
                notify.erreur(
                  error instanceof Error ? error.message : "Impossible de téléverser l'image",
                );
              })
              .finally(() => {
                setUploading(false);
                e.target.value = "";
              });
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {uploading ? "Envoi…" : "Téléverser"}
        </button>
      </div>
      {src && (
        <div
          className={
            estAvatar
              ? "relative size-28 overflow-hidden rounded-full border-2 border-brand-gold/40 shadow-sm"
              : "relative w-28 overflow-hidden rounded-lg border border-border"
          }
        >
          <img
            src={src}
            alt={estAvatar ? "Aperçu photo auteur" : "Aperçu couverture"}
            className={
              estAvatar
                ? "size-full object-cover object-[center_20%]"
                : "aspect-[2/3] w-full object-cover"
            }
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white"
            aria-label={estAvatar ? "Retirer la photo" : "Retirer la couverture"}
          >
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function ChampFichier({
  format,
  valeur,
  livreId,
  onChange,
}: {
  format: "pdf" | "epub";
  valeur: string;
  livreId?: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const extension = format.toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept={format === "pdf" ? "application/pdf,.pdf" : "application/epub+zip,.epub"}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file || !livreId) return;
          setUploading(true);
          void LivresApi.uploadFichier(livreId, format, file)
            .then((response) => {
              const url = response?.data?.fichiers?.[`${format}Url`];
              if (typeof url === "string") onChange(url);
              notify.succes(`Fichier ${extension} téléversé`);
            })
            .catch((error) => notify.erreur(error instanceof Error ? error.message : "Échec du téléversement"))
            .finally(() => {
              setUploading(false);
              event.target.value = "";
            });
        }}
      />
      <button
        type="button"
        disabled={!livreId || uploading}
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary disabled:opacity-50"
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        {uploading ? "Envoi..." : `Téléverser ${extension}`}
      </button>
      {valeur && <span className="max-w-full truncate text-xs text-muted-foreground">Fichier disponible</span>}
      {!livreId && <span className="text-xs text-muted-foreground">Enregistrez d’abord le livre.</span>}
    </div>
  );
}
