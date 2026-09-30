import { test, expect } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import { BAW_LOGIN_PATH, CSRF_HEADER } from '../../../src/helpers/baw-session';
import { LoginPage } from '../../../src/pages/LoginPage';

const LOGIN_TIMEOUT = 30000;

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-001: debe llegar al módulo inicial autenticado al iniciar sesión con credenciales válidas', async ({
    page,
  }) => {
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const isLoginCall = (method: string, url: string) =>
      method === 'POST' && url.endsWith(BAW_LOGIN_PATH);

    await test.step('Paso 1: abrir el portal sin sesión activa muestra la pantalla de login', async () => {
      await loginPage.goto();
      await expect(
        page,
        'El portal debe redirigir al login cuando no hay sesión'
      ).toHaveURL(/\/signin/);
      await expect(
        page.locator(LoginPage.HEADING_SELECTOR),
        'Debe mostrarse el encabezado de la pantalla de login'
      ).toBeVisible();
    });

    // Listeners registrados antes del envío para no perder ninguna petición
    const loginRequest = page.waitForRequest(request =>
      isLoginCall(request.method(), request.url())
    );
    const loginResponse = page.waitForResponse(
      response => isLoginCall(response.request().method(), response.url()),
      { timeout: LOGIN_TIMEOUT }
    );
    const nextRequest = page.waitForRequest(
      request =>
        request.url().includes('/bpm/') &&
        !request.url().endsWith(BAW_LOGIN_PATH),
      { timeout: LOGIN_TIMEOUT }
    );

    await test.step('Paso 2: enviar credenciales válidas invoca POST /bpm/system/login con Authorization Basic', async () => {
      await loginPage.login(username, password);
      const authorization =
        (await loginRequest).headers()['authorization'] ?? '';
      // Booleano a propósito: un fallo de aserción nunca debe imprimir la credencial
      expect(
        authorization.startsWith('Basic '),
        'La petición de login debe llevar la cabecera Authorization: Basic'
      ).toBe(true);
    });

    await test.step('Paso 3: BAW responde 201 y el portal conserva la sesión', async () => {
      expect(
        (await loginResponse).status(),
        'BAW debe responder 201 al login con credenciales válidas'
      ).toBe(201);
    });

    await test.step('Paso 4: el usuario llega al módulo inicial, autenticado', async () => {
      await expect(
        page,
        'El portal debe redirigir al módulo inicial de tareas'
      ).toHaveURL(/\/tasks/, { timeout: LOGIN_TIMEOUT });
      await expect(
        page.getByRole('heading', { name: 'Mis tareas', level: 1 }),
        'Debe mostrarse el módulo inicial «Mis tareas»'
      ).toBeVisible();
      await expect(
        page.getByRole('banner'),
        'El encabezado debe mostrar al usuario autenticado'
      ).toContainText(username);
    });

    await test.step('Resultado final: las peticiones posteriores llevan la cookie de sesión y BPMCSRFToken', async () => {
      const headers = await (await nextRequest).allHeaders();
      expect(
        CSRF_HEADER.toLowerCase() in headers,
        'Toda petición posterior debe incluir la cabecera BPMCSRFToken'
      ).toBe(true);
      expect(
        'cookie' in headers,
        'Toda petición posterior debe incluir la cookie de sesión'
      ).toBe(true);
    });
  });
});
