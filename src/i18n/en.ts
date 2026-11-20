import type { Dict } from './fr';

/** English interface strings. Same keys as fr.ts (checked by TypeScript). */
const en: Dict = {
  common: {
    siteName: 'Stock-o-mètre',
    tagline: 'Safety stock, reorder point and order-up-to level, computed in your browser.',
    skip: 'Skip to content',
    nav: {
      label: 'Main navigation',
      tool: 'Tool',
      guides: 'Guides',
      calculators: 'Calculators',
      methodology: 'Methodology',
    },
    langSwitch: {
      label: 'Language:',
      target: 'Français',
      targetShort: 'FR',
      hint: 'Lire cette page en français',
    },
    breadcrumb: { label: 'Breadcrumb', home: 'Home' },
    footer: {
      local: 'Your data stays on your computer: no upload, no cookies, no trackers.',
      privacy: 'Privacy',
      legal: 'Legal notice',
      methodology: 'Methodology',
      guides: 'Guides',
      calculators: 'Calculators',
      disclaimer:
        'Decision-support tool provided without warranty: review the results before changing your replenishment settings.',
    },
    toTool: 'Calculate for all your items from a CSV file',
    relatedCalc: 'Related calculator:',
    relatedGuide: 'Related guide:',
    readGuide: 'Read the guide',
    openCalc: 'Open the calculator',
    onThisPage: 'Summary',
    updated: 'Updated',
    readingTime: '{min} min read',
  },

  symbols: { ss: 'SS', rop: 'ROP', target: 'TS', cover: 'Cover', days: 'days' },

  meta: {
    home: {
      title: 'Free Safety Stock & Reorder Point Calculator from CSV | Stock-o-mètre',
      description:
        'Upload your stock movements as CSV: safety stock, reorder point, order-up-to level and ABC-XYZ classification for every item. Free, no sign-up, 100% in your browser.',
      heading: 'Safety stock, reorder point and target stock for every item',
    },
    guides: {
      title: 'Inventory Planning Guides: Safety Stock, ABC-XYZ, Reorder Point',
      description:
        'Six practical guides with worked examples: safety stock, order-up-to level, reorder point, ABC-XYZ analysis, service levels and exporting stock movements to CSV.',
      heading: 'Inventory planning guides',
    },
    guideSafety: {
      title: 'Safety Stock Formula: How to Calculate It (Worked Example)',
      description:
        'The safety stock formula (Z × σ × √(L+R)) explained step by step, with a full worked example, the variable lead time version and the limits of the method.',
      heading: 'Safety stock formula: calculation and worked example',
    },
    guideTarget: {
      title: 'Order-Up-To Level (Target Stock): Definition and Formula',
      description:
        'What is the order-up-to level in a periodic review system? Formula μ × (L+R) + SS, worked example, order quantity and common pitfalls.',
      heading: 'Order-up-to level (target stock): definition and calculation',
    },
    guideRop: {
      title: 'Reorder Point Formula: Calculation and Example',
      description:
        'How to calculate the reorder point: formula, worked example, how it differs from the order-up-to level, and practical tips to use it.',
      heading: 'Reorder point: how to calculate and use it',
    },
    guideAbcXyz: {
      title: 'ABC-XYZ Analysis of Inventory: Method and Example',
      description:
        'Classify items by consumption value (ABC, Pareto) and demand variability (XYZ): method, thresholds, worked example and decision matrix.',
      heading: 'ABC-XYZ inventory analysis',
    },
    guideService: {
      title: 'Choosing a Service Level by ABC Class',
      description:
        'Which cycle service level should A, B and C items target? Z-scores, the cost of safety stock, a worked example and a practical method.',
      heading: 'Choosing a service level for each item class',
    },
    guideExport: {
      title: 'How to Export Stock Movements from Your ERP to CSV',
      description:
        'Practical advice to extract stock movement history from an ERP or WMS as CSV: useful columns, time span, movement types, formats and checks.',
      heading: 'Exporting stock movements from your ERP to CSV',
    },
    calculators: {
      title: 'Free Inventory Calculators: Safety Stock, Reorder Point, Target Stock',
      description:
        'Four calculators, no file needed: safety stock, reorder point, order-up-to level and days of inventory cover. Formula shown with your values.',
      heading: 'Inventory calculators',
    },
    calcSafety: {
      title: 'Safety Stock Calculator (Formula Shown Step by Step)',
      description:
        'Calculate safety stock from average demand, its standard deviation, lead time and service level. Instant result with the formula and your values.',
      heading: 'Safety stock calculator',
    },
    calcRop: {
      title: 'Reorder Point Calculator',
      description:
        'Calculate your reorder point: daily demand × lead time + safety stock. Instant result with the formula and your values.',
      heading: 'Reorder point calculator',
    },
    calcTarget: {
      title: 'Order-Up-To Level Calculator (Target Stock)',
      description:
        'Calculate the order-up-to level of a periodic review policy: demand × (lead time + review period) + safety stock.',
      heading: 'Order-up-to level calculator',
    },
    calcCoverage: {
      title: 'Days of Inventory Cover Calculator',
      description:
        'How many days will your stock last? Days of cover = stock ÷ average daily demand. Instant result with the formula.',
      heading: 'Days of inventory cover calculator',
    },
    methodology: {
      title: 'Methodology: Formulas, Assumptions and Limits | Stock-o-mètre',
      description:
        'Every formula used by Stock-o-mètre: aggregation, safety stock, reorder point, order-up-to level, ABC-XYZ, alerts. Assumptions and limits.',
      heading: 'Methodology',
    },
    privacy: {
      title: 'Privacy: No Data Collected | Stock-o-mètre',
      description:
        'Stock-o-mètre collects no data: your file is processed in your browser, never uploaded, with no cookies and no trackers.',
      heading: 'Privacy',
    },
    legal: {
      title: 'Legal Notice | Stock-o-mètre',
      description:
        'Legal notice for the Stock-o-mètre website: publisher, hosting, intellectual property.',
      heading: 'Legal notice',
    },
  },

  tool: {
    promise:
      'Upload your stock movement history: the tool computes safety stock, reorder point and order-up-to level for every item, and classifies your items with ABC-XYZ analysis.',
    privacyTitle: 'Your data stays on your computer',
    privacyText:
      'The file is read and analysed inside your browser. It is never sent to any server: no upload, no cookies, no trackers. You can even go offline once the page has loaded.',
    steps: {
      label: 'Steps',
      upload: 'File',
      mapping: 'Columns',
      params: 'Settings',
      results: 'Results',
    },
    noscript: 'The tool needs JavaScript (which runs only in your browser).',
    upload: {
      title: '1. Load your stock movements file',
      drop: 'Drag and drop your CSV file here',
      or: 'or',
      choose: 'Choose a file',
      formats: '.csv or .txt · 50 MB max · 2 million rows · 50,000 items.',
      template: 'Download the CSV template',
      templateFile: 'movements-template.csv',
      example: 'Try with sample data (30 fictitious items)',
      reading: 'Reading file…',
      parsing: 'Splitting rows…',
      building: 'Computing items…',
      summary: '{name} · {size} · {rows} rows · {encoding} encoding · delimiter: {delimiter}',
      previewTitle: 'Preview of the first 20 rows',
      previewCaption: 'Preview of the loaded file (first 20 data rows)',
      change: 'Load another file',
      warnings: 'Irregular structure detected (line {line}): check the quotes in your file.',
    },
    delimiters: { ';': 'semicolon', ',': 'comma', '\t': 'tab' },
    errors: {
      tooBig: 'The file is {size}: the limit is 50 MB. Export a shorter period or fewer columns.',
      badType: 'Unsupported format: choose a .csv or .txt file.',
      empty: 'The file is empty or has no data rows below the header.',
      tooManyRows:
        'The file has more than 2 million rows. Export a shorter period or filter items.',
      tooManyItems:
        'The file contains more than 50,000 items. Filter the export (by family, warehouse…) and try again.',
      noValidRows: 'No usable rows: check the column mapping and the date format.',
      read: 'Unable to read the file ({detail}).',
      unexpected: 'Unexpected error during analysis ({detail}). Reload the page and try again.',
      example: 'Unable to load the sample file.',
    },
    issues: {
      invalidDate: {
        one: 'The date column contains 1 unreadable value, line {line}: “{value}”.',
        other: 'The date column contains {count} unreadable values, line {line}: “{value}”.',
      },
      invalidQty: {
        one: 'The quantity column contains 1 unreadable value, line {line}: “{value}”.',
        other: 'The quantity column contains {count} unreadable values, line {line}: “{value}”.',
      },
      emptyItem: {
        one: '1 row has no item code (line {line}).',
        other: '{count} rows have no item code (first: line {line}).',
      },
      invalidPrice: {
        one: 'The price column contains 1 unreadable value, line {line}: “{value}”.',
        other: 'The price column contains {count} unreadable values, line {line}: “{value}”.',
      },
      invalidStock: {
        one: 'The current stock column contains 1 unreadable value, line {line}: “{value}”.',
        other:
          'The current stock column contains {count} unreadable values, line {line}: “{value}”.',
      },
      skipped: 'These rows are skipped.',
    },
    mapping: {
      title: '2. Map your columns',
      intro: 'Tell the tool which column of your file holds each piece of information.',
      auto: 'Mapping suggested from your column headers: please check it.',
      remembered:
        'Mapping reused from your previous file with the same layout (stored in this browser, without any data).',
      required: 'required',
      optional: 'optional',
      none: '— None —',
      fields: {
        date: 'Movement date',
        item: 'Item code',
        qty: 'Quantity',
        type: 'Movement type',
        label: 'Description',
        price: 'Unit price',
        stock: 'Current stock',
      },
      missing: 'Map the required columns: {fields}.',
      duplicate: 'Column “{col}” is mapped to more than one field.',
      dateFormat: 'Date format',
      dateOrders: {
        dmy: 'day/month/year (31/01/2025)',
        mdy: 'month/day/year (01/31/2025)',
        ymd: 'year-month-day (2025-01-31)',
      },
      dateAmbiguous:
        'Ambiguous format: “{example}” can be read as day/month or month/day. Pick the right format above.',
      dateSample: 'Sample from your file: “{example}” → {parsed}',
      dateUnreadable: 'Sample “{example}” cannot be read with this format.',
      decimal: 'Decimal separator',
      decimals: { ',': 'comma (12,5)', '.': 'point (12.5)' },
      typesTitle: 'Movement types',
      typesIntro:
        'Classify each value found in column “{col}”. Suggested automatically from the wording.',
      typesValue: 'Value',
      typesCount: 'Rows',
      typesClass: 'Treatment',
      typesEmpty: '(empty)',
      typesTooMany:
        'This column holds {count} distinct values: is it really the movement type? Only the 200 most frequent are listed; the others will be ignored.',
      classes: {
        in: 'Receipt (in)',
        out: 'Issue (consumption)',
        adjust: 'Adjustment (stock only)',
        ignore: 'Ignore',
      },
      noType:
        'No “movement type” column: a negative quantity is an issue (consumption), a positive quantity a receipt.',
      noStock:
        'Without current stock, the rebuilt stock starts at 0 at the beginning of the file: the stock curve is then relative (only its changes are meaningful). You can enter current stock item by item in the results table.',
      analyze: 'Run the calculation',
    },
    params: {
      title: '3. Settings',
      intro:
        'Default values for all items. Every setting can also be changed item by item in the table (⚙ button).',
      period: 'Aggregation period',
      periods: { week: 'Week', month: 'Month' },
      lead: 'Lead time L (days)',
      review: 'Review period R (days, 0 = continuous review)',
      leadSd: 'Lead time standard deviation σL (days, optional)',
      method: 'Safety stock method',
      methods: {
        demand: 'Variable demand: Z × σ × √(L + R)',
        demandLead: 'Variable demand and lead time: Z × √((L + R) × σ² + μ² × σL²)',
        coverage: 'Simple cover: daily demand × days of cover',
      },
      coverageDays: 'Days of cover (simple method)',
      serviceLevels: 'Target service level by ABC class (%)',
      abcThresholds: 'ABC thresholds (% of cumulative value)',
      abcRest: 'C: the rest ({value}%)',
      xyzThresholds: 'XYZ thresholds (coefficient of variation)',
      xLimit: 'X if CV <',
      yLimit: 'Y if CV ≤',
      classLabel: 'Class {cls}',
      needsSd: 'Enter σL: without it, this method gives the same result as “variable demand”.',
      invalid: 'Invalid value for “{field}”: {hint}.',
      hints: {
        positive: 'a number greater than or equal to zero is expected',
        service: 'between 50 and 99.99%',
        abc: 'A + B must not exceed 100%, and A must be above 0',
        xyz: 'X must be less than or equal to Y',
      },
    },
    report: {
      title: 'File reading',
      used: '{used} movement rows used out of {read}.',
      ignored: {
        one: '1 row ignored (type “Ignore”).',
        other: '{count} rows ignored (type “Ignore”).',
      },
      duplicates: {
        one: '1 exact duplicate row: it is counted and flagged on the item concerned.',
        other: '{count} exact duplicate rows: they are counted and flagged on the items concerned.',
      },
      periods: '{count} complete periods analysed, from {from} to {to}.',
      droppedFirst:
        'The first period ({label}) is incomplete in the file: it is excluded from the calculation.',
      droppedLast:
        'The last period ({label}) is incomplete (current period): it is excluded from the calculation.',
      noPeriod:
        'The file does not cover any complete period: pick “week” or export a longer history.',
    },
    results: {
      title: '4. Results',
      cards: {
        items: 'Items',
        classes: 'A / B / C',
        alerts: 'Items with alerts',
        belowRop: 'Below reorder point',
        overstock: 'Total overstock',
        valueHint: '(value)',
        understock: 'Total understock',
      },
      abcValue: 'ABC classification on consumption value (quantity × unit price).',
      abcQty: 'No unit price: ABC classification on consumed quantity.',
      unitsSuffix: 'units',
      search: 'Search items',
      searchPlaceholder: 'Code or description',
      filterAbc: 'ABC class',
      filterXyz: 'XYZ class',
      all: 'All',
      alertsOnly: 'With alerts only',
      pageSize: 'Rows per page',
      pageInfo: '{from}–{to} of {total}',
      prev: 'Previous',
      next: 'Next',
      noMatch: 'No item matches the filters.',
      caption: 'Results by item. Click a header to sort, a row to display its charts.',
      sortBy: 'Sort by {col}',
      select: 'Show {item}',
      edit: 'Settings for item {item}',
      cols: {
        item: 'Item',
        label: 'Description',
        abc: 'ABC',
        xyz: 'XYZ',
        mu: 'Avg demand / {period}',
        sigma: 'Std dev',
        cv: 'CV',
        ss: 'Safety stock',
        rop: 'Reorder point',
        target: 'Target stock',
        stock: 'Current stock',
        gap: 'Gap to target',
        coverage: 'Cover (days)',
        alerts: 'Alerts',
        edit: 'Settings',
      },
      periodShort: { week: 'wk', month: 'mo' },
      over: 'Overstock',
      under: 'Understock',
      infinite: '∞',
      na: '—',
      override: 'Setting changed for this item',
      editTitle: 'Settings for item {item}',
      editIntro: 'Leave blank to use the global value. Results update immediately.',
      serviceLevel: 'Service level (%)',
      currentStock: 'Current stock',
      reset: 'Back to global values',
      close: 'Close',
      globalValue: 'global: {value}',
      alerts: {
        shortHistory: {
          short: 'Hist.',
          long: 'Short history: fewer than 8 periods, results are fragile.',
        },
        intermittent: {
          short: 'Interm.',
          long: 'Intermittent demand: more than 30% of periods without consumption. The normal-distribution formula is unreliable.',
        },
        negativeStock: {
          short: 'Stock < 0',
          long: 'Rebuilt stock goes negative: movements are probably missing from the file, or current stock is wrong.',
        },
        zeroDemand: { short: 'No demand', long: 'No consumption over the analysed period.' },
        duplicates: {
          short: 'Dupes',
          long: 'Exact duplicate rows in the file: check that this is not an export error.',
        },
        noPrice: {
          short: 'Price?',
          long: 'Missing unit price: the item is ranked with a zero value.',
        },
      },
      exportCsv: 'Export results (CSV)',
      exportFile: 'stock-o-metre-results.csv',
    },
    charts: {
      loading: 'Loading charts…',
      selectPrompt: 'Select an item in the table to display its charts.',
      download: 'Download chart image',
      summaryLabel: 'Chart summary',
      stockTitle: 'Stock over time: {item}',
      stock: 'Rebuilt stock',
      ss: 'Safety stock',
      rop: 'Reorder point',
      target: 'Target stock',
      stockout: 'Stock-out (stock ≤ 0)',
      relative:
        'Relative curve: current stock unknown, stock starts at 0 at the beginning of the file.',
      stockSummary:
        'From {from} to {to}, the rebuilt stock of {item} ranges from {min} to {max}. Stock-out periods (stock ≤ 0): {stockouts}. Safety stock: {ss}; reorder point: {rop}; target stock: {target}.',
      consTitle: 'Consumption per {period}: {item}',
      consumption: 'Consumption',
      mean: 'Average',
      band: 'Average ± 1 standard deviation',
      consSummary:
        '{n} periods. Average consumption {mu}, standard deviation {sigma}, minimum {min}, maximum {max}. Periods without consumption: {zeros}.',
      paretoTitle: 'Pareto curve (ABC classification)',
      paretoShare: 'Cumulative share',
      paretoValue: 'Consumption value',
      paretoQty: 'Consumed quantity',
      paretoSummary: '{a} A items account for {aShare} of the total; {b} B items, {c} C items.',
      classTitle: 'Current stock vs target stock by class',
      topTitle: 'Top 20 overstocks ({basis})',
      basisValue: 'by value',
      basisQty: 'by quantity',
      current: 'Current stock',
      targetStock: 'Target stock',
      classSummary: 'By class, current stock / target stock: {details}.',
      topSummary: 'Largest overstocks: {details}.',
      topNone: 'No overstocked item (or current stock unknown).',
      classNone: 'Current stock unknown: map a “current stock” column or enter it in the table.',
      periodWord: { week: 'week', month: 'month' },
      zoom: 'Zoom',
    },
    explain: {
      title: 'How is it calculated?',
      intro: 'Calculation details for the selected item, with its values.',
      none: 'Select an item in the table.',
      data: 'Data: {n} periods ({period}), μ = {mu}, σ = {sigma}, CV = {cv}.',
      conv: 'Conversion to periods: Lp = {L} d ÷ {dpp} = {lp}; Rp = {R} d ÷ {dpp} = {rp}.',
      convSd: 'σLp = {sd} d ÷ {dpp} = {sdp}.',
      z: 'Class {abc}, service level {sl} → Z = {z}.',
      ss: 'Safety stock',
      rop: 'Reorder point',
      target: 'Target stock',
      rounding: 'Results are rounded up to the next unit.',
      coverage: 'Current cover (days) = current stock ÷ average daily demand',
      more: 'All formulas and their limits',
    },
    share: {
      title: 'Share the tool',
      text: 'The shared link points to the tool, never to your data.',
      linkedin: 'LinkedIn',
      email: 'Email',
      copy: 'Copy link',
      copied: 'Link copied.',
      emailSubject: 'A free tool to calculate safety stock and reorder points',
      emailBody:
        'Stock-o-mètre computes safety stock, reorder point and target stock from a CSV file, right in the browser: {url}',
    },
  },

  calc: {
    intro: 'Enter your values: the result appears instantly, with the formula and your numbers.',
    result: 'Result:',
    zLine: 'Service level {sl} → Z = {z}.',
    formula: 'Formula with your values',
    invalid: 'Fill in the fields with valid numbers.',
    rounded: 'rounded up',
    units: 'units',
    days: 'days',
    fields: {
      mu: 'Average demand per period (μ)',
      sigma: 'Standard deviation of demand per period (σ)',
      period: 'Data period',
      lead: 'Lead time L (days)',
      review: 'Review period R (days, 0 = continuous review)',
      leadSd: 'Lead time standard deviation σL (days, 0 if unknown)',
      service: 'Target service level (%)',
      daily: 'Average daily demand',
      ss: 'Safety stock (units)',
      stock: 'Available stock (units)',
    },
    periods: { day: 'Day', week: 'Week', month: 'Month' },
    labels: {
      calcSafety: 'Safety stock',
      calcRop: 'Reorder point',
      calcTarget: 'Target stock',
      calcCoverage: 'Cover',
    },
    help: {
      calcSafety:
        '“Variable demand” method; if σL is filled in, the “variable demand and lead time” version is used. Service level = probability of no stock-out during a cycle.',
      calcRop: 'Reorder as soon as available stock (on hand + on order) drops below this level.',
      calcTarget:
        'At each review, order the difference between this level and your available stock.',
      calcCoverage: 'Number of days your stock can cover at the average consumption rate.',
    },
    cards: {
      calcSafety: 'Z × σ × √(L + R), with or without lead time variability.',
      calcRop: 'Demand during lead time + safety stock.',
      calcTarget: 'Demand during lead time + review period + safety stock.',
      calcCoverage: 'Stock ÷ average daily demand.',
    },
    coverageInfinite: 'Zero demand: infinite cover.',
  },

  guides: {
    intro:
      'Practical guides with worked examples to set up your inventory parameters with confidence. Each guide links to the matching calculator.',
    summary: 'In short',
    hypotheses: 'Assumptions',
  },

  notFound: {
    title: 'Page not found',
    text: 'This page does not exist or has moved.',
    back: 'Back to the tool',
  },

  rootPage: {
    title: 'Stock-o-mètre: safety stock calculator / calcul du stock de sécurité',
    description:
      'Safety stock, reorder point and order-up-to level calculator from a CSV file, in your browser. Calcul du stock de sécurité, du point de commande et du stock cible.',
    choose: 'Choose your language',
  },
};

export default en;
