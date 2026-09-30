import { expect, test } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

/** Tablet range widths: lower edge, representative middle and upper edge. */
const TABLET_WIDTHS = [768, 1024, 1279];
const TABLET_HEIGHT = 1024;
/** Module reached from the navigation (TC data: "/mis-tareas", real route is /processes). */
const TARGET_MODULE = 'Procesos';
const TARGET_URL = /\/processes/;
const INITIAL_URL = /\/tasks/;

test.describe('US-001 / AC-007: layout de tablet con navegación colapsada (E2E visual)', () => {
  for (const width of TABLET_WIDTHS) {
    test.describe(`ancho ${width}px`, () => {
      test.use({ viewport: { width, height: TABLET_HEIGHT } });

      test(`TC-012: el layout de tablet a ${width}px muestra todos los destinos, permite navegar y no desborda horizontalmente`, async ({
        page,
      }, testInfo) => {
        const { username, password } = getBawCredentials();
        const loginPage = new LoginPage(page);
        const layout = new PortalLayoutPage(page);

        await test.step('Paso 1: abrir el módulo inicial autenticado con el viewport de tablet', async () => {
          await loginPage.goto();
          await loginPage.loginAndWaitForPortal(username, password);
          await expect(page, 'Debe abrirse el módulo inicial').toHaveURL(
            INITIAL_URL
          );
          await page.waitForLoadState('networkidle');
          expect(
            page.viewportSize()?.width,
            'El viewport debe tener el ancho de tablet solicitado'
          ).toBe(width);
        });

        await test.step('Paso 2 (parcial): cada destino de navegación está presente y accesible', async () => {
          for (const destination of NAVIGATION_DESTINATIONS) {
            await expect(
              page.getByRole('tab', { name: destination }),
              `El destino «${destination}» debe estar visible y accesible por rol`
            ).toBeVisible();
          }
          await testInfo.attach(`navegacion-inicial-${width}px`, {
            body: await page.screenshot(),
            contentType: 'image/png',
          });
        });

        await test.step('Paso 4 (parcial): seleccionar un destino navega al módulo correspondiente', async () => {
          await layout.openModule(TARGET_MODULE);
          await expect(
            page,
            `Debe navegarse al módulo ${TARGET_MODULE}`
          ).toHaveURL(TARGET_URL);
          await expect(
            page.getByRole('heading', { name: TARGET_MODULE, level: 1 }),
            'Debe mostrarse el encabezado del módulo seleccionado'
          ).toBeVisible();
          await page.waitForLoadState('networkidle');
        });

        await test.step('Paso 5 (estructural): sin desborde horizontal y navegación visible tras navegar', async () => {
          expect(
            await layout.hasHorizontalOverflow(),
            'El contenido no debe provocar desborde horizontal'
          ).toBe(false);
          for (const destination of NAVIGATION_DESTINATIONS) {
            await expect(
              page.getByRole('tab', { name: destination }),
              `El destino «${destination}» debe seguir visible en el módulo`
            ).toBeVisible();
          }
          await testInfo.attach(`navegacion-tras-navegar-${width}px`, {
            body: await page.screenshot(),
            contentType: 'image/png',
          });
        });
      });

      test(`TC-012 (pasos 2-4): a ${width}px la navegación se colapsa a iconos, se expande al interactuar y vuelve a colapsarse`, async ({
        page,
      }, testInfo) => {
        // Hallazgo: en tablet el portal muestra la barra de pestañas con icono y etiqueta siempre;
        // no existe estado colapsado a iconos ni expansión al interactuar.
        test.fixme(
          true,
          `TC-012 pasos 2-4 (${width}px): esperado navegación colapsada a iconos (etiquetas ocultas), expandible al interactuar y colapsada tras seleccionar destino · observado: iconos con etiqueta de texto visibles siempre, sin cambio al interactuar`
        );
        const { username, password } = getBawCredentials();
        const loginPage = new LoginPage(page);
        const layout = new PortalLayoutPage(page);

        await test.step('Precondición: autenticado en el módulo inicial', async () => {
          await loginPage.goto();
          await loginPage.loginAndWaitForPortal(username, password);
          await page.waitForLoadState('networkidle');
        });

        await test.step('Paso 2: navegación colapsada a iconos con etiquetas ocultas', async () => {
          for (const destination of NAVIGATION_DESTINATIONS) {
            await expect(
              page.getByRole('tab', { name: destination }),
              `El destino «${destination}» debe seguir accesible`
            ).toBeVisible();
            expect(
              await layout.isDestinationLabelVisible(destination),
              `La etiqueta de «${destination}» debe estar oculta en estado colapsado`
            ).toBe(false);
          }
          await testInfo.attach(`colapsada-${width}px`, {
            body: await page.screenshot(),
            contentType: 'image/png',
          });
        });

        await test.step('Paso 3: al interactuar la navegación se expande y muestra las etiquetas', async () => {
          await layout.expandNavigation();
          for (const destination of NAVIGATION_DESTINATIONS) {
            await expect(
              page
                .getByRole('tab', { name: destination })
                .getByText(destination, { exact: true }),
              `La etiqueta de «${destination}» debe mostrarse al expandir`
            ).toBeVisible();
          }
          await testInfo.attach(`expandida-${width}px`, {
            body: await page.screenshot(),
            contentType: 'image/png',
          });
        });

        await test.step('Paso 4: al seleccionar un destino navega y la navegación vuelve a colapsarse', async () => {
          await layout.openModule(TARGET_MODULE);
          await expect(page, 'Debe navegarse al módulo').toHaveURL(TARGET_URL);
          await expect(
            page
              .getByRole('tab', { name: 'Mis tareas' })
              .getByText('Mis tareas', { exact: true }),
            'La etiqueta debe volver a ocultarse tras navegar'
          ).toBeHidden();
        });
      });
    });
  }
});
