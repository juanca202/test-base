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

  test('TC-014: should switch from mobile to tablet exactly at 768px and never overflow or duplicate the navigation', async ({
    page,
  }, testInfo) => {
    const layout = new PortalLayoutPage(page);
    for (const width of EDGE_WIDTHS) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto(MODULE_PATH);
      await page.waitForLoadState('networkidle');

      // Step 8: no horizontal overflow at any edge width
      expect(await layout.hasHorizontalOverflow(), `${width}px overflow`).toBe(
        false
      );

      // Steps 1-3: 767px is still mobile (no top navigation), 768px and 769px are tablet
      const navigationShown = await layout.isDestinationVisible('Mis tareas');
      expect(navigationShown, `${width}px navigation`).toBe(width >= 768);

      await testInfo.attach(`breakpoint-${width}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    }

    // Step 7: resizing continuously across both edges never shows two navigations at once
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

  test('TC-014: should differ in layout at each side of 1280px and show the mobile hamburger at 767px', async ({
    page,
  }) => {
    // Hallazgo TC-014: 1279px and 1280px render the same navigation; 767px has no hamburger.
    // Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-014 steps 1,4-6: no layout change at 1280px and no mobile hamburger (hallazgo)'
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
    // Steps 4-5: 1279px is tablet (collapsed to icons), 1280px is desktop (labels visible)
    expect(labelsShown[1279]).toBe(false);
    expect(labelsShown[1280]).toBe(true);

    // Step 1: 767px shows the mobile layout with the hamburger icon
    await page.setViewportSize({ width: 767, height: VIEWPORT_HEIGHT });
    await page.goto(MODULE_PATH);
    await page.waitForLoadState('networkidle');
    expect(await layout.hasHamburgerControl()).toBe(true);
  });
});
