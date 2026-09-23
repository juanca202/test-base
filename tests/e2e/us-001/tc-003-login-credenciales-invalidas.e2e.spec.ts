import { test, expect, Page } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const LOGIN_PATH = '/bpm/system/login';
const LOGIN_TIMEOUT = 30000;
const WRONG_PASSWORD = 'clave-incorrecta-tc003';
const UNKNOWN_USER = 'usuario.inexistente.tc003';
// Raw BAW / technical details that must never reach the user
const TECHNICAL_DETAILS = /CWTBG|CWTBB|unauthorized|exception|stack|\b401\b/i;

/** Submit the login and wait for BAW's answer, returning its HTTP status. */
async function submitAndWaitStatus(
  page: Page,
  loginPage: LoginPage,
  username: string,
  password: string
): Promise<{ status: number; usedBasicAuth: boolean }> {
  const request = page.waitForRequest(
    r => r.method() === 'POST' && r.url().endsWith(LOGIN_PATH)
  );
  const response = page.waitForResponse(
    r => r.request().method() === 'POST' && r.url().endsWith(LOGIN_PATH),
    { timeout: LOGIN_TIMEOUT }
  );
  await loginPage.login(username, password);
  const authorization = (await request).headers()['authorization'] ?? '';
  return {
    status: (await response).status(),
    // Boolean on purpose: a failure must never print the credential
    usedBasicAuth: authorization.startsWith('Basic '),
  };
}

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-003: should show a generic error and keep the user on the login for invalid credentials', async ({
    page,
  }) => {
    // Arrange: existing account with a wrong password, then an unknown user
    const { username } = getBawCredentials();
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Step 1-2: wrong password -> POST with Basic auth answered 401
    const wrongPassword = await submitAndWaitStatus(
      page,
      loginPage,
      username,
      WRONG_PASSWORD
    );
    expect(wrongPassword.usedBasicAuth).toBe(true);
    expect(wrongPassword.status).toBe(401);

    // Step 3: visible, non-technical error message
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    const wrongPasswordMessage = await loginPage.getErrorMessage();
    expect(wrongPasswordMessage).toMatch(/credenciales/i);
    expect(wrongPasswordMessage).not.toMatch(TECHNICAL_DETAILS);

    // Step 4: still on the login, and no session was started
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();

    // Step 5: same behaviour for an unknown user, retrying without reloading
    const unknownUser = await submitAndWaitStatus(
      page,
      loginPage,
      UNKNOWN_USER,
      WRONG_PASSWORD
    );
    expect(unknownUser.status).toBe(401);
    await expect(alert).toBeVisible();
    // Same message: the portal must not reveal whether the account exists
    expect(await loginPage.getErrorMessage()).toBe(wrongPasswordMessage);
    await expect(page).toHaveURL(/\/signin/);

    // Final result: no protected module is reachable
    await new TasksPage(page).goto();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
  });

  test('TC-003: should leave the password field empty after a failed login', async ({
    page,
  }) => {
    // Hallazgo TC-003 (paso 4): the portal keeps the typed password in the form
    // after a failed login. Registered in test-cases/automation.md (US-001).
    test.fixme(true, 'TC-003 step 4: password field is not cleared (hallazgo)');

    // Arrange: unknown user, so the real account is not exposed to extra failures
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await submitAndWaitStatus(page, loginPage, UNKNOWN_USER, WRONG_PASSWORD);
    await expect(page.getByRole('alert')).toBeVisible();

    // Assert (step 4): the password is not kept in the form
    expect(await loginPage.getPasswordValue()).toBe('');
  });
});
