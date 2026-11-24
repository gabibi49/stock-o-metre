---
id: service-beginner
lang: fr
slug: taux-de-service-mesurer
title: 'Mesurer un taux de service : par cycle, en quantité, en lignes'
description: 'À partir de 10 cycles de réapprovisionnement, calculer trois taux de service différents et comprendre pourquoi ils ne disent pas la même chose.'
theme: service
level: beginner
order: 1
minutes: 15
calc: calcSafety
guide: guideService
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Votre responsable vous demande « le taux de service » d’un article sur les 10 derniers cycles de réapprovisionnement (un cycle va d’une réception à la suivante). Vous disposez du relevé ci-dessous.

1. Calculez le **taux de service par cycle** : la part des cycles terminés sans rupture.
2. Calculez le **taux de remplissage** : la part de la quantité demandée servie immédiatement sur stock.
3. Calculez le **taux de lignes complètes** : la part des lignes de commande client servies en entier.
4. Votre responsable lit « 80 % » et parle de catastrophe. Que lui répondez-vous ?

## Données

| Cycle                         | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ----------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quantité demandée             | 380 | 420 | 410 | 450 | 390 | 370 | 400 | 430 | 360 | 390 |
| Quantité non servie (rupture) | 0   | 0   | 0   | 30  | 0   | 0   | 0   | 12  | 0   | 0   |

Sur la même période, 250 lignes de commande client ont porté sur cet article ; 6 n’ont pas pu être servies en entier.

## Correction

### Étape 1 — Taux de service par cycle

Deux cycles ont connu une rupture (cycles 4 et 8) ; 8 cycles sur 10 se sont terminés sans rupture.

Taux de service par cycle = 8 ÷ 10 = **80 %**.

### Étape 2 — Taux de remplissage

Quantité demandée : 4 000 unités. Quantité non servie : 30 + 12 = 42 unités.

Taux de remplissage = 1 − 42 ÷ 4 000 = 1 − 0,0105 = **98,95 %**.

### Étape 3 — Taux de lignes complètes

Taux de lignes complètes = (250 − 6) ÷ 250 = 244 ÷ 250 = **97,6 %**.

### Étape 4 — Comment lire ces chiffres

Les trois chiffres décrivent la même réalité, mais ne mesurent pas la même chose :

- **80 %** dit qu’il y a eu une rupture, même brève, dans 2 cycles sur 10. C’est l’indicateur qui sert à calculer le stock de sécurité (coefficient Z).
- **98,95 %** dit que presque toute la quantité a été servie à temps.
- **97,6 %** est le plus proche de ce que vit le client : 6 lignes sur 250 ont été incomplètes.

Avant de parler de catastrophe, il faut donc dire de quel taux on parle. Un objectif de service doit toujours préciser sa définition, sinon deux personnes peuvent avoir raison avec des chiffres opposés.
