import { expect, test } from '../../../src/fixtures/test';
import { toBasicAuthHeader } from '../../../src/config/env';
import { BAW_LOGIN_PATH } from '../../../src/helpers/baw-session';
import { buildInvalidCredentials } from '../../../src/helpers/invalid-credentials';

const API_TIMEOUT = 30000;

test.describe('US-001 / AC-001: login con credenciales inválidas (API)', () => {
  test('TC-003: BAW rechaza con 401 sin emitir sesión y sin distinguir usuario inexistente de contraseña incorrecta', async ({
    request,
  }) => {
    const rejections: { description: string; status: number; body: string }[] =
      [];

    for (const credentials of buildInvalidCredentials()) {
      await test.step(`Enviar POST ${BAW_LOGIN_PATH} con Basic auth: ${credentials.description}`, async () => {
        const response = await request.post(BAW_LOGIN_PATH, {
          headers: { Authorization: toBasicAuthHeader(credentials) },
          data: { refresh_groups: true, requested_lifetime: 7200 },
          timeout: API_TIMEOUT,
        });
        const body = await response.text();

        expect(
          response.status(),
          `BAW debe responder 401 ante ${credentials.description}`
        ).toBe(401);
        expect(
          body,
          'La respuesta de error no debe traer csrf_token'
        ).not.toContain('csrf_token');
        expect(
          response.headers()['set-cookie'] ?? '',
          'La respuesta no debe emitir cookies de sesión'
        ).not.toMatch(/LtpaToken2|JSESSIONID/);
        rejections.push({
          description: credentials.description,
          status: response.status(),
          body,
        });
      });
    }

    await test.step('Comprobar que ambas respuestas son idénticas y no revelan si el usuario existe', async () => {
      const [wrongPassword, unknownUser] = rejections;
      expect(
        unknownUser.status,
        'El código de estado debe ser el mismo para ambas variantes'
      ).toBe(wrongPassword.status);
      expect(
        unknownUser.body,
        'El cuerpo de error debe ser el mismo para ambas variantes'
      ).toBe(wrongPassword.body);
    });
  });
});
