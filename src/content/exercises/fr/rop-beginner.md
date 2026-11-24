---
id: rop-beginner
lang: fr
slug: point-de-commande-debutant
title: 'Point de commande : quand faut-il recommander ?'
description: 'Calculer un point de commande, prévoir le jour de la prochaine commande et comprendre le rôle du stock de sécurité à la réception.'
theme: rop
level: beginner
order: 1
minutes: 10
calc: calcRop
guide: guideRop
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Un magasin de pièces détachées consomme en moyenne **30 unités par jour** d’une référence de filtre. Le fournisseur livre **8 jours** après la commande. Le stock de sécurité a déjà été fixé à **60 unités**. Aucune commande n’est en cours.

1. Calculez le point de commande.
2. Le stock est aujourd’hui de 420 unités. Dans combien de jours faudra-t-il commander ?
3. Si la consommation reste égale à la moyenne, quel sera le stock juste avant la livraison ?

## Données

- Consommation moyenne d = 30 unités par jour.
- Délai L = 8 jours ; stock de sécurité SS = 60 unités.
- Stock actuel : 420 unités ; aucune commande en cours.
- Formule : PC = d × L + SS.

## Correction

### Étape 1 — Point de commande

```
PC = 30 × 8 + 60 = 240 + 60 = 300 unités
```

Les 240 unités couvrent la consommation moyenne pendant le délai ; les 60 unités couvrent les écarts.

### Étape 2 — Date de la commande

Il faut consommer 420 − 300 = 120 unités pour atteindre le point de commande.

À 30 unités par jour : 120 ÷ 30 = **4 jours**. La commande partira dans 4 jours.

### Étape 3 — Stock à la livraison

Pendant les 8 jours de délai, on consomme en moyenne 30 × 8 = 240 unités.

Stock juste avant la livraison : 300 − 240 = **60 unités**, soit exactement le stock de sécurité.

C’est le sens du stock de sécurité : si tout se passe comme prévu, on ne l’entame pas. Il ne sert que les semaines où la consommation dépasse la moyenne ou quand le fournisseur est en retard.
