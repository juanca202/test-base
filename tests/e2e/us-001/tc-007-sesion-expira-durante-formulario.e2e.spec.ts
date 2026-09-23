import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import {
  dropBawSessionCookies,
  hasPortalSession,
} from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { PortalLayoutPage } from '../../../src/pages/PortalLayoutPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const UNSAVED_TEXT = 'Borrador sin guardar 2026-09-11';
const EXPIRY_NOTICE = /sesión ha expirado/i;

test.describe('US-001 · AC-004 · Sesión inválida o expirada', () => {
  test('TC-007: should redirect to the login with an expiry notice and lose unsaved input', async ({
    page,
    context,
  }) => {
    // Steps 1-2: authenticated, with unsaved text in an editable field
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const tasksPage = new TasksPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForPortal(username, password);
    await tasksPage.fillSearch(UNSAVED_TEXT);
    expect(await tasksPage.getSearchValue()).toBe(UNSAVED_TEXT);

    // Step 3: the session stops being valid while the view stays open
    await dropBawSessionCookies(context);

    // Step 4: an action that needs BAW (module switch) gets a rejection
    await new PortalLayoutPage(page).openModule('Procesos');

    // Step 5: expiry notice, local credentials dropped, login screen shown
    await expect(page.getByText(EXPIRY_NOTICE)).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    expect(await hasPortalSession(context)).toBe(false);

    // Step 6: logging in again, the unsaved text is gone
    await loginPage.loginAndWaitForPortal(username, password);
    expect(await tasksPage.getSearchValue()).toBe('');
  });
});
