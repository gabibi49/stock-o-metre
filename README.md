# Stock-o-mètre

Site web statique et bilingue (FR / EN) de calcul du stock de sécurité, du point de commande et du stock cible à partir d'un CSV de mouvements de stock. Tout le calcul se fait dans le navigateur : le fichier du visiteur n'est jamais envoyé.

Adresse prévue : https://gabibi49.github.io/stock-o-metre/

## Prérequis

- Node.js **22.23.4 ou plus récent** (exigé par Astro 7). Vérifier avec `node -v`.
- npm 10+ et git.

## Lancer en local

```powershell
npm ci
npm run dev
```

Ouvrir ensuite http://localhost:4321/stock-o-metre/fr/. En mode `dev`, la CSP n'est pas appliquée, car le rechargement à chaud de Vite insère des styles en ligne. Pour tester le site tel qu'il sera publié :

```powershell
npm run build
npm run preview
```

## Tester

| Commande | Rôle |
|---|---|
| `npm run lint` | ESLint (avec interdiction de `innerHTML`, `eval`…) et Prettier |
| `npm run check` | vérification des types (TypeScript strict, `astro check`) |
| `npm test` | tests unitaires Vitest (formules, agrégation, lecture CSV, jeu fictif) |
| `npm run build` puis `npm run test:e2e` | tests Playwright sur le site construit, dont « aucune requête réseau pendant l'analyse » |
| `npm run verify` | enchaîne toutes les commandes ci-dessus |

Avant le premier `test:e2e`, installer le navigateur : `npx playwright install chromium`. Astro 7 refuse deux serveurs `preview` en même temps : arrêtez tout `npm run preview` en cours avant de lancer les tests.

Pour régénérer le jeu de données fictif (`tests/fixtures/` et `public/exemple-mouvements.csv`) : `npm run fixtures`.

## Déployer sur GitHub Pages (pas à pas)

1. Sur GitHub, créer un dépôt **public** nommé `stock-o-metre` (sans README, pour éviter un conflit).
2. Dans ce dossier :
   ```powershell
   git add -A
   git commit -m "Première version"
   git remote add origin https://github.com/gabibi49/stock-o-metre.git
   git push -u origin main
   ```
3. Dans le dépôt : **Settings → Pages → Build and deployment → Source : « GitHub Actions »**.
4. Le workflow `.github/workflows/deploy.yml` se lance à chaque push sur `main` : audit npm, lint, types, tests, build, tests Playwright, puis déploiement. Suivre l'avancement dans l'onglet **Actions**.
5. Le site est publié sur https://gabibi49.github.io/stock-o-metre/.

**Changer de compte ou de nom de dépôt** : modifier `SITE` et `BASE` dans `astro.config.mjs` (et l'URL du test Playwright dans `playwright.config.ts`).

## Google Search Console

1. Dans Search Console, ajouter une propriété « Préfixe de l'URL » : `https://gabibi49.github.io/stock-o-metre/`.
2. Choisir la méthode **Balise HTML** et copier uniquement la valeur de l'attribut `content`.
3. La coller dans `GOOGLE_SITE_VERIFICATION` (fichier `src/config.ts`), puis pousser. Aucune balise n'est émise tant que la valeur est vide.
4. Déclarer le sitemap : `https://gabibi49.github.io/stock-o-metre/sitemap.xml`.

Pour un site de projet, les robots ne lisent `robots.txt` qu'à la racine du domaine (`gabibi49.github.io/robots.txt`). Celui du projet ne servira qu'avec un domaine personnalisé ; le sitemap déclaré dans Search Console suffit.

## Organisation

```
src/engine/      calculs purs (loi normale, agrégation, stock de sécurité, ABC-XYZ, alertes)
src/csv/         lecture du fichier (encodage, séparateur, nombres, dates, colonnes)
src/tool/        l'outil (île TypeScript, Web Worker, tableau, graphiques ECharts)
src/calculators/ mini-calculateurs
src/i18n/        textes FR / EN et table des URL
src/content/     guides et pages de contenu (Markdown)
tests/           tests unitaires, tests e2e, jeux de données
```

Voir aussi `DECISIONS.md` (choix techniques) et `CHANGELOG.md`.
