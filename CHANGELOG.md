# Changelog

## [1.0.0] — 2026-11-20

### Ajouté

- Outil de calcul (FR/EN) : chargement CSV (glisser-déposer, 50 Mo, détection encodage / séparateur / format des nombres et des dates), association des colonnes mémorisée, classement des types de mouvement, paramètres globaux et par article.
- Moteur : agrégation hebdomadaire ou mensuelle avec périodes à zéro, 3 méthodes de stock de sécurité, point de commande, stock cible, ABC-XYZ, stock reconstitué, couverture, alertes.
- Graphiques ECharts (stock dans le temps avec ruptures, consommation, Pareto, stock par classe, top 20 des surstocks), export PNG avec filigrane, export CSV protégé, panneau « Comment c'est calculé ? ».
- 6 guides par langue, 4 mini-calculateurs par langue, méthodologie, confidentialité, mentions légales, page 404 bilingue.
- SEO : hreflang, canonical, sitemap, JSON-LD, images Open Graph.
- Sécurité : CSP stricte sans `unsafe-inline`, aucune ressource tierce.
- Tests : 165 tests unitaires, 14 tests Playwright ; CI GitHub Actions avec déploiement Pages ; Dependabot.
