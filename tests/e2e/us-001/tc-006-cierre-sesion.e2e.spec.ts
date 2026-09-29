import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import { hasPortalSession } from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { PortalLayoutPage } from '../../../src/pages/PortalLayoutPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const BAW_API = /\/(rest\/)?bpm\//;

test.describe('US-001 · AC-003 · Cierre de sesión', () => {
  test('TC-006: debe descartar la sesión y volver al login sin llamar a BAW', async ({
    page,
    context,
  }) => {
    // Arrange: usuario autenticado navegando en un módulo distinto del inicial
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layout = new PortalLayoutPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForPortal(username, password);
    await layout.openModule('Procesos');
    await expect(page).toHaveURL(/\/processes/);

    // Paso 1 (adaptado): el control de cierre de sesión está disponible desde este módulo
    await layout.openUserMenu();
    await expect(
      page.locator(PortalLayoutPage.LOGOUT_ITEM_SELECTOR)
    ).toBeVisible();

    // Paso 3: comenzar a registrar el tráfico hacia BAW
    const bawRequests: string[] = [];
    page.on('request', request => {
      if (BAW_API.test(new URL(request.url()).pathname)) {
        bawRequests.push(request.url());
      }
    });

    // Paso 4: activar el control de cierre de sesión
    await layout.clickLogout();

    // Paso 6: el navegador termina en la pantalla de login
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Pasos 4-5: no se envió nada a BAW y la sesión local desapareció
    expect(bawRequests).toHaveLength(0);
    expect(await hasPortalSession(context)).toBe(false);

    // Paso 7: volver atrás no revela el módulo anterior
    await page.goBack();
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
  });

  test('TC-006 pasos 1-2: debe mantener el botón de cierre de sesión en el pie de la barra lateral, expandida y colapsada', async () => {
    // Hallazgo TC-006: el portal no tiene menú lateral; el cierre de sesión está en el
    // menú de usuario de la cabecera. Registrado en test-cases/automation.md (US-001).
    test.fixme(
      true,
      'TC-006 pasos 1-2: el portal no tiene barra lateral, el cierre de sesión está en el menú de usuario de la cabecera (hallazgo)'
    );
  });
});
