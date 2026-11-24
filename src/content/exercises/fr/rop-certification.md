---
id: rop-certification
lang: fr
slug: point-de-commande-position-de-stock
title: 'Point de commande et position de stock : commander ou attendre ?'
description: 'Stock de sécurité et point de commande à partir d’une demande mensuelle, position de stock (physique, en commande, réservé) et effet d’un allongement du délai.'
theme: rop
level: certification
order: 1
minutes: 25
calc: calcRop
guide: guideRop
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Un article est géré au point de commande, en revue continue. La prévision est de **1 200 unités par mois** (20 jours ouvrés). Vous visez un **taux de service par cycle de 97 %**.

1. Calculez le stock de sécurité et le point de commande.
2. Calculez la position de stock d’aujourd’hui. Faut-il commander ?
3. Si la consommation suit la moyenne, quel jour la commande partira-t-elle ?
4. Le fournisseur annonce que son délai passe à 9 jours. Recalculez le point de commande. Que faites-vous aujourd’hui ?
5. Pourquoi comparer le point de commande à la position de stock, et non au stock physique ?

## Données

- Demande : 1 200 unités par mois de 20 jours ouvrés ; écart-type σ = 18 unités par jour.
- Délai L = 6 jours ouvrés ; taux de service 97 % → Z = 1,8808.
- Stock physique : 380 unités.
- Commande fournisseur en cours : 150 unités, attendues dans 2 jours.
- Quantité réservée pour une commande client déjà confirmée, non encore expédiée : 40 unités.

## Correction

### Étape 1 — Demande journalière

d = 1 200 ÷ 20 = **60 unités par jour**.

### Étape 2 — Stock de sécurité et point de commande

```
SS = 1,8808 × 18 × √6 = 1,8808 × 18 × 2,4495 = 82,93 → 83 unités
PC = 60 × 6 + 82,93 = 442,93 → 443 unités
```

Le point de commande est calculé avec le stock de sécurité non arrondi, puis arrondi à l’unité supérieure.

### Étape 3 — Position de stock

```
Position = stock physique + en commande − réservé
         = 380 + 150 − 40 = 490 unités
```

490 > 443 : **on ne commande pas aujourd’hui**.

### Étape 4 — Jour de la commande

La position baisse de 60 unités par jour. Demain soir, elle vaudra 490 − 60 = 430 unités, sous le point de commande : la commande partira **demain**.

La livraison des 150 unités dans 2 jours ne change rien : elles sont déjà comptées dans la position.

### Étape 5 — Délai de 9 jours

```
SS = 1,8808 × 18 × √9 = 1,8808 × 18 × 3 = 101,56 → 102 unités
PC = 60 × 9 + 101,56 = 641,56 → 642 unités
```

La position (490) est très en dessous du nouveau point de commande (642) : **il faut commander aujourd’hui**. Un allongement du délai de 3 jours fait monter le point de commande de 199 unités, dont 180 de consommation et 19 de stock de sécurité.

### Étape 6 — Pourquoi la position de stock ?

Si l’on comparait le point de commande au stock physique (380), on commanderait aujourd’hui alors que 150 unités arrivent dans 2 jours. Le lendemain, le stock physique serait encore bas et l’on commanderait de nouveau : c’est la **double commande**. La position de stock tient compte de tout ce qui va entrer et de tout ce qui est déjà promis.
