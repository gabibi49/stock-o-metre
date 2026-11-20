// Génère le jeu de données fictif : 30 articles, 2 ans de mouvements journaliers.
// Reproductible (générateur pseudo-aléatoire à graine fixe).
// Usage : npm run fixtures
//
// Contenu volontairement varié :
//  - P01–P10 : gros volumes, dont plusieurs saisonniers (pic en été ou en hiver) ;
//  - P11–P20 : volumes moyens réguliers ;
//  - P21–P25 : demande intermittente (commandes rares et irrégulières) ;
//  - P26–P27 : réapprovisionnement sous-dimensionné → ruptures de stock ;
//  - P28 : article lancé en juin 2025 (historique court) ;
//  - P29 : article en fin de vie (plus de sorties après mars 2025) ;
//  - P30 : grosses quantités écrites avec séparateur de milliers (« 1 250 »).
// Types de mouvement : « Réception », « Vente », « Inventaire » (ajustement signé).
// Deux lignes en double exact (P05). Pas de stock actuel pour P11 et P21 (courbe relative).
// Le fichier s'arrête le mercredi 31/12/2025 : la dernière semaine est incomplète.
import { writeFileSync, mkdirSync } from 'node:fs';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20251120);
const normal = () => {
  const u = Math.max(rnd(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
};
const poisson = (lambda) => {
  if (lambda <= 0) return 0;
  if (lambda > 30) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normal()));
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rnd();
  } while (p > L);
  return k - 1;
};

const LABELS = [
  'Vis TH M8x40 zinguée',
  'Écrou M8 inox A2',
  'Rondelle plate Ø8',
  'Joint torique Ø20 NBR',
  'Gants nitrile taille M',
  'Ruban adhésif 50 mm',
  'Câble H07 3G1,5 (m)',
  'Filtre à air F7',
  'Graisse lithium 400 g',
  'Collier serrage 200 mm',
  'Roulement 6204-2RS',
  'Courroie trapézoïdale A42',
  'Fusible 10 A',
  'Disjoncteur 16 A',
  'Pile LR06',
  'Lampe LED E27 9 W',
  'Carton 400×300×300',
  'Film étirable 23 µ',
  'Étiquette thermique 100×150',
  'Palette Europe',
  'Moteur 0,75 kW',
  'Variateur 2,2 kW',
  'Pompe doseuse',
  'Capteur inductif M12',
  'Vanne ¼ de tour DN25',
  'Huile hydraulique 20 L',
  'Liquide de refroidissement 5 L',
  'Kit démarrage ; série « Nova »',
  'Pièce détachée réf. ancienne',
  'Granulés PEHD (kg)',
];

const start = Date.UTC(2024, 0, 1); // lundi 1er janvier 2024
const end = Date.UTC(2025, 11, 31); // mercredi 31 décembre 2025
const DAY = 86_400_000;
const fmtDate = (t) => {
  const d = new Date(t);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
};
const fmtNum = (x, decimals = 2) => {
  const s = x.toFixed(decimals).replace('.', ',');
  return s.replace(/,?0+$/, '') || '0';
};
const fmtThousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const items = LABELS.map((label, i) => {
  const n = i + 1;
  const id = `P${String(n).padStart(2, '0')}`;
  let lambda; // demande moyenne par jour ouvré
  if (n <= 10) lambda = 20 + rnd() * 40;
  else if (n <= 20) lambda = 3 + rnd() * 8;
  else if (n <= 25) lambda = 0;
  else if (n <= 27) lambda = 8 + rnd() * 4;
  else if (n === 30) lambda = 900;
  else lambda = 4 + rnd() * 3;
  const price =
    n <= 10
      ? 0.05 + rnd() * 2
      : n <= 20
        ? 3 + rnd() * 30
        : n <= 25
          ? 150 + rnd() * 900
          : 2 + rnd() * 40;
  const season = n % 3 === 0 && n <= 12 ? 'summer' : n % 4 === 0 && n <= 12 ? 'winter' : null;
  const lead = 7 + Math.floor(rnd() * 21);
  const undersized = n === 26 || n === 27;
  return { n, id, label, lambda, price, season, lead, undersized, rows: [] };
});

