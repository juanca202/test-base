import { Page, Response } from '@playwright/test';
import { test, expect } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import {
  browserStoresText,
  getEphemeralStorageKeys,
  SESSION_STORAGE_KEYS,
} from '../../../src/helpers/login-failure';
import {
  BAW_SESSION_COOKIE_NAMES,
  dropBawSessionCookies,
  hasPortalSession,
} from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { PortalLayoutPage } from '../../../src/pages/PortalLayoutPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const REDIRECT_TIMEOUT = 30000;
const UNSAVED_TEXT = 'Borrador sin guardar (TC-007)';
const EXPIRED_SESSION_CODE = 'CWTBG0651E';
const OPEN_MODULE_TIMEOUT = 2000;

function waitForExpiredSessionResponse(page: Page): Promise<Response> {
  return page.waitForResponse(
    response =>
      response.url().includes('/bpm/') &&
      [401, 403].includes(response.status()),
    { timeout: REDIRECT_TIMEOUT }
  );
}

/**
 * Ask the UI for a BAW-backed module. When the portal has already reacted to the
 * expiry on its own (background poll), the tab is gone and there is nothing to click.
 */
async function requestBawFromUi(layoutPage: PortalLayoutPage): Promise<void> {
  await layoutPage
    .openModuleWithin('Procesos', OPEN_MODULE_TIMEOUT)
    .catch(() => {});
}

/**
 * The portal has no editable business form reachable without side effects
 * (starting a process creates instances in BAW). The free-text search box of
 * "Mis tareas" plays the role of the form: client-side input that is never saved.
 */
test.describe('US-001 · AC-004 · Sesión inválida o expirada', () => {
  test('TC-007: debe redirigir al login y perder los cambios no guardados cuando la sesión expira con un formulario abierto', async ({
    page,
    context,
  }) => {
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const tasksPage = new TasksPage(page);
    const layoutPage = new PortalLayoutPage(page);
    const requestsWithDraft: string[] = [];
    page.on('request', request => {
      if (
        request.url().includes(encodeURIComponent(UNSAVED_TEXT)) ||
        (request.postData() ?? '').includes(UNSAVED_TEXT)
      ) {
        requestsWithDraft.push(`${request.method()} ${request.url()}`);
      }
    });

    await test.step('Precondición: usuario autenticado en el portal', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      expect(
        await hasPortalSession(context),
        'Debe existir la sesión del portal'
      ).toBe(true);
    });

    await test.step('Pasos 1-2: escribir en el formulario sin guardarlo', async () => {
      await expect(
        page.locator(TasksPage.HEADING_SELECTOR),
        'El módulo debe mostrarse con la sesión vigente'
      ).toBeVisible();
      await tasksPage.fillSearch(UNSAVED_TEXT);
      expect(
        await tasksPage.getSearchValue(),
        'El texto debe quedar en la interfaz'
      ).toBe(UNSAVED_TEXT);
      expect(
        requestsWithDraft,
        'El texto escrito no debe enviarse a BAW'
      ).toHaveLength(0);
    });

    // Registrado antes de expirar: el portal consulta BAW en segundo plano y
    // la respuesta de sesión inválida puede llegar antes que la acción del usuario
    const expiredResponse = waitForExpiredSessionResponse(page);

    await test.step('Paso 3: forzar la expiración eliminando las cookies de BAW', async () => {
      await dropBawSessionCookies(context);
      const names = (await context.cookies()).map(cookie => cookie.name);
      for (const name of BAW_SESSION_COOKIE_NAMES) {
        expect(names, `No debe quedar la cookie ${name}`).not.toContain(name);
      }
    });

    await test.step('Paso 4: una acción que requiere BAW recibe una respuesta de sesión inválida', async () => {
      await requestBawFromUi(layoutPage);
      const response = await expiredResponse;
      if (response.status() === 403) {
        expect(
          await response.text(),
          'Un 403 debe traer el código de sesión no verificable'
        ).toContain(EXPIRED_SESSION_CODE);
      } else {
        expect(response.status(), 'BAW debe responder 401').toBe(401);
      }
    });

    await test.step('Paso 5: el portal descarta las credenciales y redirige al login', async () => {
      await expect(page, 'Debe redirigir a la pantalla de login').toHaveURL(
        /\/signin/,
        { timeout: REDIRECT_TIMEOUT }
      );
      await expect(
        page.locator(LoginPage.HEADING_SELECTOR),
        'Debe mostrarse el encabezado del login'
      ).toBeVisible();
      expect(
        await hasPortalSession(context),
        'La sesión del portal debe haberse descartado'
      ).toBe(false);
    });

    await test.step('Resultado final (1): el almacenamiento queda sin csrf_token ni username', async () => {
      const keys = await getEphemeralStorageKeys(page);
      for (const key of SESSION_STORAGE_KEYS) {
        expect(keys, `No debe quedar la entrada ${key}`).not.toContain(key);
      }
      expect(
        await browserStoresText(page, username),
        'El navegador no debe conservar el nombre de usuario'
      ).toBe(false);
    });

    await test.step('Paso 6: volver a iniciar sesión deja el formulario sin el texto no guardado', async () => {
      await loginPage.loginAndWaitForPortal(username, password);
      await expect(
        page.locator(TasksPage.HEADING_SELECTOR),
        'Debe volver al módulo de tareas'
      ).toBeVisible();
      expect(
        await tasksPage.getSearchValue(),
        'El texto no guardado no debe aparecer en la interfaz'
      ).toBe('');
      expect(
        await browserStoresText(page, UNSAVED_TEXT),
        'El texto no guardado no debe persistir en el navegador'
      ).toBe(false);
    });
  });

  test('TC-007 (paso 5): el login informa que la sesión expiró', async ({
    page,
    context,
  }) => {
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layoutPage = new PortalLayoutPage(page);

    await test.step('Autenticarse y forzar la expiración de la sesión', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await dropBawSessionCookies(context);
      await requestBawFromUi(layoutPage);
    });

    await test.step('Paso 5: tras la redirección se informa que la sesión expiró', async () => {
      await expect(page, 'Debe redirigir al login').toHaveURL(/\/signin/, {
        timeout: REDIRECT_TIMEOUT,
      });
      await expect(
        page.getByText(LoginPage.SESSION_EXPIRED_MESSAGE).first(),
        'Debe informarse que la sesión expiró'
      ).toBeVisible();
    });
  });
});
