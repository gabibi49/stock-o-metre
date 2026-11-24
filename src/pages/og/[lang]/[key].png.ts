/**
 * Images de partage Open Graph (1200 × 630), générées au build : une par page et
 * par langue. Sobres, sans photo. Police Inter (licence OFL) lue depuis
 * node_modules au build uniquement : rien n'est chargé par les visiteurs.
 */
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { DICTS } from '../../../i18n';
import { LANGS, ROUTE_KEYS, type Lang, type RouteKey } from '../../../i18n/routes';
import { exercisePages } from '../../../lib/exercises';

const require = createRequire(import.meta.url);
const fontPath = (w: number) =>
  require.resolve(`@fontsource/inter/files/inter-latin-${w}-normal.woff`);
const regular = readFileSync(fontPath(400));
const bold = readFileSync(fontPath(700));

interface OgProps {
  lang: Lang;
  key: string;
  heading: string;
  kicker: string;
}

export async function getStaticPaths() {
  const fixed = LANGS.flatMap((lang) =>
    ROUTE_KEYS.map((key: RouteKey) => {
      const d = DICTS[lang];
      const kicker = key.startsWith('guide')
        ? d.common.nav.guides
        : key.startsWith('calc')
          ? d.common.nav.calculators
          : key === 'exercises'
            ? d.common.nav.exercises
            : d.common.siteName;
      const props: OgProps = { lang, key, heading: d.meta[key].heading, kicker };
      return { params: { lang, key }, props };
    }),
  );
  // Une image par exercice : og/<langue>/ex-<id>.png
  const exercises = (await exercisePages()).map((p) => {
    const d = DICTS[p.lang];
    const props: OgProps = {
      lang: p.lang,
      key: `ex-${p.id}`,
      heading: p.entry.data.title,
      kicker: `${d.common.nav.exercises} · ${d.exercises.levels[p.entry.data.level]}`,
    };
    return { params: { lang: p.lang, key: props.key }, props };
  });
  return [...fixed, ...exercises];
}

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

export const GET: APIRoute = async ({ props }) => {
  const { lang, heading, kicker } = props as OgProps;
  const d = DICTS[lang];
  const row = (style: Record<string, unknown>, children: unknown) =>
    h('div', { display: 'flex', ...style }, children);
  const tree = h(
    'div',
    {
      width: 1056, // 1200 − 2 × 72 de marge (satori : modèle content-box)
      height: 502, // 630 − 2 × 64
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      background: '#0b5f8f',
      color: '#ffffff',
      fontFamily: 'Inter',
    },
    [
      row({ flexDirection: 'column' }, [
        row(
          { fontSize: 28, fontWeight: 700, letterSpacing: 1, opacity: 0.9 },
          kicker.toUpperCase(),
        ),
        row({ width: 96, height: 8, marginTop: 20, background: '#f4b740', borderRadius: 4 }, ''),
      ]),
      row(
        {
          fontSize: heading.length > 60 ? 54 : 64,
          fontWeight: 700,
          lineHeight: 1.12,
          maxWidth: 1050,
        },
        heading,
      ),
      row({ justifyContent: 'space-between', fontSize: 26, opacity: 0.92, width: 1056 }, [
        row({}, d.common.siteName),
        row({}, d.tool.privacyTitle),
      ]),
    ],
  );
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
