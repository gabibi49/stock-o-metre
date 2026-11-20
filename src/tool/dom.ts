/**
 * Création d'éléments DOM sans jamais interpréter de HTML.
 *
 * Règle de sécurité du projet : tout texte (en particulier ce qui vient du fichier
 * du visiteur) est inséré comme nœud texte (textContent). Aucun innerHTML,
 * insertAdjacentHTML, outerHTML ni document.write (règle ESLint dédiée).
 * Les attributs « on… » et « style » sont refusés : les événements passent par
 * addEventListener, la mise en forme par des classes CSS.
 */

export type Child = Node | string | number | null | undefined | false;
export type Attrs = Record<string, string | number | boolean | null | undefined>;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    const lower = name.toLowerCase();
    if (lower.startsWith('on') || lower === 'style' || lower === 'srcdoc') {
      throw new Error(`Attribut interdit : ${name}`);
    }
    if (lower === 'href' && typeof value === 'string' && /^\s*javascript:/i.test(value)) {
      throw new Error('URL javascript: interdite');
    }
    node.setAttribute(name, value === true ? '' : String(value));
  }
  append(node, children);
  return node;
}

export function append(parent: Node, children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    parent.appendChild(
      typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c,
    );
  }
}

/** Remplace tout le contenu d'un élément. */
export function setChildren(parent: Element, ...children: Child[]): void {
  parent.replaceChildren();
  append(parent, children);
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Élément introuvable : #${id}`);
  return node as T;
}

/** Téléchargement d'un Blob généré localement (URL blob:, aucun réseau). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: filename, class: 'hidden' });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
