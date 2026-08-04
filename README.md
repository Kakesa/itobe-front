# Ink & Insight

Travaille seulement le front de ce cahier 

CAHIER DES CHARGES

Plateforme de Média & Maison d'Édition Numérique

Version : 1.1
 Auteur : Espoir Kakesa

Client : Christopher Bigo’s
 Date : Juillet 2026





1. Présentation du projet

Nom du projet

Itobe entreprise

Contexte

Le projet consiste à concevoir une plateforme web moderne réunissant deux univers complémentaires :

Un portail Média, dédié à la publication d'actualités, d'articles, d'interviews, de chroniques et de contenus multimédias.

Un portail Maison d'Édition, destiné à la publication, la promotion, la vente et la lecture de livres numériques et physiques.

L'objectif est de créer un véritable écosystème numérique permettant aux journalistes, auteurs, éditeurs et lecteurs, découvrir, acheter et consulter des contenus depuis une plateforme unique.





2. Objectifs

La plateforme devra permettre de :

Publier des articles et des actualités.

Publier des livres numériques et physiques.

Commercialiser des ouvrages en ligne.

Permettre la lecture des livres directement sur la plateforme.

Promouvoir les auteurs et leurs œuvres.

Gérer une bibliothèque numérique personnelle.

Gérer les paiements en ligne.

Développer une communauté de lecteurs et d'abonnés.

Proposer des abonnements premium et des contenus exclusifs.





3. Architecture générale

La plateforme sera composée de deux grands portails partageant un même système d'authentification et un même espace d'administration.

Accueil




├── Média

│   ├── Actualités

│   ├── Articles

│   ├── Catégories

│   ├── Auteurs

│   ├── Newsletter

│   └── Recherche

│

├── Maison d'Édition

│   ├── Catalogue

│   ├── Livres

│   ├── Auteurs

│   ├── Promotions

│   ├── Bibliothèque

│   ├── Reader

│   └── Commandes

│

├── À propos

├── Contact

├── Connexion

└── Tableau de bord





4. Portail Média

Fonctionnalités

Le portail Média permettra :

Publication d'articles.

Publication d'actualités.

Gestion des catégories.

Gestion des tags.

Gestion des auteurs.

Publication programmée.

Brouillons.

Galerie d'images.

Intégration de vidéos YouTube.

Commentaires.

Partage sur les réseaux sociaux.

Newsletter.

Recherche avancée.

Articles populaires.

Articles recommandés.

SEO optimisé.





5. Portail Maison d'Édition

Le portail Édition permettra de gérer l'ensemble du cycle de vie d'un livre.

Gestion des livres

Chaque livre comportera notamment :

Titre

Sous-titre

Auteur

ISBN

Résumé

Couverture

Galerie d'images

Aperçu PDF

Nombre de pages

Langue

Catégorie

Date de publication

Format (PDF, EPUB, Papier)

Prix

Promotion

Disponibilité

Stock (livres physiques)





Publication

L'éditeur pourra :

Créer un livre.

Modifier un livre.

Publier.

Dépublier.

Archiver.

Mettre en avant un ouvrage.





6. Reader intégré (Lecture en ligne)

La plateforme intégrera un Reader permettant aux lecteurs de consulter les ouvrages directement dans leur navigateur, sans téléchargement obligatoire.

Fonctionnalités

Le lecteur pourra :

Lire le livre en ligne.

Reprendre automatiquement la lecture à la dernière page.

Naviguer par chapitre.

Accéder à la table des matières.

Effectuer des recherches dans le livre.

Ajouter des marque-pages.

Ajouter des favoris.

Passer en mode clair ou sombre.

Modifier la taille du texte (EPUB).

Lire en plein écran.

Synchroniser la progression entre plusieurs appareils.

Être entièrement responsive (ordinateur, tablette, mobile).





7. Aperçu gratuit des livres

Avant l'achat, le lecteur pourra consulter un extrait du livre.

L'administrateur disposera d'un contrôle total sur les contenus accessibles gratuitement.

Paramètres configurables

