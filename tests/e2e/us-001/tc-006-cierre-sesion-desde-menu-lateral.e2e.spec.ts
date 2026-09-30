import { expect, test } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import {
  getEphemeralStorageKeys,
  SESSION_STORAGE_KEYS,
} from '../../../src/helpers/login-failure';
import { hasPortalSession } from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { PortalLayoutPage } from '../../../src/pages/PortalLayoutPage';

const ORIGIN_MODULE = 'Procesos';

test.describe('US-001 / AC-003: cierre de sesión local (E2E)', () => {
  test('TC-006: el cierre de sesión descarta las credenciales locales, redirige al login y no llama a BAW', async ({
    page,
    context,
  }) => {
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layout = new PortalLayoutPage(page);
    const bawRequests: string[] = [];
    let loggingOut = false;

    await test.step('Precondición: usuario autenticado en un módulo distinto del inicial', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await layout.openModule(ORIGIN_MODULE);
      await expect(page, 'Debe estar en el módulo Procesos').toHaveURL(
        /\/processes/
      );
      // The module loads its data late: wait for it so its calls do not count as logout traffic
      await expect(
        page.locator('td').first(),
        'El módulo debe haber cargado sus datos'
      ).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(
        await hasPortalSession(context),
        'La sesión del portal debe estar activa antes del cierre'
      ).toBe(true);
    });

    await test.step('Paso 3: comenzar a registrar el tráfico hacia BAW', async () => {
      page.on('request', request => {
        if (loggingOut && request.url().includes('/bpm/')) {
          bawRequests.push(`${request.method()} ${request.url()}`);
        }
      });
    });

    await test.step('Paso 4: activar «Cerrar sesión» (menú de usuario, adaptado del pie del menú lateral)', async () => {
      await layout.openUserMenu();
      loggingOut = true;
      await layout.clickLogout();
    });

    await test.step('Paso 6: el navegador queda en la pantalla de login', async () => {
      await expect(page, 'La URL debe ser la del login').toHaveURL(/\/signin/);
      await expect(
        page.locator(LoginPage.HEADING_SELECTOR),
        'Debe mostrarse el encabezado del login'
      ).toBeVisible();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Paso 5: se descartan las credenciales locales', async () => {
      const storageKeys = await getEphemeralStorageKeys(page);
      for (const key of SESSION_STORAGE_KEYS) {
        expect(
          storageKeys,
          `El almacenamiento efímero no debe contener ${key}`
        ).not.toContain(key);
      }
      expect(
        await hasPortalSession(context),
        'La cookie de sesión del portal debe haberse descartado'
      ).toBe(false);
    });

    await test.step('Paso 4 (resultado): el cierre no emitió ninguna petición a BAW', async () => {
      expect(
        bawRequests,
        'No debe emitirse ninguna petición a BAW durante el cierre de sesión'
      ).toHaveLength(0);
    });

    await test.step('Paso 7: retroceder no devuelve al módulo protegido', async () => {
      await page.goBack();
      await expect(
        page,
        'El sistema debe redirigir de nuevo al login'
      ).toHaveURL(/\/signin/);
      await expect(
        page.locator(LoginPage.HEADING_SELECTOR),
        'Debe mostrarse el login'
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: ORIGIN_MODULE, level: 1 }),
        'No debe mostrarse contenido del módulo'
      ).toHaveCount(0);
      await expect(
        page.locator('td'),
        'No debe renderizarse ningún dato de negocio'
      ).toHaveCount(0);
    });
  });

  test('TC-006 (pasos 1-2): el pie del menú lateral muestra el botón de cierre de sesión, también con el menú colapsado', async ({
    page,
  }) => {
    // Hallazgo: el portal no tiene menú lateral; la navegación es un tablist en el encabezado
    // y «Cerrar sesión» vive en el menú de usuario del encabezado.
    test.fixme(
      true,
      'TC-006 pasos 1-2: esperado botón .sidebar__logout en el pie de un menú lateral colapsable · observado: no existe menú lateral; el cierre está en el menú de usuario del encabezado'
    );
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layout = new PortalLayoutPage(page);

    await test.step('Precondición: autenticado y en otro módulo', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await layout.openModule(ORIGIN_MODULE);
    });

    await test.step('Paso 1: el pie del menú lateral muestra el botón «Cerrar sesión»', async () => {
      const logoutButton = page.locator(
        PortalLayoutPage.SIDEBAR_LOGOUT_SELECTOR
      );
      await expect(
        logoutButton,
        'El botón de cierre de sesión debe estar visible en el pie del menú lateral'
      ).toBeVisible();
      await expect(
        logoutButton,
        'El botón debe mostrar el texto «Cerrar sesión»'
      ).toContainText('Cerrar sesión');
    });

    await test.step('Paso 2: con el menú colapsado el botón sigue visible, solo con icono', async () => {
      await page.locator(PortalLayoutPage.SIDEBAR_COLLAPSE_SELECTOR).click();
      const logoutButton = page.locator(
        PortalLayoutPage.SIDEBAR_LOGOUT_SELECTOR
      );
      await expect(
        logoutButton,
        'El botón debe seguir visible con el menú colapsado'
      ).toBeVisible();
      await expect(
        logoutButton.getByText('Cerrar sesión'),
        'La etiqueta de texto debe quedar oculta'
      ).toBeHidden();
    });
  });
});
