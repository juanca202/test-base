import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';

const MODULE_TITLE = 'Mis tareas';

test.describe('US-001 · AC-001 · Autenticación requerida', () => {
  test('TC-002: should redirect to the login without rendering the module when opening a protected URL without session', async ({
    page,
    context,
  }) => {
    // Arrange (step 1): a fresh browser context holds no portal credentials
    expect(await context.cookies()).toHaveLength(0);
    const bawRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/bpm/')) {
        bawRequests.push(request.url());
      }
    });
    const tasksPage = new TasksPage(page);

    // Act (steps 2-3): open the protected module directly by URL
    await tasksPage.goto();

    // Assert (step 4 + final result): the login is shown instead of the module
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.locator(LoginPage.HEADING_SELECTOR)).toBeVisible();
    await expect(page.locator(TasksPage.HEADING_SELECTOR)).toHaveCount(0);
    // Nothing of the module leaks into the rendered HTML, not even hidden
    expect(await page.content()).not.toContain(MODULE_TITLE);
    // No authenticated request reaches BAW
    expect(bawRequests).toHaveLength(0);
  });
});
