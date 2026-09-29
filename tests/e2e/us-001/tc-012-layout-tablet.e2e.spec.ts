import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

const TABLET_WIDTHS = [768, 1024, 1279];
const VIEWPORT_HEIGHT = 1024;
const MODULE_PATHS = ['/tasks', '/processes'];

test.describe('US-001 · AC-007 · Layout de tablet', () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getBawCredentials();
    await new LoginPage(page).goto();
    await new LoginPage(page).loginAndWaitForPortal(username, password);
  });

  test('TC-012: debe mantener cada destino accesible y evitar el desbordamiento horizontal en el rango de tablet', async ({
    page,
  }, testInfo) => {
    const layout = new PortalLayoutPage(page);
    for (const width of TABLET_WIDTHS) {
      for (const path of MODULE_PATHS) {
        const where = `${width}px ${path}`;
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Paso 2 (parte de accesibilidad): cada destino está presente y es accesible
        for (const name of NAVIGATION_DESTINATIONS) {
          expect(
            await layout.isDestinationVisible(name),
            `${where} ${name}`
          ).toBe(true);
        }
        // Paso 5 (parte estructural): sin desbordamiento horizontal
        expect(await layout.hasHorizontalOverflow(), `${where} overflow`).toBe(
          false
        );

        await testInfo.attach(`layout-tablet-${width}-${path.slice(1)}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      }
    }
  });

  test('TC-012: debe colapsar la navegación a íconos, expandirla al interactuar y colapsarla de nuevo tras navegar', async ({
    page,
  }) => {
    // Hallazgo TC-012: el rango de tablet muestra la misma navegación completa que escritorio.
    // Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-012 pasos 2-4,6: la navegación en tablet no se colapsa a íconos (hallazgo)'
    );

    const layout = new PortalLayoutPage(page);
    for (const width of TABLET_WIDTHS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');

      // Paso 2: colapsada a íconos, etiquetas ocultas, destinos aún presentes
      for (const name of NAVIGATION_DESTINATIONS) {
        expect(
          await layout.isDestinationVisible(name),
          `${width}px ${name}`
        ).toBe(true);
        expect(
          await layout.isDestinationLabelVisible(name),
          `${width}px label ${name}`
        ).toBe(false);
      }

      // Paso 3: al interactuar se expande la navegación y se muestran las etiquetas
      await layout.expandNavigation();
      for (const name of NAVIGATION_DESTINATIONS) {
        expect(
          await layout.isDestinationLabelVisible(name),
          `${width}px expanded ${name}`
        ).toBe(true);
      }

      // Paso 4: elegir un destino navega y la colapsa de nuevo
      await layout.openModule('Procesos');
      await expect(page).toHaveURL(/\/processes/);
      expect(
        await layout.isDestinationLabelVisible('Procesos'),
        `${width}px recollapsed`
      ).toBe(false);
    }
  });
});
