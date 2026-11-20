import { expect, test, type Page, type Request } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const FIXTURE = 'tests/fixtures/demo-30-articles-2-ans.csv';

/** Collecte les violations de CSP et les erreurs de console de la page. */
async function watchPage(page: Page): Promise<{ errors: string[]; csp: () => Promise<string[]> }> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      (window as unknown as { __csp: string[] }).__csp.push(
        `${e.violatedDirective} ${e.blockedURI}`,
      ),
    );
  });
  return {
    errors,
    csp: () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp),
  };
}

async function analyzeFixture(page: Page, file = FIXTURE): Promise<void> {
  await page.locator('#file-input').setInputFiles(file);
  await expect(page.locator('#step-mapping')).toBeVisible();
  await page.locator('#analyze-btn').click();
  await expect(page.locator('#step-results')).toBeVisible();
}

test.describe('outil', () => {
  test('aucune requête réseau sortante pendant l’analyse d’un fichier', async ({
    page,
    baseURL,
  }) => {
    const watch = await watchPage(page);
    await page.goto('/stock-o-metre/fr/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('data-tool-ready', 'true');

    // À partir d'ici, on enregistre toutes les requêtes.
    const requests: Request[] = [];
    page.on('request', (r) => requests.push(r));

    await analyzeFixture(page);
    await expect(page.locator('#results-wrap tbody tr.item-row')).toHaveCount(30);
    await expect(page.locator('#chart-stock canvas')).toHaveCount(1);
    // Interactions supplémentaires : changement de période, sélection, réglage par article.
    await page.locator('input[name="period"][value="month"]').check();
    await page.locator('#results-wrap button[data-select]').nth(3).click();
    await page.waitForTimeout(500);

    const origin = new URL(baseURL as string).origin;
    const fileText = readFileSync(FIXTURE, 'utf8');
    for (const r of requests) {
      const url = new URL(r.url());
      // 1. Jamais d'autre hôte que le site lui-même (pas de CDN, pas de traceur).
      expect(url.origin, r.url()).toBe(origin);
      // 2. Uniquement des lectures de fichiers statiques du site (code découpé : worker, graphiques).
      expect(r.method(), r.url()).toBe('GET');
      expect(r.postData()).toBeNull();
      expect(url.pathname, r.url()).toMatch(/^\/stock-o-metre\/assets\/[\w.-]+\.(js|css)$/);
      expect(url.search).toBe('');
    }
    // 3. Aucune donnée du fichier dans une adresse.
    expect(fileText).toContain('Vis TH M8x40');
    expect(requests.some((r) => /P0\d|Vis|Rondelle/.test(decodeURIComponent(r.url())))).toBe(false);

    expect(await watch.csp()).toEqual([]);
    expect(watch.errors).toEqual([]);
  });

  test('messages d’erreur précis et textes du fichier jamais interprétés comme HTML', async ({
    page,
  }) => {
    const watch = await watchPage(page);
    let dialog = false;
    page.on('dialog', async (d) => {
      dialog = true;
      await d.dismiss();
    });
    await page.goto('/stock-o-metre/fr/');
    await analyzeFixture(page, 'tests/fixtures/erreurs-et-injection.csv');
    const report = page.locator('#report');
    await expect(report).toContainText(
      'La colonne date contient 1 valeur illisible, ligne 4 : « 31/02/2025 »',
    );
    await expect(report).toContainText(
      'La colonne quantité contient 1 valeur illisible, ligne 5 : « douze »',
    );
    // Le libellé piégé est affiché comme texte, aucune balise <img> n'est créée.
    await expect(page.locator('#results-wrap')).toContainText('<img src=x onerror=alert(1)>');
    expect(await page.locator('#results-wrap img').count()).toBe(0);
    expect(dialog).toBe(false);
    expect(await watch.csp()).toEqual([]);

    // Export CSV : la cellule « =HYPERLINK(...) » est neutralisée par une apostrophe.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#export-csv').click(),
    ]);
    const path = await download.path();
    const csv = readFileSync(path, 'utf8');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain(`"'=HYPERLINK(""http://exemple.invalid"")"`);
    expect(csv).not.toMatch(/(^|;)=HYPERLINK/m);
    expect(watch.errors).toEqual([]);
  });

  test('fichier trop volumineux : message clair, rien n’est lu', async ({ page }, testInfo) => {
    // Fichier de 51 Mo écrit sur disque (Playwright limite les tampons en mémoire à 50 Mo).
    const huge = testInfo.outputPath('huge.csv');
    writeFileSync(huge, Buffer.alloc(51 * 1024 * 1024, 'a'));
    await page.goto('/stock-o-metre/en/');
    await page.locator('#file-input').setInputFiles(huge);
    await expect(page.locator('#upload-error')).toContainText('the limit is 50 MB');
    await expect(page.locator('#step-mapping')).toBeHidden();
  });

  test('format refusé', async ({ page }) => {
    await page.goto('/stock-o-metre/fr/');
    await page
      .locator('#file-input')
      .setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('x') });
    await expect(page.locator('#upload-error')).toContainText('choisissez un fichier .csv ou .txt');
  });

  test('version anglaise : résultats, tri, filtre et export PNG avec filigrane', async ({
    page,
  }) => {
    const watch = await watchPage(page);
    await page.goto('/stock-o-metre/en/');
    await analyzeFixture(page);
    await page.locator('#f-abc').selectOption('A');
    const rows = page.locator('#results-wrap tbody tr.item-row');
    expect(await rows.count()).toBeGreaterThan(0);
    for (const cls of await rows.locator('td:nth-child(3)').allTextContents())
      expect(cls).toBe('A');
    await page.locator('#results-wrap button[data-sort="ss"]').click();
    await expect(page.locator('#results-wrap th[aria-sort="ascending"]')).toContainText(
      'Safety stock',
    );
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button[data-download="chart-pareto"]').click(),
    ]);
    expect(download.suggestedFilename()).toBe('stock-o-metre-pareto.png');
    const png = readFileSync(await download.path());
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(await watch.csp()).toEqual([]);
    expect(watch.errors).toEqual([]);
  });
});
