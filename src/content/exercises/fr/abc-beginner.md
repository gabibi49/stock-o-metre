---
id: abc-beginner
lang: fr
slug: classement-abc-debutant
title: 'Classement ABC de 10 articles'
description: 'Calculer la valeur consommée, trier, cumuler et classer 10 articles en A, B et C, puis comprendre pourquoi on classe en valeur et non en quantité.'
theme: abc
level: beginner
order: 1
minutes: 20
guide: guideAbcXyz
tool: true
published: '2026-11-24'
updated: '2026-11-24'
---

## Énoncé

Vous voulez concentrer vos efforts de suivi sur les articles qui pèsent le plus. Classez les 10 articles ci-dessous selon la méthode ABC, avec les seuils **80 / 15 / 5 %** de la valeur consommée.

1. Calculez la valeur annuelle consommée de chaque article.
2. Triez les articles par valeur décroissante et calculez la part cumulée.
3. Attribuez les classes A, B et C.
4. Les deux articles les plus consommés en quantité sont la vis V-101 et l’écrou E-207. Pourquoi sont-ils en classe C ?

## Données

| Article | Désignation        | Consommation annuelle (unités) | Prix unitaire |
| ------- | ------------------ | ------------------------------ | ------------- |
| V-101   | Vis                | 25 000                         | 0,10 €        |
| M-210   | Moteur             | 300                            | 300,00 €      |
| R-330   | Roulement          | 4 000                          | 15,00 €       |
| C-115   | Carte électronique | 250                            | 80,00 €       |
| J-402   | Joint              | 10 000                         | 0,05 €        |
| P-118   | Plaque             | 600                            | 20,00 €       |
| E-207   | Écrou              | 20 000                         | 0,075 €       |
| K-512   | Kit de montage     | 140                            | 50,00 €       |
| T-650   | Tube               | 1 100                          | 5,00 €        |
| F-090   | Filtre             | 400                            | 2,50 €        |

Règle de classement (celle de Stock-o-mètre) : on regarde la part cumulée **avant** l’article. Elle est sous 80 % : classe A. Elle est entre 80 % et 95 % : classe B. Sinon : classe C.

## Correction

### Étape 1 — Valeur consommée

Valeur = consommation × prix. Par exemple, M-210 : 300 × 300 = 90 000 €. Le total des 10 articles vaut **200 000 €**.

### Étape 2 — Tri et cumul

| Rang | Article | Valeur   | Part    | Cumul avant | Cumul après |
| ---- | ------- | -------- | ------- | ----------- | ----------- |
| 1    | M-210   | 90 000 € | 45,00 % | 0,00 %      | 45,00 %     |
| 2    | R-330   | 60 000 € | 30,00 % | 45,00 %     | 75,00 %     |
| 3    | C-115   | 20 000 € | 10,00 % | 75,00 %     | 85,00 %     |
| 4    | P-118   | 12 000 € | 6,00 %  | 85,00 %     | 91,00 %     |
| 5    | K-512   | 7 000 €  | 3,50 %  | 91,00 %     | 94,50 %     |
| 6    | T-650   | 5 500 €  | 2,75 %  | 94,50 %     | 97,25 %     |
| 7    | V-101   | 2 500 €  | 1,25 %  | 97,25 %     | 98,50 %     |
| 8    | E-207   | 1 500 €  | 0,75 %  | 98,50 %     | 99,25 %     |
| 9    | F-090   | 1 000 €  | 0,50 %  | 99,25 %     | 99,75 %     |
| 10   | J-402   | 500 €    | 0,25 %  | 99,75 %     | 100,00 %    |

### Étape 3 — Classes

- **A** (cumul avant < 80 %) : M-210, R-330, C-115. **3 articles, 85 % de la valeur.** C-115 commence à 75 %, sous le seuil : il est A, même s’il fait passer le cumul à 85 %.
- **B** (cumul avant entre 80 % et 95 %) : P-118, K-512, T-650. **3 articles, 12,25 % de la valeur.**
- **C** : V-101, E-207, F-090, J-402. **4 articles, 2,75 % de la valeur.**

30 % des articles font 85 % de la valeur : c’est l’effet Pareto.

### Étape 4 — Valeur ou quantité ?

La vis et l’écrou représentent 45 000 des 61 790 unités consommées (73 %), mais seulement 2 % de la valeur. Une rupture coûte cher quel que soit l’article, mais l’argent immobilisé et le gain possible se trouvent sur les articles A. Pour des articles C comme la vis, une gestion simple suffit : gros lots, stock de sécurité généreux, peu de suivi.

Le classement en quantité reste utile pour d’autres questions, comme la place en magasin ou le nombre de manipulations.
