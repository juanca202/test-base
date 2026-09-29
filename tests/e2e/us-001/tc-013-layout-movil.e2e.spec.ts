import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

const MOBILE_WIDTHS = [360, 767];
const VIEWPORT_HEIGHT = 740;
const MODULE_PATHS = ['/tasks', '/processes'];

test.describe('US-001 · AC-007 · Layout móvil', () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getBawCredentials();
    await new LoginPage(page).goto();
    await new LoginPage(page).loginAndWaitForPortal(username, password);
  });

  test('TC-013: debe usar todo el ancho sin desbordamiento horizontal en el rango móvil', async ({
    page,
  }, testInfo) => {
    const layout = new PortalLayoutPage(page);
    for (const width of MOBILE_WIDTHS) {
      for (const path of MODULE_PATHS) {
        const where = `${width}px ${path}`;
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Pasos 2 y 6 (parte estructural): el contenido no es más ancho que la pantalla
        expect(await layout.hasHorizontalOverflow(), `${where} overflow`).toBe(
          false
        );
        // Paso 2: la navegación no ocupa espacio fijo en la pantalla
        expect(
          await layout.isDestinationVisible('Mis tareas'),
          `${where} fixed nav`
        ).toBe(false);

        await testInfo.attach(`layout-mobile-${width}-${path.slice(1)}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      }
    }
  });

  test('TC-013: debe ofrecer la navegación tras un ícono de hamburguesa que abre un panel superpuesto', async ({
    page,
  }) => {
    // Hallazgo TC-013: por debajo de 768px el portal no muestra ícono de hamburguesa ni navegación.
    // Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-013 pasos 2-5,7: sin hamburguesa ni navegación en móvil (hallazgo)'
    );

    const layout = new PortalLayoutPage(page);
    for (const width of MOBILE_WIDTHS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');

      // Paso 2: ícono de hamburguesa en la cabecera
      expect(await layout.hasHamburgerControl(), `${width}px hamburger`).toBe(
        true
      );

      // Paso 3: al activarlo se abre un panel con cada destino y etiqueta
      await layout.openNavigationPanel();
      for (const name of NAVIGATION_DESTINATIONS) {
        expect(
          await layout.isDestinationLabelVisible(name),
          `${width}px panel ${name}`
        ).toBe(true);
      }

      // Paso 4: elegir un destino navega y cierra el panel
      await layout.openModule('Procesos');
      await expect(page).toHaveURL(/\/processes/);
      expect(
        await layout.isDestinationVisible('Mis tareas'),
        `${width}px panel closed`
      ).toBe(false);

      // Paso 5: reabrir y cerrar sin elegir mantiene al usuario en su lugar
      await layout.openNavigationPanel();
      await page.keyboard.press('Escape');
      await expect(page).toHaveURL(/\/processes/);
    }
  });
});
