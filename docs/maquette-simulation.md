# Simulation d'entreprise : maquette à valider

Scénario A : **« Le négoce de pièces »**. Rien n'est codé : ce document décrit les écrans et
les règles de calcul pour qu'on les valide ensemble avant d'écrire la moindre ligne.

---

## 1. Le principe en une phrase

Vous êtes responsable supply chain d'un distributeur de pièces industrielles. Chaque mois, vous
tenez la **réunion S&OP / PIC** : vous ajustez les prévisions et les règles de stock ; le moteur fait
ensuite tourner les semaines du mois (ventes, commandes fournisseurs, réceptions, coûts). Au bout de
**24 mois (2 ans)**, vous comparez votre résultat à celui d'un « pilote automatique » qui n'a jamais
rien changé, sur exactement la même demande.

| Point             | Proposition                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Durée             | 24 tours mensuels = 2 ans = 104 semaines (calendrier 4-4-5 : 4, 4 puis 5 semaines par trimestre) |
| Un tour           | 2 à 3 minutes → une partie complète ≈ 1 h, en plusieurs fois grâce à la sauvegarde               |
| Semaines          | automatiques par défaut ; mode « semaine par semaine » au choix, avec commande forcée            |
| Articles          | 6 articles en 3 familles (le PIC se lit par famille, les règles se règlent par article)          |
| Pas d'argent réel | les montants sont fictifs, dans la devise choisie                                                |

> **Point à confirmer** : j'ai lu « 24 semaines pour le S&OP » comme **24 tours mensuels sur 2 ans**,
> car le S&OP se décide au mois et vous avez demandé 2 ans. 24 _semaines_ ne ferait que 6 mois et
> ne laisserait voir ni la saisonnalité ni le cycle de vie des articles.

---

## 2. Les écrans

### Écran 1 : accueil de la simulation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Simulation d'entreprise                                                      │
│ Pilotez 2 ans de stock d'un distributeur de pièces, une réunion S&OP par mois│
│                                                                              │
│  [ Nouvelle partie ]   [ Reprendre la partie en cours (mois 7/24) ]          │
│  [ Reprendre une partie depuis un fichier… ]                                 │
│                                                                              │
│  Tout se calcule dans votre navigateur. La partie en cours est gardée dans   │
│  ce navigateur ; « Télécharger ma partie » en fait un fichier chez vous.     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Écran 2 : votre entreprise (paramétrage)

```
┌─ Votre entreprise ───────────────────────────────────────────────────────────┐
│ Nom de l'entreprise  [ Distrib'Pièces          ]                             │
│ Devise               [ € ▾ ]   (€, $, £, CHF, ou symbole libre)              │
│ Unité                [ pièces ▾ ] (pièces, unités, kg, m…)                   │
│                                                                              │
│ Profil de difficulté   ( ) Facile   (•) Normal   ( ) Difficile               │
│ ┌──────────────────────────────┬─────────┬─────────┬───────────┐             │
│ │                              │ Facile  │ Normal  │ Difficile │             │
│ ├──────────────────────────────┼─────────┼─────────┼───────────┤             │
│ │ Variabilité demande (CV)     │  0,15   │ [0,30]  │   0,50    │             │
│ │ Délai fournisseur (sem.)     │   2     │  [3]    │    4      │             │
│ │ Écart-type du délai (sem.)   │   0     │ [0,5]   │    1      │             │
│ │ Événements                   │ annoncés│[partiel]│ surprises │             │
│ │ Rupture                      │reliquats│[reliq.] │ventes perdues│          │
│ │ Capacité entrepôt (palettes) │  400    │ [300]   │   220     │             │
│ └──────────────────────────────┴─────────┴─────────┴───────────┘             │
│ Les valeurs entre crochets sont modifiables : le profil n'est qu'un point    │
│ de départ.                                                                   │
│                                                                              │
│ Code de partie (graine)  [ 482913 ]  [↻ autre]                               │
│ Même code + mêmes réglages = même demande : pratique pour comparer entre     │
│ collègues ou en formation.                                                   │
│                                                                              │
│                                              [ Commencer au mois 1 ]         │
└──────────────────────────────────────────────────────────────────────────────┘
```

Les 6 articles du scénario A (renommables) :

