# Casos de prueba — US-001: Autenticación y acceso al portal

Casos de prueba derivados de los criterios de aceptación de [US-001](../README.md), según IEEE 29119-4.

**Entorno de referencia:** ambiente de BAW `https://192.168.120.100:9443` (también accesible como `btq-srv-bawodm`).
**Datos de prueba:** propuestos dentro de cada TC y marcados `[propuesto]`.

| TC                                                                | Perspectiva | Tipo de prueba    | Estado | Prioridad | Criterio de aceptación |
| ----------------------------------------------------------------- | ----------- | ----------------- | ------ | --------- | ---------------------- |
| [TC-001](./TC-001-login-credenciales-validas-happy.md)            | Happy Path  | Integration, E2E  | Ready  | Alta      | AC-001                 |
| [TC-002](./TC-002-acceso-sin-sesion-redirige-login-error.md)      | Error       | E2E               | Ready  | Alta      | AC-001                 |
| [TC-003](./TC-003-login-credenciales-invalidas-error.md)          | Error       | Integration, E2E  | Ready  | Alta      | AC-001                 |
| [TC-004](./TC-004-peticion-autenticada-https-csrf-happy.md)       | Happy Path  | Unit, Integration | Ready  | Alta      | AC-002                 |
| [TC-005](./TC-005-peticion-sin-csrf-token-rechazada-error.md)     | Error       | Integration       | Ready  | Alta      | AC-002                 |
| [TC-006](./TC-006-cierre-sesion-desde-menu-lateral-happy.md)      | Happy Path  | E2E               | Ready  | Media     | AC-003                 |
| [TC-007](./TC-007-sesion-expira-durante-formulario-error.md)      | Error       | E2E               | Ready  | Alta      | AC-004                 |
| [TC-008](./TC-008-acceso-directo-url-sesion-invalida-error.md)    | Error       | E2E               | Ready  | Alta      | AC-004                 |
| [TC-009](./TC-009-baw-inaccesible-en-login-error.md)              | Error       | Integration, E2E  | Ready  | Media     | AC-005                 |
| [TC-011](./TC-011-layout-escritorio-navegacion-completa-happy.md) | Happy Path  | Visual Test       | Ready  | Media     | AC-007                 |
| [TC-012](./TC-012-layout-tablet-navegacion-colapsada-happy.md)    | Happy Path  | Visual Test       | Ready  | Media     | AC-007                 |
| [TC-013](./TC-013-layout-movil-menu-hamburguesa-happy.md)         | Happy Path  | Visual Test       | Ready  | Media     | AC-007                 |
| [TC-014](./TC-014-breakpoints-768-1280-limite.md)                 | Límite      | Visual Test       | Ready  | Baja      | AC-007                 |

## Cobertura por criterio

| Criterio                        | Casos de prueba                   |
| ------------------------------- | --------------------------------- |
| AC-001 (Reglas de negocio)      | TC-001 · TC-002 · TC-003          |
| AC-002 (Seguridad)              | TC-004 · TC-005                   |
| AC-003 (Interacción de usuario) | TC-006                            |
| AC-004 (Seguridad)              | TC-007 · TC-008                   |
| AC-005 (Fiabilidad)             | TC-009                            |
| AC-007 (Usabilidad)             | TC-011 · TC-012 · TC-013 · TC-014 |

Los seis criterios de aceptación de la historia tienen al menos un caso de prueba `Ready`.
