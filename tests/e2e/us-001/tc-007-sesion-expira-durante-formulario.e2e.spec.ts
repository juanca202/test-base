import { test, expect } from '@playwright/test';
import { getBawCredentials } from '../../../src/config/env';
import {
  dropBawSessionCookies,
  hasPortalSession,
} from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { PortalLayoutPage } from '../../../src/pages/PortalLayoutPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const UNSAVED_TEXT = 'Borrador sin guardar 2026-09-11';
const EXPIRY_NOTICE = /sesión ha expirado/i;

test.describe('US-001 · AC-004 · Sesión inválida o expirada', () => {
  test('TC-007: debe redirigir al login con un aviso de expiración y perder lo no guardado', async ({
    page,
    context,
  }) => {
    // Pasos 1-2: autenticado, con texto sin guardar en un campo editable
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const tasksPage = new TasksPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForPortal(username, password);
    await tasksPage.fillSearch(UNSAVED_TEXT);
    expect(await tasksPage.getSearchValue()).toBe(UNSAVED_TEXT);

    // Paso 3: la sesión deja de ser válida mientras la vista sigue abierta
    await dropBawSessionCookies(context);

    // Paso 4: una acción que requiere BAW (cambio de módulo) recibe un rechazo
    await new PortalLayoutPage(page).openModule('Procesos');

    // Paso 5: aviso de expiración, credenciales locales descartadas, pantalla de login mostrada
    await expect(page.getByText(EXPIRY_NOTICE)).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    expect(await hasPortalSession(context)).toBe(false);

    // Paso 6: al iniciar sesión de nuevo, el texto no guardado ya no está
    await loginPage.loginAndWaitForPortal(username, password);
    expect(await tasksPage.getSearchValue()).toBe('');
  });
});
