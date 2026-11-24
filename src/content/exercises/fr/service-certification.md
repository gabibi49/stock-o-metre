---
id: service-certification
lang: fr
slug: taux-de-service-taux-de-remplissage
title: 'Du taux de service par cycle au taux de remplissage (fonction de perte normale)'
description: 'Utiliser la fonction de perte normale pour passer d’un taux de service par cycle à un taux de remplissage, et inversement, et mesurer l’effet de la taille des lots.'
theme: service
level: certification
order: 1
minutes: 35
calc: calcSafety
guide: guideService
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Un article est géré au point de commande. La demande pendant le délai suit une loi normale d’écart-type **σL = 100 unités**. On note G(z) la fonction de perte normale : le nombre moyen d’unités manquantes par cycle vaut σL × G(z), où z est le coefficient de sécurité (SS = z × σL).

1. Avec un taux de service par cycle de 90 % et des lots de Q = 500 unités, calculez la rupture moyenne par cycle et le taux de remplissage.
2. Le client exige un taux de remplissage de 99,5 % et les lots passent à Q = 200. Trouvez z, le stock de sécurité et le taux de service par cycle correspondant.
3. Même objectif de 99,5 %, mais avec des lots de Q = 500. Que deviennent z et le stock de sécurité ? Concluez.

## Données

- Fonction de perte normale : G(z) = φ(z) − z × (1 − Φ(z)), avec φ la densité et Φ la fonction de répartition de la loi normale centrée réduite.
- Taux de remplissage = 1 − σL × G(z) ÷ Q.
- Pour 90 % : z = 1,2816 et φ(1,2816) = 0,1755.
- Extrait de table :

| z    | 1,5     | 1,6     | 1,7     | 1,8     | 1,9     | 2,0     | 2,1     |
| ---- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| G(z) | 0,02931 | 0,02324 | 0,01829 | 0,01428 | 0,01105 | 0,00849 | 0,00647 |
| Φ(z) | 0,9332  | 0,9452  | 0,9554  | 0,9641  | 0,9713  | 0,9772  | 0,9821  |

Dans un tableur, φ(z) = LOI.NORMALE.STANDARD(z ; FAUX) et Φ(z) = LOI.NORMALE.STANDARD(z ; VRAI).

## Correction

### Étape 1 — Fonction de perte à 90 %

```
G(1,2816) = 0,1755 − 1,2816 × (1 − 0,90) = 0,1755 − 0,1282 = 0,0473
```

### Étape 2 — Rupture moyenne et taux de remplissage

Rupture moyenne par cycle : 100 × 0,0473 = **4,73 unités**.

Taux de remplissage = 1 − 4,73 ÷ 500 = **99,05 %**.

Un taux de service par cycle de 90 % (une rupture tous les 10 cycles) donne quand même 99 % de la quantité servie à temps : les ruptures sont courtes par rapport à la taille des lots.

### Étape 3 — Objectif de 99,5 % avec Q = 200

On cherche la rupture maximale autorisée par cycle : (1 − 0,995) × 200 = 1 unité.

Donc G(z) = 1 ÷ 100 = **0,0100**.

Dans la table, G(1,9) = 0,01105 et G(2,0) = 0,00849. Interpolation linéaire :

```
z ≈ 1,9 + 0,1 × (0,01105 − 0,0100) ÷ (0,01105 − 0,00849) = 1,9 + 0,1 × 0,41 ≈ 1,94
```

Stock de sécurité : SS = 1,94 × 100 = **194 unités**.

Taux de service par cycle : Φ(1,94) ≈ **97,4 %**.

### Étape 4 — Même objectif avec Q = 500

Rupture autorisée par cycle : (1 − 0,995) × 500 = 2,5 unités, donc G(z) = 0,025.

```
z ≈ 1,5 + 0,1 × (0,02931 − 0,025) ÷ (0,02931 − 0,02324) = 1,5 + 0,1 × 0,71 ≈ 1,57
```

Stock de sécurité : SS = 1,57 × 100 = **157 unités** ; taux de service par cycle Φ(1,57) ≈ 94,2 %.

### Étape 5 — Conclusion

Pour le même taux de remplissage, des lots plus gros demandent **moins de stock de sécurité** (157 au lieu de 194), car il y a moins de cycles, donc moins d’occasions de rupture. La taille des lots et le stock de sécurité ne se règlent donc pas séparément : un objectif exprimé en taux de remplissage doit être traduit en z **après** avoir fixé la quantité commandée.
