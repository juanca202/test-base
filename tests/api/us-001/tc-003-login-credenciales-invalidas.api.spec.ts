import { test, expect } from '@playwright/test';
import { getBawCredentials, toBasicAuthHeader } from '../../../src/config/env';

const LOGIN_PATH = '/bpm/system/login';
const API_TIMEOUT = 30000;
const WRONG_PASSWORD = 'clave-incorrecta-tc003';
const UNKNOWN_USER = 'usuario.inexistente.tc003';

test.describe('US-001 · AC-001 · Autenticación requerida (API)', () => {
  test('TC-003: debe responder 401 sin csrf_token ni cookie de sesión para credenciales inválidas', async ({
    request,
  }) => {
    const { username } = getBawCredentials();
    const attempts = [
      { username, password: WRONG_PASSWORD },
      { username: UNKNOWN_USER, password: WRONG_PASSWORD },
    ];

    for (const credentials of attempts) {
      // Act
      const response = await request.post(LOGIN_PATH, {
        headers: { Authorization: toBasicAuthHeader(credentials) },
        data: { refresh_groups: true, requested_lifetime: 7200 },
        timeout: API_TIMEOUT,
      });

      // Assert: mismo rechazo para contraseña incorrecta y usuario inexistente
      expect(response.status()).toBe(401);
      const setCookies = response
        .headersArray()
        .filter(header => header.name.toLowerCase() === 'set-cookie');
      expect(setCookies).toHaveLength(0);
      expect(await response.text()).not.toContain('csrf_token');
    }
  });
});
