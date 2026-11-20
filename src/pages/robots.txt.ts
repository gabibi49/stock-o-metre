import type { APIRoute } from 'astro';
import { absoluteUrl, asset } from '../i18n/routes';

/**
 * robots.txt du site de projet. Note : pour une adresse <compte>.github.io/<dépôt>,
 * les robots lisent en principe le robots.txt à la racine du domaine
 * (<compte>.github.io/robots.txt) ; celui-ci sert dès que le site a son propre
 * domaine, et le sitemap reste déclarable dans Google Search Console (voir README).
 */
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(asset('sitemap.xml'))}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
