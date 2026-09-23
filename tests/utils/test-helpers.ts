import { Page, expect, Locator } from '@playwright/test';

/**
 * Collection of utility functions for Playwright tests
 */
export class TestHelpers {
  /**
   * Wait for element to be visible and enabled
   */
  static async waitForElement(
    page: Page,
    selector: string,
    timeout = 10000
  ): Promise<Locator> {
    const element = page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    await expect(element).toBeEnabled({ timeout });
    return element;
  }

  /**
   * Fill form field with validation
   */
  static async fillField(
    page: Page,
    selector: string,
    value: string
  ): Promise<void> {
    const field = await this.waitForElement(page, selector);
    await field.clear();
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  /**
   * Click element with retry logic
   */
  static async clickElement(
    page: Page,
    selector: string,
    retries = 3
  ): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        const element = await this.waitForElement(page, selector);
        await element.click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Generate random test data
   */
  static generateTestData() {
    const timestamp = Date.now();
    return {
      email: `test.user.${timestamp}@example.com`,
      username: `testuser${timestamp}`,
      randomString: Math.random().toString(36).substring(7),
      randomNumber: Math.floor(Math.random() * 10000),
    };
  }

  /**
   * Wait for network requests to complete
   */
  static async waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }
}

/**
 * API Testing utilities
 */
export class ApiHelpers {
  /**
   * Make authenticated API request
   */
  static async makeAuthenticatedRequest(
    page: Page,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options: any = {}
  ) {
    const token = process.env.API_TOKEN || '';

    const requestOptions = {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    switch (method) {
      case 'GET':
        return await page.request.get(url, requestOptions);
      case 'POST':
        return await page.request.post(url, requestOptions);
      case 'PUT':
        return await page.request.put(url, requestOptions);
      case 'DELETE':
        return await page.request.delete(url, requestOptions);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  /**
   * Validate API response structure
   */
  static validateApiResponse(response: any, expectedStructure: any): void {
    for (const key in expectedStructure) {
      expect(response).toHaveProperty(key);
      if (
        typeof expectedStructure[key] === 'object' &&
        expectedStructure[key] !== null
      ) {
        this.validateApiResponse(response[key], expectedStructure[key]);
      }
    }
  }
}
