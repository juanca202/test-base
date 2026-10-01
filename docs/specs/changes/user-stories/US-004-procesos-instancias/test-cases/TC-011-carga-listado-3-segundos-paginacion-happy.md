# TC-011 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- Hay más instancias que el tamaño de página, para que la paginación sea relevante.
- Red en condiciones normales, sin limitación artificial.

**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-003 (Eficiencia de rendimiento) — Carga en ≤ 3 s con paginación de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo            | Valor                                    | Notas                                                               |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario          | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña       | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| `size` de página | `25` [propuesto]                         | Tamaño configurado del listado                                      |
| Umbral de carga  | 3 segundos                               | Fijado por AC-003                                                   |
| Repeticiones     | 5 [propuesto]                            | Descarta mediciones atípicas                                        |

## Datos de prueba

| 1 | Verificador | Fija el criterio de fin de carga (listado pintado y utilizable) | El criterio queda definido antes de medir |
| 2 | Usuario | Abre «Procesos» | Se invoca `GET /bpm/processes` con `offset` y `size` |
| 3 | Verificador | Inspecciona la petición | Incluye `size=25`; no se solicitan todas las instancias de una vez |
| 4 | Verificador | Mide el tiempo desde el paso 2 hasta el listado utilizable | El tiempo es igual o inferior a 3 segundos en cada repetición |

## Pasos de ejecución

| #                                                               | Actor | Acción | Resultado esperado del paso |
| --------------------------------------------------------------- | ----- | ------ | --------------------------- |
| El listado carga en ≤ 3 s pidiendo solo una página al servidor. |

## Resultado esperado final

Medición representativa: usar la mediana o el peor caso de las repeticiones. Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
