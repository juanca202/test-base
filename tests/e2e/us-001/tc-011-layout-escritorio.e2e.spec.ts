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
  test('TC-011: should show the complete navigation without expansion controls from 1280px', async ({
    page,
  }, testInfo) => {
    // Arrange: authenticated user
    const { username, password } = getBawCredentials();
    await new LoginPage(page).goto();
    await new LoginPage(page).loginAndWaitForPortal(username, password);
    const layout = new PortalLayoutPage(page);

    for (const width of DESKTOP_WIDTHS) {
      for (const path of MODULE_PATHS) {
        const where = `${width}px ${path}`;
        // Step 1: fixed width, open the module
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Step 2: every destination visible with its text label
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

        // Step 3: no hamburger or expansion control
        expect(await layout.hasHamburgerControl(), `${where} hamburger`).toBe(
          false
        );

        // Step 4 (structural part): no horizontal overflow
        expect(await layout.hasHorizontalOverflow(), `${where} overflow`).toBe(
          false
        );

        // Evidence for the manual visual review against the approved reference
        await testInfo.attach(`layout-desktop-${width}-${path.slice(1)}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      }
    }
  });
});
