import { test, expect } from '@playwright/test';
import {
  BAW_USER_TASKS_PATH,
  CSRF_ERROR_NUMBER,
  loginToBaw,
} from '../../../src/helpers/baw-session';

const API_TIMEOUT = 30000;

test.describe('US-001 · AC-002 · Seguridad de la comunicación (API)', () => {
  test('TC-005: should reject with 403 and CWTBG0651E a request that omits BPMCSRFToken', async ({
    request,
  }) => {
    // Arrange (step 1): valid session cookie, deliberately no anti-CSRF header
    await loginToBaw(request);

    // Act (step 2)
    const response = await request.get(BAW_USER_TASKS_PATH, {
      timeout: API_TIMEOUT,
    });

    // Assert (step 3 + final result): 403, not 401, with the CSRF error number
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error_number).toBe(CSRF_ERROR_NUMBER);
    // The session cookie alone does not deliver task data
    expect(body).not.toHaveProperty('items');
  });
});
