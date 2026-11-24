---
id: eoq-beginner
lang: fr
slug: quantite-economique-wilson
title: 'Quantité économique de commande (formule de Wilson)'
description: 'Calculer la quantité économique, le nombre de commandes par an et le coût total, puis mesurer ce que coûte une quantité différente.'
theme: eoq
level: beginner
order: 1
minutes: 15
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Une PME achète des cartons d’emballage. Chaque commande lui coûte des frais fixes (saisie, réception, contrôle, facture). Garder du stock lui coûte aussi (place, capital immobilisé).

1. Calculez le coût de possession unitaire H.
2. Calculez la quantité économique de commande Q* (formule de Wilson).
3. Combien de commandes par an ? Tous les combien de jours ?
4. Calculez le coût annuel de commande, le coût annuel de possession et leur total.
5. Le fournisseur livre par palettes de 1 000. Combien coûte le fait de commander 1 000 au lieu de Q* ?

## Données

- Demande annuelle D = 12 000 cartons, régulière.
- Coût de passation d’une commande S = 60 €.
- Prix unitaire 20 € ; taux de possession 20 % par an.
- Formule de Wilson : Q* = √(2 × D × S ÷ H).
- Coût annuel (hors achat) : CT = (D ÷ Q) × S + (Q ÷ 2) × H. On compte 365 jours par an.

## Correction

### Étape 1 — Coût de possession unitaire

H = 20 € × 20 % = **4 € par carton et par an**.

### Étape 2 — Quantité économique

```
Q* = √(2 × 12 000 × 60 ÷ 4) = √360 000 = 600 cartons
```

### Étape 3 — Fréquence

Nombre de commandes : 12 000 ÷ 600 = **20 commandes par an**.

Intervalle : 365 ÷ 20 = **18,25 jours**, soit environ une commande toutes les 2 semaines et demie.

### Étape 4 — Coûts

- Coût de commande : 20 × 60 = **1 200 €**.
- Coût de possession : stock moyen 600 ÷ 2 = 300 cartons × 4 € = **1 200 €**.
- Total : **2 400 € par an**.

À la quantité économique, le coût de commande et le coût de possession sont égaux. C’est une propriété de la formule de Wilson.

### Étape 5 — Commander par 1 000

- Coût de commande : (12 000 ÷ 1 000) × 60 = 12 × 60 = 720 €.
- Coût de possession : (1 000 ÷ 2) × 4 = 2 000 €.
- Total : 2 720 €, soit **320 € de plus** (+13,3 %).

La quantité est 67 % plus grande, mais le coût n’augmente que de 13 %. La courbe du coût total est plate autour de Q* : arrondir à une palette ou à un multiple d’emballage coûte peu. Ce qui compte, c’est d’être dans le bon ordre de grandeur.
