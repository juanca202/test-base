---
id: ADR-001
status: Accepted
last_update: 2026-09-22
deciders: [Equipo de QA]
tags: [playwright, testing, e2e, api]
supersedes: null
superseded_by: null
emits: []
---

# ADR-001: Playwright como Framework Principal de Testing

## Contexto

Necesitamos seleccionar un framework de testing robusto para realizar pruebas E2E y API testing a aplicaciones web externas sin acceso al código fuente. El framework debe soportar múltiples browsers, ser mantenible a largo plazo, y permitir tanto testing de UI como de APIs con la misma herramienta.

Drivers de la elección:

- Playwright soporta Chromium, Firefox y WebKit de forma nativa.
- Permite testing de APIs REST con el mismo framework que la UI.
- Tiene integración nativa con TypeScript.
- La ejecución es más rápida que alternativas como Selenium.
- Lo mantiene Microsoft, con releases frecuentes.
- El trace viewer y el inspector aceleran el diagnóstico.
- Tiene soporte para ejecución en pipelines automatizados.

## Decisión

Adoptamos **Playwright** como framework principal de testing para el proyecto.

## Alternativas consideradas

- **Cypress**: limitaciones con iframes, múltiples tabs y testing de APIs menos robusto.
- **Selenium WebDriver**: mayor complejidad de configuración y mantenimiento.
- **Puppeteer**: solo soporta Chromium, sin soporte nativo para Firefox ni Safari.

## Consecuencias

### Positivas

- Framework unificado para UI y API testing reduce complejidad del stack.
- Mejor soporte multi-browser para validar compatibilidad.
- Herramientas de debugging avanzadas aceleran resolución de issues.
- La integración con TypeScript mejora la calidad del código de testing.

### Negativas / trade-offs

- Curva de aprendizaje para un equipo familiarizado con otros frameworks.
- Comunidad más pequeña comparada con Selenium, aunque en crecimiento.
- Dependencia en Microsoft para la evolución del framework.
- Requiere migración si existe código previo en otros frameworks.
- El equipo de QA necesita formación en el framework.

## Referencias

- [Playwright](https://playwright.dev/)
- [Estándar de Testing](../standards/testing.md)
