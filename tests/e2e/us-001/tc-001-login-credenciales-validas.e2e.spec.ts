import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';

const LOGIN_PATH = '/bpm/system/login';
const LOGIN_TIMEOUT = 30000;

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-001: debe llegar al módulo inicial tras iniciar sesión con credenciales válidas', async ({
    page,
  }) => {
    // Arrange: sin sesión activa, credenciales válidas tomadas del ambiente
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);

    // Paso 1: abrir el portal sin sesión muestra la pantalla de login
    await loginPage.goto();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();

    // Pasos 2-3: al enviar se invoca POST /bpm/system/login con Basic auth; BAW responde 201
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
    // Primera petición autenticada posterior al login (resultado final)
    const nextRequest = page.waitForRequest(
      request =>
        request.url().includes('/bpm/') && !request.url().endsWith(LOGIN_PATH),
      { timeout: LOGIN_TIMEOUT }
    );
    await loginPage.login(username, password);

    const authorization = (await loginRequest).headers()['authorization'] ?? '';
    // Booleano a propósito: un fallo de aserción nunca debe imprimir la credencial
    expect(authorization.startsWith('Basic ')).toBe(true);
    expect((await loginResponse).status()).toBe(201);

    // Paso 4: el usuario llega al módulo inicial, autenticado
    await expect(page).toHaveURL(/\/tasks/, { timeout: LOGIN_TIMEOUT });
    await expect(
      page.getByRole('heading', { name: 'Mis tareas', level: 1 })
    ).toBeVisible();
    await expect(page.getByRole('banner')).toContainText(username);

    // Resultado final: las peticiones posteriores llevan la cookie de sesión y BPMCSRFToken
    const headers = await (await nextRequest).allHeaders();
    expect('bpmcsrftoken' in headers).toBe(true);
    expect('cookie' in headers).toBe(true);
  });
});
