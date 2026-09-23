import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { hasPortalSession } from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { PortalLayoutPage } from '../../../src/pages/PortalLayoutPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const BAW_API = /\/(rest\/)?bpm\//;

test.describe('US-001 · AC-003 · Cierre de sesión', () => {
  test('TC-006: should discard the session and return to the login without calling BAW', async ({
    page,
    context,
  }) => {
    // Arrange: authenticated user browsing a module other than the initial one
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layout = new PortalLayoutPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForPortal(username, password);
    await layout.openModule('Procesos');
    await expect(page).toHaveURL(/\/processes/);

    // Step 1 (adapted): the logout control is available from this module
    await layout.openUserMenu();
    await expect(
      page.locator(PortalLayoutPage.LOGOUT_ITEM_SELECTOR)
    ).toBeVisible();

    // Step 3: start recording traffic towards BAW
    const bawRequests: string[] = [];
    page.on('request', request => {
      if (BAW_API.test(new URL(request.url()).pathname)) {
        bawRequests.push(request.url());
      }
    });

    // Step 4: activate the logout control
    await layout.clickLogout();

    // Step 6: the browser ends on the login screen
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Steps 4-5: nothing was sent to BAW and the local session is gone
    expect(bawRequests).toHaveLength(0);
    expect(await hasPortalSession(context)).toBe(false);

    // Step 7: going back does not reveal the previous module
    await page.goBack();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
  });

  test('TC-006 steps 1-2: should keep the logout button in the sidebar footer, expanded and collapsed', async () => {
    // Hallazgo TC-006: the portal has no side menu; logout lives in the header
    // user menu. Registered in test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-006 steps 1-2: no sidebar in the portal, logout is in the header user menu (hallazgo)'
    );
  });
});
