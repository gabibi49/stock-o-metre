# Changelog

## [Non publié]

### Ajouté

- Rubrique « Exercices corrigés » (FR/EN) : 10 exercices (stock de sécurité, point de commande, Wilson, ABC, taux de service), au niveau débutant et au niveau certification, avec une correction pas à pas qui s'ouvre au clic, sans script. Une page par exercice, une page d'index avec un tableau par thème et par niveau, et une image de partage.
- Page « Kit ordonnancement » (FR/EN) : présentation du futur kit Excel (bientôt disponible, sans prix, formulaire ni collecte), description du fichier des OF (une ligne par opération), fichier CSV d'exemple, aperçu calculé au build (deux Gantt, charge par poste, comparaison de règles de séquencement).
- Test unitaire qui recalcule toutes les corrections avec le moteur du site.
- Menu : entrée « Exercices » ; « Méthodologie » passe dans le pied de page. Bandeau « Aller plus loin » en bas de l'accueil.

## [1.0.0] — 2026-11-20

### Ajouté

- Outil de calcul (FR/EN) : chargement CSV (glisser-déposer, 50 Mo, détection encodage / séparateur / format des nombres et des dates), association des colonnes mémorisée, classement des types de mouvement, paramètres globaux et par article.
- Moteur : agrégation hebdomadaire ou mensuelle avec périodes à zéro, 3 méthodes de stock de sécurité, point de commande, stock cible, ABC-XYZ, stock reconstitué, couverture, alertes.
- Graphiques ECharts (stock dans le temps avec ruptures, consommation, Pareto, stock par classe, top 20 des surstocks), export PNG avec filigrane, export CSV protégé, panneau « Comment c'est calculé ? ».
- 6 guides par langue, 4 mini-calculateurs par langue, méthodologie, confidentialité, mentions légales, page 404 bilingue.
- SEO : hreflang, canonical, sitemap, JSON-LD, images Open Graph.
- Sécurité : CSP stricte sans `unsafe-inline`, aucune ressource tierce.
- Tests : 165 tests unitaires, 14 tests Playwright ; CI GitHub Actions avec déploiement Pages ; Dependabot.
