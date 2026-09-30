import { expect, test } from '../../../src/fixtures/test';
import { BAW_LOGIN_PATH } from '../../../src/helpers/baw-session';
import { buildInvalidCredentials } from '../../../src/helpers/invalid-credentials';
import {
  browserStoresText,
  captureLoginExchange,
  getEphemeralStorageKeys,
  SESSION_STORAGE_KEYS,
} from '../../../src/helpers/login-failure';
import { hasPortalSession } from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';

/** Text that would reveal technical details or the raw BAW message. */
const TECHNICAL_DETAILS = /401|unauthorized|CWTBG|exception|stack|basic /i;

test.describe('US-001 / AC-001: login con credenciales inválidas (E2E)', () => {
  test('TC-003: el portal muestra un error genérico, permanece en el login y no conserva credenciales', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const messages: string[] = [];

    await test.step('Precondición: usuario sin sesión en la pantalla de login', async () => {
      await loginPage.goto();
      await expect(
        page.locator(LoginPage.HEADING_SELECTOR),
        'Debe mostrarse la pantalla de login'
      ).toBeVisible();
    });

    for (const credentials of buildInvalidCredentials()) {
      await test.step(`Intento con ${credentials.description}`, async () => {
        const { request, response } = await captureLoginExchange(page, () =>
          loginPage.login(credentials.username, credentials.password)
        );

        expect(
          new URL(request.url()).pathname.endsWith(BAW_LOGIN_PATH),
          `El portal debe invocar POST ${BAW_LOGIN_PATH}`
        ).toBe(true);
        expect(
          request.headers()['authorization'],
          'La petición debe usar autenticación Basic'
        ).toMatch(/^Basic /);
        expect(
          response.status(),
          'BAW debe responder 401 a las credenciales inválidas'
        ).toBe(401);

        const storageKeys = await getEphemeralStorageKeys(page);
        for (const key of SESSION_STORAGE_KEYS) {
          expect(
            storageKeys,
            `El almacenamiento efímero no debe contener ${key}`
          ).not.toContain(key);
        }

        const message = await loginPage.getErrorMessage();
        expect(message, 'Debe mostrarse un mensaje de error visible').not.toBe(
          ''
        );
        expect(
          message,
          'El mensaje no debe exponer detalles técnicos ni el mensaje crudo de BAW'
        ).not.toMatch(TECHNICAL_DETAILS);
        messages.push(message);

        await expect(
          page.locator(LoginPage.HEADING_SELECTOR),
          'El usuario debe permanecer en la pantalla de login'
        ).toBeVisible();
        expect(
          await loginPage.getPasswordValue(),
          'El campo de contraseña debe quedar vacío'
        ).toBe('');
        expect(
          await browserStoresText(page, credentials.password),
          'El navegador no debe conservar la contraseña'
        ).toBe(false);
        expect(
          await hasPortalSession(page.context()),
          'La sesión no debe marcarse como iniciada'
        ).toBe(false);
      });
    }

    await test.step('Comprobar que el mensaje es idéntico y no revela si el usuario existe', async () => {
      const [wrongPasswordMessage, unknownUserMessage] = messages;
      expect(
        unknownUserMessage,
        'El mensaje debe ser el mismo para usuario inexistente y contraseña incorrecta'
      ).toBe(wrongPasswordMessage);
    });
  });
});
