import { test, expect } from '@playwright/test';
import { getBawCredentials, toBasicAuthHeader } from '../../../src/config/env';

const LOGIN_PATH = '/bpm/system/login';
const API_TIMEOUT = 30000;
const WRONG_PASSWORD = 'clave-incorrecta-tc003';
const UNKNOWN_USER = 'usuario.inexistente.tc003';

test.describe('US-001 · AC-001 · Autenticación requerida (API)', () => {
  test('TC-003: should answer 401 without csrf_token or session cookie for invalid credentials', async ({
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

      // Assert: same rejection for wrong password and unknown user
      expect(response.status()).toBe(401);
      const setCookies = response
        .headersArray()
        .filter(header => header.name.toLowerCase() === 'set-cookie');
      expect(setCookies).toHaveLength(0);
      expect(await response.text()).not.toContain('csrf_token');
    }
  });
});
