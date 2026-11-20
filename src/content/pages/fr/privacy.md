---
key: privacy
lang: fr
updated: '2026-11-20'
---

**En résumé : Stock-o-mètre ne collecte aucune donnée.** Votre fichier est lu et analysé dans votre navigateur. Il n’est jamais envoyé sur un serveur.

## Votre fichier reste sur votre ordinateur

- Le fichier que vous chargez est lu localement par votre navigateur, au moyen d’un _Web Worker_, un programme qui tourne sur votre propre machine.
- Aucun envoi : le site n’a pas de serveur applicatif, pas de base de données et pas d’API. Il s’agit uniquement de fichiers statiques (pages, scripts, styles).
- Une politique de sécurité du contenu (CSP) interdit au navigateur toute connexion vers un autre site que celui-ci. Un test automatisé vérifie à chaque mise à jour qu’aucune requête réseau ne part pendant l’analyse d’un fichier.
- Les exports (CSV des résultats, images des graphiques) sont fabriqués dans votre navigateur et enregistrés directement sur votre ordinateur.
- Quand vous fermez ou rechargez la page, les données en mémoire disparaissent.

Vous pouvez le vérifier vous-même : ouvrez les outils de développement de votre navigateur (onglet Réseau), chargez un fichier et lancez le calcul. Vous pouvez aussi couper votre connexion internet une fois la page chargée : l’outil continue de fonctionner.

## Pas de cookie, pas de traceur

- Aucun cookie n’est déposé.
- Aucun outil de mesure d’audience, aucun pixel publicitaire, aucun script tiers.
- Aucune police, bibliothèque ou image n’est chargée depuis un autre site : tout est servi depuis ce site.

## Ce qui est mémorisé dans votre navigateur

Pour vous éviter de refaire l’association des colonnes à chaque fichier, l’outil mémorise dans le stockage local de votre navigateur (_localStorage_) :

- les numéros de colonnes associés à chaque information, pour un format de fichier donné (identifié par ses en-têtes) ;
- le format de date et le séparateur décimal choisis ;
- le classement des types de mouvement (par exemple « Vente » → sortie).

Les lignes de votre fichier, vos articles, quantités et prix ne sont **jamais** mémorisés. Ces réglages restent sur votre ordinateur et ne sont jamais transmis. Pour les effacer, supprimez les données du site dans les réglages de votre navigateur.

## Hébergement

Le site est hébergé par GitHub Pages (GitHub Inc.). Comme tout hébergeur web, GitHub peut enregistrer dans ses journaux techniques des informations de connexion, comme l’adresse IP, à des fins de sécurité et de bon fonctionnement du service. Ces journaux ne contiennent pas vos fichiers, qui ne quittent jamais votre ordinateur. Pour en savoir plus, consultez la déclaration de confidentialité de GitHub.

## Boutons de partage

Les boutons « LinkedIn » et « E-mail » sont de simples liens : rien n’est chargé depuis LinkedIn tant que vous ne cliquez pas. Le lien partagé pointe vers la page d’accueil de l’outil et ne contient jamais vos données.

## Contact

Pour toute question sur cette page, voir les [mentions légales](/fr/mentions-legales/).
