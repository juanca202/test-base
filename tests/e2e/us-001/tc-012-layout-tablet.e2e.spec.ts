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

  test('TC-012: should keep every destination reachable and avoid horizontal overflow in the tablet range', async ({
    page,
  }, testInfo) => {
    const layout = new PortalLayoutPage(page);
    for (const width of TABLET_WIDTHS) {
      for (const path of MODULE_PATHS) {
        const where = `${width}px ${path}`;
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Step 2 (accessibility part): every destination is present and reachable
        for (const name of NAVIGATION_DESTINATIONS) {
          expect(
            await layout.isDestinationVisible(name),
            `${where} ${name}`
          ).toBe(true);
        }
        // Step 5 (structural part): no horizontal overflow
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

  test('TC-012: should collapse the navigation to icons, expand it on interaction and collapse it again after navigating', async ({
    page,
  }) => {
    // Hallazgo TC-012: the tablet range shows the same full navigation as desktop.
    // Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-012 steps 2-4,6: tablet navigation is not collapsed to icons (hallazgo)'
    );

    const layout = new PortalLayoutPage(page);
    for (const width of TABLET_WIDTHS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');

      // Step 2: collapsed to icons, labels hidden, destinations still present
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

      // Step 3: interacting expands the navigation and shows the labels
      await layout.expandNavigation();
      for (const name of NAVIGATION_DESTINATIONS) {
        expect(
          await layout.isDestinationLabelVisible(name),
          `${width}px expanded ${name}`
        ).toBe(true);
      }

      // Step 4: choosing a destination navigates and collapses it again
      await layout.openModule('Procesos');
      await expect(page).toHaveURL(/\/processes/);
      expect(
        await layout.isDestinationLabelVisible('Procesos'),
        `${width}px recollapsed`
      ).toBe(false);
    }
  });
});
