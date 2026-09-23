# Casos de prueba — US-003: Mis tareas — listado y SLA

Casos de prueba derivados de los criterios de aceptación de [US-003](../README.md), según IEEE 29119-4.

**Entorno de referencia:** ambiente de BAW `https://192.168.120.100:9443` (también accesible como `btq-srv-bawodm`).
**Datos de prueba:** propuestos dentro de cada TC y marcados `[propuesto]`.

| TC                                                               | Perspectiva | Tipo de prueba    | Estado | Prioridad | Criterio de aceptación |
| ---------------------------------------------------------------- | ----------- | ----------------- | ------ | --------- | ---------------------- |
| [TC-001](./TC-001-listado-tareas-sla-a-tiempo-happy.md)          | Happy Path  | Integration, E2E  | Ready  | Alta      | AC-001                 |
| [TC-002](./TC-002-tarea-due-date-pasado-vencida-happy.md)        | Happy Path  | Unit, E2E         | Ready  | Alta      | AC-001                 |
| [TC-003](./TC-003-tarea-at-risk-time-pasado-en-riesgo-limite.md) | Límite      | Unit, E2E         | Ready  | Media     | AC-001                 |
| [TC-004](./TC-004-listado-vacio-sin-tareas-error.md)             | Error       | E2E               | Ready  | Media     | AC-001                 |
| [TC-005](./TC-005-resumen-conteos-sla-pagina-happy.md)           | Happy Path  | Unit, E2E         | Ready  | Media     | AC-002                 |
| [TC-006](./TC-006-resumen-conteos-solo-pagina-cargada-limite.md) | Límite      | Unit, Integration | Ready  | Media     | AC-002                 |
| [TC-007](./TC-007-filtro-estado-tarea-servidor-happy.md)         | Happy Path  | Integration, E2E  | Ready  | Alta      | AC-003                 |
| [TC-008](./TC-008-busqueda-texto-libre-cliente-happy.md)         | Happy Path  | Unit, E2E         | Ready  | Media     | AC-003                 |
| [TC-009](./TC-009-busqueda-fuera-de-pagina-cargada-limite.md)    | Límite      | E2E               | Ready  | Baja      | AC-003                 |
| [TC-010](./TC-010-carga-listado-3-segundos-paginacion-happy.md)  | Happy Path  | Integration, E2E  | Ready  | Media     | AC-004                 |
| [TC-011](./TC-011-indicador-carga-respuesta-lenta-limite.md)     | Límite      | Integration       | Ready  | Baja      | AC-004                 |

## Cobertura por criterio

| Criterio                           | Casos de prueba                   |
| ---------------------------------- | --------------------------------- |
| AC-001 (Interacción de usuario)    | TC-001 · TC-002 · TC-003 · TC-004 |
| AC-002 (Procesamiento de datos)    | TC-005 · TC-006                   |
| AC-003 (Interacción de usuario)    | TC-007 · TC-008 · TC-009          |
| AC-004 (Eficiencia de rendimiento) | TC-010 · TC-011                   |

Los cuatro criterios de aceptación de la historia tienen al menos un caso de prueba.
