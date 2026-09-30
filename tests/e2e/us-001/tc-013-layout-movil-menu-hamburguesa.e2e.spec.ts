import { expect, test } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

// TC-013 (Visual Test): structural assertions plus attached screenshots, no pixel diff.
const MOBILE_HEIGHT = 740;
const MOBILE_WIDTHS = [360, 767];
const MODULES = [
  { name: 'Mis tareas', path: /\/tasks/, url: '/tasks' },
  { name: 'Procesos', path: /\/processes/, url: '/processes' },
];

for (const width of MOBILE_WIDTHS) {
  test.describe(`US-001 / AC-007: layout móvil a ${width}px (Visual Test)`, () => {
    test.beforeEach(async ({ page }) => {
      const { username, password } = getBawCredentials();
      await page.setViewportSize({ width, height: MOBILE_HEIGHT });
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
    });

    test(`TC-013: a ${width}px la navegación no ocupa espacio fijo y el contenido no desborda (pasos 1, 2 y 6 parcial)`, async ({
      page,
    }) => {
      const layout = new PortalLayoutPage(page);

      for (const module of MODULES) {
        await test.step(`Paso 1: abrir «${module.name}» con viewport de ${width}px`, async () => {
          await page.goto(module.url);
          await layout.waitForPageLoad();
          await expect(page, `Debe abrirse ${module.name}`).toHaveURL(
            module.path
          );
          await expect(
            page.getByRole('heading', { name: module.name, level: 1 }),
            `Debe mostrarse el encabezado de ${module.name}`
          ).toBeVisible();
        });

        await test.step(`Paso 2: en «${module.name}» la barra de pestañas no ocupa espacio fijo`, async () => {
          for (const destination of NAVIGATION_DESTINATIONS) {
            expect(
              await layout.isDestinationVisible(destination),
              `La pestaña «${destination}» no debe mostrarse en pantalla móvil`
            ).toBe(false);
          }
        });

        await test.step(`Paso 6: en «${module.name}» no hay desborde horizontal`, async () => {
          expect(
            await layout.hasHorizontalOverflow(),
            `No debe haber desborde horizontal a ${width}px`
          ).toBe(false);
          await test.info().attach(`movil-${width}-${module.url.slice(1)}`, {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
          });
        });
      }
    });

    test(`TC-013: a ${width}px el encabezado muestra hamburguesa que abre un panel superpuesto con todos los destinos (pasos 2 a 5 y 6 parcial)`, async ({
      page,
    }) => {
      // Hallazgo: en <768px el portal oculta la barra de pestañas y no ofrece ningún control
      // de hamburguesa ni panel de navegación; los módulos solo se alcanzan por URL.
      test.fixme(
        true,
        'TC-013 pasos 2-5: esperado icono de hamburguesa que abre un panel superpuesto con todos los destinos · observado: la navegación queda oculta y no existe control alternativo en el encabezado'
      );
      const layout = new PortalLayoutPage(page);
      const initialUrl = page.url();

      await test.step('Paso 2: el encabezado muestra un icono de hamburguesa', async () => {
        expect(
          await layout.hasHamburgerControl(),
          'Debe mostrarse el icono de hamburguesa'
        ).toBe(true);
      });

      await test.step('Paso 3: activar la hamburguesa abre un panel con todos los destinos', async () => {
        await layout.openNavigationPanel();
        await expect(
          layout.getNavigationPanel(),
          'Debe abrirse el panel de navegación superpuesto'
        ).toBeVisible();
        for (const destination of NAVIGATION_DESTINATIONS) {
          expect(
            await layout.isDestinationInPanel(destination),
            `El panel debe ofrecer «${destination}»`
          ).toBe(true);
        }
      });

      await test.step('Paso 4: elegir un destino navega y cierra el panel', async () => {
        await layout
          .getNavigationPanel()
          .getByRole('link', { name: 'Procesos' })
          .click();
        await expect(page, 'Debe navegar a Procesos').toHaveURL(/\/processes/);
        await expect(
          layout.getNavigationPanel(),
          'El panel debe cerrarse tras elegir un destino'
        ).toBeHidden();
      });

      await test.step('Paso 5: abrir y cerrar el panel sin elegir destino conserva el módulo', async () => {
        const moduleUrl = page.url();
        await layout.openNavigationPanel();
        await page.keyboard.press('Escape');
        await expect(
          layout.getNavigationPanel(),
          'El panel debe cerrarse'
        ).toBeHidden();
        await expect(page, 'Debe permanecer en el mismo módulo').toHaveURL(
          moduleUrl
        );
        expect(moduleUrl, 'Se partió del módulo inicial').not.toBe(initialUrl);
      });
    });
  });
}
