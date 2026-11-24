/**
 * Textes de l'interface en français. Toute chaîne visible doit venir d'ici
 * (ou de en.ts) : aucun texte en dur dans les composants.
 * Variables : {nom}. Pluriels : objets { one, other } (règles Intl.PluralRules).
 */
const fr = {
  common: {
    siteName: 'Stock-o-mètre',
    tagline: 'Stock de sécurité, point de commande et stock cible, calculés dans votre navigateur.',
    skip: 'Aller au contenu',
    nav: {
      label: 'Navigation principale',
      tool: 'Outil',
      guides: 'Guides',
      calculators: 'Calculateurs',
      methodology: 'Méthodologie',
      exercises: 'Exercices',
      kit: 'Kit ordonnancement',
    },
    langSwitch: {
      label: 'Langue :',
      target: 'English',
      targetShort: 'EN',
      hint: 'Read this page in English',
    },
    breadcrumb: { label: 'Fil d’Ariane', home: 'Accueil' },
    footer: {
      local: 'Vos données restent sur votre ordinateur : aucun envoi, aucun cookie, aucun traceur.',
      privacy: 'Confidentialité',
      legal: 'Mentions légales',
      methodology: 'Méthodologie',
      guides: 'Guides',
      calculators: 'Calculateurs',
      exercises: 'Exercices corrigés',
      kit: 'Kit ordonnancement',
      disclaimer:
        'Outil d’aide à la décision fourni sans garantie : vérifiez les résultats avant de modifier vos paramètres de réapprovisionnement.',
    },
    toTool: 'Calculer pour tous vos articles avec un CSV',
    relatedCalc: 'Mini-calculateur associé :',
    relatedGuide: 'Guide associé :',
    readGuide: 'Lire le guide',
    openCalc: 'Ouvrir le calculateur',
    onThisPage: 'Résumé',
    updated: 'Mis à jour le',
    readingTime: 'Lecture : {min} min',
  },

  symbols: { ss: 'SS', rop: 'PC', target: 'SC', cover: 'Couverture', days: 'jours' },

  meta: {
    home: {
      title: 'Calcul du stock de sécurité et du stock cible en ligne (CSV) | Stock-o-mètre',
      description:
        'Chargez vos mouvements de stock en CSV : stock de sécurité, point de commande, stock cible et classement ABC-XYZ par article. Gratuit, sans inscription, 100 % dans votre navigateur.',
      heading: 'Stock de sécurité, point de commande et stock cible pour tous vos articles',
    },
    guides: {
      title: 'Guides de gestion des stocks : stock de sécurité, ABC-XYZ, point de commande',
      description:
        'Six guides pratiques avec exemples chiffrés : stock de sécurité, stock cible, point de commande, classement ABC-XYZ, taux de service et export CSV depuis votre ERP.',
      heading: 'Guides de gestion des stocks',
    },
    guideSafety: {
      title: 'Calcul du stock de sécurité : formule et exemple chiffré',
      description:
        'La formule du stock de sécurité (Z × σ × √(L+R)) expliquée pas à pas, avec un exemple complet, la variante délai variable et les limites de la méthode.',
      heading: 'Calcul du stock de sécurité : formule et exemple',
    },
    guideTarget: {
      title: 'Stock cible (niveau de recomplètement) : définition et calcul',
      description:
        'Qu’est-ce que le stock cible ou niveau de recomplètement ? Formule μ × (L+R) + SS, exemple chiffré, quantité à commander et pièges à éviter.',
      heading: 'Stock cible (niveau de recomplètement) : définition et calcul',
    },
    guideRop: {
      title: 'Point de commande : calcul, exemple et utilisation',
      description:
        'Calculer le point de commande (seuil de réapprovisionnement) : formule, exemple chiffré, différence avec le stock cible et conseils de mise en œuvre.',
      heading: 'Point de commande : calcul et utilisation',
    },
    guideAbcXyz: {
      title: 'Classement ABC-XYZ des articles : méthode et exemple',
      description:
        'Classer ses articles en ABC (valeur consommée, Pareto) et XYZ (régularité de la demande) : méthode, seuils, exemple chiffré et matrice de décision.',
      heading: 'Classement ABC-XYZ des articles',
    },
    guideService: {
      title: 'Choisir son taux de service par classe d’articles (ABC)',
      description:
        'Quel taux de service viser pour les articles A, B et C ? Coefficient Z, coût du stock de sécurité, exemple chiffré et méthode de choix.',
      heading: 'Choisir son taux de service par classe d’articles',
    },
    guideExport: {
      title: 'Exporter ses mouvements de stock en CSV depuis son ERP',
      description:
        'Conseils pour extraire l’historique des mouvements de stock de votre ERP ou WMS en CSV : colonnes utiles, période, types de mouvement, formats et contrôles.',
      heading: 'Exporter ses mouvements de stock depuis son ERP en CSV',
    },
    calculators: {
      title: 'Calculateurs de stock gratuits : sécurité, point de commande, stock cible',
      description:
        'Quatre mini-calculateurs sans fichier : stock de sécurité, point de commande, stock cible et couverture de stock en jours. Formule détaillée avec vos valeurs.',
      heading: 'Mini-calculateurs de stock',
    },
    exercises: {
      title: 'Exercices corrigés de supply chain : stock de sécurité, Wilson, ABC, taux de service',
      description:
        'Exercices de gestion des stocks avec énoncé, données et correction pas à pas : stock de sécurité, point de commande, quantité économique de Wilson, classement ABC, taux de service. Niveau débutant et niveau certification.',
      heading: 'Exercices corrigés de supply chain',
    },
    kit: {
      title: 'Kit ordonnancement des OF pour PME industrielle (Excel) : planning, Gantt, charge',
      description:
        'Futur classeur Excel de gestion des ordres de fabrication : planning des OF, diagramme de Gantt, charge et capacité par poste, séquencement et priorités. À partir d’un export CSV, une ligne par opération.',
      heading: 'Kit ordonnancement des ordres de fabrication',
    },
    calcSafety: {
      title: 'Calculateur de stock de sécurité en ligne (formule détaillée)',
      description:
        'Calculez votre stock de sécurité à partir de la demande moyenne, de son écart-type, du délai et du taux de service. Résultat immédiat et formule détaillée.',
      heading: 'Calculateur de stock de sécurité',
    },
    calcRop: {
      title: 'Calculateur de point de commande en ligne',
      description:
        'Calculez le point de commande : consommation par jour × délai d’approvisionnement + stock de sécurité. Résultat immédiat avec la formule détaillée.',
      heading: 'Calculateur de point de commande',
    },
    calcTarget: {
      title: 'Calculateur de stock cible (niveau de recomplètement)',
      description:
        'Calculez le stock cible d’une politique à revue périodique : consommation × (délai + période de revue) + stock de sécurité.',
      heading: 'Calculateur de stock cible',
    },
    calcCoverage: {
      title: 'Calculateur de couverture de stock en jours',
      description:
        'Combien de jours votre stock va-t-il durer ? Couverture = stock ÷ consommation moyenne par jour. Calcul immédiat et formule détaillée.',
      heading: 'Calculateur de couverture de stock en jours',
    },
    methodology: {
      title: 'Méthodologie : formules, hypothèses et limites | Stock-o-mètre',
      description:
        'Toutes les formules utilisées par Stock-o-mètre : agrégation, stock de sécurité, point de commande, stock cible, ABC-XYZ, alertes. Hypothèses et limites.',
      heading: 'Méthodologie',
    },
    privacy: {
      title: 'Confidentialité : aucune donnée collectée | Stock-o-mètre',
      description:
        'Stock-o-mètre ne collecte aucune donnée : votre fichier est traité dans votre navigateur, sans envoi, sans cookie et sans traceur.',
      heading: 'Confidentialité',
    },
    legal: {
      title: 'Mentions légales | Stock-o-mètre',
      description:
        'Mentions légales du site Stock-o-mètre : éditeur, hébergement, propriété intellectuelle.',
      heading: 'Mentions légales',
    },
  },

  tool: {
    promise:
      'Chargez l’historique de vos mouvements de stock : l’outil calcule, article par article, le stock de sécurité, le point de commande et le stock cible, et classe vos articles en ABC-XYZ.',
    privacyTitle: 'Vos données restent sur votre ordinateur',
    privacyText:
      'Le fichier est lu et analysé dans votre navigateur. Il n’est jamais envoyé sur un serveur : pas d’envoi, pas de cookie, pas de traceur. Vous pouvez même couper votre connexion après le chargement de la page.',
    steps: {
      label: 'Étapes',
      upload: 'Fichier',
      mapping: 'Colonnes',
      params: 'Paramètres',
      results: 'Résultats',
    },
    noscript: 'L’outil a besoin de JavaScript (exécuté uniquement dans votre navigateur).',
    upload: {
      title: '1. Chargez votre fichier de mouvements',
      drop: 'Glissez-déposez votre fichier CSV ici',
      or: 'ou',
      choose: 'Choisir un fichier',
      formats: 'Formats .csv ou .txt · 50 Mo maximum · 2 millions de lignes · 50 000 articles.',
      template: 'Télécharger le modèle CSV',
      templateFile: 'modele-mouvements.csv',
      example: 'Essayer avec un exemple (30 articles fictifs)',
      reading: 'Lecture du fichier…',
      parsing: 'Découpage des lignes…',
      building: 'Calcul par article…',
      summary: '{name} · {size} · {rows} lignes · encodage {encoding} · séparateur : {delimiter}',
      previewTitle: 'Aperçu des 20 premières lignes',
      previewCaption: 'Aperçu du fichier chargé (20 premières lignes de données)',
      change: 'Charger un autre fichier',
      warnings:
        'Structure irrégulière détectée (ligne {line}) : vérifiez les guillemets du fichier.',
    },
    delimiters: { ';': 'point-virgule', ',': 'virgule', '\t': 'tabulation' },
    errors: {
      tooBig:
        'Le fichier fait {size} : la limite est de 50 Mo. Exportez une période plus courte ou moins de colonnes.',
      badType: 'Format non pris en charge : choisissez un fichier .csv ou .txt.',
      empty: 'Le fichier est vide ou ne contient aucune ligne de données sous l’en-tête.',
      tooManyRows:
        'Le fichier dépasse 2 millions de lignes. Réduisez la période exportée ou filtrez les articles.',
      tooManyItems:
        'Le fichier contient plus de 50 000 articles. Filtrez l’export (par famille, par magasin…) et recommencez.',
      noValidRows:
        'Aucune ligne exploitable : vérifiez l’association des colonnes et le format des dates.',
      read: 'Impossible de lire le fichier ({detail}).',
      unexpected: 'Erreur inattendue pendant l’analyse ({detail}). Rechargez la page et réessayez.',
      example: 'Impossible de charger le fichier d’exemple.',
    },
    issues: {
      invalidDate: {
        one: 'La colonne date contient 1 valeur illisible, ligne {line} : « {value} ».',
        other: 'La colonne date contient {count} valeurs illisibles, ligne {line} : « {value} ».',
      },
      invalidQty: {
        one: 'La colonne quantité contient 1 valeur illisible, ligne {line} : « {value} ».',
        other:
          'La colonne quantité contient {count} valeurs illisibles, ligne {line} : « {value} ».',
      },
      emptyItem: {
        one: '1 ligne sans code article (ligne {line}).',
        other: '{count} lignes sans code article (première : ligne {line}).',
      },
      invalidPrice: {
        one: 'La colonne prix contient 1 valeur illisible, ligne {line} : « {value} ».',
        other: 'La colonne prix contient {count} valeurs illisibles, ligne {line} : « {value} ».',
      },
      invalidStock: {
        one: 'La colonne stock actuel contient 1 valeur illisible, ligne {line} : « {value} ».',
        other:
          'La colonne stock actuel contient {count} valeurs illisibles, ligne {line} : « {value} ».',
      },
      skipped: 'Ces lignes sont ignorées.',
    },
    mapping: {
      title: '2. Associez les colonnes',
      intro: 'Indiquez quelle colonne de votre fichier correspond à chaque information.',
      auto: 'Association proposée automatiquement d’après les en-têtes : vérifiez-la.',
      remembered:
        'Association reprise de votre précédent fichier au même format (mémorisée dans ce navigateur, sans aucune donnée).',
      required: 'obligatoire',
      optional: 'facultatif',
      none: '— Aucune —',
      fields: {
        date: 'Date du mouvement',
        item: 'Code article',
        qty: 'Quantité',
        type: 'Type de mouvement',
        label: 'Libellé',
        price: 'Prix unitaire',
        stock: 'Stock actuel',
      },
      missing: 'Associez les colonnes obligatoires : {fields}.',
      duplicate: 'La colonne « {col} » est associée à plusieurs informations.',
      dateFormat: 'Format des dates',
      dateOrders: {
        dmy: 'jour/mois/année (31/01/2025)',
        mdy: 'mois/jour/année (01/31/2025)',
        ymd: 'année-mois-jour (2025-01-31)',
      },
      dateAmbiguous:
        'Format ambigu : « {example} » peut se lire jour/mois ou mois/jour. Choisissez le bon format ci-dessus.',
      dateSample: 'Exemple lu dans le fichier : « {example} » → {parsed}',
      dateUnreadable: 'Exemple « {example} » illisible avec ce format.',
      decimal: 'Séparateur décimal',
      decimals: { ',': 'virgule (12,5)', '.': 'point (12.5)' },
      typesTitle: 'Types de mouvement',
      typesIntro:
        'Classez chaque valeur de la colonne « {col} ». Proposition automatique d’après le libellé.',
      typesValue: 'Valeur',
      typesCount: 'Lignes',
      typesClass: 'Traitement',
      typesEmpty: '(vide)',
      typesTooMany:
        'Cette colonne contient {count} valeurs différentes : est-ce bien le type de mouvement ? Seules les 200 plus fréquentes sont listées ; les autres seront ignorées.',
      classes: {
        in: 'Entrée',
        out: 'Sortie (consommation)',
        adjust: 'Ajustement (stock seulement)',
        ignore: 'Ignorer',
      },
      noType:
        'Sans colonne « type de mouvement » : une quantité négative est une sortie (consommation), une quantité positive une entrée.',
      noStock:
        'Sans stock actuel, le stock reconstitué part de 0 au début du fichier : la courbe de stock est alors relative (seules ses variations ont un sens). Vous pourrez saisir le stock actuel article par article dans le tableau des résultats.',
      analyze: 'Lancer le calcul',
    },
    params: {
      title: '3. Paramètres',
      intro:
        'Valeurs par défaut pour tous les articles. Chaque paramètre est aussi modifiable article par article dans le tableau (bouton ⚙).',
      period: 'Période d’agrégation',
      periods: { week: 'Semaine', month: 'Mois' },
      lead: 'Délai d’approvisionnement L (jours)',
      review: 'Période de revue R (jours, 0 = revue continue)',
      leadSd: 'Écart-type du délai σL (jours, facultatif)',
      method: 'Méthode du stock de sécurité',
      methods: {
        demand: 'Demande variable : Z × σ × √(L + R)',
        demandLead: 'Demande et délai variables : Z × √((L + R) × σ² + μ² × σL²)',
        coverage: 'Couverture simple : consommation par jour × jours de couverture',
      },
      coverageDays: 'Jours de couverture (méthode simple)',
      serviceLevels: 'Taux de service visé par classe ABC (%)',
      abcThresholds: 'Seuils ABC (% de la valeur cumulée)',
      abcRest: 'C : le reste ({value} %)',
      xyzThresholds: 'Seuils XYZ (coefficient de variation)',
      xLimit: 'X si CV <',
      yLimit: 'Y si CV ≤',
      classLabel: 'Classe {cls}',
      needsSd:
        'Renseignez σL : sans lui, cette méthode donne le même résultat que « demande variable ».',
      invalid: 'Valeur invalide pour « {field} » : {hint}.',
      hints: {
        positive: 'nombre positif ou nul attendu',
        service: 'entre 50 et 99,99 %',
        abc: 'A + B doit rester inférieur ou égal à 100 %, A supérieur à 0',
        xyz: 'X doit être inférieur ou égal à Y',
      },
    },
    report: {
      title: 'Lecture du fichier',
      used: '{used} lignes de mouvements prises en compte sur {read}.',
      ignored: {
        one: '1 ligne ignorée (type « Ignorer »).',
        other: '{count} lignes ignorées (type « Ignorer »).',
      },
      duplicates: {
        one: '1 ligne en double exact : elle est comptée, et signalée sur l’article concerné.',
        other:
          '{count} lignes en double exact : elles sont comptées, et signalées sur les articles concernés.',
      },
      periods: '{count} périodes complètes analysées, du {from} au {to}.',
      droppedFirst:
        'La première période ({label}) est incomplète dans le fichier : elle est exclue du calcul.',
      droppedLast:
        'La dernière période ({label}) est incomplète (période en cours) : elle est exclue du calcul.',
      noPeriod:
        'Le fichier ne couvre aucune période complète : choisissez la semaine ou exportez un historique plus long.',
    },
    results: {
      title: '4. Résultats',
      cards: {
        items: 'Articles',
        classes: 'A / B / C',
        alerts: 'Articles avec alerte',
        belowRop: 'Sous le point de commande',
        overstock: 'Surstock total',
        valueHint: '(valeur)',
        understock: 'Sous-stock total',
      },
      abcValue: 'Classement ABC sur la valeur consommée (quantité × prix unitaire).',
      abcQty: 'Pas de prix unitaire : classement ABC sur la quantité consommée.',
      unitsSuffix: 'unités',
      search: 'Rechercher un article',
      searchPlaceholder: 'Code ou libellé',
      filterAbc: 'Classe ABC',
      filterXyz: 'Classe XYZ',
      all: 'Toutes',
      alertsOnly: 'Avec alertes seulement',
      pageSize: 'Lignes par page',
      pageInfo: '{from}–{to} sur {total}',
      prev: 'Précédent',
      next: 'Suivant',
      noMatch: 'Aucun article ne correspond aux filtres.',
      caption:
        'Résultats par article. Cliquez sur un en-tête pour trier, sur une ligne pour afficher ses graphiques.',
      sortBy: 'Trier par {col}',
      select: 'Afficher {item}',
      edit: 'Paramètres de l’article {item}',
      cols: {
        item: 'Article',
        label: 'Libellé',
        abc: 'ABC',
        xyz: 'XYZ',
        mu: 'Conso. moyenne / {period}',
        sigma: 'Écart-type',
        cv: 'CV',
        ss: 'Stock de sécurité',
        rop: 'Point de commande',
        target: 'Stock cible',
        stock: 'Stock actuel',
        gap: 'Écart au stock cible',
        coverage: 'Couverture (jours)',
        alerts: 'Alertes',
        edit: 'Réglages',
      },
      periodShort: { week: 'sem.', month: 'mois' },
      over: 'Surstock',
      under: 'Sous-stock',
      infinite: '∞',
      na: '—',
      override: 'Paramètre modifié pour cet article',
      editTitle: 'Paramètres propres à l’article {item}',
      editIntro: 'Laissez vide pour reprendre la valeur globale. Le recalcul est immédiat.',
      serviceLevel: 'Taux de service (%)',
      currentStock: 'Stock actuel',
      reset: 'Revenir aux valeurs globales',
      close: 'Fermer',
      globalValue: 'global : {value}',
      alerts: {
        shortHistory: {
          short: 'Hist.',
          long: 'Historique court : moins de 8 périodes, résultats fragiles.',
        },
        intermittent: {
          short: 'Interm.',
          long: 'Demande intermittente : plus de 30 % de périodes sans consommation. La formule (loi normale) est peu fiable.',
        },
        negativeStock: {
          short: 'Stock < 0',
          long: 'Le stock reconstitué devient négatif : des mouvements manquent probablement dans le fichier, ou le stock actuel est faux.',
        },
        zeroDemand: { short: 'Conso. 0', long: 'Aucune consommation sur la période analysée.' },
        duplicates: {
          short: 'Doublons',
          long: 'Lignes en double exact dans le fichier : vérifiez qu’il ne s’agit pas d’une erreur d’export.',
        },
        noPrice: {
          short: 'Prix ?',
          long: 'Prix unitaire manquant : l’article est classé sur une valeur nulle.',
        },
      },
      exportCsv: 'Exporter les résultats (CSV)',
      exportFile: 'stock-o-metre-resultats.csv',
    },
    charts: {
      loading: 'Chargement des graphiques…',
      selectPrompt: 'Sélectionnez un article dans le tableau pour afficher ses graphiques.',
      download: 'Télécharger l’image du graphique',
      summaryLabel: 'Résumé du graphique',
      stockTitle: 'Stock dans le temps : {item}',
      stock: 'Stock reconstitué',
      ss: 'Stock de sécurité',
      rop: 'Point de commande',
      target: 'Stock cible',
      stockout: 'Rupture (stock ≤ 0)',
      relative: 'Courbe relative : stock actuel inconnu, le stock part de 0 au début du fichier.',
      stockSummary:
        'Du {from} au {to}, le stock reconstitué de {item} varie de {min} à {max}. Périodes de rupture (stock ≤ 0) : {stockouts}. Stock de sécurité : {ss} ; point de commande : {rop} ; stock cible : {target}.',
      consTitle: 'Consommation par {period} : {item}',
      consumption: 'Consommation',
      mean: 'Moyenne',
      band: 'Moyenne ± 1 écart-type',
      consSummary:
        '{n} périodes. Consommation moyenne {mu}, écart-type {sigma}, minimum {min}, maximum {max}. Périodes sans consommation : {zeros}.',
      paretoTitle: 'Courbe de Pareto (classement ABC)',
      paretoShare: 'Part cumulée',
      paretoValue: 'Valeur consommée',
      paretoQty: 'Quantité consommée',
      paretoSummary:
        '{a} articles A représentent {aShare} du total ; {b} articles B, {c} articles C.',
      classTitle: 'Stock actuel et stock cible par classe',
      topTitle: 'Les 20 plus gros surstocks ({basis})',
      basisValue: 'en valeur',
      basisQty: 'en quantité',
      current: 'Stock actuel',
      targetStock: 'Stock cible',
      classSummary: 'Par classe, stock actuel / stock cible : {details}.',
      topSummary: 'Plus gros surstocks : {details}.',
      topNone: 'Aucun article en surstock (ou stock actuel inconnu).',
      classNone:
        'Stock actuel inconnu : renseignez une colonne « stock actuel » ou saisissez-le dans le tableau.',
      periodWord: { week: 'semaine', month: 'mois' },
      zoom: 'Zoom',
    },
    explain: {
      title: 'Comment c’est calculé ?',
      intro: 'Détail du calcul pour l’article sélectionné, avec ses valeurs.',
      none: 'Sélectionnez un article dans le tableau.',
      data: 'Données : {n} périodes ({period}), μ = {mu}, σ = {sigma}, CV = {cv}.',
      conv: 'Conversion en périodes : Lp = {L} j ÷ {dpp} = {lp} ; Rp = {R} j ÷ {dpp} = {rp}.',
      convSd: 'σLp = {sd} j ÷ {dpp} = {sdp}.',
      z: 'Classe {abc}, taux de service {sl} → Z = {z}.',
      ss: 'Stock de sécurité',
      rop: 'Point de commande',
      target: 'Stock cible',
      rounding: 'Les résultats sont arrondis à l’unité supérieure.',
      coverage: 'Couverture actuelle (jours) = stock actuel ÷ consommation moyenne par jour',
      more: 'Toutes les formules et leurs limites',
    },
    share: {
      title: 'Partager l’outil',
      text: 'Le lien partagé pointe vers l’outil, jamais vers vos données.',
      linkedin: 'LinkedIn',
      email: 'E-mail',
      copy: 'Copier le lien',
      copied: 'Lien copié.',
      emailSubject: 'Un outil gratuit pour calculer stock de sécurité et stock cible',
      emailBody:
        'Stock-o-mètre calcule stock de sécurité, point de commande et stock cible à partir d’un CSV, directement dans le navigateur : {url}',
    },
  },

  calc: {
    intro:
      'Saisissez vos valeurs : le résultat s’affiche immédiatement, avec la formule détaillée.',
    result: 'Résultat :',
    zLine: 'Taux de service {sl} → Z = {z}.',
    formula: 'Formule avec vos valeurs',
    invalid: 'Complétez les champs avec des nombres valides.',
    rounded: 'arrondi à l’unité supérieure',
    units: 'unités',
    days: 'jours',
    fields: {
      mu: 'Consommation moyenne par période (μ)',
      sigma: 'Écart-type de la consommation par période (σ)',
      period: 'Période des données',
      lead: 'Délai d’approvisionnement L (jours)',
      review: 'Période de revue R (jours, 0 = revue continue)',
      leadSd: 'Écart-type du délai σL (jours, 0 si inconnu)',
      service: 'Taux de service visé (%)',
      daily: 'Consommation moyenne par jour',
      ss: 'Stock de sécurité (unités)',
      stock: 'Stock disponible (unités)',
    },
    periods: { day: 'Jour', week: 'Semaine', month: 'Mois' },
    labels: {
      calcSafety: 'Stock de sécurité',
      calcRop: 'Point de commande',
      calcTarget: 'Stock cible',
      calcCoverage: 'Couverture',
    },
    help: {
      calcSafety:
        'Méthode « demande variable » ; si σL est renseigné, la variante « demande et délai variables » est utilisée. Taux de service = probabilité de ne pas rompre pendant un cycle.',
      calcRop:
        'Commandez dès que le stock disponible (stock + commandes en cours) passe sous ce seuil.',
      calcTarget:
        'À chaque revue, commandez la différence entre ce niveau et votre stock disponible.',
      calcCoverage: 'Nombre de jours que votre stock peut couvrir au rythme de consommation moyen.',
    },
    cards: {
      calcSafety: 'Z × σ × √(L + R), avec ou sans variabilité du délai.',
      calcRop: 'Consommation pendant le délai + stock de sécurité.',
      calcTarget: 'Consommation pendant délai + revue + stock de sécurité.',
      calcCoverage: 'Stock ÷ consommation moyenne par jour.',
    },
    coverageInfinite: 'Consommation nulle : couverture infinie.',
  },

  guides: {
    intro:
      'Des guides concrets, avec exemples chiffrés, pour paramétrer vos stocks sans y passer vos week-ends. Chaque guide renvoie vers le calculateur correspondant.',
    summary: 'En bref',
    hypotheses: 'Hypothèses',
  },

  exercises: {
    intro:
      'Chaque exercice comporte un énoncé, des données et une correction pas à pas. Cherchez d’abord par vous-même, puis dépliez les étapes une à une pour vérifier votre raisonnement.',
    levels: { beginner: 'Débutant', certification: 'Niveau certification' },
    levelHints: {
      beginner: 'Une formule à la fois, des données courtes : pour découvrir ou réviser les bases.',
      certification:
        'Plusieurs notions combinées et une décision à justifier, dans l’esprit des certifications professionnelles en supply chain (type APICS CPIM).',
    },
    themes: {
      safety: 'Stock de sécurité',
      rop: 'Point de commande',
      eoq: 'Quantité économique (Wilson)',
      abc: 'Classement ABC',
      service: 'Taux de service',
    },
    matrixCaption: 'Exercices par thème et par niveau',
    theme: 'Thème',
    level: 'Niveau',
    duration: 'Durée indicative : {min} min',
    stepsHint:
      'Cliquez sur une étape pour afficher sa correction. Essayez d’abord de la faire seul.',
    links: 'Pour aller plus loin',
    openTool: 'Analyser tous vos articles avec l’outil',
    sameTheme: 'Même thème, autre niveau :',
    all: 'Tous les exercices',
    disclaimer:
      'Exercices originaux rédigés pour Stock-o-mètre, sans lien avec l’ASCM / APICS. Les conventions de calcul sont celles de la page Méthodologie.',
    homeTitle: 'Aller plus loin',
    homeText:
      'Entraînez-vous avec des exercices corrigés pas à pas, du niveau débutant au niveau certification.',
  },

  kit: {
    badge: 'Bientôt disponible',
    lead: 'Un classeur Excel pour planifier les ordres de fabrication d’une PME industrielle : planning des OF, diagramme de Gantt, charge et capacité par poste. Il part d’un simple export CSV de vos OF, comme Stock-o-mètre part de vos mouvements de stock.',
    problemTitle: 'Pourquoi ce kit',
    problem:
      'Dans beaucoup de PME, le planning d’atelier tient dans un fichier Excel construit au fil des années, que seule une personne sait faire vivre. L’ERP gère les commandes et les stocks, mais pas l’arbitrage fin entre postes, réglages et urgences. Les logiciels d’ordonnancement (APS) sont souvent trop lourds pour un atelier de quelques postes.',
    principleTitle: 'Le principe : le même que pour vos stocks',
    principle: {
      export:
        'Exportez vos OF depuis votre ERP ou votre fichier actuel, au format CSV, avec une ligne par opération.',
      compute:
        'Le kit place chaque opération sur son poste, dans l’ordre de la gamme, sans dépasser la capacité, et calcule la date de fin de chaque OF.',
      adjust:
        'Vous changez les priorités à la main quand le terrain l’impose : le planning et la charge se recalculent.',
    },
    featuresTitle: 'Ce que contiendra le kit',
    features: {
      planning: 'Planning des OF',
      gantt: 'Diagramme de Gantt',
      load: 'Charge et capacité par poste',
      sequencing: 'Séquencement avec ou sans changements de série',
      priorities: 'Modification manuelle des priorités',
    },
    featureTexts: {
      planning:
        'Date de début et de fin de chaque opération et de chaque OF, comparée à la date due.',
      gantt:
        'Une ligne par poste, pour voir d’un coup d’œil l’enchaînement des opérations et les retards.',
      load: 'Heures à produire comparées aux heures disponibles, pour repérer les goulots.',
      sequencing:
        'Ordre de passage selon la priorité et la date due, avec en option le regroupement des opérations de même famille de réglage pour réduire les changements de série.',
      priorities: 'Le planificateur garde la main : il remonte un OF urgent, et le calcul suit.',
    },
    fileTitle: 'Le fichier des OF',
    fileIntro:
      'Une ligne par opération : un OF qui passe sur trois postes occupe trois lignes. Les noms de colonnes de votre ERP pourront être associés à ceux du kit.',
    columnHead: 'Colonne',
    meaningHead: 'Contenu',
    columns: {
      order: 'of',
      item: 'article',
      quantity: 'quantite',
      operation: 'operation',
      workCenter: 'poste',
      setup: 'temps_reglage_h',
      unit: 'temps_unitaire_h',
      family: 'famille_reglage',
      earliest: 'debut_au_plus_tot',
      due: 'date_due',
      priority: 'priorite',
      status: 'statut',
    },
    columnTexts: {
      order: 'Numéro de l’ordre de fabrication.',
      item: 'Référence fabriquée.',
      quantity: 'Quantité à produire.',
      operation: 'Numéro d’opération (10, 20, 30…) : ordre de passage dans la gamme.',
      workCenter: 'Poste de charge ou machine.',
      setup: 'Temps de réglage de l’opération, en heures.',
      unit: 'Temps par pièce, en heures.',
      family:
        'Famille de réglage : deux opérations de même famille enchaînées sur un poste évitent un réglage.',
      earliest: 'Date à partir de laquelle l’opération peut démarrer (matière disponible).',
      due: 'Date à laquelle l’OF doit être terminé.',
      priority: '1 = la plus urgente.',
      status: 'Lancé ou Planifié.',
    },
    download: 'Télécharger le fichier d’exemple (CSV)',
    templateFile: 'modele-of.csv',
    capacityNote:
      'La capacité des postes (heures par jour) et le calendrier de travail se renseignent dans le kit, pas dans ce fichier.',
    previewTitle: 'Aperçu sur le fichier d’exemple',
    previewIntro:
      'Ce planning est calculé à partir du fichier d’exemple : 6 OF, 3 postes, une semaine de 5 jours de 8 heures. Il illustre le principe ; ce n’est pas le kit lui-même.',
    centers: { DEC: 'Découpe laser', PLI: 'Pliage', SOU: 'Soudure' },
    scenarios: {
      base: 'Priorité puis date due, un réglage à chaque opération',
      grouped: 'Réglages regroupés par famille',
      priority: 'OF-1004 passé en priorité 1',
      both: 'OF-1004 en priorité 1 et réglages regroupés',
    },
    compareCaption: 'Effet des règles de séquencement sur le fichier d’exemple',
    compareRule: 'Règle',
    compareSetup: 'Heures de réglage',
    compareLate: 'OF en retard',
    noneLate: 'aucun',
    ganttBefore: 'Avant : règle de base',
    ganttAfter: 'Après : OF-1004 en priorité 1 et réglages regroupés',
    ganttLabel: 'Diagramme de Gantt, {rule}. Le détail figure dans les tableaux de la page.',
    lateMark: 'En rouge : OF en retard ({orders}).',
    loadTitle: 'Charge et capacité par poste (règle de base)',
    loadLine: '{h} h sur {cap} h ({pct})',
    lesson:
      'Aucun poste n’est chargé à plus de {max} de sa capacité, et pourtant un OF finit en retard : la charge globale ne suffit pas, c’est l’ordre de passage qui fait le délai. Remonter la priorité de l’OF en retard ne suffit pas non plus : un autre OF passe en retard. En regroupant aussi les réglages, tous les OF sont à l’heure.',
    tableCaption: 'Planning détaillé après ajustement',
    cols: {
      order: 'OF',
      operation: 'Op.',
      center: 'Poste',
      start: 'Début',
      end: 'Fin',
      due: 'Date due',
    },
    notTitle: 'Ce que le kit ne cherche pas à faire',
    not: {
      erp: 'Remplacer votre ERP : il lit un export et n’écrit rien dans vos systèmes.',
      aps: 'Remplacer un logiciel d’ordonnancement (APS) : il vise les ateliers de quelques postes, avec des règles simples et visibles.',
      decide: 'Décider à votre place : il propose un ordre de passage, le planificateur tranche.',
    },
    availabilityTitle: 'Disponibilité',
    availability:
      'Le kit est en préparation. Il n’y a ni inscription ni liste d’attente : revenez simplement sur cette page.',
    homeText:
      'Un futur classeur Excel pour planifier vos ordres de fabrication : planning, Gantt, charge des postes. Bientôt disponible.',
  },

  notFound: {
    title: 'Page introuvable',
    text: 'Cette page n’existe pas ou a été déplacée.',
    back: 'Retour à l’outil',
  },

  rootPage: {
    title: 'Stock-o-mètre : calcul du stock de sécurité / safety stock calculator',
    description:
      'Calcul du stock de sécurité, du point de commande et du stock cible à partir d’un CSV, dans votre navigateur. Safety stock, reorder point and order-up-to level calculator.',
    choose: 'Choisissez votre langue',
  },
};

export default fr;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof fr>;
