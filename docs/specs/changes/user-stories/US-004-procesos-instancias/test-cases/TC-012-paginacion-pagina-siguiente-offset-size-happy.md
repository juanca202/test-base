# TC-012 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- Hay más instancias que el tamaño de página y la respuesta trae `next`.

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test, E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-003 (Eficiencia de rendimiento) — Carga en ≤ 3 s con paginación de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-003 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo      | Valor                                    | Notas                                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| `size`     | `25` [propuesto]                         | Tamaño de página                                                    |

## Datos de prueba

| 1 | Usuario | Abre «Procesos» | Se invoca `GET /bpm/processes` con `size=25` y primera posición |
| 2 | Usuario | Avanza a la página siguiente | Se invoca con `offset` correspondiente a la segunda página y el mismo `size` |
| 3 | Sistema | Recibe `200` | Se muestran las instancias siguientes, distintas de las de la primera página, en ≤ 3 s |

## Pasos de ejecución

| #                                                                                                         | Actor | Acción | Resultado esperado del paso |
| --------------------------------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| La navegación entre páginas se resuelve en servidor con `offset`/`size`, sin cargar el conjunto completo. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
