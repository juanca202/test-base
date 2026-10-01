# TC-001 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- Existe al menos una instancia de proceso en estado `running`.

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado con filtro Activo/Completado
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-001 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo      | Valor                                    | Notas                                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| `states`   | `running`                                | Filtro Activo (por defecto)                                         |

## Datos de prueba

| 1 | Usuario | Abre el módulo «Procesos» | El sistema invoca `GET /bpm/processes?states=running` con cookie de sesión y `BPMCSRFToken` |
| 2 | Sistema | Recibe `200` con `processes` | Se pinta el listado de instancias y la pestaña «Activo» queda seleccionada |
| 3 | Verificador | Revisa cada fila | Cada instancia muestra los datos del modelo MD-03 y su estado corresponde a `running` |

## Pasos de ejecución

| #                                                                                                                      | Actor | Acción | Resultado esperado del paso |
| ---------------------------------------------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| El listado muestra únicamente instancias activas, obtenidas con `GET /bpm/processes?states=running` y respuesta `200`. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
