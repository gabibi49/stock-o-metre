---
key: guideService
lang: fr
summary:
  - 'Le taux de service par cycle est la probabilité de ne pas tomber en rupture entre deux réceptions ; il fixe le coefficient Z de la formule du stock de sécurité.'
  - 'Le stock de sécurité croît vite près de 100 % : passer de 95 % à 99 % augmente le stock de sécurité de 41 %.'
  - 'Différencier le taux par classe ABC (par exemple A 98 %, B 95 %, C 90 %) concentre le stock là où l’enjeu est le plus fort.'
  - 'Exemple chiffré : trois articles aux paramètres identiques, mais au coût unitaire différent, et le coût de chaque point de service.'
published: '2026-11-20'
updated: '2026-11-20'
---

« On veut 100 % de taux de service. » La phrase est fréquente, mais elle ne tient pas face aux chiffres : avec une demande incertaine, garantir l’absence totale de rupture demanderait un stock infini. Le vrai travail consiste à **choisir le niveau de risque acceptable**, article par article ou classe par classe, en connaissant son coût.

## De quel taux de service parle-t-on ?

Deux indicateurs portent souvent le même nom :

- le **taux de service par cycle** (*cycle service level*) : la probabilité qu’un cycle de réapprovisionnement se termine sans rupture. C’est lui qui intervient dans la formule SS = Z × σ × √(L + R) ;
- le **taux de remplissage** (*fill rate*) : la part de la demande servie immédiatement sur stock.

Ils ne sont pas égaux. Prenons un article dont la consommation pendant le délai a un écart-type de 100 unités, commandé par lots de 500. Avec un taux de service par cycle de 95 %, la loi normale donne une rupture attendue d’environ 2,1 unités par cycle, soit un taux de remplissage de 1 − 2,1 ÷ 500 ≈ **99,6 %**. Un taux de 95 % « par cycle » n’est donc pas une performance médiocre ; il ne signifie pas que 5 % des clients repartent les mains vides.

## Ce que coûte chaque point de service

Le coefficient Z est le quantile de la loi normale. Il ne croît pas en ligne droite :

| Taux de service | Z | Stock de sécurité par rapport à 95 % |
|---|---|---|
| 80 % | 0,8416 | 51 % |
| 90 % | 1,2816 | 78 % |
| 95 % | 1,6449 | 100 % |
| 97,5 % | 1,9600 | 119 % |
| 98 % | 2,0537 | 125 % |
| 99 % | 2,3263 | 141 % |
| 99,5 % | 2,5758 | 157 % |
| 99,9 % | 3,0902 | 188 % |

De 90 % à 95 %, on ajoute 28 % de stock de sécurité. De 95 % à 99 %, on en ajoute 41 %. Les derniers points sont les plus chers.

## Exemple chiffré complet

Trois articles ont la même incertitude : σ × √(L + R) = **100 unités**. Ils ne diffèrent que par leur coût unitaire et leur classe ABC :

| Article | Classe | Coût unitaire | Taux visé | Z | Stock de sécurité | Valeur |
|---|---|---|---|---|---|---|
| Pompe | A | 40 € | 98 % | 2,0537 | 205,4 → 206 | 8 240 € |
| Joint | B | 15 € | 95 % | 1,6449 | 164,5 → 165 | 2 475 € |
| Collier | C | 4 € | 90 % | 1,2816 | 128,2 → 129 | 516 € |

Avec un coût de possession annuel de 25 % (financement, assurance, place, obsolescence), le stock de sécurité de la pompe coûte environ 8 240 × 0,25 = **2 060 € par an**.

Regardons deux décisions possibles :

- **Monter la pompe de 98 % à 99 %** : 233 − 206 = 27 unités de plus, soit 1 080 € de stock et 270 € par an.
- **Monter le collier de 90 % à 98 %** : 206 − 129 = 77 unités de plus, soit 308 € de stock et 77 € par an.

Le second choix gagne beaucoup plus de fiabilité pour beaucoup moins d’argent. C’est tout l’intérêt de raisonner par classe.

## Deux façons de différencier

**Approche 1, protéger le chiffre d’affaires.** Les articles A pèsent le plus dans la consommation : une rupture y coûte cher en ventes perdues. On leur donne le taux le plus élevé : **A 98 %, B 95 %, C 90 %**. Ce sont les valeurs par défaut de Stock-o-mètre, modifiables.

**Approche 2, économiser là où c’est cher.** Les articles C coûtent peu à stocker : un taux élevé ne pèse presque rien, et il évite de gérer des ruptures sur des centaines de petites références. On peut alors viser **C 98 à 99 %** et ajuster finement les A, qui concentrent l’argent immobilisé.

Les deux approches sont défendables. Le bon choix dépend du coût d’une rupture chez vous : client perdu, ligne de production arrêtée, simple report de livraison ? En pratique, beaucoup d’entreprises combinent les deux : taux élevé sur les A **réguliers** (AX), taux élevé sur les C bon marché, et taux plus modéré sur les articles chers et erratiques (AZ), traités au cas par cas.

## Une méthode en quatre étapes

1. **Classez vos articles** en ABC et XYZ (voir le [guide du classement ABC-XYZ](/fr/guides/classement-abc-xyz/)).
2. **Partez d’une grille simple** : par exemple A 98 %, B 95 %, C 90 %, avec une exception pour les articles critiques (pièces de sécurité, articles sans substitut).
3. **Calculez le stock de sécurité correspondant** et sa valeur totale. Si le budget est dépassé, baissez d’abord les classes où le coût marginal est le plus élevé.
4. **Mesurez** le taux de service réellement obtenu sur quelques mois, et ajustez.

Pour les articles **intermittents** (classe Z), la loi normale décrit mal la demande : le taux de service affiché n’est qu’indicatif. Préférez une revue manuelle.

## Hypothèses et limites

- La correspondance entre taux de service et Z suppose une demande **normale** et **stationnaire** sur L + R.
- Le taux de service par cycle ne tient pas compte de la **taille des lots** : un gros lot réduit le nombre de cycles, donc le nombre d’occasions de rupture dans l’année.
- Les **ruptures passées** faussent l’historique : la demande non servie n’apparaît pas dans les sorties.
- Un taux de service est une **cible statistique** : sur un trimestre, le taux observé fluctue autour de la cible.

## Essayez avec vos articles

Le [calculateur de stock de sécurité](/fr/calculateurs/stock-de-securite/) montre immédiatement l’effet d’un changement de taux de service sur un article. Pour tout votre catalogue, [Stock-o-mètre](/fr/) applique un taux par classe ABC, que vous pouvez modifier globalement ou article par article, et recalcule instantanément stock de sécurité, point de commande et stock cible, sans que vos données ne quittent votre ordinateur.
