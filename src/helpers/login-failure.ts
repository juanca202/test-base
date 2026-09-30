import { Page, Request, Response } from '@playwright/test';
import { BAW_LOGIN_PATH } from './baw-session';

/** Names of the entries every logged-in session keeps in ephemeral storage. */
export const SESSION_STORAGE_KEYS = ['csrf_token', 'username'];

/** Request and response of one login attempt as seen by the browser. */
export interface LoginExchange {
  request: Request;
  response: Response;
}

function isLoginCall(url: string): boolean {
  return new URL(url).pathname.endsWith(BAW_LOGIN_PATH);
}

/**
 * Run a login attempt and capture the call the portal makes to BAW.
 * @param page - Page under test.
 * @param submit - Action that fills and submits the login form.
 */
export async function captureLoginExchange(
  page: Page,
  submit: () => Promise<void>
): Promise<LoginExchange> {
  const responsePromise = page.waitForResponse(
    response =>
      isLoginCall(response.url()) && response.request().method() === 'POST',
    { timeout: 30000 }
  );
  await submit();
  const response = await responsePromise;
  return { request: response.request(), response };
}

/**
 * Keys held by the browser's ephemeral storage (session and local storage).
 * @param page - Page under test.
 */
export async function getEphemeralStorageKeys(page: Page): Promise<string[]> {
  return await page.evaluate(() => [
    ...Object.keys(globalThis.sessionStorage),
    ...Object.keys(globalThis.localStorage),
  ]);
}

/**
 * Whether any value in ephemeral storage or any cookie contains the text.
 * @param page - Page under test.
 * @param text - Text to look for (e.g. a password).
 */
export async function browserStoresText(
  page: Page,
  text: string
): Promise<boolean> {
  const inStorage = await page.evaluate(
    needle =>
      [globalThis.sessionStorage, globalThis.localStorage].some(storage =>
        Object.keys(storage).some(key =>
          (storage.getItem(key) ?? '').includes(needle)
        )
      ),
    text
  );
  const cookies = await page.context().cookies();
  return inStorage || cookies.some(cookie => cookie.value.includes(text));
}
