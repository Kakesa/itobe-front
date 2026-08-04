import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl">
            Itobe<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Média en ligne et maison d'édition numérique. Créer, publier, diffuser, lire.
          </p>
        </div>

        <div>
          <p className="kicker">Média</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/media" className="hover:text-foreground">
                Actualités
              </Link>
            </li>
            <li>
              <Link to="/media" className="hover:text-foreground">
                Articles
              </Link>
            </li>
            <li>
              <Link to="/auteurs" className="hover:text-foreground">
                Auteurs
              </Link>
            </li>
            <li>
              <Link to="/recherche" className="hover:text-foreground">
                Recherche
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="kicker">Édition</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/edition" className="hover:text-foreground">
                Catalogue
              </Link>
            </li>
            <li>
              <Link to="/bibliotheque" className="hover:text-foreground">
                Ma bibliothèque
              </Link>
            </li>
            <li>
              <Link to="/tableau-de-bord" className="hover:text-foreground">
                Tableau de bord
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="kicker">Newsletter</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Un résumé éditorial chaque vendredi.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLFormElement).reset();
            }}
          >
            <input
              type="email"
              required
              placeholder="votre@email.com"
              className="min-w-0 flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button className="rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
              OK
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © 2026 Itobe Entreprise — Tous droits réservés.
      </div>
    </footer>
  );
}
