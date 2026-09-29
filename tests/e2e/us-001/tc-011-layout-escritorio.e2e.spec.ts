import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

const DESKTOP_WIDTHS = [1280, 1920];
const VIEWPORT_HEIGHT = 900;
const MODULE_PATHS = ['/tasks', '/processes'];

test.describe('US-001 · AC-007 · Layout de escritorio', () => {
  test('TC-011: debe mostrar la navegación completa sin controles de expansión desde 1280px', async ({
    page,
  }, testInfo) => {
    // Arrange: usuario autenticado
    const { username, password } = getBawCredentials();
    await new LoginPage(page).goto();
    await new LoginPage(page).loginAndWaitForPortal(username, password);
    const layout = new PortalLayoutPage(page);

    for (const width of DESKTOP_WIDTHS) {
      for (const path of MODULE_PATHS) {
        const where = `${width}px ${path}`;
        // Paso 1: ancho fijo, abrir el módulo
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Paso 2: cada destino visible con su etiqueta de texto
        for (const name of NAVIGATION_DESTINATIONS) {
          expect(
            await layout.isDestinationVisible(name),
            `${where} ${name}`
          ).toBe(true);
          expect(
            await layout.isDestinationLabelVisible(name),
            `${where} label ${name}`
          ).toBe(true);
        }

        // Paso 3: sin hamburguesa ni control de expansión
        expect(await layout.hasHamburgerControl(), `${where} hamburger`).toBe(
          false
        );

        // Paso 4 (parte estructural): sin desbordamiento horizontal
        expect(await layout.hasHorizontalOverflow(), `${where} overflow`).toBe(
          false
        );

        // Evidencia para la revisión visual manual contra la referencia aprobada
        await testInfo.attach(`layout-desktop-${width}-${path.slice(1)}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      }
    }
  });
});
