---
key: guideTarget
lang: fr
summary:
  - 'Le stock cible (ou niveau de recomplètement) est le niveau jusqu’auquel on remonte le stock disponible à chaque revue périodique.'
  - 'Formule : stock cible = μ × (L + R) + stock de sécurité, avec μ la consommation moyenne par période.'
  - 'À chaque revue, on commande : stock cible − (stock physique + commandes en cours − commandes clients en attente).'
  - 'Exemple : 250 unités par semaine, délai de 14 jours, revue hebdomadaire, 95 % → stock cible de 921 unités.'
published: '2026-11-20'
updated: '2026-11-20'
---

Dans beaucoup d’entreprises, les commandes fournisseurs ne partent pas au fil de l’eau : on fait le point une fois par semaine, ou tous les quinze jours, et on commande ce qu’il faut pour « tenir ». Le **stock cible**, aussi appelé **niveau de recomplètement** (en anglais *order-up-to level*), formalise ce « ce qu’il faut ». C’est le pilier des politiques à **revue périodique**.

## Définition

Le stock cible est le niveau de stock disponible que l’on vise juste après avoir passé une commande. À chaque revue, on calcule l’écart entre ce niveau et la situation réelle, et on commande exactement cet écart.

Il doit couvrir tout ce qui peut se passer avant que la commande **suivante** ne soit livrée : le délai de la commande actuelle (L), plus l’intervalle jusqu’à la prochaine revue (R). D’où la formule :

```
Stock cible = μ × (L + R) + SS
```

- **μ** : consommation moyenne par période ;
- **L** et **R** : délai et période de revue, convertis dans la même unité de période ;
- **SS** : stock de sécurité, calculé lui aussi sur L + R (voir le [guide du stock de sécurité](/fr/guides/calcul-stock-de-securite/)).

## Le stock disponible, pas le stock physique

La quantité à commander se calcule à partir de la **position de stock**, et non du seul stock en rayon :

```
Position de stock = stock physique + commandes fournisseurs en cours − commandes clients en attente
Quantité à commander = stock cible − position de stock (si positive)
```

Oublier les commandes déjà passées est l’erreur classique : on recommande ce qui est déjà en route, et le stock gonfle à chaque cycle.

## Exemple chiffré complet

Un consommable a les caractéristiques suivantes, mesurées sur un an de données hebdomadaires :

| Paramètre | Valeur |
|---|---|
| Consommation moyenne μ | 250 unités / semaine |
| Écart-type σ | 60 unités / semaine |
| Délai fournisseur L | 14 jours = 2 semaines |
| Période de revue R | 7 jours = 1 semaine |
| Taux de service visé | 95 % → Z = 1,6449 |

**1. Stock de sécurité.**

```
SS = 1,6449 × 60 × √(2 + 1) = 98,69 × 1,7321 = 170,94 → 171 unités
```

**2. Stock cible.**

```
Stock cible = 250 × (2 + 1) + 170,94 = 750 + 170,94 = 920,94 → 921 unités
```

**3. Commande du lundi.** Lors de la revue, vous avez 380 unités en rayon, une commande de 200 unités attendue jeudi, et aucune commande client en attente. La position de stock vaut 380 + 200 − 0 = 580. Vous commandez **921 − 580 = 341 unités**.

**4. Stock moyen attendu.** En régime de croisière, le stock physique moyen tourne autour de SS + μ × R ÷ 2 = 171 + 125 = **296 unités** environ. C’est un ordre de grandeur utile pour estimer l’immobilisation.

Le [calculateur de stock cible](/fr/calculateurs/stock-cible/) refait ce calcul avec vos valeurs.

## L’effet de la période de revue

Que se passe-t-il si l’on ne commande plus que toutes les deux semaines (R = 2) ?

- SS = 1,6449 × 60 × √(2 + 2) = 197,39 → 198 unités ;
- stock cible = 250 × 4 + 197,39 = 1 197,39 → 1 198 unités ;
- stock moyen ≈ 198 + 250 = 448 unités.

Espacer les revues réduit le travail administratif et regroupe les commandes, mais augmente le stock moyen d’environ 150 unités ici. Le bon rythme résulte d’un arbitrage entre coût de passation des commandes et coût de possession du stock.

## Stock cible ou point de commande ?

Les deux notions coexistent souvent dans un même ERP :

| | Point de commande | Stock cible |
|---|---|---|
| Déclenchement | dès que la position de stock passe sous un seuil | à date fixe |
| Quantité | souvent fixe (lot économique, multiple du conditionnement) | variable : on complète jusqu’au niveau |
| Période couverte par le SS | L | L + R |
| Adapté à | articles suivis en continu | commandes groupées par fournisseur, tournées |

Avec une revue continue (R = 0), les deux formules se rejoignent : le stock cible est égal au [point de commande](/fr/guides/point-de-commande/).

## Hypothèses et limites

Le calcul suppose une **demande stationnaire** (sans tendance forte) et **à peu près normale** sur L + R. Il hérite donc des limites du stock de sécurité :

- en cas de **saisonnalité**, une moyenne annuelle donne un stock cible trop haut en basse saison et trop bas en haute saison. Recalculez par saison, ou sur un historique récent ;
- pour une **demande intermittente**, la formule donne un ordre de grandeur, pas un niveau précis ;
- les **contraintes d’achat** (minimum de commande, conditionnement par 50) s’ajoutent après coup : arrondir la commande au conditionnement supérieur fait mécaniquement monter le stock moyen ;
- la consommation pendant les **ruptures** est sous-estimée par l’historique.

## Les pièges à éviter

1. **Commander « jusqu’au stock cible » depuis le stock physique** au lieu de la position de stock.
2. **Calculer le stock de sécurité sur L seul** alors que l’on travaille en revue périodique : on sous-protège la période entre deux revues.
3. **Fixer un stock cible en mois de consommation** identique pour tous les articles, sans tenir compte de la variabilité.
4. **Ne pas tenir compte des articles qui ne bougent plus** : leur stock cible tombe à zéro, signe qu’il faut écouler ou déstocker.

## Pour tous vos articles

[Stock-o-mètre](/fr/) calcule le stock cible de chaque référence à partir de vos mouvements de stock, compare le résultat à votre stock actuel et signale en orange les surstocks et en rouge les sous-stocks. Vous pouvez modifier délai, revue et taux de service article par article, avec un recalcul immédiat. Aucune donnée ne quitte votre ordinateur.
