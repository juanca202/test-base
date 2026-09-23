# Fuentes de contexto

Incluir estos archivos en cada conversación para obtener contexto completo sobre el proyecto:

- @.agents/MEMORY.md — Memoria persistente y reglas operativas
- @docs/adr/README.md — Decisiones de arquitectura vigentes
- @docs/standards/README.md — Estándares técnicos del proyecto
- @README.md — Descripción del proyecto

# Reglas generales

- Este es un proyecto de QA para testing de aplicaciones externas sin acceso al código fuente
- Utilizar Playwright + TypeScript para pruebas E2E y API testing
- Seguir patrones de Page Object Model para estructurar las pruebas
- Mantener reportes claros usando Allure para documentación de resultados
- Configurar pruebas para múltiples browsers y viewports
- Usar datos de prueba parametrizados y configurables por ambiente

# Stack tecnológico

## Framework Principal

- **Playwright 1.63.0** - Framework de testing E2E y API
- **TypeScript 6.0.3** - Lenguaje principal con type safety
- **Node.js 20+** - Runtime environment

## Testing y Calidad

- **Allure 3.12.2** - Reportería avanzada con categorización
- **ESLint 10.11.0** - Linting con configuración TypeScript
- **Prettier 3.9.8** - Code formatting

## Integración y CI/CD

- **Husky 9.1.7** - Git hooks para pre-commit
- **dotenv 18.0.3** - Gestión de variables de ambiente

## Browsers y Devices

- **Chromium, Firefox, WebKit** - Testing multi-browser
- **Mobile viewports** - Chrome Mobile, Safari Mobile
- **Headless/Headed** - Configurable por ambiente

## Arquitectura

- **Page Object Model** - Patrón de diseño para mantener tests
- **Multi-environment** - dev, staging, production
- **Parallel execution** - Tests independientes en paralelo
