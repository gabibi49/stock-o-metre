---
key: methodology
lang: fr
updated: '2026-11-20'
---

Cette page décrit exactement ce que calcule Stock-o-mètre, dans l’ordre, avec les hypothèses et les limites de chaque étape. Le code est testé contre des exemples calculés à la main.

## Notations

| Symbole | Signification                                                                |
| ------- | ---------------------------------------------------------------------------- |
| d       | consommation (sorties) d’un article sur une période                          |
| μ       | moyenne des consommations par période                                        |
| σ       | écart-type d’échantillon des consommations par période (dénominateur n − 1)  |
| n       | nombre de périodes analysées pour l’article                                  |
| L, R    | délai d’approvisionnement et période de revue, en jours                      |
| Lp, Rp  | L et R convertis en périodes : jours ÷ 7 (semaine) ou jours ÷ 30,4375 (mois) |
| σL, σLp | écart-type du délai, en jours puis en périodes                               |
| Z       | quantile de la loi normale centrée réduite pour le taux de service           |
| SS      | stock de sécurité                                                            |

30,4375 jours est la durée moyenne d’un mois (365,25 ÷ 12).

## 1. Lecture du fichier

- **Encodage** : UTF-8 (avec ou sans BOM), UTF-16 avec BOM, sinon Windows-1252.
- **Séparateur** : point-virgule, virgule ou tabulation, détecté sur les 50 premières lignes (le séparateur retenu est celui qui apparaît le même nombre de fois sur au moins 80 % des lignes et produit le plus de colonnes).
- **Nombres** : virgule ou point décimal, détecté sur un échantillon ; espaces, espaces insécables et apostrophes acceptés comme séparateurs de milliers ; signe moins en tête ou en fin, parenthèses comptables. Une valeur ambiguë pour le format détecté (par exemple « 1.5 » dans un fichier à virgule décimale) est refusée plutôt que mal lue.
- **Dates** : jj/mm/aaaa, jj.mm.aaaa, jj-mm-aaaa, aaaa-mm-jj, aaaa/mm/jj, mm/jj/aaaa, avec ou sans heure. Seule la date calendaire est utilisée (pas de fuseau horaire). Si l’échantillon ne permet pas de distinguer jj/mm de mm/jj, l’outil vous le demande. Les dates impossibles (31/02) sont rejetées.
- **Lignes rejetées** : date, quantité ou code article illisible. Elles sont comptées et la première est citée avec son numéro de ligne.
- **Limites** : 50 Mo, 2 millions de lignes, 50 000 articles.

## 2. Types de mouvement et signe des quantités

Chaque valeur de la colonne type est classée par vous en **entrée**, **sortie** (consommation), **ajustement** (modifie le stock reconstitué sans être une consommation) ou **ignorer**.

Certains logiciels exportent les sorties en négatif, d’autres en positif. Pour chaque type classé entrée ou sortie, l’outil prend le **signe majoritaire** de ses quantités comme sens normal. Une ligne de signe opposé (un retour, par exemple) vient en déduction. Les ajustements gardent leur signe tel quel.

Sans colonne type : quantité négative = sortie, positive = entrée, nulle = ignorée.

Le prix unitaire et le stock actuel retenus sont la dernière valeur valide par date. Les lignes strictement identiques (toutes colonnes) sont comptées comme des doublons : elles restent dans le calcul, car deux sorties identiques le même jour peuvent être réelles, mais l’article est signalé.

## 3. Agrégation par période

- La consommation est **sommée par article et par période** (semaine ISO du lundi au dimanche, ou mois civil).
- **Toutes les périodes** entre la première période de l’article et la fin du fichier sont présentes, **y compris celles sans aucune sortie**, qui valent 0. Sans elles, une demande intermittente paraîtrait régulière.
- La série d’un article commence à son **premier mouvement** dans le fichier (et non au début du fichier) : un article lancé en cours de période n’est pas pénalisé par des mois « à zéro » où il n’existait pas encore.
- Une période n’est retenue que si **le fichier la couvre entièrement**, de la première à la dernière date du fichier. La dernière période (période en cours) est exclue si le fichier s’arrête avant sa fin ; la première est exclue si le fichier commence après son début. Les deux cas sont signalés.
- Une période dont le total est négatif (plus de retours que de sorties) compte pour 0.

## 4. Statistiques

```
μ = Σ d / n
σ = √( Σ (d − μ)² / (n − 1) )        (σ = 0 si n < 2)
CV = σ / μ                             (non défini si μ = 0)
```

## 5. Coefficient de sécurité Z

