---
id: eoq-certification
lang: fr
slug: wilson-remises-quantitatives
title: 'Wilson avec remises sur quantité : quelle tranche choisir ?'
description: 'Appliquer la méthode des remises quantitatives : quantité économique par tranche de prix, quantités réalisables et comparaison des coûts totaux, achat compris.'
theme: eoq
level: certification
order: 1
minutes: 30
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Un atelier achète des roulements. Le fournisseur propose un tarif dégressif selon la quantité de chaque commande. Le coût de possession est exprimé en pourcentage du prix d’achat : il baisse donc quand le prix baisse.

1. Calculez la quantité économique pour chaque tranche de prix.
2. Pour chaque tranche, retenez la quantité réalisable la moins chère.
3. Comparez les coûts totaux annuels, achat compris, et choisissez la quantité à commander.
4. Citez deux risques à vérifier avant d’adopter cette quantité.

## Données

| Quantité commandée | Prix unitaire |
| ------------------ | ------------- |
| de 1 à 499         | 10,00 €       |
| de 500 à 999       | 9,60 €        |
| 1 000 et plus      | 9,30 €        |

- Demande annuelle D = 5 000 unités ; coût de passation S = 100 € par commande.
- Taux de possession i = 25 % par an : H = i × prix.
- Coût total annuel : CT = D × prix + (D ÷ Q) × S + (Q ÷ 2) × H.

## Correction

### Étape 1 — Quantité économique par tranche

| Prix    | H = 25 % × prix | Q* = √(2 × 5 000 × 100 ÷ H) |
| ------- | --------------- | --------------------------- |
| 10,00 € | 2,500 €         | √400 000 = 632,5            |
| 9,60 €  | 2,400 €         | √416 667 = 645,5            |
| 9,30 €  | 2,325 €         | √430 108 = 655,8            |

### Étape 2 — Quantités réalisables

- **10,00 €** : 632 n’est pas dans la tranche (1 à 499). La meilleure quantité réalisable est 499, mais à ce prix on paierait plus cher qu’à 500 unités. Cette tranche est écartée.
- **9,60 €** : 645 est dans la tranche (500 à 999). On retient **Q = 645**.
- **9,30 €** : 656 est sous le minimum de 1 000. Le coût augmente quand on s’éloigne de Q*, donc la meilleure quantité réalisable est le minimum de la tranche : **Q = 1 000**.

### Étape 3 — Coûts totaux

**Q = 645 à 9,60 €**

- Achat : 5 000 × 9,60 = 48 000,00 €.
- Commande : (5 000 ÷ 645) × 100 = 775,19 €.
- Possession : (645 ÷ 2) × 2,40 = 774,00 €.
- Total : **49 549,19 €**.

**Q = 1 000 à 9,30 €**

- Achat : 5 000 × 9,30 = 46 500,00 €.
- Commande : (5 000 ÷ 1 000) × 100 = 500,00 €.
- Possession : (1 000 ÷ 2) × 2,325 = 1 162,50 €.
- Total : **48 162,50 €**.

Pour comparaison, la tranche écartée (499 à 10 €) coûterait 51 625,75 €.

**Décision : commander par 1 000.** L’économie est de 49 549,19 − 48 162,50 = **1 386,69 € par an**. La remise sur l’achat (1 500 €) dépasse largement la hausse du coût de possession.

### Étape 4 — Risques à vérifier

- **Place et stock moyen** : le stock moyen passe de 323 à 500 unités. Le magasin peut-il les accueillir ?
- **Obsolescence** : 1 000 unités représentent 2,4 mois de consommation. Un changement de référence ou une baisse de la demande laisserait du stock invendu.
- **Trésorerie** : chaque commande immobilise 9 300 € au lieu de 6 192 €.
- **Hypothèse de demande régulière** : si la demande est saisonnière, il vaut mieux recalculer par période.
