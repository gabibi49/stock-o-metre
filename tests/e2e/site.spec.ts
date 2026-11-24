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
  expect(paths.length).toBe(59); // racine + 19 pages × 2 langues + 10 exercices × 2 langues
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
    '/stock-o-metre/fr/simulation/',
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

test('simulation : partie, semaine par semaine, sauvegarde et reprise depuis un fichier', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost')) external.push(r.url());
  });
  page.on('dialog', (d) => void d.accept());
  await page.goto('/stock-o-metre/fr/');
  await page.locator('nav a', { hasText: 'Simulation' }).click();
  await expect(page).toHaveURL(/\/fr\/simulation\/$/);

  // Paramétrage : entreprise, devise, profil.
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await page.locator('#sim-company').fill('Ma Société');
  await page.locator('#sim-currency').selectOption('CHF');
  await page.locator('#sim-seed').fill('482913');
  await page.getByRole('button', { name: 'Commencer au mois 1' }).click();
  await expect(page.locator('#sim-title')).toHaveText('Ma Société · mois 1 / 24');
  await expect(page.locator('.summary-cards')).toContainText('CHF');
  await expect(page.locator('table.sim-plan-table')).toContainText('Roulements');

  // Le point de commande se recalcule à la saisie.
  const row = page.locator('table.sim-decisions tbody tr', { hasText: 'R-6204' });
  const rop = row.locator('td').nth(7);
  const before = await rop.textContent();
  await row.locator('input[data-field="f0"]').fill('200');
  await expect(rop).not.toHaveText(before as string);
  await row.locator('input[data-field="service"]').fill('120');
  await expect(page.getByRole('button', { name: /Lancer le mois/ })).toBeDisabled();
  await row.locator('input[data-field="service"]').fill('95');
  await page.getByRole('button', { name: /Lancer le mois/ }).click();
  await expect(page.locator('#sim-title')).toHaveText('Ma Société · mois 2 / 24');
  await expect(page.locator('#sim-app')).toContainText('Ce qui s’est passé en janvier');

  // Semaine par semaine, avec une commande express.
  await page.getByRole('button', { name: 'Avancer semaine par semaine' }).click();
  await expect(page.locator('.sim-sub')).toContainText('semaine 1 sur 4 jouée');
  await page.locator('#sim-force-item').selectOption('C-B55');
  await page.locator('#sim-force-qty').fill('150');
  await page.getByLabel('Express : délai 1 sem., prix +15 %').check();
  await page.getByRole('button', { name: 'Commander' }).click();
  await expect(page.locator('.sim-events')).toContainText('Commande express de 150 pièces');
  await page.getByRole('button', { name: 'Semaine suivante' }).click();
  await expect(page.locator('.sim-sub')).toContainText('semaine 2 sur 4 jouée');

  // Reprise après rechargement (stockage local).
  await page.reload();
  await page.getByRole('button', { name: /Reprendre la partie en cours/ }).click();
  await expect(page.locator('.sim-sub')).toContainText('semaine 2 sur 4 jouée');

  // Téléchargement de la partie, abandon, puis reprise depuis le fichier.
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Télécharger ma partie' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('simulation-482913-mois-2.json');
  const file = await download.path();
  await page.getByRole('button', { name: 'Abandonner la partie' }).click();
  await expect(page.getByRole('button', { name: 'Nouvelle partie' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Reprendre la partie en cours/ })).toHaveCount(0);
  await page.locator('#sim-file').setInputFiles(file);
  await expect(page.locator('.sim-sub')).toContainText('semaine 2 sur 4 jouée');

  // Un fichier qui n'est pas une partie est refusé.
  await page.getByRole('button', { name: 'Abandonner la partie' }).click();
  await page.locator('#sim-file').setInputFiles({
    name: 'autre.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"app":"autre"}'),
  });
  await expect(page.locator('#sim-app [role="alert"]')).toHaveText(
    'Ce fichier n’est pas une partie de simulation valide.',
  );
  expect(external).toEqual([]);
});

test('simulation (EN) : bilan au bout des 24 mois', async ({ page }) => {
  await page.goto('/stock-o-metre/en/simulation/');
  await page.getByRole('button', { name: 'New game' }).click();
  await page.locator('#sim-seed').fill('111111');
  await page.getByLabel('Hard').check();
  await page.getByRole('button', { name: 'Start month 1' }).click();
  for (let m = 1; m <= 24; m++) {
    await expect(page.locator('#sim-title')).toContainText(`month ${m} / 24`);
    await page.getByRole('button', { name: /Run the month/ }).click();
  }
  await expect(page.locator('#sim-title')).toHaveText('Results · PartsCo · code 111111 · Hard');
  await expect(page.locator('table.sim-end-table tbody tr')).toHaveCount(6);
  await expect(page.locator('svg.sim-chart')).toHaveCount(3);
  await expect(page.locator('#sim-app')).toContainText('What your game shows');
});

test('page 404 bilingue', async ({ page }) => {
  const res = await page.goto('/stock-o-metre/page-inexistante/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page introuvable');
  await expect(page.locator('h2')).toHaveText('Page not found');
});
