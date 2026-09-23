---
name: Testing Standards
domain: testing
status: Active
last_update: 2026-09-22
source_adrs: [ADR-003, ADR-005, ADR-006, ADR-007]
tags: [testing, msw]
---

# Testing Standards

Este estándar cubre las pruebas automatizadas del framework de QA: estructura, Page Objects, esperas, datos, aserciones, reintentos, tiempos, mocks HTTP, APIs REST y GraphQL, y evidencias de ejecución.

## Estructura de pruebas

**ID:** test-structure
**Estado:** Active

Las pruebas E2E **DEBEN** vivir en `tests/e2e/` con el nombre `*.e2e.spec.ts`. Las pruebas API **DEBEN** vivir en `tests/api/` con el nombre `*.api.spec.ts`.

Cada caso **DEBE** organizarse en `describe` / `it` con los pasos arrange, act y assert.

### Excepciones

Ninguna.

## Page Object Model

**ID:** page-object-model
**Estado:** Active

Las páginas **DEBEN** modelarse como clases `*Page.ts` que extienden `BasePage`. Los métodos **DEBEN** nombrarse con verbos (`login()`, `fillEmail()`, `clickSubmit()`). Los selectores **DEBEN** ser constantes en `UPPER_CASE`.

### Excepciones

Ninguna.

## Estrategias de espera

**ID:** wait-strategies
**Estado:** Active

Antes de una interacción **DEBE** usarse `waitForElement()`. Después de una navegación **DEBE** usarse `waitForLoadState('networkidle')`. Las operaciones lentas **DEBEN** tener un timeout explícito.

**NO DEBE** usarse `page.waitForTimeout()` con un valor fijo, un sleep hardcodeado ni un polling manual sin timeout.

### Excepciones

Ninguna.

## Aserciones

**ID:** assertions
**Estado:** Active

Las aserciones **DEBEN** comprobar un estado concreto: visibilidad de un locator, código HTTP o un formato esperado.

**NO DEBEN** usarse comprobaciones genéricas como `toBeTruthy()` o `toContain('success')` cuando existe una aserción específica.

### Excepciones

Ninguna.

## Reintentos

**ID:** retries
**Estado:** Active

Un elemento inestable **DEBE** reintentarse como máximo 3 veces. Las llamadas API **DEBEN** usar backoff exponencial. Los servicios externos **DEBEN** protegerse con un circuit breaker.

### Excepciones

Ninguna.

## Tiempos y paralelismo

**ID:** performance-timeouts
**Estado:** Active

El timeout de un elemento de UI **DEBE** ser de 10 segundos por defecto. Una llamada API **NO DEBE** superar 30 segundos. La carga de una página **NO DEBE** superar 60 segundos.

Las pruebas independientes **DEBEN** poder ejecutarse en paralelo, con usuarios o datos distintos.

### Excepciones

Ninguna.

## Mocks de APIs HTTP

**ID:** http-api-mocks
**Estado:** Active

MSW **PUEDE** usarse en el navegador o en herramientas de desarrollo local para simular APIs HTTP sin backend. Los handlers viven en `src/mocks/handlers.ts` y el worker del navegador en `src/mocks/browser.ts`. El service worker generado está en `public/mockServiceWorker.js`.

La suite E2E con Playwright **NO DEBE** exigir MSW. Esas pruebas se ejecutan contra flujos reales o con los mecanismos de red de Playwright.

### Excepciones

Este repositorio no contempla pruebas unitarias ni de integración. No aplica ninguna obligación de arrancar el server o el worker de MSW en una suite de test.

## Pruebas REST y GraphQL

**ID:** rest-graphql-api
**Estado:** Active

Las pruebas de APIs REST y GraphQL **DEBEN** usar `APIRequestContext` de Playwright. El contexto es la fixture `request` o, si la prueba ya dispone de una página, `page.request`.

GraphQL **DEBE** enviarse como petición HTTP de ese mismo contexto.

### Excepciones

