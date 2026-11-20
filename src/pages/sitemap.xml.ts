import type { APIRoute } from 'astro';
import { absoluteUrl, BASE, LANGS, pathTo, ROUTE_KEYS } from '../i18n/routes';

/** Sitemap avec les deux langues et les liens hreflang réciproques (xhtml:link). */
export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTE_KEYS.flatMap((key) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map(
          (l) =>
            `<xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(pathTo(key, l))}"/>`,
        ),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(`${BASE}/`)}"/>`,
      ].join('');
      const priority =
        key === 'home' ? '1.0' : key.startsWith('guide') || key.startsWith('calc') ? '0.8' : '0.4';
      return `<url><loc>${absoluteUrl(pathTo(key, lang))}</loc><lastmod>${today}</lastmod><priority>${priority}</priority>${alternates}</url>`;
    }),
  );
  const root = `<url><loc>${absoluteUrl(`${BASE}/`)}</loc><lastmod>${today}</lastmod><priority>0.5</priority></url>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[root, ...urls].join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
