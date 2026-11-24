---
id: safety-certification
lang: fr
slug: stock-de-securite-delai-variable
title: 'Stock de sécurité avec un délai fournisseur variable : faut-il payer pour fiabiliser ?'
description: 'Demande et délai variables, coût de possession du stock de sécurité et décision chiffrée face à une offre du fournisseur.'
theme: safety
level: certification
order: 1
minutes: 30
calc: calcSafety
guide: guideSafety
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Un composant électronique est consommé tous les jours ouvrés. Le stock est suivi **en continu** (revue continue, R = 0). Vous visez un **taux de service par cycle de 98 %**.

1. Calculez le stock de sécurité en ne tenant compte que de la variabilité de la demande.
2. Calculez-le en tenant compte aussi de la variabilité du délai.
3. Quel est le coût annuel de possession de ce stock de sécurité ?
4. Le fournisseur propose de ramener l’écart-type de son délai à 1 jour, contre une hausse de 0,10 € par unité achetée. Faut-il accepter, sur le seul critère du stock de sécurité ?

## Données

- Consommation : μ = 50 unités par jour, σ = 15 unités par jour ; 250 jours ouvrés par an.
- Délai moyen L = 12 jours ouvrés ; écart-type du délai σL = 3 jours.
- Taux de service par cycle 98 % → Z = 2,0537.
- Coût unitaire 8 € ; taux de possession 25 % par an.
- Formule avec délai variable : SS = Z × √(L × σ² + μ² × σL²).

## Correction

### Étape 1 — Demande seule

```
SS = Z × σ × √L = 2,0537 × 15 × √12 = 2,0537 × 15 × 3,4641 = 106,72 → 107 unités
```

### Étape 2 — Demande et délai variables

- Part due à la demande : L × σ² = 12 × 15² = 2 700.
- Part due au délai : μ² × σL² = 50² × 3² = 22 500.
- Racine de la somme : √25 200 = 158,75.

```
SS = 2,0537 × 158,75 = 326,02 → 327 unités
```

L’incertitude sur le délai pèse **huit fois plus** que celle sur la demande (22 500 contre 2 700). Ignorer la variabilité du délai sous-estimerait le stock de sécurité de plus des deux tiers.

### Étape 3 — Coût de possession

Coût de possession unitaire : H = 8 × 25 % = 2 € par unité et par an.

Coût annuel du stock de sécurité : 327 × 2 = **654 € par an**.

### Étape 4 — Offre du fournisseur

Avec σL = 1 jour :

- part due au délai : 50² × 1² = 2 500 ;
- SS = 2,0537 × √(2 700 + 2 500) = 2,0537 × 72,11 = 148,10 → **149 unités**.

Gain de possession : (327 − 149) × 2 = **356 € par an**.

Surcoût d’achat : 50 × 250 = 12 500 unités par an × 0,10 € = **1 250 € par an**.

Sur le seul critère du stock de sécurité, **l’offre n’est pas rentable** : elle coûte 1 250 € pour en économiser 356.

### Étape 5 — Ce qu’il faut ajouter à la discussion

Le calcul ne dit pas tout. Un délai fiable réduit aussi les urgences, les transports express et le temps passé à relancer. Il libère 178 unités de place en magasin. Avant de refuser, chiffrez ces coûts. Proposez aussi au fournisseur un partage de l’effort : à 0,02 € par unité (250 € par an), l’offre deviendrait rentable.
