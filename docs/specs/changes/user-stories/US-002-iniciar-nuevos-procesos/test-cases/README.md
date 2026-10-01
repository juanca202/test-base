# Casos de prueba — US-002: Iniciar nuevos procesos

Casos de prueba derivados de los criterios de aceptación de [US-002](../README.md), según IEEE 29119-4.

**Entorno de referencia:** ambiente de BAW de desarrollo `https://192.168.120.100:9443` (también accesible como `btq-srv-bawodm`).
**Datos de prueba:** credenciales en las variables de entorno `TEST_USER_NAME` y `TEST_USER_PASSWORD`; proceso de referencia: el primer elemento de `exposedItemsList`; timeout de arranque: 5 s. Los identificadores marcados `[propuesto]` no constan en el artefacto.
**Escrituras reales:** solo TC-003 crea una instancia real; los TC E2E interceptan el `POST` de inicio.

| TC                                                                  | Perspectiva | Tipo de prueba | Estado | Prioridad | Criterio de aceptación |
| ------------------------------------------------------------------- | ----------- | -------------- | ------ | --------- | ---------------------- |
| [TC-001](./TC-001-listado-procesos-iniciables-happy.md)             | Happy Path  | API Test, E2E  | Ready  | Alta      | AC-001                 |
| [TC-002](./TC-002-listado-sin-sesion-401-error.md)                  | Error       | API Test       | Ready  | Alta      | AC-001                 |
| [TC-003](./TC-003-inicio-instancia-real-api-happy.md)               | Happy Path  | API Test       | Ready  | Alta      | AC-002                 |
| [TC-004](./TC-004-seleccion-proceso-envia-start-con-ids-happy.md)   | Happy Path  | E2E            | Ready  | Alta      | AC-002                 |
| [TC-005](./TC-005-inicio-bpdid-inexistente-error.md)                | Error       | API Test       | Ready  | Media     | AC-002                 |
| [TC-006](./TC-006-timeout-inicio-sin-reintento-automatico-error.md) | Error       | E2E            | Ready  | Alta      | AC-003                 |
| [TC-007](./TC-007-error-red-reintento-manual-error.md)              | Error       | E2E            | Ready  | Alta      | AC-003                 |
| [TC-008](./TC-008-listado-vacio-estado-vacio-limite.md)             | Límite      | E2E            | Ready  | Media     | AC-004                 |
| [TC-009](./TC-009-fallo-carga-listado-estado-error.md)              | Error       | E2E            | Ready  | Alta      | AC-004                 |

## Cobertura por criterio

| Criterio                        | Casos de prueba          |
| ------------------------------- | ------------------------ |
| AC-001 (Interacción de usuario) | TC-001 · TC-002          |
| AC-002 (Casos de uso)           | TC-003 · TC-004 · TC-005 |
| AC-003 (Fiabilidad)             | TC-006 · TC-007          |
| AC-004 (Interacción de usuario) | TC-008 · TC-009          |

Los cuatro criterios de aceptación de la historia tienen al menos un caso de prueba `Ready`.
