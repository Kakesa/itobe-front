import { Link } from "@tanstack/react-router";
import { usePortailActif } from "@/hooks/use-portail";

export function SiteFooter() {
  const portail = usePortailActif();
  const estMedia = portail === "media";

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-display text-2xl">
            Itobe<span className="text-accent">.</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {estMedia ? "Portail Média" : "Maison d'édition"}
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {estMedia
              ? "Actualités, enquêtes et chroniques autour du livre et de la culture."
              : "Publier, promouvoir et lire des ouvrages numériques et physiques."}
          </p>
        </div>

        <div>
          <p className="kicker">Navigation</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {estMedia ? (
              <>
                <li>
                  <Link to="/media" className="hover:text-foreground">
                    Actualités
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
              </>
            ) : (
              <>
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
                  <Link to="/admin" className="hover:text-foreground">
                    Tableau de bord
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link to="/a-propos" className="hover:text-foreground">
                À propos
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
          <p className="kicker">Plateforme</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                Changer de portail
              </Link>
            </li>
            <li>
              <Link
                to={estMedia ? "/edition" : "/media"}
                className="hover:text-foreground"
              >
                {estMedia ? "Maison d'édition" : "Portail Média"}
              </Link>
            </li>
            <li>
              <Link to="/connexion" className="hover:text-foreground">
                Connexion
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © 2026 Itobe Entreprise — Tous droits réservés.
      </div>
    </footer>
  );
}
