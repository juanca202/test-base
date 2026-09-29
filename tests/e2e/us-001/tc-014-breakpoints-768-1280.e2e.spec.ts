import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

const VIEWPORT_HEIGHT = 900;
const MODULE_PATH = '/tasks';
const EDGE_WIDTHS = [767, 768, 769, 1279, 1280, 1281];

test.describe('US-001 · AC-007 · Bordes entre rangos de ancho', () => {
  test.beforeEach(async ({ page }) => {
    const { username, password } = getBawCredentials();
    await new LoginPage(page).goto();
    await new LoginPage(page).loginAndWaitForPortal(username, password);
  });

  test('TC-014: debe pasar de móvil a tablet exactamente en 768px y nunca desbordar ni duplicar la navegación', async ({
    page,
  }, testInfo) => {
    const layout = new PortalLayoutPage(page);
    for (const width of EDGE_WIDTHS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto(MODULE_PATH);
      await page.waitForLoadState('networkidle');

      // Paso 8: sin desbordamiento horizontal en ningún ancho límite
      expect(await layout.hasHorizontalOverflow(), `${width}px overflow`).toBe(
        false
      );

      // Pasos 1-3: 767px sigue siendo móvil (sin navegación superior), 768px y 769px son tablet
      const navigationShown = await layout.isDestinationVisible('Mis tareas');
      expect(navigationShown, `${width}px navigation`).toBe(width >= 768);

      await testInfo.attach(`breakpoint-${width}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    }

    // Paso 7: redimensionar continuamente a través de ambos bordes nunca muestra dos navegaciones a la vez
    for (const width of [
      360, 700, 767, 768, 1000, 1279, 1280, 1600, 1920, 1280, 768, 767, 360,
    ]) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.waitForTimeout(150);
      const navigationShown = await layout.isDestinationVisible('Mis tareas');
      const hamburger = await layout.hasHamburgerControl();
      expect(navigationShown && hamburger, `${width}px both navigations`).toBe(
        false
      );
    }
  });

  test('TC-014: debe diferir el layout a cada lado de 1280px y mostrar la hamburguesa móvil en 767px', async ({
    page,
  }) => {
    // Hallazgo TC-014: 1279px y 1280px muestran la misma navegación; 767px no tiene hamburguesa.
    // Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-014 pasos 1,4-6: sin cambio de layout en 1280px y sin hamburguesa móvil (hallazgo)'
    );

    const layout = new PortalLayoutPage(page);
    const labelsShown: Record<number, boolean> = {};
    for (const width of [1279, 1280]) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto(MODULE_PATH);
      await page.waitForLoadState('networkidle');
      labelsShown[width] = await layout.isDestinationLabelVisible(
        NAVIGATION_DESTINATIONS[0]
      );
    }
    // Pasos 4-5: 1279px es tablet (colapsada a íconos), 1280px es escritorio (etiquetas visibles)
    expect(labelsShown[1279]).toBe(false);
    expect(labelsShown[1280]).toBe(true);

    // Paso 1: 767px muestra el layout móvil con el ícono de hamburguesa
    await page.setViewportSize({ width: 767, height: VIEWPORT_HEIGHT });
    await page.goto(MODULE_PATH);
    await page.waitForLoadState('networkidle');
    expect(await layout.hasHamburgerControl()).toBe(true);
  });
});
