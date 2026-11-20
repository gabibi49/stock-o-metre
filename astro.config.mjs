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

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    rehypePlugins: [rehypeLinks],
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