Ninguna.

## Gestión de datos de prueba

**ID:** test-data
**Estado:** Active

Los datos de prueba estáticos, reproducibles y no sensibles **DEBEN** almacenarse en el repositorio. Cuando el dataset es declarativo, **DEBE** expresarse en JSON, YAML o CSV.

Los datos dinámicos y aislados **DEBEN** generarse con factories o builders. Las factories de código viven en `src/fixtures/`; `generateRandomUser()` genera usuarios únicos.

Los datos que dependen del ambiente y las credenciales **DEBEN** provenir de configuración externa y de secretos del entorno. Esos valores **NO DEBEN** versionarse en el repositorio.

Cada prueba **DEBE** crear los datos que necesita, de forma preferente mediante APIs o fixtures de preparación, y **NO DEBE** depender de datos dejados por otra prueba.

Los recursos creados durante una prueba **DEBEN** eliminarse al finalizar cuando sea técnicamente posible.

### Excepciones

Si el sistema bajo prueba no permite borrar un recurso, la prueba no usa ese recurso como precondición de otra.

## Evidencias de ejecución

**ID:** execution-evidence
**Estado:** Active

El framework **DEBE** generar automáticamente evidencias y artefactos de ejecución.

En las pruebas E2E, los screenshots, los videos y los traces **DEBEN** capturarse principalmente ante fallos. El trace **DEBE** ser la evidencia primaria de diagnóstico.

Los logs y los resultados de ejecución **DEBEN** estar disponibles para todas las ejecuciones.

Las pruebas API **DEBEN** registrar el request y el response de acuerdo con la criticidad del escenario y ante fallos.

### Excepciones

Ninguna.

## Criterios de cumplimiento

| ID     | Requisito          | Descripción                                                                                                                                                                | Automatizable | Enfoque    | Verificación                                                |
| ------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------- | ----------------------------------------------------------- |
| CR-002 | http-api-mocks     | MSW **PUEDE** usarse en el navegador o en desarrollo local para simular APIs sin backend                                                                                   | no            | —          | Pending                                                     |
| CR-003 | rest-graphql-api   | Las pruebas REST y GraphQL **DEBEN** usar `APIRequestContext` de Playwright                                                                                                | yes           | bloqueante | [checks/testing.mjs](../../scripts/arch/checks/testing.mjs) |
| CR-004 | test-data          | Los datos dinámicos y aislados **DEBEN** generarse con factories o builders                                                                                                | no            | —          | Pending                                                     |
| CR-005 | test-data          | Cada prueba **DEBE** crear los datos que necesita y **NO DEBE** depender de los que dejó otra prueba                                                                       | no            | —          | Pending                                                     |
| CR-006 | test-data          | Los recursos creados durante una prueba **DEBEN** eliminarse al finalizar cuando sea técnicamente posible                                                                  | no            | —          | Pending                                                     |
| CR-007 | execution-evidence | En las pruebas E2E, los screenshots, los videos y los traces **DEBEN** capturarse principalmente ante fallos, y el trace **DEBE** ser la evidencia primaria de diagnóstico | yes           | bloqueante | Pending                                                     |
| CR-008 | execution-evidence | Los logs y los resultados de ejecución **DEBEN** estar disponibles para todas las ejecuciones                                                                              | yes           | bloqueante | Pending                                                     |

## Referencias

- [ADR-002: Page Object Model como Patrón de Diseño](../adr/ADR-002-page-object-model-pattern.md)
- [ADR-003: Mock Service Worker para mocks de APIs HTTP](../adr/ADR-003-msw-http-mocks.md)
- [ADR-005: APIRequestContext de Playwright para pruebas REST y GraphQL](../adr/ADR-005-playwright-api-request-context.md)
- [ADR-006: Estrategia de datos de prueba](../adr/ADR-006-test-data-strategy.md)
- [ADR-007: Evidencias y artefactos de ejecución](../adr/ADR-007-execution-evidence.md)
