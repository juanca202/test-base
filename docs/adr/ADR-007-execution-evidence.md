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

Cuando una prueba contra una aplicación externa falla, el equipo necesita diagnosticar sin repetir la ejecución. Una prueba E2E se entiende con la línea de tiempo del navegador; una prueba API, con el intercambio HTTP.

Además, los reportes de ejecución de las pruebas requieren evidencias de toda la corrida, no solo de los fallos: una evidencia que existe únicamente para las pruebas fallidas no permite documentar las que pasaron.

Los reporters de la suite ya producen resultados de cada ejecución. La captura de trace como evidencia principal de un fallo, y el registro de request y response en las pruebas API, todavía no están cerrados como regla del framework.

## Decisión

El framework genera automáticamente evidencias y artefactos de ejecución.

- En pruebas E2E se capturan screenshots, videos y traces en todas las ejecuciones, también cuando la prueba pasa. El trace es la evidencia primaria de diagnóstico.
- Los logs y los resultados de ejecución están disponibles para todas las ejecuciones.
- Las pruebas API registran request y response de acuerdo con la criticidad del escenario y ante fallos.

## Consecuencias

### Positivas

- Un fallo E2E se diagnostica con el trace, apoyado por screenshot y video.
- Los reportes de ejecución cuentan con evidencias de todas las pruebas de la corrida.
- Toda ejecución deja logs y resultados, también cuando pasa.
- El registro HTTP de las pruebas API se concentra en los escenarios críticos y en los fallos.

### Negativas / trade-offs

- Traces y videos de todas las ejecuciones aumentan el costo de almacenamiento y el tiempo de ejecución; requiere una política de retención de artefactos.
- El request y el response de una prueba API pueden incluir datos del escenario; su volumen depende de la criticidad.

## Referencias

- [ADR-001: Playwright como Framework Principal de Testing](ADR-001-playwright-as-testing-framework.md)
- [Estándar de Testing](../standards/testing.md) — requisito «Evidencias de ejecución»
