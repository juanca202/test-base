import { test, expect } from '@playwright/test';
import {
  BAW_USER_TASKS_PATH,
  CSRF_ERROR_NUMBER,
  CSRF_HEADER,
  loginToBaw,
} from '../../../src/helpers/baw-session';

const API_TIMEOUT = 30000;

test.describe('US-001 · AC-002 · Seguridad de la comunicación (API)', () => {
  test('TC-004: debe aceptar una petición autenticada con la cookie de sesión y BPMCSRFToken', async ({
    request,
  }) => {
    // Arrange (precondición de TC-001): sesión iniciada, cookies conservadas por el contexto
    const csrfToken = await loginToBaw(request);

    // Act: operación posterior al login con la cabecera anti-CSRF
    const response = await request.get(BAW_USER_TASKS_PATH, {
      headers: { [CSRF_HEADER]: csrfToken },
      timeout: API_TIMEOUT,
    });

    // Assert (paso 5): BAW la acepta y no reporta un token no verificable
    expect(response.status()).toBe(200);
    expect(response.status()).not.toBe(403);
    expect(await response.text()).not.toContain(CSRF_ERROR_NUMBER);
  });
});
