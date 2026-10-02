---
id: ADR-007
status: Draft
last_update: 2026-10-02
deciders: [Equipo de QA]
tags: [testing, evidence, trace, allure]
supersedes: null
superseded_by: null
emits: [testing/CR-007, testing/CR-008]
---

# ADR-007: Evidencias y artefactos de ejecución

## Contexto

Las pruebas automatizadas E2E requieren evidencias de ejecución para demostrar el resultado de cada prueba y dar trazabilidad en los reportes de QA.

La evidencia no se limita a los casos con error. Tanto las pruebas exitosas como las fallidas cuentan con evidencia que permite verificar que la prueba se ejecutó y conocer el estado del sistema durante esa ejecución.

Playwright genera distintos tipos de evidencia, principalmente traces, screenshots y videos. Generar todos los tipos para cada prueba incrementa innecesariamente el almacenamiento y el tiempo de procesamiento. Hace falta una estrategia que obtenga evidencia de todas las ejecuciones y seleccione el tipo según la naturaleza de la prueba.

## Decisión

Se adopta una estrategia de evidencia basada en el tipo de prueba:

| Tipo de prueba                                 | Evidencia principal     |
| ---------------------------------------------- | ----------------------- |
| E2E funcional                                  | Playwright Trace        |
| Regresión visual                               | Screenshot              |
| API                                            | Request/Response + logs |
| Escenarios que requieren evidencia audiovisual | Video                   |
| Pruebas que requieren diagnóstico adicional    | Evidencia combinada     |

En las pruebas E2E funcionales, el Playwright Trace es la evidencia principal de la ejecución, tanto si la prueba termina correctamente como si termina con error.

La configuración base de Playwright es:

```ts
use: {
  trace: 'on',
  screenshot: 'off',
  video: 'off',
}
```

Las pruebas que requieren otro tipo de evidencia sobrescriben esa configuración a nivel de test, `test.describe` o proyecto.

### Criterios de selección

- Toda ejecución automatizada produce evidencia.
- La evidencia permite identificar el resultado de la prueba.
- Se usa el tipo de evidencia que aporta mayor valor al objetivo de la prueba.
- No se generan varios tipos de evidencia cuando uno es suficiente para documentar la ejecución.
- La evidencia se asocia con el Test Case, la ejecución y el build correspondientes.
- La evidencia está disponible para la generación de reportes y para el análisis posterior de resultados.
- La evidencia se conserva según la política de retención definida para los artefactos del pipeline.

### Uso en los reportes

Las evidencias generadas durante la ejecución forman parte del reporte automatizado de pruebas. El reporte relaciona:

```text
Test Case
    │
    ├── Ejecución
    │     ├── Resultado
    │     ├── Duración
    │     └── Evidencia
    │
    ├── Build / Release
    └── Bug (cuando corresponda)
```

En las pruebas E2E, el `trace.zip` se vincula desde el reporte como evidencia principal y se analiza con Playwright Trace Viewer.

### Ejemplos

Una prueba funcional genera su trace aunque pase:

```ts
test('crear usuario', async ({ page }) => {
  await page.goto('/users');
  await page.getByRole('button', { name: 'Nuevo' }).click();
  // ...
});
```

```text
test-results/
└── crear-usuario/
    └── trace.zip
```

En una prueba de regresión visual, la evidencia principal es el screenshot de la comparación:

```ts
test('pantalla de usuarios', async ({ page }) => {
  await page.goto('/users');

  await expect(page).toHaveScreenshot('users.png');
});
```

## Consecuencias

### Positivas

- Todas las ejecuciones cuentan con evidencia verificable.
- Los reportes de QA demuestran tanto ejecuciones exitosas como fallidas.
- Se mantiene la trazabilidad entre Test Case, ejecución, build y evidencia.
- Se reduce la generación de artefactos redundantes.
- El Trace aporta información detallada para analizar una ejecución E2E.
- La estrategia se adapta al tipo de prueba.

### Negativas / trade-offs

- Se requiere almacenamiento para conservar las evidencias de las ejecuciones exitosas.
- Los traces pueden generar un volumen considerable de datos en ejecuciones con muchos tests.
- Hay que definir una política de retención y limpieza de artefactos.
- Algunos usuarios necesitan Playwright Trace Viewer para analizar los traces.
- El request y el response de una prueba API pueden incluir datos del escenario; su volumen depende de la criticidad.

## Referencias

- [ADR-001: Playwright como Framework Principal de Testing](ADR-001-playwright-as-testing-framework.md)
- [Estándar de Testing](../standards/testing.md) — requisito «Evidencias de ejecución»
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
