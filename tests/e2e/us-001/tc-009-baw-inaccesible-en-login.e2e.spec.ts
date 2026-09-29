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
    test(`TC-009: debe mostrar un mensaje de servicio no disponible y permitir reintentar (${failure})`, async ({
      page,
      context,
    }) => {
      // Paso 1: BAW no puede completar el login (variante bajo prueba)
      const { username, password } = getBawCredentials();
      await page.route(LOGIN_ROUTE, route => {
        if (failure === 'network error') return route.abort('failed');
        if (failure === 'timeout') return route.abort('timedout');
        return route.fulfill({ status: 500, body: 'boom' });
      });
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Paso 2: se envían credenciales válidas
      await loginPage.login(username, password);

      // Paso 3: mensaje claro de indisponibilidad, distinto del de credenciales inválidas
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible({ timeout: 30000 });
      const message = await loginPage.getErrorMessage();
      expect(message).toMatch(UNAVAILABLE_MESSAGE);
      expect(message).not.toMatch(CREDENTIALS_MESSAGE);
      expect(message).not.toMatch(TECHNICAL_DETAILS);

      // Paso 4: el login sigue operativo y permite reintentar sin recargar
      await expect(page).toHaveURL(/\/signin/);
      await expect(
        page.getByRole('button', { name: 'Iniciar sesión' })
      ).toBeEnabled();

      // Paso 5: no se inició sesión
      expect(await hasPortalSession(context)).toBe(false);

      // Paso 6: un módulo protegido devuelve al usuario al login
      await page.goto(TasksPage.PATH);
      await expect(page).toHaveURL(/\/signin/);

      // Paso 7: BAW se restablece y las mismas credenciales inician sesión
      await page.unroute(LOGIN_ROUTE);
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await expect(page.locator(TasksPage.HEADING_SELECTOR)).toBeVisible();
    });
  }
});
