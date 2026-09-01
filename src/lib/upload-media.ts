import { MediasApi } from "./api-client";
import { ApiError } from "./api-client";

/** Téléverse une image vers Cloudinary via l'API médias (auth requise). */
export async function uploadMediaImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const response = await MediasApi.upload(form);
  const media = response?.data ?? response;
  const url = media?.url;

  if (!url || typeof url !== "string") {
    throw new ApiError("Réponse de téléversement invalide", 500);
  }

  if (url.startsWith("/uploads/")) {
    throw new ApiError(
      "Le serveur n'a pas téléversé l'image sur Cloudinary. Vérifiez CLOUDINARY_* dans .env du backend.",
      503,
    );
  }

  return url;
}
