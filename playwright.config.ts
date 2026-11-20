import { defineConfig, devices } from '@playwright/test';

/**
 * Tests de bout en bout sur le site construit (npm run build), servi par
 * « astro preview ». Le chemin de base /stock-o-metre/ est le même qu'en production.
 */
const PORT = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}/stock-o-metre/`,
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
