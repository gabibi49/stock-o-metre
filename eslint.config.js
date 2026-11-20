// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

/** Interdits de sécurité : jamais d'insertion HTML brute ni d'évaluation de code. */
/** @type {import("eslint").Linter.RulesRecord} */
const securityRules = {
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-restricted-properties': [
    'error',
    {
      property: 'innerHTML',
      message: 'Interdit : utilisez textContent ou les helpers de src/tool/dom.ts.',
    },
    {
      property: 'outerHTML',
      message: 'Interdit : utilisez textContent ou les helpers de src/tool/dom.ts.',
    },
    { property: 'insertAdjacentHTML', message: 'Interdit : utilisez les helpers DOM.' },
    { object: 'document', property: 'write', message: 'Interdit.' },
    { object: 'document', property: 'writeln', message: 'Interdit.' },
  ],
};

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'lighthouse/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...securityRules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
