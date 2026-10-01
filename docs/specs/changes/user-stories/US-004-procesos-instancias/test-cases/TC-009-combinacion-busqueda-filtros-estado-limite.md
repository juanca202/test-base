# TC-009 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- Existen instancias que cumplen todos los criterios combinados.

**Perspectiva:** Límite
**Tipo de prueba:** API Test, E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-002 (Interacción de usuario) — Búsqueda y filtros de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-002 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo                                            | Valor                                    | Notas                                                               |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario                                          | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña                                       | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| `states`                                         | `running`                                | Estado activo                                                       |
| `search_term`, `model`, `containers`, `versions` | valores coherentes entre sí [propuesto]  | Todos a la vez                                                      |

## Datos de prueba

| 1 | Usuario | Aplica búsqueda y los tres filtros sobre la pestaña Activo | La petición incluye `states`, `search_term`, `model`, `containers` y `versions` |
| 2 | Sistema | Recibe `200` | El listado cumple todas las condiciones simultáneamente |
| 3 | Usuario | Cambia a «Completado» conservando los filtros | Se reenvían los mismos filtros con `states=finished` y la paginación vuelve a la primera página |

## Pasos de ejecución

| #                                                                                         | Actor | Acción | Resultado esperado del paso |
| ----------------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| Todos los filtros se combinan sin perderse al cambiar de estado, y la página se reinicia. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
