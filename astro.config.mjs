// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Adresse publique du site (GitHub Pages, site de projet).
 * Pour changer de compte ou de dépôt, modifiez uniquement ces deux constantes
 * (voir README.md, section « Déploiement »).
 */
export const SITE = 'https://gabibi49.github.io';
export const BASE = '/stock-o-metre';

/**
 * Plugin rehype (sans dépendance) pour les contenus Markdown :
 * - préfixe les liens internes « /fr/… » par le chemin de base du site de projet ;
 * - ajoute rel="noopener noreferrer" et target="_blank" aux liens externes.
 */
function rehypeLinks() {
  /** @param {any} node */
  const visit = (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      typeof node.properties?.href === 'string'
    ) {
      const href = node.properties.href;
      if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith(`${BASE}/`)) {
        node.properties.href = `${BASE}${href}`;
      } else if (/^https?:\/\//.test(href)) {
        node.properties.rel = ['noopener', 'noreferrer'];
        node.properties.target = '_blank';
      }
    }
    if (Array.isArray(node.children)) node.children.forEach(visit);
  };
  return (/** @type {any} */ tree) => visit(tree);
}

/**
 * Plugin rehype pour les exercices corrigés (src/content/exercises) : après le
 * titre de niveau 2 « Correction » (FR) ou « Solution » (EN), chaque titre de
 * niveau 3 et le contenu qui le suit deviennent un bloc <details> replié,
 * déplié au clic. Aucun script : compatible avec la CSP stricte.
 */
function rehypeExerciseSteps() {
  /** @param {any} node */
  const text = (node) =>
    node.type === 'text' ? node.value : (node.children ?? []).map(text).join('');
  return (/** @type {any} */ tree, /** @type {any} */ file) => {
    const path = String(file?.path ?? file?.history?.[0] ?? '').replace(/\\/g, '/');
    if (!path.includes('/content/exercises/')) return;
    /** @type {any[]} */
    const out = [];
    let inSolution = false;
    /** @type {any} */
    let step = null;
    for (const node of tree.children) {
      const isEl = node.type === 'element';
      if (isEl && node.tagName === 'h2') {
        step = null;
        inSolution = /^(correction|solution)\b/i.test(text(node).trim());
        out.push(node);
      } else if (inSolution && isEl && node.tagName === 'h3') {
        step = {
          type: 'element',
          tagName: 'details',
          properties: { className: ['step'] },
          children: [
            { type: 'element', tagName: 'summary', properties: {}, children: node.children },
          ],
        };
        out.push(step);
      } else if (step) {
        step.children.push(node);
      } else {
        out.push(node);
      }
    }
    tree.children = out;
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    rehypePlugins: [rehypeLinks, rehypeExerciseSteps],
    smartypants: false,
    // Pas de coloration syntaxique : Shiki insère des attributs style="…"
    // que la CSP (style-src 'self', sans 'unsafe-inline') bloquerait.
    syntaxHighlight: false,
  },
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory',
    // Aucune feuille de style insérée dans le HTML : indispensable pour la CSP
    // stricte (style-src 'self', sans 'unsafe-inline').
    inlineStylesheets: 'never',
    assets: 'assets',
  },
  devToolbar: { enabled: false },
  compressHTML: true,
  vite: {
    build: {
      // Ne jamais transformer un petit fichier en data: URI à l'intérieur d'un
      // script ou d'un style : tout reste en fichiers servis depuis 'self'.
      assetsInlineLimit: 0,
    },
    worker: {
      format: 'es',
    },
  },
});
