# TC-007 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- Existen instancias de al menos dos modelos distintos.

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Interacción de usuario) — Búsqueda y filtros de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-002 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo      | Valor                                     | Notas                                                               |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`      | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña | variable de entorno `TEST_USER_PASSWORD`  | Nunca se escribe en el TC ni en los reportes                        |
| `model`    | nombre de un modelo existente [propuesto] | Coincidencia según la API                                           |

## Datos de prueba

| 1 | Usuario | Selecciona un modelo en el filtro | El sistema invoca `GET /bpm/processes` con `model=<modelo>` |
| 2 | Sistema | Recibe `200` | Solo se muestran instancias del modelo elegido |
| 3 | Usuario | Quita el filtro | El listado vuelve a incluir todos los modelos |

## Pasos de ejecución

| #                                                                                    | Actor | Acción | Resultado esperado del paso |
| ------------------------------------------------------------------------------------ | ----- | ------ | --------------------------- |
| El listado se restringe por `model` en servidor y se restablece al quitar el filtro. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
