export type Field = 'date' | 'item' | 'qty' | 'type' | 'label' | 'price' | 'stock';

export const REQUIRED_FIELDS: readonly Field[] = ['date', 'item', 'qty'];
export const OPTIONAL_FIELDS: readonly Field[] = ['type', 'label', 'price', 'stock'];
export const ALL_FIELDS: readonly Field[] = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

export type ColumnMapping = Record<Field, number | null>;

/** Met en minuscules, retire accents et ponctuation : « Qté_Mvt. » → « qte mvt ». */
export function normalizeHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Synonymes usuels (FR et EN), déjà normalisés. */
export const SYNONYMS: Readonly<Record<Field, readonly string[]>> = {
  date: [
    'date',
    'date mvt',
    'date mouvement',
    'date du mouvement',
    'date de mouvement',
    'date operation',
    'date transaction',
    'date comptable',
    'date piece',
    'jour',
    'movement date',
    'transaction date',
    'posting date',
    'document date',
    'day',
    'datetime',
    'timestamp',
  ],
  item: [
    'article',
    'code article',
    'ref',
    'ref article',
    'reference',
    'reference article',
    'code produit',
    'produit',
    'id article',
    'num article',
    'no article',
    'sku',
    'item',
    'item code',
    'item id',
    'item number',
    'item no',
    'product',
    'product code',
    'product id',
    'part',
    'part number',
    'part no',
    'material',
    'materiel',
    'code',
  ],
  qty: [
    'quantite',
    'qte',
    'qt',
    'qte mvt',
    'quantite mvt',
    'quantite mouvement',
    'qty',
    'quantity',
    'qty moved',
    'movement quantity',
    'units',
    'unites',
    'nb',
    'nombre',
  ],
  type: [
    'type mouvement',
    'type mvt',
    'type de mouvement',
    'code mouvement',
    'type',
    'sens',
    'nature',
    'nature mouvement',
    'movement type',
    'transaction type',
    'move type',
    'direction',
  ],
  label: [
    'libelle',
    'libelle article',
    'designation',
    'description',
    'desc',
    'nom',
    'nom article',
    'name',
    'item name',
    'item description',
    'product name',
    'product description',
  ],
  price: [
    'prix unitaire',
    'prix',
    'pu',
    'cout unitaire',
    'cout',
    'prix achat',
    'prix d achat',
    'pmp',
    'cump',
    'valeur unitaire',
    'unit price',
    'price',
    'unit cost',
    'cost',
    'standard cost',
  ],
  stock: [
    'stock actuel',
    'stock',
    'stock physique',
    'stock disponible',
    'quantite en stock',
    'qte en stock',
    'current stock',
    'stock on hand',
    'on hand',
    'qty on hand',
    'available stock',
    'inventory',
    'soh',
  ],
};

/**
 * Score de correspondance entre un en-tête et un champ :
 * 3 = identique à un synonyme ; 1 = tous les mots d'un synonyme figurent dans
 * l'en-tête (ex. « Qté sortie » contient « qte ») ; 0 = aucune correspondance.
 */
function score(header: string, field: Field): number {
  const words = header.split(' ');
  let best = 0;
  for (const syn of SYNONYMS[field]) {
    if (header === syn) return 3;
    const synWords = syn.split(' ');
    if (synWords.every((w) => words.includes(w)))
      best = Math.max(best, 1 + (synWords.length > 1 ? 1 : 0));
  }
  return best;
}

/**
 * Propose une association colonnes → champs à partir des noms d'en-têtes.
 * Les meilleures correspondances sont attribuées en premier ; une colonne ne
 * sert qu'une fois ; à score égal, les champs obligatoires sont prioritaires.
 */
export function autoMap(headers: readonly string[]): ColumnMapping {
  const norm = headers.map(normalizeHeader);
  const candidates: { field: Field; col: number; s: number; prio: number }[] = [];
  ALL_FIELDS.forEach((field, prio) => {
    norm.forEach((h, col) => {
      const s = score(h, field);
      if (s > 0) candidates.push({ field, col, s, prio });
    });
  });
  candidates.sort((x, y) => y.s - x.s || x.prio - y.prio || x.col - y.col);
  const mapping = Object.fromEntries(ALL_FIELDS.map((f) => [f, null])) as ColumnMapping;
  const used = new Set<number>();
  for (const c of candidates) {
    if (mapping[c.field] !== null || used.has(c.col)) continue;
    mapping[c.field] = c.col;
    used.add(c.col);
  }
  return mapping;
}

/** Signature d'un format de fichier (en-têtes normalisés), pour mémoriser l'association. */
export function headerSignature(headers: readonly string[]): string {
  return headers.map(normalizeHeader).join('|');
}

export function missingRequired(m: ColumnMapping): Field[] {
  return REQUIRED_FIELDS.filter((f) => m[f] === null);
}
