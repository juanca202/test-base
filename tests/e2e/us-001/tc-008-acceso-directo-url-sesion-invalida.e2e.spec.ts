import { test, expect } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';
import {
  dropBawSessionCookies,
  hasPortalSession,
  hasStoredCredentials,
  trackBusinessDataRendering,
  wasBusinessDataRendered,
} from '../../../src/helpers/portal-session';

const MODULE_TITLE = 'Mis tareas';
const REJECTED_STATUSES = [401, 403];
const REDIRECT_TIMEOUT = 30000;

test.describe('US-001 · AC-004 · Sesión inválida o expirada', () => {
  test('TC-008: debe redirigir al login sin exponer el módulo al abrir una URL protegida con la sesión invalidada en BAW', async ({
    page,
    context,
  }) => {
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const tasksPage = new TasksPage(page);
    const bawStatuses: number[] = [];

    await test.step('Paso 1: iniciar sesión e invalidar la credencial contra BAW conservando la sesión del portal', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await dropBawSessionCookies(context);
      expect(
        await hasPortalSession(context),
        'El portal debe seguir aparentando tener sesión'
      ).toBe(true);
    });

    await test.step('Paso 2: abrir directamente por URL el módulo protegido', async () => {
      await trackBusinessDataRendering(page);
      page.on('response', response => {
        if (response.url().includes('/bpm/')) {
          bawStatuses.push(response.status());
        }
      });
      await page.goto(TasksPage.PATH);
    });

    await test.step('Pasos 3-5: BAW rechaza la primera petición y el portal redirige al login', async () => {
      await expect(page, 'El navegador debe quedar en el login').toHaveURL(
        /\/signin/,
        { timeout: REDIRECT_TIMEOUT }
      );
      await expect(
        page.locator(LoginPage.HEADING_SELECTOR),
        'Debe mostrarse el encabezado del login'
      ).toBeVisible();
      expect(
        bawStatuses.length,
        'El portal debe haber emitido al menos una petición a BAW'
      ).toBeGreaterThan(0);
      expect(
        REJECTED_STATUSES,
        'BAW debe responder 401 o 403 a la primera petición autenticada'
      ).toContain(bawStatuses[0]);
    });

    await test.step('Paso 4 y resultado final: se descartan las credenciales locales', async () => {
      expect(
        await hasPortalSession(context),
        'La sesión del portal debe haberse descartado'
      ).toBe(false);
      expect(
        await hasStoredCredentials(page),
        'El almacenamiento no debe conservar username ni csrf_token'
      ).toBe(false);
    });

    await test.step('Paso 6: nunca se renderizan datos del módulo protegido', async () => {
      await expect(
        page.locator(TasksPage.HEADING_SELECTOR),
        'El encabezado del módulo no debe estar en el DOM'
      ).toHaveCount(0);
      expect(
        await page.content(),
        'El HTML renderizado no debe contener el módulo protegido'
      ).not.toContain(MODULE_TITLE);
      expect(
        await wasBusinessDataRendered(page),
        'No debe haberse renderizado ningún dato de negocio, ni siquiera de forma transitoria'
      ).toBe(false);
    });
  });
});
