import type { APIRoute } from 'astro';
import { exampleCsv } from '../lib/kit-example';

/** Fichier d'exemple des OF du kit ordonnancement (une ligne par opération), généré au build. */
export const GET: APIRoute = () =>
  new Response(exampleCsv('en'), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
