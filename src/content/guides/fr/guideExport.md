---
key: guideExport
lang: fr
summary:
  - 'Pour calculer stocks de sécurité et stocks cibles, il faut l’historique des mouvements de stock : date, article, quantité, et si possible type de mouvement, prix et stock actuel.'
  - 'Exportez 12 à 24 mois, jusqu’à la fin d’une période complète (fin de semaine ou fin de mois).'
  - 'Classez correctement les types de mouvement : seules les sorties de consommation alimentent la demande.'
  - 'Méfiez-vous d’Excel : zéros en tête des codes, dates converties, séparateurs décimaux.'
published: '2026-11-20'
updated: '2026-11-20'
---

Tous les logiciels de gestion (ERP, WMS, logiciel de caisse, gestion commerciale) enregistrent les mouvements de stock : réceptions, sorties, transferts, inventaires. C’est la matière première du calcul des stocks de sécurité. Ce guide explique comment en tirer un fichier CSV propre, quel que soit votre logiciel.

## Quelles données extraire ?

Cherchez dans votre logiciel un état ou une requête du type « historique des mouvements », « journal de stock » ou « mouvements d’articles », avec une ligne par mouvement.

| Colonne | Obligatoire | Contenu |
|---|---|---|
| date | oui | date du mouvement (jj/mm/aaaa ou aaaa-mm-jj ; l’heure est tolérée) |
| article | oui | code article, identique d’une ligne à l’autre |
| quantité | oui | quantité du mouvement |
| type_mouvement | conseillé | nature du mouvement : réception, vente, consommation, inventaire… |
| libellé | facultatif | désignation de l’article |
| prix_unitaire | conseillé | coût unitaire, pour le classement ABC en valeur |
| stock_actuel | conseillé | stock à la date de l’export, répété sur chaque ligne ou présent au moins une fois par article |

Les noms de colonnes peuvent être différents : l’outil reconnaît les synonymes courants (« qté », « référence », « date mvt », « qty »…) et vous laisse corriger l’association. Un [modèle CSV](/modele-mouvements.csv) est téléchargeable.

## Quelle période ?

- **Durée** : 12 à 24 mois. Moins de 8 périodes ne permet pas d’estimer correctement la variabilité ; plus de 2 ans mélange souvent des situations qui n’existent plus.
- **Fin** : arrêtez l’export à la **fin d’une période complète** (dimanche soir pour une analyse hebdomadaire, dernier jour du mois pour une analyse mensuelle). L’outil exclut la dernière période si le fichier s’arrête avant sa fin, pour ne pas la compter comme une période de faible consommation.
- **Début** : de même, commencez un lundi ou un 1er du mois.

## Bien traiter les types de mouvement

Seules les **sorties de consommation** (ventes, consommations de production, sorties vers les clients) mesurent la demande. Les autres mouvements modifient le stock sans être de la demande :

- **réceptions fournisseurs, retours de production** : entrées ;
- **inventaires, régularisations** : ajustements, qui comptent pour reconstituer le stock mais pas comme consommation ;
- **transferts entre dépôts** : à décider selon le périmètre. Si vous analysez un seul dépôt, un transfert sortant est une demande pour ce dépôt. Si vous analysez l’entreprise entière, il faut l’ignorer ;
- **retours clients** : ils viennent en déduction de la consommation, à condition d’être classés avec les sorties (l’outil tient compte du signe).

Si votre export n’a pas de colonne type, la convention retenue est simple : quantité négative = sortie, quantité positive = entrée.

## Exemple chiffré complet

Voici un extrait pour un article, exporté du lundi 6 au vendredi 31 janvier 2025, avec un stock actuel de 132 unités :

| date | article | quantité | type_mouvement |
|---|---|---|---|
| 06/01/2025 | VIS-M8 | 500 | Réception |
| 07/01/2025 | VIS-M8 | 120 | Vente |
| 09/01/2025 | VIS-M8 | 95 | Vente |
| 14/01/2025 | VIS-M8 | 140 | Vente |
| 16/01/2025 | VIS-M8 | −3 | Inventaire |
| 27/01/2025 | VIS-M8 | 110 | Vente |

**1. Consommation par semaine.** Semaine du 6/01 : 120 + 95 = 215. Semaine du 13/01 : 140. Semaine du 20/01 : **0** (aucune vente). Semaine du 27/01 : 110, mais le fichier s’arrête le vendredi 31 : cette semaine est incomplète et exclue.

**2. L’importance de la semaine à zéro.** Sur les trois semaines complètes (215, 140, 0), la moyenne vaut 118,33 et l’écart-type 109,13 : le coefficient de variation est de 0,92, une demande irrégulière. Si l’on oubliait la semaine sans vente, on obtiendrait une moyenne de 177,5 et un écart-type de 53,03 (CV de 0,30) : un article qui paraît régulier, et un stock de sécurité sous-estimé.

**3. Stock reconstitué.** Le total des mouvements vaut 500 − 120 − 95 − 140 − 3 − 110 = +32. Avec un stock actuel de 132, le stock de départ était de 100. En suivant les lignes : 600, 480, 385, 245, 242, puis 132. Si une valeur devenait négative, il manquerait des mouvements dans l’export.

Bien sûr, trois semaines ne suffisent pas pour un calcul fiable : l’outil signalerait un « historique court ». L’extrait montre seulement le traitement des données.

## Les pièges d’Excel

Si vous passez par un tableur avant d’enregistrer en CSV :

- **zéros en tête** : le code « 00125 » devient 125. Formatez la colonne en texte avant le collage ;
- **dates** : Excel peut inverser jour et mois, ou convertir les dates en nombres (45 678). Vérifiez quelques lignes ;
- **grands codes numériques** affichés en notation scientifique (1,23E+12) : format texte ;
- **séparateurs** : un Excel français enregistre en « CSV (séparateur : point-virgule) » avec la virgule décimale. L’outil détecte les deux formats, ainsi que l’encodage (UTF-8 ou Windows-1252) ;
- **lignes de total** ou de sous-total ajoutées en bas de l’état : supprimez-les.

## Contrôles avant l’analyse

1. **Totaux** : comparez la somme des sorties d’un article avec la consommation affichée par votre logiciel sur la même période.
2. **Stock** : le stock reconstitué doit retomber sur le stock actuel ; un stock négatif signale des mouvements manquants.
3. **Doublons** : une même ligne exportée deux fois double la consommation. L’outil signale les lignes strictement identiques.
4. **Unités** : un article géré en cartons ici et en unités là fausse tout. Exportez dans l’unité de stock.
5. **Données personnelles** : le calcul n’en a pas besoin. Retirez les noms de clients ou de salariés de l’export.

## Volume

Un fichier de mouvements dépasse vite le million de lignes. L’outil accepte jusqu’à 50 Mo, 2 millions de lignes et 50 000 articles. Au-delà, découpez par famille d’articles ou par dépôt.

## Lancer l’analyse

Une fois l’export prêt, chargez-le dans [l’outil Stock-o-mètre](/fr/) : il propose l’association des colonnes, vous laisse classer les types de mouvement, puis calcule stock de sécurité, point de commande et stock cible pour chaque article. Le fichier reste sur votre ordinateur. Pour vérifier un article isolé, le [calculateur de couverture](/fr/calculateurs/couverture-de-stock/) indique en un instant combien de jours votre stock actuel peut tenir.
