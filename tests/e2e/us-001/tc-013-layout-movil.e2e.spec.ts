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

  test('TC-013: should use the full width without horizontal overflow in the mobile range', async ({
    page,
  }, testInfo) => {
    const layout = new PortalLayoutPage(page);
    for (const width of MOBILE_WIDTHS) {
      for (const path of MODULE_PATHS) {
        const where = `${width}px ${path}`;
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Steps 2 and 6 (structural part): the content is not wider than the screen
        expect(await layout.hasHorizontalOverflow(), `${where} overflow`).toBe(
          false
        );
        // Step 2: the navigation does not take fixed space on the screen
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

  test('TC-013: should offer the navigation behind a hamburger icon that opens an overlay panel', async ({
    page,
  }) => {
    // Hallazgo TC-013: below 768px the portal shows no hamburger icon and no navigation.
    // Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-013 steps 2-5,7: no hamburger and no navigation on mobile (hallazgo)'
    );

    const layout = new PortalLayoutPage(page);
    for (const width of MOBILE_WIDTHS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/tasks');
      await page.waitForLoadState('networkidle');

      // Step 2: hamburger icon in the header
      expect(await layout.hasHamburgerControl(), `${width}px hamburger`).toBe(
        true
      );

      // Step 3: activating it opens a panel with every destination and label
      await layout.openNavigationPanel();
      for (const name of NAVIGATION_DESTINATIONS) {
        expect(
          await layout.isDestinationLabelVisible(name),
          `${width}px panel ${name}`
        ).toBe(true);
      }

      // Step 4: choosing a destination navigates and closes the panel
      await layout.openModule('Procesos');
      await expect(page).toHaveURL(/\/processes/);
      expect(
        await layout.isDestinationVisible('Mis tareas'),
        `${width}px panel closed`
      ).toBe(false);

      // Step 5: reopening and closing without choosing keeps the user in place
      await layout.openNavigationPanel();
      await page.keyboard.press('Escape');
      await expect(page).toHaveURL(/\/processes/);
    }
  });
});
