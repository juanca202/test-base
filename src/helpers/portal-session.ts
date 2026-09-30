import { BrowserContext, Page } from '@playwright/test';

/** Cookie where the portal keeps its own session; it disappears on logout/expiry. */
export const PORTAL_SESSION_COOKIE = 'baw_sess';

/** Cookies issued by BAW at login; dropping them makes BAW reject the session. */
export const BAW_SESSION_COOKIE_NAMES = [
  'LtpaToken2',
  'JSESSIONID',
  'XSRF-TOKEN',
];

/**
 * Whether the browser context still holds the portal session credentials.
 * @param context - Browser context under test.
 */
export async function hasPortalSession(
  context: BrowserContext
): Promise<boolean> {
  const cookies = await context.cookies();
  return cookies.some(cookie => cookie.name === PORTAL_SESSION_COOKIE);
}

/**
 * Invalidate the session on the BAW side while the portal still believes it is
 * logged in: removes only the BAW cookies and keeps the portal's own session.
 * @param context - Browser context under test.
 */
export async function dropBawSessionCookies(
  context: BrowserContext
): Promise<void> {
  for (const name of BAW_SESSION_COOKIE_NAMES) {
    await context.clearCookies({ name });
  }
}

/** Browser-side script: flags the window as soon as a table cell is rendered. */
const BUSINESS_DATA_WATCHER = `
  window.__businessDataRendered = false;
  new MutationObserver(() => {
    if (document.querySelector('td')) {
      window.__businessDataRendered = true;
    }
  }).observe(document, { childList: true, subtree: true });
`;

/**
 * Start watching the DOM so a later check can tell whether any business data
 * (a table cell) was rendered at any moment, even transiently.
 * Call it before navigating.
 * @param page - Page under test.
 */
export async function trackBusinessDataRendering(page: Page): Promise<void> {
  await page.addInitScript(BUSINESS_DATA_WATCHER);
}

/**
 * Whether business data was rendered since {@link trackBusinessDataRendering}.
 * @param page - Page under test.
 */
export async function wasBusinessDataRendered(page: Page): Promise<boolean> {
  return (
    (await page.evaluate('window.__businessDataRendered === true')) === true
  );
}