for (const it of items) {
  // Politique de réappro simulée (point de commande / quantité fixe).
  const daily = it.lambda > 0 ? it.lambda * (5 / 7) : 0.6;
  const rop = it.undersized ? daily * it.lead * 0.5 : daily * it.lead * 1.6 + 10;
  const qty = Math.max(5, Math.round(daily * 30));
  let stock = Math.round(rop + qty / 2);
  const pipeline = [];
  for (let t = start; t <= end; t += DAY) {
    const date = new Date(t);
    const dow = date.getUTCDay();
    const doy = Math.floor((t - Date.UTC(date.getUTCFullYear(), 0, 1)) / DAY);
    // Réceptions arrivées ce jour.
    for (let k = pipeline.length - 1; k >= 0; k--) {
      if (pipeline[k].at <= t) {
        stock += pipeline[k].q;
        it.rows.push([fmtDate(t), 'Réception', pipeline[k].q]);
        pipeline.splice(k, 1);
      }
    }
    if (dow === 0 || dow === 6) continue;
    let demand;
    const launched = it.n !== 28 || t >= Date.UTC(2025, 5, 2);
    const alive = it.n !== 29 || t < Date.UTC(2025, 2, 15);
    if (!launched || !alive) demand = 0;
    else if (it.n >= 21 && it.n <= 25) demand = rnd() < 0.04 ? 1 + Math.floor(rnd() * 6) : 0;
    else {
      let f = 1;
      if (it.season === 'summer') f = 1 + 0.6 * Math.sin((2 * Math.PI * (doy - 80)) / 365);
      if (it.season === 'winter') f = 1 + 0.6 * Math.cos((2 * Math.PI * doy) / 365);
      demand = poisson(it.lambda * f);
    }
    const shipped = Math.min(demand, Math.max(0, stock));
    if (shipped > 0) {
      stock -= shipped;
      it.rows.push([fmtDate(t), 'Vente', shipped]);
    }
    const position = stock + pipeline.reduce((s, p) => s + p.q, 0);
    if (launched && alive && position <= rop) {
      const delay = it.lead + Math.round(normal() * (it.undersized ? 6 : 2));
      pipeline.push({ at: t + Math.max(2, delay) * DAY, q: qty });
    }
    // Inventaire tournant : petits écarts une fois par trimestre environ.
    if (rnd() < 0.012 && stock > 5) {
      const delta = Math.round(normal() * 2) || -1;
      stock += delta;
      it.rows.push([fmtDate(t), 'Inventaire', delta]);
    }
  }
  it.finalStock = stock;
}

const header = [
  'date',
  'article',
  'libellé',
  'quantité',
  'type_mouvement',
  'prix_unitaire',
  'stock_actuel',
];
const lines = [];
for (const it of items) {
  for (const [date, type, q] of it.rows) {
    const qtyText = it.n === 30 && Math.abs(q) >= 1000 ? fmtThousands(q) : String(q);
    const stockText = it.n === 11 || it.n === 21 ? '' : String(it.finalStock);
    lines.push({
      sort: date.split('/').reverse().join(''),
      cells: [date, it.id, it.label, qtyText, type, fmtNum(it.price), stockText],
    });
  }
}
lines.sort((a, b) => (a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0));
// Deux doublons exacts pour P05.
const dupSource = lines.filter((l) => l.cells[1] === 'P05' && l.cells[4] === 'Vente').slice(10, 12);
for (const d of dupSource)
  lines.splice(lines.indexOf(d) + 1, 0, { sort: d.sort, cells: [...d.cells] });

const escape = (c) => (/[;"\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
const csv =
  '﻿' +
  [header, ...lines.map((l) => l.cells)].map((r) => r.map(escape).join(';')).join('\r\n') +
  '\r\n';
mkdirSync('tests/fixtures', { recursive: true });
writeFileSync('tests/fixtures/demo-30-articles-2-ans.csv', csv, 'utf8');
writeFileSync('public/exemple-mouvements.csv', csv, 'utf8');
console.log(`${lines.length} lignes, ${items.length} articles.`);
for (const it of items) console.log(it.id, it.rows.length, 'stock final', it.finalStock);
