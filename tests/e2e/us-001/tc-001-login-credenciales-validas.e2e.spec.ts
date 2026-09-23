import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';

const LOGIN_PATH = '/bpm/system/login';
const LOGIN_TIMEOUT = 30000;

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-001: should reach the initial module after logging in with valid credentials', async ({
    page,
  }) => {
    // Arrange: no active session, valid credentials from the environment
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);

    // Step 1: opening the portal without a session shows the login screen
    await loginPage.goto();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();

    // Steps 2-3: submitting invokes POST /bpm/system/login with Basic auth; BAW answers 201
    const loginRequest = page.waitForRequest(
      request =>
        request.method() === 'POST' && request.url().endsWith(LOGIN_PATH)
    );
    const loginResponse = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().endsWith(LOGIN_PATH),
      { timeout: LOGIN_TIMEOUT }
    );
    // First authenticated request that follows the login (Result final)
    const nextRequest = page.waitForRequest(
      request =>
        request.url().includes('/bpm/') && !request.url().endsWith(LOGIN_PATH),
      { timeout: LOGIN_TIMEOUT }
    );
    await loginPage.login(username, password);

    const authorization = (await loginRequest).headers()['authorization'] ?? '';
    // Boolean on purpose: an assertion failure must never print the credential
    expect(authorization.startsWith('Basic ')).toBe(true);
    expect((await loginResponse).status()).toBe(201);

    // Step 4: the user lands on the initial module, authenticated
    await expect(page).toHaveURL(/\/tasks/, { timeout: LOGIN_TIMEOUT });
    await expect(
      page.getByRole('heading', { name: 'Mis tareas', level: 1 })
    ).toBeVisible();
    await expect(page.getByRole('banner')).toContainText(username);

    // Final result: later requests carry the session cookie and BPMCSRFToken
    const headers = await (await nextRequest).allHeaders();
    expect('bpmcsrftoken' in headers).toBe(true);
    expect('cookie' in headers).toBe(true);
  });
});
