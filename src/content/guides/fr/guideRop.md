---
key: guideRop
lang: fr
summary:
  - 'Le point de commande est le seuil de stock disponible qui déclenche une commande fournisseur.'
  - 'Formule : point de commande = consommation moyenne × délai d’approvisionnement + stock de sécurité.'
  - 'Exemple : 18 unités par jour, délai de 12 jours, taux de service de 97,5 % → point de commande de 257 unités.'
  - 'On compare toujours le point de commande à la position de stock (stock physique + commandes en cours), jamais au seul stock en rayon.'
published: '2026-11-20'
updated: '2026-11-20'
---

Le point de commande (ou **seuil de réapprovisionnement**, *reorder point* en anglais) répond à une question simple : **à partir de quel niveau de stock faut-il commander ?** Trop haut, on commande trop tôt et le stock gonfle. Trop bas, la commande arrive après la rupture. Le bon seuil permet de tenir jusqu’à la livraison, avec une marge calculée pour les imprévus.

## La formule

En **revue continue**, c’est-à-dire quand on surveille le stock en permanence (ce que fait un ERP à chaque mouvement) :

```
Point de commande = μ × L + SS
```

- **μ × L** est la consommation moyenne pendant le délai d’approvisionnement : ce que l’on va consommer « normalement » en attendant la livraison ;
- **SS** est le stock de sécurité, qui couvre la consommation au-delà de la moyenne pendant ce même délai.

μ et L doivent être dans la même unité : une consommation par jour avec un délai en jours, ou une consommation par semaine avec un délai converti en semaines (10 jours = 10 ÷ 7 = 1,43 semaine).

## Exemple chiffré complet

Un filtre se consomme en moyenne **18 unités par jour ouvré**, avec un écart-type journalier de **6 unités**. Le fournisseur livre en **12 jours** ouvrés. L’article est important : on vise un taux de service de **97,5 %**, soit Z = **1,96**.

**1. Consommation pendant le délai.**

```
μ × L = 18 × 12 = 216 unités
```

**2. Stock de sécurité.** La période à couvrir est le délai seul (revue continue, R = 0) :

```
SS = 1,96 × 6 × √12 = 1,96 × 6 × 3,4641 = 40,74 → 41 unités
```

**3. Point de commande.**

```
Point de commande = 216 + 40,74 = 256,74 → 257 unités
```

**4. Mise en pratique.** Le filtre est acheté par lots de 300. Le lundi, la position de stock est de 420 unités et aucune commande n’est en cours. Au rythme moyen, elle atteint 257 unités après (420 − 257) ÷ 18 ≈ 9 jours : la commande part donc vers le 10e jour. Elle arrive 12 jours plus tard ; dans le cas moyen, il reste alors environ 41 unités, le stock de sécurité, avant que le lot de 300 ne remonte le stock.

**5. Stock moyen.** Avec des lots fixes, le stock physique moyen vaut à peu près SS + Q ÷ 2 = 41 + 150 = **191 unités**.

Vérifiez vos propres valeurs avec le [calculateur de point de commande](/fr/calculateurs/point-de-commande/).

## Pourquoi comparer à la position de stock

Le seuil doit être comparé à la **position de stock** :

```
Position de stock = stock physique + commandes fournisseurs en cours − commandes clients en attente
```

Si l’on ne regarde que le stock physique, le seuil reste franchi tant que la commande n’est pas arrivée, et l’on recommande chaque jour. C’est encore plus important quand la consommation pendant le délai dépasse la taille du lot : plusieurs commandes sont alors en cours en même temps.

## Point de commande et revue périodique

Si vous ne vérifiez vos stocks qu’une fois par semaine, un article peut franchir le seuil le mardi sans que personne ne s’en aperçoive avant le lundi suivant. Deux solutions :

- intégrer la période de revue dans le stock de sécurité et dans le seuil (le seuil devient μ × (L + R) + SS), ce qui revient à piloter avec un [stock cible](/fr/guides/stock-cible-niveau-de-recompletement/) ;
- ou passer en revue continue grâce aux alertes de votre ERP.

Dans l’outil Stock-o-mètre, le point de commande est toujours calculé sur L, et le stock cible sur L + R. Avec R = 0, les deux sont égaux.

## D’où viennent les paramètres ?

- **μ et σ** : de l’historique des sorties, agrégé par jour, semaine ou mois, **en gardant les périodes sans sortie**. Douze à vingt-quatre mois d’historique sont un bon compromis.
- **L** : du délai réel constaté (date de réception − date de commande), plutôt que du délai annoncé par le fournisseur. Comptez aussi le temps de contrôle à réception et de rangement.
- **Le taux de service** : d’un choix de gestion, idéalement différencié par classe d’articles (voir [choisir son taux de service par classe](/fr/guides/taux-de-service-par-classe/)).

Si le délai varie sensiblement, utilisez la formule du stock de sécurité qui intègre l’écart-type du délai, détaillée dans le [guide du stock de sécurité](/fr/guides/calcul-stock-de-securite/).

## Hypothèses et limites

- **Demande stationnaire** : le point de commande est calculé sur une moyenne passée. Si la consommation augmente de 30 %, le seuil devient trop bas.
- **Loi normale** : correcte pour les articles qui sortent souvent ; pour les articles intermittents, le seuil est approximatif.
- **Une seule commande à la fois** : la formule reste valable avec plusieurs commandes en cours, à condition de raisonner en position de stock.
- **Taux de service par cycle** : 97,5 % signifie qu’environ 1 cycle de réapprovisionnement sur 40 connaîtra une rupture, même courte. Ce n’est pas 97,5 % de la demande servie.
- **Demande perdue** : pendant une rupture, les sorties sont nulles et l’historique sous-estime la demande réelle.

## Erreurs fréquentes

1. Fixer le seuil « au jugé » une fois pour toutes, sans le recalculer quand la consommation évolue.
2. Oublier le stock de sécurité, ou le compter deux fois (dans le seuil et dans un « stock mini » séparé).
3. Utiliser le délai contractuel au lieu du délai réellement constaté.
4. Comparer le seuil au stock physique au lieu de la position de stock.

## Pour tous vos articles

[L’outil Stock-o-mètre](/fr/) calcule le point de commande de chaque article à partir de l’export CSV de vos mouvements de stock, et indique combien d’articles sont actuellement sous leur point de commande. Tout le calcul se fait dans votre navigateur : votre fichier n’est envoyé nulle part.
