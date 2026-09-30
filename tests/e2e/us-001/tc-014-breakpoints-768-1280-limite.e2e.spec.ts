import { expect, test } from '../../../src/fixtures/test';
import { getBawCredentials } from '../../../src/config/env';
import { LoginPage } from '../../../src/pages/LoginPage';
import {
  NAVIGATION_DESTINATIONS,
  PortalLayoutPage,
} from '../../../src/pages/PortalLayoutPage';

/** Fixed viewport height, so that width is the only variable. */
const VIEWPORT_HEIGHT = 900;
/** Widths around the mobile/tablet edge (768px belongs to tablet per AC-007). */
const MOBILE_TABLET_EDGE = [767, 768, 769];
/** Widths around the tablet/desktop edge (1280px belongs to desktop per AC-007). */
const TABLET_DESKTOP_EDGE = [1279, 1280, 1281];
/** Continuous resize sweep between the smallest and the largest supported widths. */
const SWEEP_MIN = 360;
const SWEEP_MAX = 1920;
const SWEEP_STEP = 40;
const INITIAL_URL = /\/tasks/;

/** Widths from SWEEP_MIN to SWEEP_MAX in SWEEP_STEP increments, plus the exact edges. */
function buildSweepWidths(): number[] {
  const widths = new Set<number>([
    ...MOBILE_TABLET_EDGE,
    ...TABLET_DESKTOP_EDGE,
  ]);
  for (let width = SWEEP_MIN; width <= SWEEP_MAX; width += SWEEP_STEP) {
    widths.add(width);
  }
  return [...widths].sort((a, b) => a - b);
}

