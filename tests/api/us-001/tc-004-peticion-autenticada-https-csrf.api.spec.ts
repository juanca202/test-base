import { expect, test } from '../../../src/fixtures/test';
import {
  BAW_USER_TASKS_PATH,
  CSRF_ERROR_NUMBER,
  CSRF_HEADER,
  loginToBaw,
} from '../../../src/helpers/baw-session';

test.describe('US-001 · AC-002 · Comunicación con BAW sobre HTTPS con token anti-CSRF', () => {
  test('TC-004: una petición posterior al login viaja por HTTPS con BPMCSRFToken y BAW la acepta con 200', async ({
    request,
  }) => {
    const csrfToken =
      await test.step('Precondición: iniciar sesión en BAW y obtener el csrf_token', () =>
        loginToBaw(request));

    const response =
      await test.step('Pasos 1-3: emitir GET /bpm/user-tasks con la cabecera BPMCSRFToken y la cookie de sesión', () =>
        request.get(BAW_USER_TASKS_PATH, {
          headers: { [CSRF_HEADER]: csrfToken },
          timeout: 30000,
        }));

    await test.step('Paso 4: la petición real se emitió sobre https://', () => {
      expect(
        response.url().startsWith('https://'),
        `La URL de la petición debe usar esquema https, pero fue ${new URL(response.url()).protocol}`
      ).toBe(true);
    });

    await test.step('Paso 5: BAW responde 200 y no rechaza por CSRF (CWTBG0651E)', async () => {
      expect(
        response.status(),
        'BAW debe aceptar la petición autenticada con 200'
      ).toBe(200);
      const body = await response.text();
      expect(
        body,
        `La respuesta no debe contener el error ${CSRF_ERROR_NUMBER}`
      ).not.toContain(CSRF_ERROR_NUMBER);
    });
  });
});