Z est le quantile de la loi normale centrée réduite pour le taux de service par cycle visé, calculé par l’algorithme de Peter J. Acklam (erreur relative inférieure à 1,2 × 10⁻⁹). Valeurs de contrôle testées : 90 % → 1,2816 ; 95 % → 1,6449 ; 98 % → 2,0537 ; 99 % → 2,3263. Le taux est borné entre 50 % et 99,99 %.

Par défaut, le taux dépend de la classe ABC de l’article : A 98 %, B 95 %, C 90 %.

## 6. Stock de sécurité : trois méthodes

**Demande variable** (par défaut) :

```
SS = Z × σ × √(Lp + Rp)
```

**Demande et délai variables** (si σL est renseigné) :

```
SS = Z × √( (Lp + Rp) × σ² + μ² × σLp² )
```

Avec σL = 0, cette formule donne le même résultat que la précédente.

**Couverture simple** :

```
SS = (μ ÷ jours par période) × nombre de jours de couverture
```

## 7. Point de commande et stock cible

```
Point de commande = μ × Lp + SS
Stock cible        = μ × (Lp + Rp) + SS
```

Avec une revue continue (R = 0), les deux sont égaux. Le stock de sécurité étant calculé sur Lp + Rp, il couvre aussi la période entre deux revues.

## 8. Arrondis

Stock de sécurité, point de commande et stock cible sont **arrondis à l’unité supérieure** dans le tableau et l’export (avec une tolérance de 10⁻⁹ pour éviter qu’une imprécision de calcul ne fasse passer 24,000000000000004 à 25). Les graphiques utilisent les valeurs exactes.

## 9. Classements ABC et XYZ

**ABC** : sur la valeur consommée sur la période analysée (quantité × prix unitaire) si une colonne prix existe, sinon sur la quantité. Les articles sont triés par valeur décroissante. Un article est classé selon la part cumulée **avant** lui : A si elle est inférieure au seuil A (80 % par défaut), B si elle est inférieure à A + B (95 %), sinon C. Le premier article est donc toujours A, et un article de valeur nulle toujours C. Un article sans prix alors que la colonne prix existe est classé sur une valeur nulle et signalé.

**XYZ** : X si CV < 0,5 ; Y si 0,5 ≤ CV ≤ 1 ; Z si CV > 1 (seuils modifiables). Pas de classe si μ = 0.

## 10. Stock reconstitué et couverture

Avec un stock actuel (colonne du fichier ou saisie dans le tableau), on remonte le temps en annulant les mouvements :

```
stock en fin de jour j = stock actuel − Σ (mouvements nets après le jour j)
```

Sans stock actuel, le stock part de 0 au début du fichier : la courbe est alors **relative**, seules ses variations ont un sens. Les périodes où le stock est inférieur ou égal à 0 sont surlignées comme ruptures.

```
Couverture actuelle (jours) = stock actuel ÷ (μ ÷ jours par période)
Écart au stock cible        = stock actuel − stock cible arrondi
```

Un écart positif est un surstock (orange), négatif un sous-stock (rouge).

## 11. Alertes

| Alerte                    | Condition                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Historique court          | moins de 8 périodes analysées                                                                               |
| Demande intermittente     | plus de 30 % des périodes à zéro : la loi normale est peu fiable                                            |
| Stock reconstitué négatif | avec un stock actuel connu, le stock reconstitué passe sous 0 : mouvements manquants ou stock actuel erroné |
| Consommation nulle        | μ = 0                                                                                                       |
| Doublons                  | lignes strictement identiques dans le fichier                                                               |
| Prix manquant             | colonne prix associée mais aucun prix valide pour l’article                                                 |

## Hypothèses et limites

- **Demande stationnaire** : moyenne et dispersion stables sur l’historique. Une tendance ou une saisonnalité augmentent σ et faussent les niveaux selon la saison. Utilisez un historique récent, ou analysez séparément haute et basse saison.
- **Loi normale** de la demande sur Lp + Rp, et **indépendance** entre périodes. Raisonnable pour les articles à forte rotation ; approximatif pour les articles lents ou intermittents (alerte dédiée).
- **Taux de service par cycle** : probabilité de ne pas rompre entre deux réceptions. Ce n’est pas le taux de remplissage (part de la demande servie), qui est en général plus élevé.
- **Demande censurée** : pendant une rupture, les sorties sont nulles alors que la demande existait. L’historique sous-estime alors la demande.
- **Contraintes d’achat ignorées** : minimum de commande, conditionnement, lot économique, capacité de stockage.
- **Délai et revue identiques pour tous les articles**, sauf modification article par article.
- **Plage du fichier** : la première et la dernière date du fichier (tous mouvements confondus) définissent les périodes complètes.

L’outil est une aide à la décision. Vérifiez les résultats, en particulier pour les articles signalés par une alerte, avant de modifier vos paramètres de réapprovisionnement.
