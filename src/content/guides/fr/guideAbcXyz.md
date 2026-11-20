---
key: guideAbcXyz
lang: fr
summary:
  - 'Le classement ABC trie les articles par valeur consommée (loi de Pareto) : A = les quelques articles qui font l’essentiel de la valeur.'
  - 'Le classement XYZ trie les articles par régularité de la demande, mesurée par le coefficient de variation σ / μ.'
  - 'Combinés, ils forment une matrice de 9 cases qui guide le taux de service, la fréquence de revue et la méthode de calcul.'
  - 'Exemple : sur 10 articles, 4 articles A représentent 85 % de la valeur consommée.'
published: '2026-11-20'
updated: '2026-11-20'
---

Gérer 5 000 références avec les mêmes règles revient à traiter de la même façon une pièce qui pèse 200 000 € de consommation par an et une rondelle qui en pèse 30. Le classement ABC-XYZ sert à **concentrer l’attention et le stock là où ils rapportent**. Il combine deux questions : *combien cet article pèse-t-il ?* (ABC) et *sa demande est-elle prévisible ?* (XYZ).

## Le classement ABC : la valeur

Le classement ABC applique le principe de Pareto : une petite partie des articles représente l’essentiel de la valeur consommée.

1. Pour chaque article, calculez la **valeur consommée** sur la période : quantité sortie × prix unitaire (coût d’achat ou coût standard). Sans prix, on peut classer sur la quantité, en gardant en tête que cela mélange des articles de valeurs très différentes.
2. Triez les articles par valeur décroissante.
3. Calculez la **part cumulée** de la valeur.
4. Attribuez les classes selon des seuils, classiquement **80 / 15 / 5 %** : les articles qui font les premiers 80 % de la valeur sont A, les 15 % suivants B, le reste C.

Un détail compte : que faire de l’article qui « franchit » le seuil de 80 % ? Dans Stock-o-mètre, on regarde la part cumulée **avant** l’article. S’il commence sous 80 %, il est A. Ainsi l’article le plus important est toujours A, même s’il pèse à lui seul 90 % de la valeur.

## Le classement XYZ : la régularité

Le classement XYZ s’appuie sur le **coefficient de variation** (CV) de la consommation par période :

```
CV = σ / μ
```

Le CV mesure la dispersion relativement à la moyenne : un écart-type de 20 sur une moyenne de 100 (CV = 0,2) est bien plus régulier qu’un écart-type de 20 sur une moyenne de 10 (CV = 2). Seuils usuels :

| Classe | CV | Profil |
|---|---|---|
| X | moins de 0,5 | demande régulière, facile à prévoir |
| Y | de 0,5 à 1 | demande fluctuante (saisonnalité, promotions) |
| Z | plus de 1 | demande erratique ou intermittente |

Le CV dépend de la période d’agrégation : il est en général plus faible en mensuel qu’en hebdomadaire, car les variations se compensent. Comparez des articles calculés sur la même période, et **gardez les périodes à zéro** : un article qui ne sort qu’une semaine sur quatre doit apparaître comme irrégulier.

## Exemple chiffré complet

Dix articles, avec leur valeur consommée sur 12 mois (en milliers d’euros) et le CV de leur consommation hebdomadaire :

| Article | Valeur (k€) | Part | Cumul avant | ABC | CV | XYZ |
|---|---|---|---|---|---|---|
| P1 | 420 | 42 % | 0 % | A | 0,20 | X |
| P2 | 260 | 26 % | 42 % | A | 0,60 | Y |
| P3 | 110 | 11 % | 68 % | A | 1,40 | Z |
| P4 | 60 | 6 % | 79 % | A | 0,30 | X |
| P5 | 50 | 5 % | 85 % | B | 0,45 | X |
| P6 | 40 | 4 % | 90 % | B | 0,80 | Y |
| P7 | 25 | 2,5 % | 94 % | B | 1,60 | Z |
| P8 | 15 | 1,5 % | 96,5 % | C | 0,25 | X |
| P9 | 12 | 1,2 % | 98 % | C | 0,90 | Y |
| P10 | 8 | 0,8 % | 99,2 % | C | 2,10 | Z |

Total : 1 000 k€. P4 commence à 79 %, sous le seuil de 80 % : il est A. Les **4 articles A pèsent 85 %** de la valeur, les 3 B 11,5 % et les 3 C 3,5 %.

Pour le CV, prenons l’article de l’exemple du [guide du stock de sécurité](/fr/guides/calcul-stock-de-securite/) : μ = 116,67 et σ = 18,87 par semaine, donc CV = 18,87 ÷ 116,67 = 0,16 : classe X.

## La matrice ABC-XYZ

| | X (régulier) | Y (fluctuant) | Z (erratique) |
|---|---|---|---|
| **A** | Taux de service élevé, stock de sécurité calculé finement, revue fréquente. Stock maîtrisé car prévisible. | Suivi rapproché de la saisonnalité, recalcul fréquent des paramètres. | Article à fort enjeu et imprévisible : dialogue avec les clients, contrats fournisseurs courts, éventuellement fabrication à la commande. |
| **B** | Paramètres standards, revue régulière. | Paramètres standards, recalcul trimestriel. | Vérifier si la demande est réellement erratique ou liée à quelques grosses commandes. |
| **C** | Automatiser : lots plus gros, revues espacées. | Automatiser, accepter un peu plus de stock. | Candidats au déréférencement ou à l’approvisionnement à la commande. |

P1 (AX) est l’article idéal : forte valeur, demande stable. Un stock de sécurité calculé au plus juste rapporte beaucoup. P3 (AZ) est l’article à risque : forte valeur, demande erratique. La formule classique du stock de sécurité y est peu fiable et une décision humaine s’impose. P10 (CZ) pèse peu et ne se prévoit pas : on peut se demander s’il faut le stocker.

## Bien utiliser le classement

- **Recalculez-le** au moins une fois par an, idéalement chaque trimestre : les articles changent de classe.
- **Ne confondez pas valeur et marge** : un article C peut être indispensable (pièce de sécurité, article d’appel). Gardez la possibilité d’affecter manuellement un niveau de service.
- **Différenciez le taux de service par classe** : c’est l’usage le plus direct du classement. Le guide [choisir son taux de service par classe](/fr/guides/taux-de-service-par-classe/) propose une méthode.

## Hypothèses et limites

- La valeur consommée dépend du **prix retenu** : coût d’achat récent, coût moyen pondéré ou prix de vente donnent des classements différents.
- Le CV suppose une **moyenne non nulle** : un article sans consommation n’a pas de classe XYZ.
- Un CV élevé peut venir d’une **tendance** ou d’une **saisonnalité** connue, donc prévisible, et pas seulement du hasard. Regardez le graphique avant de conclure.
- Les seuils 80/15/5 et 0,5/1 sont des **conventions**, pas des lois : adaptez-les à votre activité.

## Faire le classement automatiquement

[Stock-o-mètre](/fr/) calcule le classement ABC (sur la valeur si un prix est présent dans le fichier, sinon sur la quantité) et le classement XYZ de tous vos articles, avec des seuils modifiables, une courbe de Pareto et un filtre par classe. Le traitement est local : vos données ne quittent pas votre ordinateur. Pour un calcul ponctuel, le [calculateur de stock de sécurité](/fr/calculateurs/stock-de-securite/) suffit.
