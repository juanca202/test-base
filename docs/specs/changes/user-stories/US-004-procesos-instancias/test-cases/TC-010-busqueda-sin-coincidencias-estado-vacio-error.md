# TC-010 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-002 (Interacción de usuario) — Búsqueda y filtros de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-002 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo             | Valor                                    | Notas                                                               |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario           | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña        | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| Texto de búsqueda | `zzz-sin-coincidencia` [propuesto]       | No existe en ningún modelo ni instancia                             |

## Datos de prueba

| 1 | Usuario | Escribe el texto sin coincidencias | Se invoca `GET /bpm/processes` con `search_term=zzz-sin-coincidencia` |
| 2 | Sistema | Recibe `200` con `processes` vacío | Se muestra un mensaje de «sin resultados» distinguible del error de carga |
| 3 | Usuario | Limpia la búsqueda | Se restablece el listado |

## Pasos de ejecución

| #                                                                                | Actor | Acción | Resultado esperado del paso |
| -------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| El portal diferencia «sin resultados» de un fallo y permite limpiar la búsqueda. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
