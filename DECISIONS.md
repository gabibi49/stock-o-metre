# Décisions techniques

## Pile et versions
- **Astro 7.4.13** : Astro 6 avait des failles critiques connues (npm audit). Astro 7 exige Node ≥ 22.23.4 ; Node a été mis à jour en 22.23.5 sur le poste de développement.
- **TypeScript 6.0.3** (et non 7) : typescript-eslint ne prend pas encore en charge TS 7.
- **@astrojs/markdown-remark** ajouté : Astro 7 utilise un nouveau moteur Markdown, et les plugins rehype (préfixe du chemin de base) nécessitent ce paquet.
- **Override `fflate` 0.7.5** : corrige une vulnérabilité modérée de la dépendance de satori (outil de build uniquement).
- Versions figées (`--save-exact`), `package-lock.json` versionné, `npm audit` : 0 vulnérabilité.
- Pas de Preact : l'outil est en TypeScript simple, avec des helpers DOM (`src/tool/dom.ts`).

## Sécurité
- **CSP stricte par balise meta**, sans `'unsafe-inline'` : `build.inlineStylesheets: 'never'`, `assetsInlineLimit: 0`, barre d'outils de dev désactivée, **coloration syntaxique Markdown désactivée** (Shiki insère des attributs `style`). Un test e2e vérifie l'absence de violation CSP sur toutes les pages.
- Les blocs `application/ld+json` et `application/json` (configuration de l'outil) sont des données non exécutées : la CSP ne les concerne pas. `<` y est échappé.
- La CSP n'est émise qu'en production : le mode dev de Vite insère des styles en ligne.
- Info-bulles ECharts : formateur qui renvoie des éléments DOM (jamais une chaîne HTML), `confine: true`, déclenchement par axe (pas de flèche HTML).
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` : interdits par ESLint. `el()` refuse les attributs `on*`, `style` et les URL `javascript:`.
- **Export CSV** : apostrophe devant toute cellule **texte** commençant par `= + - @`, tabulation ou retour chariot. Les cellules **numériques calculées** ne sont pas préfixées, pour rester exploitables dans un tableur (« -12 » doit rester un nombre) ; ce sont des nombres validés, sans risque de formule.
- `localStorage` : seulement l'association des colonnes, les formats et le classement des types de mouvement (libellés de catégories). Jamais les lignes ni les articles. Accès sous try/catch.
- Doublons détectés par hachage 53 bits des lignes (pas de copie du texte en mémoire) ; le risque de collision est négligeable.

## Règles de calcul (interprétations documentées)
- **Début de série par article** : au premier mouvement de l'article, et non au début du fichier, pour ne pas pénaliser un article lancé en cours de période. La fin reste la dernière date du fichier.
- **Périodes incomplètes** : la dernière (et la première) période est exclue si le fichier ne la couvre pas entièrement, et l'exclusion est signalée. La plage du fichier est définie par la première et la dernière date de toutes les lignes valides.
- **Signe des quantités** : pour chaque type classé entrée ou sortie, le signe majoritaire définit le sens normal ; les lignes de signe opposé (retours) viennent en déduction.
- **4ᵉ classe « Ajustement »** ajoutée (en plus d'Entrée, Sortie, Ignorer) : un inventaire modifie le stock reconstitué sans être une consommation.
- Une période dont le total est négatif compte pour 0.
- **ABC** : part cumulée mesurée *avant* l'article (le premier article est toujours A ; valeur nulle = C). Prix retenu : dernier prix valide par date.
- **Arrondi** à l'unité supérieure avec une tolérance de 1e-9 ; −0 converti en 0.
- **Alerte « stock reconstitué négatif »** uniquement si le stock actuel est connu (sans lui, la courbe est relative).
- Taux de service borné entre 50 % et 99,99 %.
- Le point de commande est calculé sur L, le stock cible sur L + R (stock de sécurité sur L + R pour les deux, comme le demande le cahier des charges).

## Interface et SEO
- Une seule route `[...path].astro` génère toutes les pages FR/EN depuis la table `src/i18n/routes.ts`, utilisée aussi pour hreflang, le sélecteur de langue et le sitemap.
- Page racine = choix de langue sans redirection (x-default indexable, sans script).
- Images Open Graph générées au build avec satori + resvg, police Inter (OFL) lue depuis `node_modules` au build uniquement.
- Module ECharts (~600 Ko non compressé) chargé à la demande, puis préchargé quand le navigateur est inactif, pour que l'outil marche hors ligne une fois la page ouverte.
- Première colonne du tableau figée et panneau de réglages « collant » pour rester utilisables avec le défilement horizontal.
- `robots.txt` fourni, mais pour un site de projet GitHub Pages seul celui de la racine du domaine est lu par les robots (voir README).
