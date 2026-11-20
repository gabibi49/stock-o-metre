/**
 * Réglages du site modifiables sans toucher au code des pages.
 */

/**
 * Jeton de vérification Google Search Console (méthode « balise HTML »).
 * Collez ici uniquement la valeur de l'attribut content, par exemple
 * 'AbCdEf123…'. Laisser vide tant que la propriété n'est pas créée.
 * Aucune balise n'est émise si la valeur est vide (voir README.md).
 */
export const GOOGLE_SITE_VERIFICATION = '';

/**
 * Content-Security-Policy appliquée par balise meta sur toutes les pages
 * (GitHub Pages ne permet pas d'envoyer d'en-têtes HTTP personnalisés).
 * Aucun 'unsafe-inline' : Astro est configuré pour ne rien insérer en ligne.
 * Les blocs <script type="application/ld+json"> et application/json sont des
 * données, jamais exécutées : la CSP ne les concerne pas.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

export const REFERRER_POLICY = 'strict-origin-when-cross-origin';

/** Date de publication des contenus (données structurées). */
export const PUBLISHED = '2026-11-20';
