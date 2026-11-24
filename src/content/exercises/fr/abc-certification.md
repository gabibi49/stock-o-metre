---
id: abc-certification
lang: fr
slug: classement-abc-xyz-politique
title: 'ABC-XYZ : classer 6 articles et choisir leur mode de gestion'
description: 'Classement ABC sur la valeur, classement XYZ sur le coefficient de variation, matrice croisée et choix d’une politique de réapprovisionnement par article.'
theme: abc
level: certification
order: 1
minutes: 35
guide: guideAbcXyz
tool: true
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Voici 6 mois de consommation de 6 articles. Vous devez proposer un mode de gestion adapté à chacun.

1. Faites le classement ABC sur la valeur consommée en 6 mois (seuils 80 / 15 / 5 %, part cumulée mesurée avant l’article).
2. Calculez le coefficient de variation CV = σ ÷ μ de la consommation mensuelle et faites le classement XYZ (X : CV < 0,5 ; Y : 0,5 ≤ CV ≤ 1 ; Z : CV > 1).
3. Placez chaque article dans la matrice ABC-XYZ.
4. Pour chaque article, choisissez un mode de gestion parmi : **(a)** point de commande avec stock de sécurité calculé ; **(b)** approvisionnement à la commande, sans stock permanent ; **(c)** gros lots et règle simple de type mini / maxi. Justifiez.
5. Calculez le stock de sécurité de P-01 et de P-02 à 98 % (Z = 2,0537), avec un délai plus une revue d’un mois. Commentez.

## Données

| Article | M1  | M2  | M3  | M4  | M5  | M6  | Prix unitaire |
| ------- | --- | --- | --- | --- | --- | --- | ------------- |
| P-01    | 100 | 110 | 95  | 105 | 100 | 90  | 55 €          |
| P-02    | 40  | 0   | 120 | 10  | 0   | 70  | 200 €         |
| P-03    | 250 | 380 | 60  | 330 | 120 | 60  | 8 €           |
| P-04    | 500 | 520 | 480 | 510 | 490 | 500 | 2 €           |
| P-05    | 30  | 0   | 0   | 90  | 0   | 0   | 15 €          |
| P-06    | 60  | 80  | 40  | 90  | 50  | 40  | 6 €           |

Écart-type d’échantillon (division par n − 1 = 5).

## Correction

### Étape 1 — Classement ABC

| Article | Quantité (6 mois) | Valeur   | Part    | Cumul avant | Classe |
| ------- | ----------------- | -------- | ------- | ----------- | ------ |
| P-02    | 240               | 48 000 € | 47,73 % | 0,00 %      | A      |
| P-01    | 600               | 33 000 € | 32,82 % | 47,73 %     | A      |
| P-03    | 1 200             | 9 600 €  | 9,55 %  | 80,55 %     | B      |
| P-04    | 3 000             | 6 000 €  | 5,97 %  | 90,10 %     | B      |
| P-06    | 360               | 2 160 €  | 2,15 %  | 96,06 %     | C      |
| P-05    | 120               | 1 800 €  | 1,79 %  | 98,21 %     | C      |

Total : 100 560 €. P-03 commence à 80,55 %, au-dessus du seuil de 80 % : il est B.

### Étape 2 — Classement XYZ

| Article | μ (par mois) | σ      | CV   | Classe |
| ------- | ------------ | ------ | ---- | ------ |
| P-01    | 100          | 7,07   | 0,07 | X      |
| P-02    | 40           | 47,75  | 1,19 | Z      |
| P-03    | 200          | 139,57 | 0,70 | Y      |
| P-04    | 500          | 14,14  | 0,03 | X      |
| P-05    | 20           | 36,33  | 1,82 | Z      |
| P-06    | 60           | 20,98  | 0,35 | X      |

Exemple pour P-02 : écarts à la moyenne 0, −40, +80, −30, −40, +30 ; somme des carrés 11 400 ; variance 11 400 ÷ 5 = 2 280 ; σ = 47,75 ; CV = 47,75 ÷ 40 = 1,19.

### Étape 3 — Matrice

|       | X    | Y    | Z    |
| ----- | ---- | ---- | ---- |
| **A** | P-01 |      | P-02 |
| **B** | P-04 | P-03 |      |
| **C** | P-06 |      | P-05 |

### Étape 4 — Mode de gestion

- **P-01 (AX)** : (a). Article cher et très régulier : la formule fonctionne bien, et un réglage serré évite d’immobiliser de l’argent. Revue fréquente.
- **P-02 (AZ)** : (b). Article cher et erratique : deux mois sans consommation sur six. La loi normale décrit mal cette demande, et un stock de sécurité calculé coûterait très cher (voir l’étape 5). Mieux vaut travailler la prévision avec le client, obtenir des commandes fermes plus tôt, ou approvisionner à la commande.
- **P-03 (BY)** : (a), avec une prévision qui suit les variations. La demande fluctue fortement : vérifiez s’il y a une saisonnalité avant de figer un stock de sécurité.
- **P-04 (BX)** : (a) ou (c). Très régulier et peu cher : un point de commande simple, ou des gros lots.
- **P-06 (CX)** : (c). Peu de valeur, demande régulière : gros lots et mini / maxi, sans calcul fin.
- **P-05 (CZ)** : (b), ou un petit stock forfaitaire si le délai fournisseur est long. Une seule consommation importante en six mois : un stock permanent risque de dormir.

### Étape 5 — Stocks de sécurité

```
P-01 : SS = 2,0537 × 7,07 × √1 = 14,52 → 15 unités, soit 825 €
P-02 : SS = 2,0537 × 47,75 × √1 = 98,06 → 99 unités, soit 19 800 €
```

Le stock de sécurité de P-02 vaut à lui seul 2,5 mois de consommation moyenne et 24 fois celui de P-01 en valeur. Pour un article AZ, c’est le signe qu’il faut changer de méthode (étape 4) plutôt qu’augmenter le stock.
