# TC-006 — Dado un usuario con más tareas que el tamaño de página, Cuando pagina el listado, Entonces el resumen de SLA sigue reflejando el total real del usuario y no cambia entre páginas

**Perspectiva:** Límite
**Tipo de prueba:** Unit, Integration
**Prioridad:** Media
**Criterio de aceptación:** AC-002 (Procesamiento de datos) — Resumen de conteos por estado de SLA calculado por el servidor sobre el total real de tareas del usuario
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=Unit, Integration · criterion=AC-002 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11
**Actualizado:** 2026-09-14 — Reescrito: el escenario que este TC verificaba (el resumen refleja solo la página, no el total) era el comportamiento de la API custom `GET /bpm/user-tasks`; con la migración a API-13/WLE (ADR-015) el resumen es exacto también con más tareas que el tamaño de página, así que este TC pasa a verificar exactamente eso. Ver [MD-05](../../../../specs/technical-docs/portal-procesos-baw.md#md-05).

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene un número de tareas asignadas mayor que el tamaño de página configurado, con una distribución de estados de SLA conocida.
- La respuesta de API-13 (`PUT /rest/bpm/wle/v1/tasks?calcStats=true`) incluye `data.totalCount` mayor que `data.items.length` de la página, señal de que hay más páginas.

## Datos de prueba

| Campo                        | Valor                                           | Notas                                                                      |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| Usuario                      | `usuario.carga` [propuesto]                     | Cuenta con volumen alto de tareas                                          |
| Total de tareas del usuario  | 30 [propuesto]                                  | 12 a tiempo, 9 en riesgo, 9 vencidas                                       |
| `size` de página             | `10` [propuesto]                                | Tamaño de página deliberadamente menor que el total                        |
| Primera página (`offset=0`)  | 6 a tiempo, 3 en riesgo, 1 vencida [propuesto]  | Distribución distinta a la del total — filas visibles, no el resumen       |
| Segunda página (`offset=10`) | 4 a tiempo, 2 en riesgo, 4 vencidas [propuesto] | Distribución distinta — para verificar que el resumen no cambia al paginar |

## Pasos de ejecución

| #   | Actor       | Acción                                                                   | Resultado esperado del paso                                                                                                                                                                        |
| --- | ----------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sistema     | Invoca API-13 con `size=10`, `offset=0` (query param) y `calcStats=true` | BAW devuelve `200` con 10 tareas (`items`), `totalCount=30` y `stats` con `onTime=12, atRisk=9, overdue=9, total=30`                                                                               |
| 2   | Usuario     | Observa el resumen que encabeza el listado en la primera página          | Muestra 12 a tiempo, 9 en riesgo y 9 vencidas — el total real del usuario, NO la distribución 6/3/1 de las filas visibles                                                                          |
| 3   | Verificador | Compara el resumen con las filas visibles de la primera página           | El resumen (12/9/9) es distinto de la distribución de las 10 filas visibles (6/3/1) — son conceptos independientes: el resumen es del total, las filas son de la página                            |
| 4   | Verificador | Comprueba el número de llamadas emitidas para pintar el resumen          | Se emitió una sola llamada a API-13; el resumen no requiere recorrer todas las páginas ni llamadas adicionales                                                                                     |
| 5   | Usuario     | Avanza a la segunda página del listado                                   | El sistema invoca API-13 con `offset=10` (query param) y recibe las 10 tareas siguientes, con distribución de filas 4/2/4                                                                          |
| 6   | Usuario     | Observa el resumen que encabeza el listado en la segunda página          | El resumen sigue mostrando 12 a tiempo, 9 en riesgo y 9 vencidas — **no cambia** al paginar, aunque las filas visibles sí cambiaron                                                                |
| 7   | Verificador | Compara `stats` de ambas respuestas                                      | `stats` de la página 1 y de la página 2 son idénticos (`onTime=12, atRisk=9, overdue=9, total=30`), porque ambos se calculan sobre la misma búsqueda total, no sobre el `offset`/`size` solicitado |

## Resultado esperado final

El resumen de SLA muestra siempre 12 a tiempo, 9 en riesgo y 9 vencidas — el total real de las 30 tareas del usuario — en ambas páginas, sin variar al paginar y sin coincidir con la distribución de las filas visibles de ninguna de las dos páginas. El sistema no emite llamadas adicionales para calcularlo: el propio `stats` de la respuesta paginada ya lo trae.

## Observaciones

Esta es la perspectiva de límite del criterio porque es el caso que distingue el resumen (exacto, sobre el total) de las filas visibles (parciales, sobre la página): un lector apurado podría asumir que ambos deberían coincidir, y este TC prueba que no tienen por qué hacerlo y que eso es correcto. Antes de la migración a API-13 (ADR-015), este mismo escenario exponía el comportamiento contrario — el resumen SÍ dependía de la página, como compromiso aceptado frente a NFR-003 —; ese comportamiento quedó obsoleto con el cambio de API y ya no aplica. El caso con una sola página (resumen y filas visibles coinciden porque todo cabe) lo cubre [TC-005](./TC-005-resumen-conteos-sla-pagina-happy.md).
