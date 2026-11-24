import { expect, test } from '@playwright/test';

/** Récupère la liste des pages depuis le sitemap généré. */
async function sitemapPaths(
  request: import('@playwright/test').APIRequestContext,
): Promise<string[]> {
  const xml = await (await request.get('/stock-o-metre/sitemap.xml')).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] as string).pathname);
}

test('toutes les pages : CSP, référent, hreflang réciproques, canonical, aucune erreur', async ({
  page,
  request,
}) => {
  const paths = await sitemapPaths(request);
  expect(paths.length).toBe(57); // racine + 18 pages × 2 langues + 10 exercices × 2 langues
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${page.url()} ${m.text()}`);
  });
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost')) external.push(r.url());
  });
  for (const path of paths) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content');
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute(
      'content',
      'strict-origin-when-cross-origin',
    );
    expect(await page.title()).not.toBe('');
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    const hreflangs = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((ls) => ls.map((l) => l.getAttribute('hreflang')));
    expect(hreflangs.sort()).toEqual(['en', 'fr', 'x-default']);
    // Réciprocité : la page de l'autre langue pointe vers celle-ci.
    if (path !== '/stock-o-metre/') {
      const lang = (await page.locator('html').getAttribute('lang')) as string;
      const other = lang === 'fr' ? 'en' : 'fr';
      const otherHref = (await page
        .locator(`link[hreflang="${other}"]`)
        .getAttribute('href')) as string;
      const self = (await page.locator(`link[hreflang="${lang}"]`).getAttribute('href')) as string;
      expect(new URL(self).pathname).toBe(path);
      const back = await request.get(new URL(otherHref).pathname);
      expect(await back.text()).toContain(`hreflang="${lang}" href="${self}"`);
      // Le sélecteur de langue pointe vers la page équivalente.
      await expect(page.locator('a.lang-switch')).toHaveAttribute(
        'href',
        new URL(otherHref).pathname,
      );
    }
    // JSON-LD valide, avec un fil d'Ariane.
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.length).toBeGreaterThan(0);
    const parsed = ld.flatMap((t) => [JSON.parse(t)].flat()) as { '@type': string }[];
    if (path !== '/stock-o-metre/')
      expect(parsed.map((o) => o['@type'])).toContain('BreadcrumbList');
    // Liens externes protégés.
    for (const rel of await page
      .locator('a[href^="http"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('rel')))) {
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
    // Liens internes valides (chemin de base respecté).
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
      expect(href, `${path} → ${href}`).toMatch(/^\/stock-o-metre\//);
    }
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('liens internes : aucun lien cassé', async ({ page, request }) => {
  const paths = await sitemapPaths(request);
  const checked = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    const hrefs = await page
      .locator('a[href^="/stock-o-metre/"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href') as string));
    for (const href of hrefs) {
      const clean = href.split('#')[0] as string;
      if (checked.has(clean)) continue;
      checked.add(clean);
      const res = await request.get(clean);
      expect(res.status(), `${path} → ${clean}`).toBe(200);
    }
  }
  expect(checked.size).toBeGreaterThan(30);
});

test('mini-calculateur de stock de sécurité : résultat et formule', async ({ page }) => {
  await page.goto('/stock-o-metre/fr/calculateurs/stock-de-securite/');
  // Valeurs par défaut : μ = 100, σ = 30 / semaine, L = 14 j, R = 7 j, 95 %
  // SS = 1,6449 × 30 × √(2 + 1) = 85,47 → 86
  await expect(page.locator('#calc-value')).toHaveText('86 unités');
  await expect(page.locator('#calc-formula')).toContainText('= 1,6449 × 30 × √(2 + 1)');
  await page.locator('#f-service').fill('98');
  // Z(98 %) = 2,0537 → 2,0537 × 30 × 1,7321 = 106,72 → 107
  await expect(page.locator('#calc-value')).toHaveText('107 unités');
  await page.locator('#f-service').fill('120');
  await expect(page.locator('#calc-error')).not.toBeEmpty();
  await expect(page.locator('a.btn', { hasText: 'Calculer pour tous vos articles' })).toBeVisible();
});

test('mini-calculateurs : point de commande, stock cible, couverture (EN)', async ({ page }) => {
  await page.goto('/stock-o-metre/en/calculators/reorder-point/');
  await expect(page.locator('#calc-value')).toHaveText('160 units'); // 12 × 10 + 40
  await page.goto('/stock-o-metre/en/calculators/target-stock/');
  await expect(page.locator('#calc-value')).toHaveText('244 units'); // 12 × 17 + 40
  await page.goto('/stock-o-metre/en/calculators/days-of-cover/');
  await expect(page.locator('#calc-value')).toHaveText('37.5 days'); // 450 ÷ 12
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 800 } });
  for (const path of [
    '/stock-o-metre/fr/',
    '/stock-o-metre/fr/guides/calcul-stock-de-securite/',
    '/stock-o-metre/en/calculators/safety-stock/',
    '/stock-o-metre/fr/methodologie/',
    '/stock-o-metre/fr/exercices/',
    '/stock-o-metre/fr/kit-ordonnancement/',
    '/stock-o-metre/fr/exercices/classement-abc-xyz-politique/',
  ]) {
    test(`pas de défilement horizontal : ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test('exercices : index, correction repliée puis dépliée, liens', async ({ page }) => {
  await page.goto('/stock-o-metre/fr/exercices/');
  await expect(page.locator('.exercise-matrix a')).toHaveCount(10);
  await page.locator('a', { hasText: 'Calculer un stock de sécurité' }).first().click();
  await expect(page).toHaveURL(/\/fr\/exercices\/stock-de-securite-debutant\/$/);
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText('Exercices');
  const steps = page.locator('details.step');
  await expect(steps).toHaveCount(6);
  const answer = page.locator('details.step', { hasText: 'Stock de sécurité à 95 %' });
  await expect(answer.locator('pre')).toBeHidden();
  await answer.locator('summary').click();
  await expect(answer.locator('pre')).toBeVisible();
  await expect(answer.locator('pre')).toContainText('69,79 → 70 unités');
  await expect(
    page.locator('.exercise-links a[href$="/fr/calculateurs/stock-de-securite/"]'),
  ).toBeVisible();
  // Le sélecteur de langue mène au même exercice en anglais.
  await page.locator('a.lang-switch').click();
  await expect(page).toHaveURL(/\/en\/exercises\/safety-stock-beginner\/$/);
  await expect(page.locator('h2', { hasText: 'Solution' })).toBeVisible();
});

test('kit ordonnancement : présentation seule, fichier CSV, aperçu calculé', async ({
  page,
  request,
}) => {
  await page.goto('/stock-o-metre/fr/');
  await page.locator('nav a', { hasText: 'Kit ordonnancement' }).click();
  await expect(page).toHaveURL(/\/fr\/kit-ordonnancement\/$/);
  await expect(page.locator('main')).toContainText('Bientôt disponible');
  // Ni prix, ni formulaire, ni champ de saisie, ni lien externe.
  await expect(page.locator('main form, main input, main textarea')).toHaveCount(0);
  await expect(page.locator('main a[href^="http"]')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('€');
  // Aperçu : deux Gantt et un graphique de charge, calculés au build.
  await expect(page.locator('svg.gantt')).toHaveCount(3);
  await expect(page.locator('svg.gantt rect.gantt-late').first()).toBeVisible();
  await expect(page.locator('main')).toContainText('En rouge : OF en retard (OF-1004).');
  // Fichier d'exemple : une ligne par opération.
  const href = (await page
    .locator('a[download]', { hasText: 'fichier d’exemple' })
    .getAttribute('href')) as string;
  const csv = await (await request.get(href)).text();
  expect(csv.split(/\r\n/).filter(Boolean)).toHaveLength(16);
  expect(csv).toContain('of;article;quantite;operation;poste');
  const en = await (await request.get('/stock-o-metre/work-orders-template.csv')).text();
  expect(en).toContain('work_order,item,quantity,operation,work_center');
});

test('page 404 bilingue', async ({ page }) => {
  const res = await page.goto('/stock-o-metre/page-inexistante/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page introuvable');
  await expect(page.locator('h2')).toHaveText('Page not found');
});
