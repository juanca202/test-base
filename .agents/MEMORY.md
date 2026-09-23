# Memoria

Memoria de preferencias del proyecto. Las decisiones arquitectónicas se registran en `docs/adr/`, los estándares en `docs/standards/`, y las reglas generales y el stack tecnológico en `AGENTS.md`.

## Preferencias

- **Enfoque de testing**: Black-box testing para aplicaciones externas
- **Herramientas principales**: Playwright + TypeScript + Allure
- **Patrones de diseño**: Page Object Model (POM)
- **Reportería**: Allure Reports con categorización de fallos

## Reglas operativas

### Estructura de pruebas

- Separar pruebas E2E y API en directorios distintos
- Usar fixtures para datos de prueba reutilizables
- Implementar setup/teardown global para configuración común
- Mantener helpers utilitarios para funciones repetitivas

### Configuración de ambientes

- Soportar múltiples ambientes (dev, staging, production)
- Variables de ambiente para URLs, credenciales y configuraciones
- Configuración flexible de browsers y viewports
- Timeouts configurables por tipo de prueba

### Buenas prácticas establecidas

- Usar wait strategies explícitas (no sleeps fijos)
- Implementar retry logic para elementos flaky
- Capturar screenshots y traces en fallos
- Validar tanto UI como comportamiento funcional
- Mantener tests independientes y paralelos

## Decisiones técnicas previas

- **Test Runner**: Playwright Test, único runner del repo (sin Vitest ni cobertura de líneas)
- **Reporting**: Allure (sobre HTML básico)
- **Linting**: ESLint + TypeScript rules
- **Formateo**: Prettier con configuración estándar
