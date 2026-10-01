# Casos de prueba — US-004: Procesos — instancias en ejecución y completadas

Casos de prueba derivados de los criterios de aceptación de [US-004](../README.md), según IEEE 29119-4.

**Entorno de referencia:** ambiente de BAW `https://192.168.120.100:9443` (también accesible como `btq-srv-bawodm`), igual que US-001 y US-002.
**Datos de prueba:** credenciales por variables de entorno `TEST_USER_NAME` / `TEST_USER_PASSWORD` (reutilizadas de US-001/US-002); el resto, propuestos en cada TC y marcados `[propuesto]`.

| TC                                                                  | Perspectiva | Tipo de prueba | Estado | Prioridad | Criterio de aceptación |
| ------------------------------------------------------------------- | ----------- | -------------- | ------ | --------- | ---------------------- |
| [TC-001](./TC-001-listado-instancias-activas-running-happy.md)      | Happy Path  | API Test, E2E  | Ready  | Alta      | AC-001                 |
| [TC-002](./TC-002-listado-instancias-completadas-finished-happy.md) | Happy Path  | API Test, E2E  | Ready  | Alta      | AC-001                 |
| [TC-003](./TC-003-listado-sin-sesion-401-error.md)                  | Error       | API Test, E2E  | Ready  | Alta      | AC-001                 |
| [TC-004](./TC-004-estado-sin-instancias-completadas-limite.md)      | Límite      | E2E            | Ready  | Media     | AC-001                 |
| [TC-005](./TC-005-fallo-carga-listado-baw-5xx-error.md)             | Error       | E2E            | Ready  | Media     | AC-001                 |
| [TC-006](./TC-006-busqueda-texto-search-term-servidor-happy.md)     | Happy Path  | API Test, E2E  | Ready  | Alta      | AC-002                 |
| [TC-007](./TC-007-filtro-modelo-proceso-happy.md)                   | Happy Path  | API Test, E2E  | Ready  | Alta      | AC-002                 |
| [TC-008](./TC-008-filtro-process-app-y-snapshot-happy.md)           | Happy Path  | API Test, E2E  | Ready  | Media     | AC-002                 |
| [TC-009](./TC-009-combinacion-busqueda-filtros-estado-limite.md)    | Límite      | API Test, E2E  | Ready  | Media     | AC-002                 |
| [TC-010](./TC-010-busqueda-sin-coincidencias-estado-vacio-error.md) | Error       | E2E            | Ready  | Media     | AC-002                 |
| [TC-011](./TC-011-carga-listado-3-segundos-paginacion-happy.md)     | Happy Path  | E2E            | Ready  | Media     | AC-003                 |
| [TC-012](./TC-012-paginacion-pagina-siguiente-offset-size-happy.md) | Happy Path  | API Test, E2E  | Ready  | Media     | AC-003                 |
| [TC-013](./TC-013-ultima-pagina-sin-next-limite.md)                 | Límite      | API Test, E2E  | Ready  | Baja      | AC-003                 |
| [TC-014](./TC-014-indicador-carga-respuesta-lenta-limite.md)        | Límite      | E2E            | Ready  | Baja      | AC-003                 |
