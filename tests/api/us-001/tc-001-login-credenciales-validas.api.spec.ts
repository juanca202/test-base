import { test, expect } from '../../../src/fixtures/test';
import { getBawCredentials, toBasicAuthHeader } from '../../../src/config/env';
import { BAW_LOGIN_PATH } from '../../../src/helpers/baw-session';

const API_TIMEOUT = 30000;

test.describe('US-001 · AC-001 · Autenticación requerida (API)', () => {
  test('TC-001: debe responder 201 con csrf_token y cookie de sesión con credenciales válidas', async ({
    request,
  }) => {
    // Arrange
    const authorization = toBasicAuthHeader(getBawCredentials());

    // Act
    const response =
      await test.step('Pasos 2-3: invocar POST /bpm/system/login con Authorization Basic', async () =>
        await request.post(BAW_LOGIN_PATH, {
          headers: { Authorization: authorization },
          data: { refresh_groups: true, requested_lifetime: 7200 },
          timeout: API_TIMEOUT,
        }));

    // Assert
    await test.step('BAW responde 201 con csrf_token y cookie de sesión', async () => {
      expect(response.status(), 'El login válido debe responder 201').toBe(201);
      const body = await response.json();
      expect(
        typeof body.csrf_token,
        'El cuerpo debe incluir csrf_token como cadena'
      ).toBe('string');
      expect(
        body.csrf_token.length,
        'csrf_token no debe estar vacío'
      ).toBeGreaterThan(0);
      const sessionCookies = response
        .headersArray()
        .filter(header => header.name.toLowerCase() === 'set-cookie');
      expect(
        sessionCookies.length,
        'La respuesta debe establecer la cookie de sesión de BAW'
      ).toBeGreaterThan(0);
    });
  });
});
