import { test, expect } from '@playwright/test';
import {
  BAW_USER_TASKS_PATH,
  CSRF_ERROR_NUMBER,
  CSRF_HEADER,
  loginToBaw,
} from '../../../src/helpers/baw-session';

const API_TIMEOUT = 30000;

test.describe('US-001 · AC-002 · Seguridad de la comunicación (API)', () => {
  test('TC-004: should accept an authenticated request carrying the session cookie and BPMCSRFToken', async ({
    request,
  }) => {
    // Arrange (TC-001 precondition): logged in, cookies kept by the context
    const csrfToken = await loginToBaw(request);

    // Act: post-login operation with the anti-CSRF header
    const response = await request.get(BAW_USER_TASKS_PATH, {
      headers: { [CSRF_HEADER]: csrfToken },
      timeout: API_TIMEOUT,
    });

    // Assert (step 5): BAW accepts it and does not report an unverifiable token
    expect(response.status()).toBe(200);
    expect(response.status()).not.toBe(403);
    expect(await response.text()).not.toContain(CSRF_ERROR_NUMBER);
  });
});
