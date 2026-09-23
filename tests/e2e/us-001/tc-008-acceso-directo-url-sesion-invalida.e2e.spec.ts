import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import {
  dropBawSessionCookies,
  hasPortalSession,
  trackBusinessDataRendering,
  wasBusinessDataRendered,
} from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';

test.describe('US-001 · AC-004 · Sesión inválida o expirada', () => {
  test('TC-008: should redirect to the login without rendering business data when BAW rejects the session', async ({
    page,
    context,
  }) => {
    // Arrange (step 1): the portal believes it has a session, BAW no longer accepts it
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForPortal(username, password);
    await dropBawSessionCookies(context);
    await trackBusinessDataRendering(page);
    const bawStatuses: number[] = [];
    page.on('response', response => {
      if (/\/rest\/bpm\//.test(response.url())) {
        bawStatuses.push(response.status());
      }
    });

    // Steps 2-3: open the protected module directly by URL
    await page.goto(TasksPage.PATH);

    // Step 5 + final result: the browser ends on the login screen
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Step 3: BAW answered 401 or 403 to the first authenticated request
    expect(bawStatuses.length).toBeGreaterThan(0);
    expect(bawStatuses.every(status => status === 401 || status === 403)).toBe(
      true
    );

    // Step 4: local credentials discarded
    expect(await hasPortalSession(context)).toBe(false);

    // Step 6: no business data was rendered, not even transiently
    expect(await wasBusinessDataRendered(page)).toBe(false);
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
  });
});
