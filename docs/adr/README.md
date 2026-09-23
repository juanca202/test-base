# Registros de Decisiones de Arquitectura

Este directorio contiene las decisiones de arquitectura importantes del proyecto de QA, documentadas como ADRs para mantener un registro histórico y justificación de las elecciones técnicas.

<!-- arch-manage añade aquí una línea por ADR creado: `- [ADR-XXX: Título](ADR-XXX-slug.md)`. No reordenar ni eliminar entradas manualmente. -->

- [ADR-001: Playwright como Framework Principal de Testing](ADR-001-playwright-as-testing-framework.md)
- [ADR-002: Page Object Model como Patrón de Diseño](ADR-002-page-object-model-pattern.md)
- [ADR-003: Integración Directa con Azure DevOps Test Cases](ADR-003-azure-devops-integration.md)
- [ADR-004: Mock Service Worker para mocks de APIs HTTP](ADR-004-msw-http-mocks.md)
- [ADR-005: Conventional Commits con commitlint y Husky](ADR-005-conventional-commits.md)
- [ADR-006: APIRequestContext de Playwright para pruebas REST y GraphQL](ADR-006-playwright-api-request-context.md)
- [ADR-007: Estrategia de datos de prueba](ADR-007-test-data-strategy.md)
- [ADR-008: Evidencias y artefactos de ejecución](ADR-008-execution-evidence.md)

## Formato de ADR

Cada ADR lleva frontmatter (`id`, `status`, `last_update`, `deciders`, `tags`, `supersedes`, `superseded_by`, `emits`) y las secciones `Contexto`, `Decisión`, `Consecuencias` y `Referencias`. `Alternativas consideradas` solo aparece si se evaluaron opciones.

## Criterios de documentación

Se documentan como ADR las decisiones que:

- Afectan la arquitectura del framework de testing
- Tienen impacto en múltiples componentes
- Requieren justificación técnica para el equipo
- Pueden cambiar en el futuro y necesitan contexto histórico
