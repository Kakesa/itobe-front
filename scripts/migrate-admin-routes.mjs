import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.join(__dirname, "../src/routes");

const migrations = [
  ["admin.articles.tsx", "admin.media.articles.tsx", "/admin/articles", "/admin/media/articles"],
  ["admin.actualites.tsx", "admin.media.actualites.tsx", "/admin/actualites", "/admin/media/actualites"],
  ["admin.medias.tsx", "admin.media.medias.tsx", "/admin/medias", "/admin/media/medias"],
  ["admin.commentaires.tsx", "admin.media.commentaires.tsx", "/admin/commentaires", "/admin/media/commentaires"],
  ["admin.seo.tsx", "admin.media.seo.tsx", "/admin/seo", "/admin/media/seo"],
  ["admin.utilisateurs.tsx", "admin.media.utilisateurs.tsx", "/admin/utilisateurs", "/admin/media/utilisateurs"],
  ["admin.roles.tsx", "admin.media.roles.tsx", "/admin/roles", "/admin/media/roles"],
  ["admin.parametres.tsx", "admin.media.parametres.tsx", "/admin/parametres", "/admin/media/parametres"],
  ["admin.calendrier.tsx", "admin.media.calendrier.tsx", "/admin/calendrier", "/admin/media/calendrier"],
  ["admin.rapports.tsx", "admin.media.rapports.tsx", "/admin/rapports", "/admin/media/rapports"],
  ["admin.statistiques.tsx", "admin.media.statistiques.tsx", "/admin/statistiques", "/admin/media/statistiques"],
  ["admin.newsletter.tsx", "admin.media.newsletter.tsx", "/admin/newsletter", "/admin/media/newsletter"],
  ["admin.newsletter.index.tsx", "admin.media.newsletter.index.tsx", "/admin/newsletter/", "/admin/media/newsletter/"],
  ["admin.newsletter.abonnes.tsx", "admin.media.newsletter.abonnes.tsx", "/admin/newsletter/abonnes", "/admin/media/newsletter/abonnes"],
  ["admin.newsletter.templates.tsx", "admin.media.newsletter.templates.tsx", "/admin/newsletter/templates", "/admin/media/newsletter/templates"],
  ["admin.newsletter.campagnes.tsx", "admin.media.newsletter.campagnes.tsx", "/admin/newsletter/campagnes", "/admin/media/newsletter/campagnes"],
  ["admin.newsletter.campagne.$id.tsx", "admin.media.newsletter.campagne.$id.tsx", "/admin/newsletter/campagne/$id", "/admin/media/newsletter/campagne/$id"],
  ["admin.livres.tsx", "admin.edition.livres.tsx", "/admin/livres", "/admin/edition/livres"],
  ["admin.auteurs.tsx", "admin.edition.auteurs.tsx", "/admin/auteurs", "/admin/edition/auteurs"],
  ["admin.categories.tsx", "admin.edition.categories.tsx", "/admin/categories", "/admin/edition/categories"],
  ["admin.commandes.tsx", "admin.edition.commandes.tsx", "/admin/commandes", "/admin/edition/commandes"],
  ["admin.paiements.tsx", "admin.edition.paiements.tsx", "/admin/paiements", "/admin/edition/paiements"],
  ["admin.coupons.tsx", "admin.edition.coupons.tsx", "/admin/coupons", "/admin/edition/coupons"],
  ["admin.promotions.tsx", "admin.edition.promotions.tsx", "/admin/promotions", "/admin/edition/promotions"],
];

for (const [oldName, newName, oldPath, newPath] of migrations) {
  const oldFile = path.join(routesDir, oldName);
  const newFile = path.join(routesDir, newName);

  if (!fs.existsSync(oldFile)) {
    console.warn("Skip missing:", oldName);
    continue;
  }

  let content = fs.readFileSync(oldFile, "utf8");
  content = content.replaceAll(oldPath, newPath);
  content = content.replace(
    `createFileRoute("${oldPath}")`,
    `createFileRoute("${newPath}")`,
  );

  fs.writeFileSync(newFile, content);
  console.log("Created:", newName);

  const redirectContent = `import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("${oldPath}")({
  beforeLoad: () => {
    throw redirect({ to: "${newPath}" as "${newPath}" });
  },
});
`;

  fs.writeFileSync(oldFile, redirectContent);
  console.log("Redirect:", oldName, "->", newPath);
}

// Edition calendrier copy from media calendrier
const mediaCal = path.join(routesDir, "admin.media.calendrier.tsx");
const editionCal = path.join(routesDir, "admin.edition.calendrier.tsx");
if (fs.existsSync(mediaCal) && !fs.existsSync(editionCal)) {
  let c = fs.readFileSync(mediaCal, "utf8");
  c = c.replaceAll("/admin/media/calendrier", "/admin/edition/calendrier");
  fs.writeFileSync(editionCal, c);
  console.log("Created: admin.edition.calendrier.tsx");
}

const editionReports = [
  ["admin.edition.rapports.tsx", "/admin/rapports", "/admin/edition/rapports"],
  ["admin.edition.statistiques.tsx", "/admin/statistiques", "/admin/edition/statistiques"],
];

for (const [file, oldP, newP] of editionReports) {
  const mediaFile = file.replace("edition", "media");
  const src = path.join(routesDir, mediaFile);
  const dest = path.join(routesDir, file);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    let c = fs.readFileSync(src, "utf8");
    c = c.replaceAll("/admin/media/", "/admin/edition/");
    fs.writeFileSync(dest, c);
    console.log("Created:", file);
  }
}

console.log("Done.");
