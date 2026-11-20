import type { MoveClass } from '../csv/build';
import type { DateOrder } from '../csv/dates';
import type { ColumnMapping } from '../csv/mapping';
import type { DecimalSeparator } from '../csv/numbers';

/**
 * Mémorisation de l'association des colonnes dans localStorage, pour le prochain
 * fichier au même format (même en-têtes). Seuls sont stockés : les numéros de
 * colonnes, les formats et le classement des types de mouvement (libellés de
 * catégories). Jamais les lignes du fichier, ni les articles, ni les quantités.
 * Tout accès est protégé par try/catch (navigation privée, stockage bloqué…).
 */
export interface SavedMapping {
  mapping: ColumnMapping;
  dateOrder: DateOrder;
  decimal: DecimalSeparator;
  typeRules: Record<string, MoveClass> | null;
}

const PREFIX = 'stock-o-metre:mapping:v1:';
const MAX_ENTRIES = 20;

export function loadMapping(signature: string): SavedMapping | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + signature);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedMapping;
    return parsed && typeof parsed === 'object' && parsed.mapping ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMapping(signature: string, value: SavedMapping): void {
  try {
    const store = window.localStorage;
    store.setItem(PREFIX + signature, JSON.stringify(value));
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
    // Limite le nombre de formats mémorisés.
    for (const k of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) store.removeItem(k);
  } catch {
    // Stockage indisponible : on continue sans mémoriser.
  }
}
