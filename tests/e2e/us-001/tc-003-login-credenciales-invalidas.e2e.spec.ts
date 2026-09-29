import { test, expect, Page } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const LOGIN_PATH = '/bpm/system/login';
const LOGIN_TIMEOUT = 30000;
const WRONG_PASSWORD = 'clave-incorrecta-tc003';
const UNKNOWN_USER = 'usuario.inexistente.tc003';
// Detalles técnicos o crudos de BAW que nunca deben llegar al usuario
const TECHNICAL_DETAILS = /CWTBG|CWTBB|unauthorized|exception|stack|\b401\b/i;

/** Envía el login y espera la respuesta de BAW, devolviendo su estado HTTP. */
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
    // Booleano a propósito: un fallo nunca debe imprimir la credencial
    usedBasicAuth: authorization.startsWith('Basic '),
  };
}

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-003: debe mostrar un error genérico y mantener al usuario en el login con credenciales inválidas', async ({
    page,
  }) => {
    // Arrange: cuenta existente con contraseña incorrecta, luego un usuario inexistente
    const { username } = getBawCredentials();
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Pasos 1-2: contraseña incorrecta -> POST con Basic auth respondido con 401
    const wrongPassword = await submitAndWaitStatus(
      page,
      loginPage,
      username,
      WRONG_PASSWORD
    );
    expect(wrongPassword.usedBasicAuth).toBe(true);
    expect(wrongPassword.status).toBe(401);

    // Paso 3: mensaje de error visible y no técnico
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    const wrongPasswordMessage = await loginPage.getErrorMessage();
    expect(wrongPasswordMessage).toMatch(/credenciales/i);
    expect(wrongPasswordMessage).not.toMatch(TECHNICAL_DETAILS);

    // Paso 4: sigue en el login y no se inició sesión
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();

    // Paso 5: mismo comportamiento con un usuario inexistente, reintentando sin recargar
    const unknownUser = await submitAndWaitStatus(
      page,
      loginPage,
      UNKNOWN_USER,
      WRONG_PASSWORD
    );
    expect(unknownUser.status).toBe(401);
    await expect(alert).toBeVisible();
    // Mismo mensaje: el portal no debe revelar si la cuenta existe
    expect(await loginPage.getErrorMessage()).toBe(wrongPasswordMessage);
    await expect(page).toHaveURL(/\/signin/);

    // Resultado final: ningún módulo protegido es accesible
    await new TasksPage(page).goto();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
  });

  test('TC-003: debe dejar vacío el campo de contraseña tras un login fallido', async ({
    page,
  }) => {
    // Hallazgo TC-003 (paso 4): el portal conserva en el formulario la contraseña escrita
    // tras un login fallido. Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-003 paso 4: el campo de contraseña no se limpia (hallazgo)'
    );

    // Arrange: usuario inexistente, para no exponer la cuenta real a fallos adicionales
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await submitAndWaitStatus(page, loginPage, UNKNOWN_USER, WRONG_PASSWORD);
    await expect(page.getByRole('alert')).toBeVisible();

    // Assert (paso 4): la contraseña no se conserva en el formulario
    expect(await loginPage.getPasswordValue()).toBe('');
  });
});
