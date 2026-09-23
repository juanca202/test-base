import { APIRequestContext, expect } from '@playwright/test';
import { getBawCredentials, toBasicAuthHeader } from '../config/env';

/** Path of the BAW login operation. */
export const BAW_LOGIN_PATH = '/bpm/system/login';

/** Path of a representative BAW operation that requires an authenticated session. */
export const BAW_USER_TASKS_PATH = '/bpm/user-tasks';

/** Header BAW requires on every request after the login. */
export const CSRF_HEADER = 'BPMCSRFToken';

/** BAW error number returned when the anti-CSRF token cannot be verified. */
export const CSRF_ERROR_NUMBER = 'CWTBG0651E';

const API_TIMEOUT = 30000;

/**
 * Log in to BAW with the environment credentials. The session cookies stay in
 * the `APIRequestContext`, so later requests of the same context reuse them.
 * @param request - API context of the test.
 * @returns The `csrf_token` issued by BAW.
 */
export async function loginToBaw(request: APIRequestContext): Promise<string> {
  const response = await request.post(BAW_LOGIN_PATH, {
    headers: { Authorization: toBasicAuthHeader(getBawCredentials()) },
    data: { refresh_groups: true, requested_lifetime: 7200 },
    timeout: API_TIMEOUT,
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(typeof body.csrf_token).toBe('string');
  return body.csrf_token;
}