| Famille    | Article | Comportement de la demande                  | Ce qu'il apprend                                |
| ---------- | ------- | ------------------------------------------- | ----------------------------------------------- |
| Roulements | R-6204  | stable, fort volume (X)                     | le cas d'école : SS, point de commande, Wilson  |
| Roulements | R-6305  | tendance à la hausse (+20 %/an)             | une prévision qui ne suit pas fait des ruptures |
| Courroies  | C-A42   | saisonnière (pic au printemps)              | anticiper dans le PIC, pas au dernier moment    |
| Courroies  | C-B55   | erratique, gros clients (Z)                 | le niveau de service a un coût sur un article Z |
| Filtres    | F-H10   | fin de vie : la demande s'arrête au mois 18 | le stock qui reste ne vaut presque plus rien    |
| Filtres    | F-N20   | nouvel article lancé au mois 7              | démarrer sans historique                        |

Au départ, la partie fournit **52 semaines d'historique** de ventes. Un bouton les exporte au format
du fichier de l'outil Stock-o-mètre, pour les analyser avec l'outil (ABC/XYZ, stock de sécurité).

### Écran 3 : la réunion S&OP mensuelle (écran principal)

```
┌─ Distrib'Pièces · Mois 7 / 24 · Juillet année 1 ─────────────────────────────┐
│ Taux de service (cumul) 96,1 %   Stock 84 300 €   Résultat cumulé 41 250 €   │
│ Pilote automatique au même stade : 94,8 % · 91 700 € · 38 900 €              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. CE QUI S'EST PASSÉ EN JUIN                                                │
│   Ventes 9 820 pièces (prévu 9 400) · 2 ruptures (C-B55) · 3 réceptions      │
│   [graphique : stock et ventes des 6 derniers mois, par famille]             │
│                                                                              │
│ 2. CE QUI S'ANNONCE                                                          │
│   ⚑ Promotion d'un client sur C-A42 en septembre (+60 % sur le mois)         │
│   ⚑ Nouvel article F-N20 référencé ce mois-ci : pas d'historique             │
│                                                                              │
│ 3. PLAN (PIC) PAR FAMILLE, 3 MOIS                                            │
│ ┌────────────┬────────────┬────────┬────────┬────────┐                       │
│ │ Roulements │            │ Juil.  │ Août   │ Sept.  │                       │
│ │            │ Ventes prév│ 4 200  │ 4 250  │ 5 400  │                       │
│ │            │ Achats prév│ 4 000  │ 4 500  │ 5 000  │                       │
│ │            │ Stock fin  │ 2 900  │ 3 150  │ 2 750  │                       │
│ │            │ Couverture │ 3,1 sem│ 3,0 sem│ 2,5 sem│                       │
│ │ Courroies … (même tableau)                                               │
│ │ Filtres  …                                                               │
│ │ Entrepôt   │ Palettes   │  241   │  262   │  238   │  capacité 300         │
│ └────────────┴────────────┴────────┴────────┴────────┘                       │
│                                                                              │
│ 4. VOS DÉCISIONS PAR ARTICLE                                                 │
│ ┌────────┬────────────────┬──────────┬───────┬───────┬─────────────────────┐ │
│ │Article │Prévision/sem.  │ Service  │  SS   │  PC   │ Qté commande        │ │
│ │        │ M+1  M+2  M+3  │  visé    │(calc.)│(calc.)│ (Wilson suggéré)    │ │
│ ├────────┼────────────────┼──────────┼───────┼───────┼─────────────────────┤ │
│ │R-6204  │[120][120][125] │ [95 %]   │  119  │  599  │ [500]  (500)        │ │
│ │R-6305  │[ 85][ 87][ 90] │ [95 %]   │   …   │   …   │ […]                 │ │
│ │…       │                │          │       │       │                     │ │
│ └────────┴────────────────┴──────────┴───────┴───────┴─────────────────────┘ │
│ [ Reprendre les suggestions ]   Suggestion = moyenne mobile 13 semaines      │
│                                                                              │
│      [ Lancer le mois (4 semaines) ]   [ Avancer semaine par semaine ]       │
│      [ Télécharger ma partie ]                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

Les colonnes SS et PC sont recalculées à chaque saisie, avec les mêmes formules que les
calculateurs du site.

### Écran 4 : semaine par semaine (facultatif)

```
┌─ Mois 7 · Semaine 2 / 4 ─────────────────────────────────────────────────────┐
│ ┌────────┬───────┬────────┬─────────┬──────────┬───────────┬─────────────┐   │
│ │Article │Stock  │ Ventes │Reliquats│ En cde   │ Position  │ Événement   │   │
│ ├────────┼───────┼────────┼─────────┼──────────┼───────────┼─────────────┤   │
│ │R-6204  │  412  │  131   │    0    │ 500 (S4) │   912     │             │   │
│ │C-B55   │    0  │   58   │   23    │ 300 (S3) │   277     │ ⚠ rupture   │   │
│ └────────┴───────┴────────┴─────────┴──────────┴───────────┴─────────────┘   │
│                                                                              │
│ Forcer une commande : article [C-B55 ▾]  quantité [150]                      │
│   ( ) Normale : délai 3 sem., prix normal                                    │
│   (•) Express : délai 1 sem., prix +15 %          [ Commander ]              │
│                                                                              │
│              [ Semaine suivante ]   [ Finir le mois automatiquement ]        │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Écran 5 : bilan au bout des 24 mois

