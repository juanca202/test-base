import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { acceptanceCriterion } from '../../../src/helpers/traceability';

acceptanceCriterion(
  'US-001: Página principal y navegación',
  'AC-001: El sitio carga y permite navegar entre secciones',
  () => {
    test.beforeEach(async ({ page }) => {
      // Setup that runs before each test
      await page.goto('/');
    });

    test('TC-1001: la página principal carga', async ({ page }) => {
      // Example E2E test - replace with your actual application logic

      // Wait for page to load
      await TestHelpers.waitForNetworkIdle(page);

      // Verify page title
      await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

      // Take screenshot for documentation
      await TestHelpers.takeScreenshot(page, 'homepage-loaded');
    });

    test('TC-1002: el formulario se envía correctamente', async ({ page }) => {
      // Example form testing - customize for your application

      // Generate test data
      const testData = TestHelpers.generateTestData();

      // Note: This is an example - customize selectors for your actual application
      // const formSelector = 'form[data-testid="contact-form"]';

      try {
        // Fill form fields (customize selectors)
        await TestHelpers.fillField(
          page,
          'input[name="email"]',
          testData.email
        );
        await TestHelpers.fillField(
          page,
          'input[name="name"]',
          testData.username
        );

        // Submit form
        await TestHelpers.clickElement(page, 'button[type="submit"]');

        // Verify success message (customize selector)
        await expect(
          page.locator('[data-testid="success-message"]')
        ).toBeVisible({
          timeout: 15000,
        });
      } catch (error) {
        // Take screenshot on failure for debugging
        await TestHelpers.takeScreenshot(page, 'form-submission-failed');
        throw error;
      }
    });

    test('TC-1003: la navegación recorre las secciones principales', async ({
      page,
    }) => {
      // Example navigation testing

      const navigationItems = [
        { selector: '[data-testid="nav-about"]', expectedUrl: '/about' },
        { selector: '[data-testid="nav-services"]', expectedUrl: '/services' },
        { selector: '[data-testid="nav-contact"]', expectedUrl: '/contact' },
      ];

      for (const item of navigationItems) {
        await TestHelpers.clickElement(page, item.selector);
        await expect(page).toHaveURL(new RegExp(item.expectedUrl));
        await TestHelpers.waitForNetworkIdle(page);
      }
    });
  }
);
