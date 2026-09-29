import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const MODULE_TITLE = 'Mis tareas';

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-002: debe redirigir al login sin renderizar el módulo al abrir una URL protegida sin sesión', async ({
    page,
    context,
  }) => {
    // Arrange (paso 1): un contexto de navegador nuevo no contiene credenciales del portal
    expect(await context.cookies()).toHaveLength(0);
    const bawRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/bpm/')) {
        bawRequests.push(request.url());
      }
    });
    const tasksPage = new TasksPage(page);

    // Act (pasos 2-3): abrir el módulo protegido directamente por URL
    await tasksPage.goto();

    // Assert (paso 4 + resultado final): se muestra el login en lugar del módulo
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
    // Nada del módulo se filtra al HTML renderizado, ni siquiera oculto
    expect(await page.content()).not.toContain(MODULE_TITLE);
    // Ninguna petición autenticada llega a BAW
    expect(bawRequests).toHaveLength(0);
  });
});