L'administrateur pourra :

Définir le nombre de pages gratuites.

Débloquer uniquement certaines pages.

Débloquer un ou plusieurs chapitres.

Définir un pourcentage du livre accessible gratuitement (5 %, 10 %, 20 %, etc.).

Activer ou désactiver les aperçus.

Prévisualiser l'expérience utilisateur avant publication.

Cette fonctionnalité permettra de donner envie aux lecteurs d'acheter l'ouvrage complet.





8. Bibliothèque numérique

Chaque utilisateur disposera d'une bibliothèque personnelle.

Elle comprendra :

Les livres achetés.

Les livres téléchargés.

Les livres favoris.

L'historique de lecture.

Les téléchargements.

Les derniers livres consultés.

La synchronisation automatique de la progression de lecture.





9. Paiement

La plateforme prendra en charge :

Mobile Money

Cartes bancaires

Après validation du paiement, le lecteur pourra :

Lire le livre intégralement en ligne.

Télécharger le livre (si l'éditeur l'autorise).

Retrouver automatiquement le livre dans sa bibliothèque.





10. Gestion des auteurs

Chaque auteur possédera une page publique comprenant :

Photo

Biographie

Réseaux sociaux

Livres publiés

Articles publiés

Nombre de ventes

Nombre de lectures

Nombre de téléchargements





11. Gestion des utilisateurs

Administrateur

Accès complet à la plateforme :

Gestion des utilisateurs.

Gestion des rôles et permissions.

Gestion des auteurs.

Gestion des articles.

Gestion des livres.

Gestion des catégories.

Gestion des médias.

Gestion des commandes.

Gestion des paiements.

Gestion des coupons.

Gestion des abonnements.

Gestion des newsletters.

Paramètres généraux.





Éditeur

Publication des livres.

Gestion des ouvrages.

Gestion des auteurs.





Journaliste

Version future





Auteur

version future





Lecteur

Lire les articles.

Acheter des livres.

Lire les livres en ligne.

Télécharger les livres.

Commenter les articles.

Gérer sa bibliothèque.





12. Tableau de bord

Le tableau de bord affichera :

Nombre d'articles publiés.

Nombre de livres.

Ventes.

Revenus.

Lectures en ligne.

Téléchargements.

Visiteurs.

Nouveaux utilisateurs.

Abonnés à la newsletter.

Livres les plus vendus.

Articles les plus consultés.

Graphiques :

Revenus

Ventes

Lectures

Téléchargements

Trafic

Croissance des utilisateurs





13. Recherche avancée

Recherche sur :

Articles

Livres

Auteurs

Catégories

Mots-clés

Filtres :

Prix

Auteur

Date

Popularité

Format

Catégorie





14. Sécurité

Authentification JWT.

Gestion des rôles.

Permissions avancées.

Protection contre les téléchargements non autorisés.

Désactivation de la copie du texte.

Désactivation de l'impression.

Filigrane dynamique sur les fichiers téléchargés.

Liens de lecture sécurisés.

Historique des connexions.





15. SEO

URL optimisées.

Sitemap.

Robots.txt.

Meta Title.

Meta Description.

Open Graph.

Twitter Cards.

JSON-LD.

Canonical URLs.





16. Technologies

Frontend

React

Vite

Tailwind CSS

TanStack Router

TanStack Query

Backend

Node.js

Express.js

Base de données

MongoDB

Mongoose

Authentification

JWT

Refresh Token

Paiement

Mobile Money

Stockage

Cloudinary


Vision

Cette plateforme a pour ambition de devenir un écosystème numérique complet, combinant un média en ligne et une maison d'édition digitale. Elle offrira aux auteurs, éditeurs et lecteurs un espace unique pour créer, publier, diffuser, vendre et consulter des contenus de qualité. Grâce à son Reader intégré, sa bibliothèque numérique, son système de vente de livres et ses outils de gestion avancés, elle se positionne comme une solution moderne, évolutive et adaptée aux besoins des acteurs de l'édition et des médias.


## Build with Lovable


## Development

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
