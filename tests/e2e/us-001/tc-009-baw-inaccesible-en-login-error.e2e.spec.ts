import type { Route } from '@playwright/test';
import { expect, test } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import { BAW_LOGIN_PATH } from '../../../src/helpers/baw-session';
import { buildInvalidCredentials } from '../../../src/helpers/invalid-credentials';
import {
  getEphemeralStorageKeys,
  SESSION_STORAGE_KEYS,
} from '../../../src/helpers/login-failure';
import { hasPortalSession } from '../../../src/helpers/portal-session';
import { LoginPage } from '../../../src/pages/LoginPage';
import { TasksPage } from '../../../src/pages/TasksPage';

/** Text that would reveal technical details of the failed communication. */
const TECHNICAL_DETAILS =
  /500|502|503|504|timeout|timed out|network|fetch|econn|exception|stack|internal server/i;
/** Wording that tells the user the service cannot be reached. */
const UNAVAILABLE_MESSAGE =
  /no se pudo conectar|no está disponible|indisponible/i;
const LOGIN_ROUTE = `**${BAW_LOGIN_PATH}`;
const PORTAL_TIMEOUT = 30000;

/** Ways of making BAW unreachable without waiting for a real timeout. */
const OUTAGE_VARIANTS = [
  {
    name: 'error de red',
    simulate: (route: Route) => route.abort('connectionrefused'),
  },
  {
    name: 'tiempo de espera agotado',
    simulate: (route: Route) => route.abort('timedout'),
  },
  {
    name: 'respuesta 500',
    simulate: (route: Route) =>
      route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error',
      }),
  },
];

test.describe('US-001 / AC-005: BAW inaccesible durante el login (E2E)', () => {
  for (const variant of OUTAGE_VARIANTS) {
    test(`TC-009: con BAW inaccesible (${variant.name}) el portal informa la indisponibilidad, no inicia sesión y permite reintentar`, async ({
      page,
      context,
    }) => {
      const { username, password } = getBawCredentials();
      const loginPage = new LoginPage(page);
      let loginAttempts = 0;

      await test.step('Precondición: usuario sin sesión en la pantalla de login', async () => {
        await loginPage.goto();
        await expect(
          page.locator(LoginPage.HEADING_SELECTOR),
          'Debe mostrarse la pantalla de login'
        ).toBeVisible();
      });

      let credentialsMessage = '';
      await test.step('Referencia: mensaje que el portal muestra ante credenciales inválidas', async () => {
        const [invalid] = buildInvalidCredentials();
        await loginPage.login(invalid.username, invalid.password);
        await expect(
          page.getByRole('alert'),
          'Debe mostrarse el error de credenciales'
        ).toBeVisible({ timeout: PORTAL_TIMEOUT });
        credentialsMessage = await loginPage.getErrorMessage();
        // Reload so the reference alert cannot be mistaken for the outage one.
        await loginPage.goto();
        await expect(
          page.getByRole('alert'),
          'El error de referencia no debe persistir tras recargar'
        ).toHaveCount(0);
      });

      await test.step('Paso 1: dejar BAW inaccesible interceptando POST /bpm/system/login', async () => {
        await page.route(LOGIN_ROUTE, route => {
          loginAttempts += 1;
          return variant.simulate(route);
        });
      });

      await test.step('Paso 2: enviar credenciales válidas', async () => {
        await loginPage.login(username, password);
        await expect
          .poll(() => loginAttempts, {
            message: 'El portal debe invocar POST /bpm/system/login',
            timeout: PORTAL_TIMEOUT,
          })
          .toBe(1);
      });

      await test.step('Paso 3: mensaje claro de indisponibilidad, sin trazas técnicas', async () => {
        await expect(
          page.getByRole('alert'),
          'Debe mostrarse un mensaje de error visible'
        ).toBeVisible({ timeout: PORTAL_TIMEOUT });
        const message = await loginPage.getErrorMessage();
        expect(
          message,
          'El mensaje debe indicar que el servicio no está disponible'
        ).toMatch(UNAVAILABLE_MESSAGE);
        expect(
          message,
          'El mensaje no debe exponer detalles técnicos'
        ).not.toMatch(TECHNICAL_DETAILS);
        expect(
          message,
          'El mensaje debe distinguirse del de credenciales inválidas'
        ).not.toBe(credentialsMessage);
        test.info().annotations.push({
          type: `mensaje (${variant.name})`,
          description: message,
        });
      });

      await test.step('Paso 4: el login sigue operativo sin recargar la página', async () => {
        await expect(
          page.locator(LoginPage.HEADING_SELECTOR),
          'El usuario debe permanecer en la pantalla de login'
        ).toBeVisible();
        await expect(page, 'La URL debe seguir siendo /signin').toHaveURL(
          /\/signin/
        );
        await expect(
          page.locator(LoginPage.SUBMIT_SELECTOR),
          'El botón de envío debe seguir habilitado para reintentar'
        ).toBeEnabled();
      });

      await test.step('Paso 5: la sesión no figura como iniciada', async () => {
        const storageKeys = await getEphemeralStorageKeys(page);
        for (const key of SESSION_STORAGE_KEYS) {
          expect(
            storageKeys,
            `El almacenamiento efímero no debe contener ${key}`
          ).not.toContain(key);
        }
        expect(
          await hasPortalSession(context),
          'La sesión del portal no debe marcarse como iniciada'
        ).toBe(false);
      });

      await test.step('Paso 6: abrir por URL un módulo protegido devuelve al login', async () => {
        await page.goto(TasksPage.PATH);
        await expect(page, 'El navegador debe quedar en el login').toHaveURL(
          /\/signin/,
          { timeout: PORTAL_TIMEOUT }
        );
        await expect(
          page.locator(LoginPage.HEADING_SELECTOR),
          'Debe mostrarse el login'
        ).toBeVisible();
      });

      await test.step('Paso 7: restablecido BAW, el mismo usuario reintenta y accede al módulo inicial', async () => {
        await page.unroute(LOGIN_ROUTE);
        await loginPage.loginAndWaitForPortal(username, password);
        await expect(
          page.locator(TasksPage.HEADING_SELECTOR),
          'Debe mostrarse el módulo inicial'
        ).toBeVisible();
      });
    });
  }
});