```
┌─ Bilan · Distrib'Pièces · Code 482913 · Normal ──────────────────────────────┐
│                        Vous        Pilote automatique                        │
│ Résultat logistique    142 800 €   121 400 €        (+21 400 €)              │
│ Taux de service        96,4 %      93,9 %                                    │
│ Stock moyen            79 200 €    88 600 €                                  │
│ Rotation du stock      9,8         8,6                                       │
│ Stock obsolète (F-H10) 1 240 €     6 900 €                                   │
│                                                                              │
│ [graphiques sur 24 mois : stock, taux de service, résultat cumulé]           │
│ Ce que montre votre partie : 3 constats tirés des chiffres                   │
│ (ex. « vos ruptures viennent à 70 % de C-B55 : article Z servi à 98 % »)     │
│                                                                              │
│ [ Télécharger ma partie ]  [ Rejouer le même code ]  [ Nouvelle partie ]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Les règles de calcul

### 3.1 Ordre des opérations, chaque semaine et pour chaque article

1. **Réceptions** : les commandes dont la date d'arrivée est atteinte entrent en stock.
2. **Ventes** : la demande de la semaine est servie sur le stock. Les reliquats en attente sont
   servis en premier. Ce qui manque devient un reliquat, ou une vente perdue selon le profil.
3. **Réapprovisionnement** (point de commande, révision continue) :
   - position = stock + en commande − reliquats ;
   - si position ≤ PC, le moteur commande Q, autant de fois que nécessaire pour repasser au-dessus du PC.
4. **Coûts de la semaine** : possession, passation, dépassement d'entrepôt, ruptures.

### 3.2 Les formules, les mêmes que sur le site

| Grandeur                 | Formule                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Écart-type de l'erreur σ | écart-type (échantillon) de (ventes − prévision) sur les 13 dernières semaines                                 |
| Stock de sécurité        | SS = Z × σ × √(L + R) (L = délai en semaines ; R = 1 semaine, car le stock est contrôlé chaque fin de semaine) |
| SS si le délai varie     | SS = Z × √((L + R)·σ² + d²·σL²)                                                                                |
| Point de commande        | PC = d × (L + R) + SS (d = prévision hebdo du mois joué)                                                       |
| Quantité suggérée        | Wilson : Q* = √(2·D·S / (c·i)), D = 52 × d                                                                     |
| Coût de possession       | valeur du stock en fin de semaine × taux annuel / 52                                                           |

**Exemple chiffré** pour R-6204, avec d = 120/sem., σ = 36, L = 3 sem., 95 % (Z = 1,6449),
S = 40 €/commande, c = 8 €, i = 25 %/an :

- SS = 1,6449 × 36 × √(3 + 1) = 118,43 → **119** ;
- PC = 120 × 4 + 118,43 = 598,43 → **599** ;
- Q* = √(2 × 6 240 × 40 / 2) = 499,6 → **500** ;
- coût annuel attendu = 6 240 / 500 × 40 + (500/2 + 119) × 2 = 499,20 + 738 = **1 237,20 €**.

> Mise à jour pendant le développement : le stock n'étant contrôlé qu'en fin de semaine, la
> révision n'est pas continue. Sans la semaine de révision R, le premier essai du moteur donnait
> 95 % visés mais seulement 85 à 90 % servis. Avec R = 1 semaine, comme dans la formule du site,
> le taux de service obtenu correspond à la cible.

### 3.3 Le PIC (plan par famille)

Le PIC est une **projection** : le moteur rejoue les 3 mois suivants avec une demande égale à la
prévision. Il en tire, par famille et par mois :

- **Ventes prévues** : la somme des prévisions des articles de la famille ;
- **Achats prévus** : les commandes que les règles déclencheraient ;
- **Stock fin** = stock début + achats − ventes ;
- **Couverture** = stock fin / ventes prévues par semaine du mois suivant ;
- **Palettes** = Σ stock / unités par palette, comparé à la capacité de l'entrepôt.

C'est ce tableau qui permet de voir venir un pic : une promotion, la saison, ou un entrepôt qui
déborde.

### 3.4 Coûts et résultat

| Poste                        | Règle                                                                       |
| ---------------------------- | --------------------------------------------------------------------------- |
| Marge brute                  | ventes servies × (prix de vente − coût d'achat)                             |
| Passation                    | S par commande ; une commande express coûte +15 % sur le prix d'achat       |
| Possession                   | 3.2 ci-dessus                                                               |
| Entrepôt                     | au-delà de la capacité : coût par palette et par semaine (stockage externe) |
| Rupture, mode reliquats      | pénalité par unité et par semaine d'attente (10 % du prix de vente)         |
| Rupture, mode ventes perdues | marge perdue + pénalité d'image (10 % du prix de vente)                     |
| Obsolescence                 | à la fin de la partie, le stock de F-H10 ne vaut plus que 20 % de son coût  |

**Résultat logistique = marge brute − tous les coûts.** C'est le score. Le taux de service est
affiché à côté, mais il est déjà payé dans le score par les pénalités de rupture.

### 3.5 Indicateurs affichés

- **Taux de service (fill rate)** = quantités servies à temps / quantités demandées.
- **Taux de cycles sans rupture** = semaines sans rupture / semaines.
- **Stock moyen en valeur**, **rotation** = coût des ventes annuel / stock moyen, **couverture en semaines**.

Ce sont les deux définitions du service vues dans les exercices corrigés.

### 3.6 Hasard reproductible (graine)

- Un générateur pseudo-aléatoire initialisé par le code de partie.
- **Un flux séparé par article pour la demande**, et un autre pour les délais : la demande ne
  dépend jamais de vos décisions. C'est ce qui rend juste la comparaison avec le pilote automatique,
  et entre collègues ayant le même code.
- La demande d'une semaine = niveau × saisonnalité × tendance × (1 + CV × tirage normal), arrondie,
  jamais négative. C-B55 suit un tirage « par gros clients » : peu de commandes, mais grosses.
- Les événements sont tirés au début de la partie. Selon le profil, ils sont annoncés un mois avant,
  annoncés en partie, ou non annoncés.

### 3.7 Le pilote automatique

Il garde les réglages du mois 1 pendant 24 mois : prévision = moyenne de l'historique, 95 %, Wilson.
Il est simulé en même temps que vous, avec la même graine. C'est la référence de « ne rien faire ».

---

## 4. Sauvegarde et vie privée

- La partie est enregistrée **dans le navigateur** (localStorage) après chaque tour.
- Ce qui est enregistré : les réglages, le code de partie et la liste de vos décisions, rien d'autre.
  Le moteur rejoue la partie à l'identique à partir de ces éléments.
- **« Télécharger ma partie »** crée un petit fichier `.json` sur votre ordinateur.
  **« Reprendre une partie »** le relit sur place, sans l'envoyer nulle part.
- Une ligne s'ajoute à la page de confidentialité : « La simulation garde votre partie en cours dans
  le stockage local de votre navigateur ; aucune donnée n'est envoyée. Vous pouvez l'effacer avec le
  bouton Nouvelle partie ou en vidant les données du site. »
- RGPD : rien ne quitte l'appareil et il n'y a ni compte ni cookie de suivi. Le stockage local sert
  uniquement au service demandé par l'utilisateur, ce qui n'appelle pas de bandeau de consentement.

---

## 5. Préparé pour le scénario B (composants et produits finis)

Le moteur est découpé en étapes hebdomadaires. Le scénario A n'en utilise qu'une partie :

```
Semaine : réceptions → [besoins nets / nomenclatures]* → ventes → réappro → [charge des postes]* → coûts
                         * vides dans le scénario A, utilisées par le scénario B
```

- Article : `type: achete | fabrique`, `nomenclature?`, `gamme?` (même format d'opérations que le
  kit ordonnancement).
- Postes de charge : liste vide en A.
- Le scénario est un simple fichier de données (articles, profils, événements) : on ajoute B sans
  toucher au moteur de A.
- Le lancement des OF reste dans le kit ordonnancement. La simulation B s'arrêtera au plan directeur
  et à la charge globale, pour rester au niveau S&OP / PDP.

---

## 6. Ce que j'ajouterai sur le site

- Une page `/fr/simulation/` et `/en/simulation/`, dans le menu, et une carte dans « Aller plus loin ».
- Des formulaires de saisie (contrairement au kit), mais aucune donnée envoyée : la CSP
  `form-action 'none'` reste en place.
- Les graphiques en SVG, sans attribut `style`, comme pour le Gantt.
- Des tests unitaires du moteur : même graine = même partie, calculs de l'exemple 3.2, PIC, coûts.
  Des tests navigateur pour un tour complet, la sauvegarde et la reprise depuis un fichier.
