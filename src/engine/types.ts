/**
 * Données d'un article, telles que produites par la lecture du CSV (Web Worker).
 * Les tableaux sont déjà cumulés par jour et triés par jour croissant.
 */
export interface ItemData {
  id: string;
  label: string;
  /** Prix unitaire retenu (dernier prix valide par date), ou null. */
  price: number | null;
  /** Stock actuel lu dans le fichier (dernière valeur par date), ou null. */
  stockFromFile: number | null;
  /** Premier jour où l'article a un mouvement pris en compte. */
  firstDay: number;
  /** Consommation par jour (positive ; négative pour un retour net). */
  consDays: number[];
  consQty: number[];
  /** Mouvement net de stock par jour (entrées − sorties ± ajustements). */
  moveDays: number[];
  moveNets: number[];
  /** Nombre de lignes en double exact (lignes identiques à une précédente). */
  duplicates: number;
  /** Nombre de lignes de mouvements lues pour l'article. */
  lines: number;
}

export interface Dataset {
  items: ItemData[];
  fileFirstDay: number;
  fileLastDay: number;
  /** Une colonne prix a été associée. */
  hasPrice: boolean;
}
