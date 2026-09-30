import { test, expect } from '../../../src/fixtures/test';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';
import { hasPortalSession } from '../../../src/helpers/portal-session';

const MODULE_TITLE = 'Mis tareas';

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-002: debe redirigir al login sin renderizar el módulo al abrir una URL protegida sin sesión', async ({
    page,
    context,
  }) => {
    const bawRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/bpm/')) {
        bawRequests.push(request.url());
      }
    });
    const tasksPage = new TasksPage(page);

    await test.step('Paso 1: verificar que el navegador no tiene credenciales del portal', async () => {
      expect(
        await context.cookies(),
        'El contexto nuevo no debe tener cookies'
      ).toHaveLength(0);
      expect(
        await hasPortalSession(context),
        'No debe existir la sesión del portal'
      ).toBe(false);
    });

    await test.step('Pasos 2-3: abrir directamente la URL del módulo protegido', async () => {
      await tasksPage.goto();
    });

    await test.step('Paso 4: el navegador queda en la pantalla de login', async () => {
      await expect(page, 'La URL debe ser la del login').toHaveURL(/\/signin/);
      await expect(
        page.locator(LoginPage.HEADING_SELECTOR),
        'Debe mostrarse el encabezado del login'
      ).toBeVisible();
      expect(
        new URL(page.url()).pathname,
        'La URL no debe corresponder al módulo solicitado'
      ).not.toBe(TasksPage.PATH);
    });

    await test.step('Resultado final: no se filtra el módulo ni se llama a BAW', async () => {
      await expect(
        page.locator(TasksPage.HEADING_SELECTOR),
        'El encabezado del módulo no debe renderizarse'
      ).toHaveCount(0);
      expect(
        await page.content(),
        'El HTML renderizado no debe contener el módulo protegido'
      ).not.toContain(MODULE_TITLE);
      expect(
        bawRequests,
        'No debe emitirse ninguna petición a BAW'
      ).toHaveLength(0);
    });
  });
});
