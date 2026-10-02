import { test } from '@playwright/test';
import { allure } from 'allure-playwright';

/**
 * Agrupa pruebas bajo Historia -> Criterio de aceptación para que la
 * trazabilidad Historia -> AC -> TC se vea en Playwright y en Allure.
 *
 * - `story`: `US-XXX: título` de la historia de usuario.
 * - `criterion`: `AC-XXX: título` del criterio de aceptación.
 * - Las pruebas dentro del callback llevan su `TC-<id>:` en el título.
 *
 * En Allure la historia queda como Feature y el criterio como Story
 * (pestaña Behaviors), además del árbol de Suites.
 */
export function acceptanceCriterion(
  story: string,
  criterion: string,
  body: () => void
): void {
  test.describe(story, () => {
    test.describe(criterion, () => {
      test.beforeEach(async () => {
        await allure.feature(story);
        await allure.story(criterion);
      });

      body();
    });
  });
}
