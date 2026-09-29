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
  test('TC-008: debe redirigir al login sin renderizar datos de negocio cuando BAW rechaza la sesión', async ({
    page,
    context,
  }) => {
    // Arrange (paso 1): el portal cree tener sesión, BAW ya no la acepta
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

    // Pasos 2-3: abrir el módulo protegido directamente por URL
    await page.goto(TasksPage.PATH);

    // Paso 5 + resultado final: el navegador termina en la pantalla de login
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Paso 3: BAW respondió 401 o 403 a la primera petición autenticada
    expect(bawStatuses.length).toBeGreaterThan(0);
    expect(bawStatuses.every(status => status === 401 || status === 403)).toBe(
      true
    );

    // Paso 4: credenciales locales descartadas
    expect(await hasPortalSession(context)).toBe(false);

    // Paso 6: no se renderizaron datos de negocio, ni siquiera de forma transitoria
    expect(await wasBusinessDataRendered(page)).toBe(false);
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
  });
});
