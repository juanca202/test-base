import { expect, test } from '../../../src/fixtures/test';
import {
  BAW_USER_TASKS_PATH,
  CSRF_ERROR_NUMBER,
  loginToBaw,
} from '../../../src/helpers/baw-session';

test.describe('US-001 · AC-002 · Petición sin token anti-CSRF', () => {
  test('TC-005: BAW rechaza con 403 y CWTBG0651E una petición con cookie de sesión válida pero sin BPMCSRFToken', async ({
    request,
  }) => {
    await test.step('Paso 1: iniciar sesión en BAW y conservar la cookie de sesión', async () => {
      await loginToBaw(request);
    });

    const response =
      await test.step('Paso 2: emitir GET /bpm/user-tasks con la cookie de sesión y sin la cabecera BPMCSRFToken', () =>
        request.get(BAW_USER_TASKS_PATH, { timeout: 30000 }));

    await test.step('Paso 3: BAW responde 403 con error_number CWTBG0651E y sin datos de tareas', async () => {
      expect(
        response.status(),
        'BAW debe rechazar la petición sin token anti-CSRF con 403, no con 401'
      ).toBe(403);
      const body = await response.json();
      expect(
        body.error_number,
        'El cuerpo debe informar el error CWTBG0651E'
      ).toBe(CSRF_ERROR_NUMBER);
      expect(
        JSON.stringify(body),
        'La respuesta no debe incluir datos de tareas'
      ).not.toContain('"items"');
    });
  });

  // Hallazgo TC-005: BAW devuelve error_number en la raíz del cuerpo; el TC documenta un cuerpo `exception`.
  test.fixme('TC-005: el cuerpo del 403 se envuelve en un objeto exception con error_number CWTBG0651E', async ({
    request,
  }) => {
    await loginToBaw(request);
    const response = await request.get(BAW_USER_TASKS_PATH, {
      timeout: 30000,
    });

    await test.step('Paso 3: el cuerpo contiene un objeto exception con el error_number', async () => {
      const body = await response.json();
      expect(
        body.exception?.error_number,
        'El cuerpo exception debe informar el error CWTBG0651E'
      ).toBe(CSRF_ERROR_NUMBER);
    });
  });
});
