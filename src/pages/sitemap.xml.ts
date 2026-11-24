import type { APIRoute } from 'astro';
import { absoluteUrl, BASE, LANGS, pathTo, ROUTE_KEYS, type Lang } from '../i18n/routes';
import { exercisePages } from '../lib/exercises';

/** Sitemap avec les deux langues et les liens hreflang réciproques (xhtml:link). */
export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const entry = (paths: Record<Lang, string>, lang: Lang, priority: string) => {
    const alternates = [
      ...LANGS.map(
        (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(paths[l])}"/>`,
      ),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(`${BASE}/`)}"/>`,
    ].join('');
    return `<url><loc>${absoluteUrl(paths[lang])}</loc><lastmod>${today}</lastmod><priority>${priority}</priority>${alternates}</url>`;
  };
  const urls = ROUTE_KEYS.flatMap((key) =>
    LANGS.map((lang) => {
      const priority =
        key === 'home'
          ? '1.0'
          : key.startsWith('guide') ||
              key.startsWith('calc') ||
              key === 'exercises' ||
              key === 'simulation'
            ? '0.8'
            : '0.4';
      const paths = { fr: pathTo(key, 'fr'), en: pathTo(key, 'en') };
      return entry(paths, lang, priority);
    }),
  );
  for (const p of await exercisePages()) urls.push(entry(p.paths, p.lang, '0.7'));
  const root = `<url><loc>${absoluteUrl(`${BASE}/`)}</loc><lastmod>${today}</lastmod><priority>0.5</priority></url>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[root, ...urls].join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
