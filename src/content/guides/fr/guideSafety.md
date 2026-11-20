---
key: guideSafety
lang: fr
summary:
  - 'Le stock de sécurité couvre l’écart entre la consommation réelle et la consommation moyenne pendant le délai de réapprovisionnement.'
  - 'Formule de base : SS = Z × σ × √(L + R), avec σ l’écart-type de la consommation par période, L le délai et R la période de revue exprimés dans la même unité de période.'
  - 'Exemple complet : 12 semaines d’historique, délai de 10 jours, revue hebdomadaire, taux de service de 95 % → stock de sécurité de 49 unités.'
  - 'La formule suppose une demande stable et à peu près normale : elle devient fragile pour les articles intermittents ou saisonniers.'
published: '2026-11-20'
updated: '2026-11-20'
---

Le stock de sécurité est la quantité que vous gardez « en plus » pour absorber les imprévus : une semaine où les clients consomment davantage que d’habitude, un fournisseur qui livre avec quelques jours de retard. Trop faible, il expose à des ruptures ; trop élevé, il immobilise de la trésorerie et de la place. Bien le calculer, c’est trouver le niveau qui correspond au risque de rupture que vous acceptez, article par article.

## Ce que le stock de sécurité doit couvrir

Quand vous passez une commande, vous ne serez livré qu’après le **délai d’approvisionnement L**. Si vous ne regardez vos stocks qu’à intervalles réguliers, il faut aussi tenir jusqu’à la prochaine revue : c’est la **période de revue R**. Pendant ces L + R jours, vous consommerez en moyenne μ × (L + R). Le stock de sécurité ne sert pas à couvrir cette consommation moyenne, mais **la part qui dépasse la moyenne**.

Cette part dépend de deux choses :

- la **variabilité de la consommation**, mesurée par son écart-type σ ;
- le **niveau de protection** souhaité, traduit en coefficient Z à partir du taux de service.

## La formule de base

Lorsque le délai est fiable et que seule la demande varie :

```
SS = Z × σ × √(L + R)
```

- **σ** est l’écart-type de la consommation **par période** (par semaine ou par mois), calculé sur l’historique.
- **L** et **R** sont exprimés **dans la même unité de période** que σ. Avec des données hebdomadaires, un délai de 10 jours vaut 10 ÷ 7 = 1,43 semaine.
- **Z** est le quantile de la loi normale correspondant au taux de service visé : 1,2816 pour 90 %, 1,6449 pour 95 %, 2,0537 pour 98 %, 2,3263 pour 99 %.

Pourquoi une racine carrée ? Si les consommations des différentes semaines sont indépendantes, leurs **variances** s’additionnent. Sur 2,43 semaines, la variance vaut 2,43 × σ², donc l’écart-type vaut σ × √2,43. L’incertitude grandit moins vite que la durée : deux semaines de délai ne doublent pas le stock de sécurité, elles le multiplient par √2 ≈ 1,41.

Le taux de service dont il est question ici est le **taux de service par cycle** : la probabilité de ne pas tomber en rupture entre deux réceptions. Ce n’est pas la part de la demande servie (le « taux de remplissage »), qui est en général nettement plus élevée. Le guide [choisir son taux de service par classe](/fr/guides/taux-de-service-par-classe/) détaille cette différence.

## Exemple chiffré complet

Un article de visserie a été consommé ainsi sur les 12 dernières semaines :

| Semaine | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sorties | 120 | 95 | 140 | 110 | 130 | 85 | 150 | 105 | 125 | 115 | 100 | 125 |

**1. Moyenne.** Le total vaut 1 400 unités, soit μ = 1 400 ÷ 12 = **116,67 unités par semaine**.

**2. Écart-type.** On calcule l’écart de chaque semaine à la moyenne, on l’élève au carré et on additionne : la somme des carrés vaut 3 916,67. On divise par n − 1 = 11 (écart-type d’échantillon) : variance = 356,06, d’où σ = √356,06 = **18,87 unités**.

**3. Conversion du délai et de la revue.** Le fournisseur livre en 10 jours et vous passez commande chaque lundi : Lp = 10 ÷ 7 = **1,4286 semaine**, Rp = 7 ÷ 7 = **1 semaine**. Donc √(Lp + Rp) = √2,4286 = **1,5584**.

