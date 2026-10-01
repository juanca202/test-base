# TC-008 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- Existen instancias en al menos dos process apps o snapshots distintos.

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test, E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-002 (Interacción de usuario) — Búsqueda y filtros de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-002 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo        | Valor                                             | Notas                                                               |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------------- |
| Usuario      | variable de entorno `TEST_USER_NAME`              | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña   | variable de entorno `TEST_USER_PASSWORD`          | Nunca se escribe en el TC ni en los reportes                        |
| `containers` | acrónimo de una process app existente [propuesto] | Ej. `VR`                                                            |
| `versions`   | acrónimo de un snapshot existente [propuesto]     | Filtro por snapshot                                                 |

## Datos de prueba

| 1 | Usuario | Selecciona una process app | El sistema invoca `GET /bpm/processes` con `containers=<acrónimo>` |
| 2 | Usuario | Selecciona además un snapshot | La petición incluye `versions=<acrónimo>` |
| 3 | Sistema | Recibe `200` | Solo se muestran instancias de esa process app y snapshot |

## Pasos de ejecución

| #                                                                                           | Actor | Acción | Resultado esperado del paso |
| ------------------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| Los filtros de process app y snapshot se aplican en servidor con `containers` y `versions`. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
