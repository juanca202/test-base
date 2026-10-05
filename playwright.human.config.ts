import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

const chromium = (baseConfig.projects ?? []).find(
  project => project.name === 'chromium'
);

/**
 * Configuración para pruebas con intervención humana (@human).
 * Corre solo esas pruebas, de a una y en Chromium, para que el prompt en la
 * terminal sea claro. El browser es visible solo en las pruebas que además
 * llevan @visible (p. ej. CAPTCHA); en el resto (p. ej. OTP por email o SMS)
 * corre headless. Uso: npm run test:human
 */
export default defineConfig({
  ...baseConfig,
  grepInvert: undefined,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  projects: [
    {
      ...chromium,
      name: 'human',
      grep: /@human/,
      grepInvert: /@visible/,
      use: { ...chromium?.use, headless: true },
    },
    {
      ...chromium,
      name: 'human-visible',
      grep: /@human.*@visible|@visible.*@human/,
      use: { ...chromium?.use, headless: false },
    },
  ],
});
