import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { hasPortalSession } from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const LOGIN_ROUTE = '**/bpm/system/login';
const UNAVAILABLE_MESSAGE = /conectar|servidor|disponible/i;
const CREDENTIALS_MESSAGE = /credenciales/i;
const TECHNICAL_DETAILS = /ERR_|status|500|boom|exception|stack/i;

type Failure = 'network error' | 'timeout' | 'server error 500';

const FAILURES: Failure[] = ['network error', 'timeout', 'server error 500'];

test.describe('US-001 · AC-005 · Fiabilidad ante error de conexión', () => {
  for (const failure of FAILURES) {
    test(`TC-009: should show a service-unavailable message and allow retrying (${failure})`, async ({
      page,
      context,
    }) => {
      // Step 1: BAW cannot complete the login (variant under test)
      const { username, password } = getBawCredentials();
      await page.route(LOGIN_ROUTE, route => {
        if (failure === 'network error') return route.abort('failed');
        if (failure === 'timeout') return route.abort('timedout');
        return route.fulfill({ status: 500, body: 'boom' });
      });
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Step 2: valid credentials are submitted
      await loginPage.login(username, password);

      // Step 3: clear unavailability message, distinct from invalid credentials
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 30000 });
      const message = await loginPage.getErrorMessage();
      expect(message).toMatch(UNAVAILABLE_MESSAGE);
      expect(message).not.toMatch(CREDENTIALS_MESSAGE);
      expect(message).not.toMatch(TECHNICAL_DETAILS);

      // Step 4: the login stays operational and allows retrying without reload
      await expect(page).toHaveURL(/\/signin/);
      await expect(
        page.getByRole('button', { name: 'Iniciar sesión' })
      ).toBeEnabled();

      // Step 5: no session was started
      expect(await hasPortalSession(context)).toBe(false);

      // Step 6: a protected module sends the user back to the login
      await page.goto(TasksPage.PATH);
      await expect(page).toHaveURL(/\/signin/);

      // Step 7: BAW is restored and the same credentials log in
      await page.unroute(LOGIN_ROUTE);
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await expect(page.locator(TasksPage.HEADING_SELECTOR)).toBeVisible();
    });
  }
});
