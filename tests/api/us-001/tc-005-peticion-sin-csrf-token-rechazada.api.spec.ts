import { test, expect } from '@playwright/test';
import {
  BAW_USER_TASKS_PATH,
  CSRF_ERROR_NUMBER,
  loginToBaw,
} from '../../../src/helpers/baw-session';

const API_TIMEOUT = 30000;

test.describe('US-001 · AC-002 · Seguridad de la comunicación (API)', () => {
  test('TC-005: debe rechazar con 403 y CWTBG0651E una petición que omite BPMCSRFToken', async ({
    request,
  }) => {
    // Arrange (paso 1): cookie de sesión válida, deliberadamente sin cabecera anti-CSRF
    await loginToBaw(request);

    // Act (paso 2)
    const response = await request.get(BAW_USER_TASKS_PATH, {
      timeout: API_TIMEOUT,
    });

    // Assert (paso 3 + resultado final): 403, no 401, con el número de error CSRF
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error_number).toBe(CSRF_ERROR_NUMBER);
    // La cookie de sesión por sí sola no entrega datos de tareas
    expect(body).not.toHaveProperty('items');
  });
});
