import { expect, test } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

const VIEWPORT_HEIGHT = 900;
const DESKTOP_WIDTHS = [1280, 1920];
const MODULES = [
  { name: 'Mis tareas', path: /\/tasks/ },
  { name: 'Procesos', path: /\/processes/ },
];

test.describe('US-001 / AC-007: layout de escritorio con navegación completa (E2E visual)', () => {
  test('TC-011: en anchos de escritorio la navegación se muestra completa, con etiquetas y sin control de expansión ni desbordes', async ({
    page,
  }, testInfo) => {
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layout = new PortalLayoutPage(page);

    await test.step('Precondición: usuario autenticado en el módulo inicial', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
    });

    for (const width of DESKTOP_WIDTHS) {
      for (const module of MODULES) {
        await test.step(`Pasos 1-4 a ${width}px en «${module.name}»`, async () => {
          await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
          await layout.openModule(module.name);
          await expect(
            page,
            `Debe mostrarse el módulo ${module.name}`
          ).toHaveURL(module.path);
          await expect(
            page.getByRole('heading', { name: module.name, level: 1 }),
            `Debe mostrarse el encabezado de ${module.name}`
          ).toBeVisible();

          // Paso 1: el layout corresponde al rango de escritorio
          expect(
            await page.evaluate('window.innerWidth'),
            'El viewport debe tener el ancho de escritorio fijado'
          ).toBe(width);

          // Paso 2: navegación completa, cada destino con su etiqueta
          for (const destination of NAVIGATION_DESTINATIONS) {
            expect(
              await layout.isDestinationVisible(destination),
              `El destino «${destination}» debe estar visible a ${width}px`
            ).toBe(true);
            expect(
              await layout.isDestinationLabelVisible(destination),
              `El destino «${destination}» debe mostrar su etiqueta de texto a ${width}px`
            ).toBe(true);
          }

          // Paso 3: sin control de expansión
          expect(
            await layout.hasHamburgerControl(),
            `No debe haber icono de hamburguesa a ${width}px`
          ).toBe(false);

          // Paso 4 (estructural): sin texto cortado ni desborde horizontal
          for (const destination of NAVIGATION_DESTINATIONS) {
            expect(
              await layout.isDestinationLabelClipped(destination),
              `La etiqueta «${destination}» no debe estar cortada a ${width}px`
            ).toBe(false);
          }
          expect(
            await layout.hasHorizontalOverflow(),
            `No debe haber desborde horizontal a ${width}px`
          ).toBe(false);

          await testInfo.attach(
            `layout-${width}px-${module.path.source.replace(/\W/g, '')}`,
            {
              body: await page.screenshot(),
              contentType: 'image/png',
            }
          );
        });
      }
    }
  });

  test('TC-011 (paso 4): la captura coincide con la referencia visual aprobada de escritorio', async () => {
    // Hallazgo/limitación: no existe referencia visual aprobada y los datos de Mis tareas son vivos,
    // por lo que no se puede comparar píxeles; el paso se cubre con aserciones estructurales.
    test.fixme(
      true,
      'TC-011 paso 4: esperado comparación con referencia visual aprobada · observado: no existe referencia aprobada y los datos de Mis tareas son vivos; cubierto con aserciones estructurales y capturas adjuntas'
    );
  });
});