test.describe('US-001 / AC-007: cambio de layout en los bordes de 768px y 1280px (E2E visual)', () => {
  test('TC-014: en 768-1281px el layout es único y estable a cada lado de los bordes y el redimensionado continuo no deja estados intermedios rotos', async ({
    page,
  }, testInfo) => {
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layout = new PortalLayoutPage(page);

    /** Resize and wait until the portal has applied the new width. */
    const resizeTo = async (width: number): Promise<void> => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await expect
        .poll(() => page.evaluate('window.innerWidth'), {
          message: `El viewport debe quedar en ${width}px`,
        })
        .toBe(width);
    };

    /** Structural signature of the navigation at the current width. */
    const navigationSignature = async (): Promise<{
      tabWidth: number | undefined;
      labelsVisible: boolean;
    }> => ({
      tabWidth: (
        await page.getByRole('tab', { name: 'Procesos' }).boundingBox()
      )?.width,
      labelsVisible: await layout.isDestinationLabelVisible('Procesos'),
    });

    await test.step('Precondición: autenticado en el módulo inicial', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await expect(page, 'Debe abrirse el módulo inicial').toHaveURL(
        INITIAL_URL
      );
      await page.waitForLoadState('networkidle');
    });

    /** Assert the layout is the full navigation with labels, once, without hamburger. */
    const expectFullNavigation = async (width: number): Promise<void> => {
      for (const destination of NAVIGATION_DESTINATIONS) {
        await expect(
          page.getByRole('tab', { name: destination }),
          `A ${width}px el destino «${destination}» debe estar visible`
        ).toBeVisible();
      }
      expect(
        await layout.countNavigationBars(),
        `A ${width}px debe haber una sola barra de navegación (sin duplicados)`
      ).toBe(1);
      expect(
        await layout.hasHamburgerControl(),
        `A ${width}px no debe haber icono de hamburguesa junto a la navegación`
      ).toBe(false);
      expect(
        await layout.hasHorizontalOverflow(),
        `A ${width}px no debe haber desborde horizontal`
      ).toBe(false);
      await testInfo.attach(`layout-${width}px`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    };

    await test.step('Paso 3: a 769px se mantiene el layout de tablet, idéntico al de 768px', async () => {
      await resizeTo(768);
      await expectFullNavigation(768);
      const at768 = await navigationSignature();
      await resizeTo(769);
      await expectFullNavigation(769);
      expect(
        await navigationSignature(),
        'El layout a 769px debe ser idéntico al de 768px'
      ).toEqual(at768);
    });

    await test.step('Paso 5 (parcial): a 1279px la navegación sigue completa y sin desborde', async () => {
      await resizeTo(1279);
      await expectFullNavigation(1279);
    });

    await test.step('Pasos 5-6: a 1280px el layout es de escritorio con navegación completa y a 1281px se mantiene idéntico', async () => {
      await resizeTo(1280);
      await expectFullNavigation(1280);
      expect(
        (await navigationSignature()).labelsVisible,
        'A 1280px las etiquetas de navegación deben estar visibles'
      ).toBe(true);
      const at1280 = await navigationSignature();
      await resizeTo(1281);
      await expectFullNavigation(1281);
      expect(
        await navigationSignature(),
        'El layout a 1281px debe ser idéntico al de 1280px'
      ).toEqual(at1280);
    });

    await test.step('Paso 7: el redimensionado continuo de 360px a 1920px y a la inversa no genera estados intermedios ni navegación duplicada', async () => {
      const ascending = buildSweepWidths();
      const sweep = [...ascending, ...[...ascending].reverse()];
      for (const width of sweep) {
        await resizeTo(width);
        const tabs = await page.getByRole('tab').count();
        expect(
          [0, NAVIGATION_DESTINATIONS.length],
          `A ${width}px la navegación debe estar completa u oculta, nunca parcial (pestañas: ${tabs})`
        ).toContain(tabs);
        expect(
          await layout.countNavigationBars(),
          `A ${width}px no debe duplicarse la navegación`
        ).toBeLessThanOrEqual(1);
        const hasHamburger = await layout.hasHamburgerControl();
        expect(
          hasHamburger && tabs > 0,
          `A ${width}px no deben coexistir la navegación completa y la hamburguesa`
        ).toBe(false);
      }
    });

    await test.step('Paso 8: sin desborde horizontal en ningún ancho del recorrido', async () => {
      for (const width of buildSweepWidths()) {
        await resizeTo(width);
        expect(
          await layout.hasHorizontalOverflow(),
          `A ${width}px no debe haber desborde horizontal`
        ).toBe(false);
      }
      await testInfo.attach('layout-final-sweep', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    });
  });

  test('TC-014 (pasos 1, 2 y 4): 767px muestra layout móvil con hamburguesa y 768px/1279px muestran la navegación de tablet colapsada a iconos', async ({
    page,
  }, testInfo) => {
    // Hallazgo: el portal no tiene layout móvil con hamburguesa ni colapso a iconos en tablet;
    // la navegación es un tablist de cabecera con etiquetas visibles de 768px en adelante.
    test.fixme(
      true,
      'TC-014 pasos 1, 2 y 4: esperado 767px con icono de hamburguesa y panel superpuesto, y 768px/1279px con navegación colapsada a iconos sin hamburguesa · observado: a 767px la navegación desaparece sin hamburguesa; de 768px a 1279px se ven las etiquetas completas sin colapso'
    );
    const { username, password } = getBawCredentials();
    const loginPage = new LoginPage(page);
    const layout = new PortalLayoutPage(page);

    await test.step('Precondición: autenticado en el módulo inicial', async () => {
      await loginPage.goto();
      await loginPage.loginAndWaitForPortal(username, password);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Paso 1: a 767px se muestra el layout móvil con icono de hamburguesa y panel superpuesto', async () => {
      await page.setViewportSize({ width: 767, height: VIEWPORT_HEIGHT });
      await testInfo.attach('movil-767px', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
      await expect(
        page.locator(
          'role=banner >> role=button[name=/menú|menu|hamburgues|navegación/i]'
        ),
        'A 767px debe mostrarse el icono de hamburguesa'
      ).toBeVisible();
      await layout.openNavigationPanel();
      await expect(
        page.getByRole('tab', { name: NAVIGATION_DESTINATIONS[0] }),
        'El panel superpuesto debe mostrar los destinos'
      ).toBeVisible();
    });

    for (const [step, width] of [
      ['Paso 2', 768],
      ['Paso 4', 1279],
    ] as const) {
      await test.step(`${step}: a ${width}px la navegación de tablet está colapsada a iconos y sin hamburguesa`, async () => {
        await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
        await testInfo.attach(`tablet-${width}px`, {
          body: await page.screenshot(),
          contentType: 'image/png',
        });
        expect(
          await layout.hasHamburgerControl(),
          `A ${width}px no debe haber icono de hamburguesa`
        ).toBe(false);
        for (const destination of NAVIGATION_DESTINATIONS) {
          expect(
            await layout.isDestinationLabelVisible(destination),
            `A ${width}px la etiqueta de «${destination}» debe estar oculta (colapsada a iconos)`
          ).toBe(false);
        }
      });
    }
  });
});
