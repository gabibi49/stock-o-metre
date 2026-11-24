---
id: safety-beginner
lang: fr
slug: stock-de-securite-debutant
title: 'Calculer un stock de sécurité à partir de 8 semaines de ventes'
description: 'Moyenne, écart-type, conversion du délai et coefficient Z : le calcul complet du stock de sécurité d’un article, puis l’effet d’un taux de service plus exigeant.'
theme: safety
level: beginner
order: 1
minutes: 15
calc: calcSafety
guide: guideSafety
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Vous gérez un article de quincaillerie vendu toutes les semaines. Le fournisseur livre **2 semaines** après la commande, et vous passez commande **une fois par semaine**, le lundi. Vous visez un **taux de service par cycle de 95 %**.

1. Calculez la consommation moyenne μ et l’écart-type σ par semaine.
2. Calculez le stock de sécurité avec la formule SS = Z × σ × √(L + R).
3. Que devient le stock de sécurité si l’on vise 99 % ?

## Données

| Semaine         | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   |
| --------------- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ventes (unités) | 180 | 220 | 210 | 160 | 240 | 190 | 200 | 200 |

- Délai d’approvisionnement L = 2 semaines ; période de revue R = 1 semaine.
- Coefficients Z : 1,6449 pour 95 % ; 2,3263 pour 99 %.
- Écart-type d’échantillon (division par n − 1). Le stock de sécurité s’arrondit à l’unité supérieure.

## Correction

### Étape 1 — Consommation moyenne

Total des 8 semaines : 180 + 220 + 210 + 160 + 240 + 190 + 200 + 200 = 1 600 unités.

μ = 1 600 ÷ 8 = **200 unités par semaine**.

### Étape 2 — Écart-type

| Semaine            | 1   | 2   | 3   | 4     | 5     | 6   | 7   | 8   |
| ------------------ | --- | --- | --- | ----- | ----- | --- | --- | --- |
| Écart à la moyenne | −20 | +20 | +10 | −40   | +40   | −10 | 0   | 0   |
| Écart au carré     | 400 | 400 | 100 | 1 600 | 1 600 | 100 | 0   | 0   |

Somme des carrés : 4 200. Variance = 4 200 ÷ (8 − 1) = 600.

σ = √600 = **24,49 unités**.

### Étape 3 — Durée à couvrir

Le délai et la revue sont déjà en semaines, comme σ : L + R = 2 + 1 = 3 semaines, et √3 = **1,7321**.

### Étape 4 — Stock de sécurité à 95 %

```
SS = 1,6449 × 24,49 × 1,7321 = 69,79 → 70 unités
```

### Étape 5 — Stock de sécurité à 99 %

```
SS = 2,3263 × 24,49 × 1,7321 = 98,70 → 99 unités
```

Passer de 95 % à 99 % augmente le stock de sécurité de **41 %** (99 ÷ 70 ≈ 1,41), pour diviser par cinq le risque de rupture par cycle (de 5 % à 1 %). Les derniers points de taux de service coûtent de plus en plus cher.

### Pour vérifier

Dans le calculateur, choisissez la période « Semaine » et saisissez μ = 200, σ = 24,49, L = 14 jours, R = 7 jours, taux = 95 % : vous retrouvez 70 unités.