**4. Coefficient de sécurité.** Pour un taux de service de 95 %, Z = **1,6449**.

**5. Stock de sécurité.**

```
SS = 1,6449 × 18,87 × 1,5584 = 48,37 → 49 unités
```

On arrondit toujours à l’unité supérieure. Avec ce stock de sécurité, le [point de commande](/fr/guides/point-de-commande/) vaut 116,67 × 1,4286 + 48,37 = 215,04, soit 216 unités, et le [stock cible](/fr/guides/stock-cible-niveau-de-recompletement/) 116,67 × 2,4286 + 48,37 = 331,70, soit 332 unités.

Vous pouvez refaire ce calcul avec vos propres valeurs dans le [calculateur de stock de sécurité](/fr/calculateurs/stock-de-securite/).

## Quand le délai varie aussi

Si le fournisseur livre tantôt en 8 jours, tantôt en 13, l’incertitude ne vient plus seulement de la demande. On ajoute alors un terme pour la variabilité du délai, avec σL l’écart-type du délai :

```
SS = Z × √((L + R) × σ² + μ² × σL²)
```

Reprenons l’exemple avec σL = 3 jours, soit σLp = 3 ÷ 7 = 0,4286 semaine :

- part due à la demande : 2,4286 × 356,06 = 864,72 ;
- part due au délai : 116,67² × 0,4286² = 2 500,00 ;
- SS = 1,6449 × √3 364,72 = 1,6449 × 58,01 = 95,41 → **96 unités**.

Trois jours d’incertitude sur le délai font presque doubler le stock de sécurité. Fiabiliser un fournisseur rapporte souvent plus que de raffiner les prévisions.

## La méthode « jours de couverture »

Beaucoup d’entreprises fixent un stock de sécurité en jours : « 5 jours de consommation ». Ici, 116,67 ÷ 7 = 16,67 unités par jour, donc 5 jours font 83,3, soit 84 unités. Cette règle est simple à expliquer, mais elle ignore la variabilité : un article très régulier et un article très erratique reçoivent la même protection en jours. Elle reste utile pour démarrer, ou pour des articles sans historique.

## Hypothèses et limites

La formule repose sur des hypothèses qu’il faut connaître :

- **Demande stationnaire** : la moyenne et la dispersion ne changent pas sur la période étudiée. Une tendance ou une saisonnalité marquée gonflent artificiellement σ.
- **Loi normale** : la consommation sur L + R suit à peu près une courbe en cloche. C’est raisonnable pour les articles à forte rotation, beaucoup moins pour ceux qui ne sortent que de temps en temps.
- **Indépendance** des périodes entre elles.
- **Demande observée = demande réelle** : pendant une rupture, les sorties sont nulles alors que la demande existait. L’historique sous-estime alors la moyenne.

Pour une **demande intermittente** (plus de 30 % de périodes sans sortie), la loi normale décrit mal la réalité : le résultat est à prendre comme un ordre de grandeur. Des méthodes dédiées (loi de Poisson, méthode de Croston) sont alors plus adaptées.

## Les erreurs les plus fréquentes

1. **Oublier les périodes à zéro.** Si l’on ne garde que les semaines avec des sorties, la demande paraît régulière et σ est sous-estimé.
2. **Mélanger les unités** : un σ mensuel avec un délai en semaines.
3. **Utiliser l’écart entre le maximum et le minimum** au lieu de l’écart-type.
4. **Appliquer le même taux de service à tous les articles**, alors qu’un [classement ABC-XYZ](/fr/guides/classement-abc-xyz/) permet de mieux répartir l’effort.
5. **Ne jamais recalculer** : la consommation évolue, le stock de sécurité aussi. Une mise à jour trimestrielle est un bon rythme.

## Calculer pour tous vos articles

Faire ce calcul à la main pour un article est instructif ; pour 3 000 références, c’est une autre histoire. [L’outil Stock-o-mètre](/fr/) lit l’export de vos mouvements de stock en CSV, reconstitue les consommations par semaine ou par mois (périodes à zéro comprises), puis calcule le stock de sécurité, le point de commande et le stock cible de chaque article. Le fichier est traité dans votre navigateur et n’est jamais envoyé sur un serveur.
