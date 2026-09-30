---
id: ADR-007
status: Draft
last_update: 2026-09-29
deciders: [Equipo de QA]
tags: [testing, evidence, trace, allure]
supersedes: null
superseded_by: null
emits: [testing/CR-007, testing/CR-008, testing/CR-009]
---

# ADR-007: Evidencias y artefactos de ejecución

## Contexto

Cuando una prueba contra una aplicación externa falla, el equipo necesita diagnosticar sin repetir la ejecución. Pero una ejecución exitosa también debe poder demostrarse: sin evidencia, un «pasó» no se puede revisar ni auditar. Una prueba E2E se entiende con el video del flujo; una prueba API, con el intercambio HTTP completo.

La versión anterior de esta decisión limitaba video, screenshot y trace a los fallos, y registraba request y response de las pruebas API según la criticidad del escenario. Eso deja sin evidencia las ejecuciones exitosas, por lo que se revisa.

## Decisión

El framework genera automáticamente evidencia de **toda** ejecución, no solo de las que fallan.

- En pruebas E2E se graba un video del flujo en cada ejecución, pase o falle. Ante un fallo se conservan además el trace, como evidencia primaria de diagnóstico, y el screenshot.
- En pruebas API se adjuntan el request y el response de cada prueba, pase o falle. La evidencia enmascara las cabeceras y los tokens sensibles (`Authorization`, `Cookie`, tokens).
- Los logs y los resultados de ejecución están disponibles para todas las ejecuciones.

## Consecuencias

### Positivas

- Cada ejecución, también la exitosa, deja una prueba revisable de lo que ocurrió.
- Un fallo E2E se diagnostica con el trace, apoyado por screenshot y video.
- Toda prueba API muestra el intercambio HTTP exacto, sin depender de una clasificación de criticidad.

### Negativas / trade-offs

- El video en cada ejecución aumenta el almacenamiento, sobre todo en la matriz de browsers y viewports.
- Adjuntar request y response en todas las pruebas API aumenta el tamaño de los resultados; el enmascarado de datos sensibles pasa a ser obligatorio.

## Referencias

- [ADR-001: Playwright como Framework Principal de Testing](ADR-001-playwright-as-testing-framework.md)
- [Estándar de Testing](../standards/testing.md) — requisito «Evidencias de ejecución»
