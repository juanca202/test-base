import { test, expect } from '@playwright/test';
import { getBawCredentials, toBasicAuthHeader } from '../../../src/config/env';

const LOGIN_PATH = '/bpm/system/login';
const API_TIMEOUT = 30000;

test.describe('US-001 · AC-001 · Autenticación requerida (API)', () => {
  test('TC-001: debe responder 201 con csrf_token y cookie de sesión para credenciales válidas', async ({
    request,
  }) => {
    // Arrange
    const authorization = toBasicAuthHeader(getBawCredentials());

    // Act
    const response = await request.post(LOGIN_PATH, {
      headers: { Authorization: authorization },
      data: { refresh_groups: true, requested_lifetime: 7200 },
      timeout: API_TIMEOUT,
    });

    // Assert
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(typeof body.csrf_token).toBe('string');
    expect(body.csrf_token.length).toBeGreaterThan(0);
    const setCookies = response
      .headersArray()
      .filter(header => header.name.toLowerCase() === 'set-cookie');
    expect(setCookies.length).toBeGreaterThan(0);
  });
});
