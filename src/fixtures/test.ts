import {
  APIRequestContext,
  APIResponse,
  test as base,
  TestInfo,
} from '@playwright/test';

export { expect } from '@playwright/test';

/** Value that replaces every sensitive header or token in the attached evidence. */
export const MASK = '***';

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie'];
const SENSITIVE_BODY_KEYS =
  /("(?:[a-z_]*token[a-z_]*|password)"\s*:\s*)"[^"]*"/gi;
const REQUEST_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'fetch',
];

type Headers = Record<string, string>;

/**
 * Copy the headers hiding the ones that carry credentials or tokens.
 * @param headers - Headers as sent or received.
 */
export function maskHeaders(headers: Headers): Headers {
  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => {
      const lower = name.toLowerCase();
      const sensitive =
        SENSITIVE_HEADERS.includes(lower) || lower.includes('token');
      return [name, sensitive ? MASK : value];
    })
  );
}

/**
 * Hide the value of token and password fields of a JSON body.
 * @param body - Body as text.
 */
export function maskBody(body: string): string {
  return body.replace(SENSITIVE_BODY_KEYS, `$1"${MASK}"`);
}

function serializeRequestBody(options?: Record<string, unknown>): string {
  if (!options) {
    return '';
  }
  const raw = options.data ?? options.form ?? options.multipart;
  if (raw === undefined) {
    return '';
  }
  return maskBody(typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2));
}

async function attachJson(
  testInfo: TestInfo,
  name: string,
  body: string
): Promise<void> {
  await testInfo.attach(name, { body, contentType: 'application/json' });
}

/**
 * Wrap an API context so every request and response is attached to the test
 * result, pass or fail, with sensitive headers and tokens masked (ADR-007).
 */
function withEvidence(
  request: APIRequestContext,
  testInfo: TestInfo
): APIRequestContext {
  let sequence = 0;
  return new Proxy(request, {
    get(target, property, receiver) {
      const original = Reflect.get(target, property, receiver);
      if (
        typeof property !== 'string' ||
        !REQUEST_METHODS.includes(property) ||
        typeof original !== 'function'
      ) {
        return typeof original === 'function'
          ? original.bind(target)
          : original;
      }
      return async (url: string, options?: Record<string, unknown>) => {
        const label = `${++sequence}. ${property.toUpperCase()} ${url}`;
        const requestHeaders = (options?.headers ?? {}) as Headers;
        const response: APIResponse = await original.call(target, url, options);
        await attachJson(
          testInfo,
          `${label} — request`,
          JSON.stringify(
            {
              method: property.toUpperCase(),
              url,
              headers: maskHeaders(requestHeaders),
              body: serializeRequestBody(options),
            },
            null,
            2
          )
        );
        await attachJson(
          testInfo,
          `${label} — response`,
          JSON.stringify(
            {
              status: response.status(),
              headers: maskHeaders(response.headers()),
              body: maskBody(await response.text().catch(() => '')),
            },
            null,
            2
          )
        );
        return response;
      };
    },
  });
}

/**
 * `test` of the project. The `request` fixture attaches request and response
 * of every API call as evidence; the rest of the fixtures are Playwright's.
 */
export const test = base.extend({
  request: async ({ request }, use, testInfo) => {
    await use(withEvidence(request, testInfo));
  },
});
