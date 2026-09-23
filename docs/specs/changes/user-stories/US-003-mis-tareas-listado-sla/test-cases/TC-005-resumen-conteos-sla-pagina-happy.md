# TC-005 — Dado un usuario con tareas en los tres estados de SLA, Cuando abre «Mis tareas», Entonces el resumen muestra los conteos de a tiempo, en riesgo y vencida del total real de sus tareas

**Perspectiva:** Happy Path
**Tipo de prueba:** Unit, E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-002 (Procesamiento de datos) — Resumen de conteos por estado de SLA calculado por el servidor sobre el total real de tareas del usuario
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-002 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11
**Actualizado:** 2026-09-14 — AC-002 cambió de resumen calculado en cliente sobre la página a resumen calculado en servidor sobre el total (ADR-015, migración a API-13/WLE); ver [MD-05](../../../../specs/technical-docs/portal-procesos-baw.md#md-05).

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene exactamente seis tareas asignadas, repartidas entre los tres estados de SLA, y todas caben en la primera página del listado.
- La derivación del estado de SLA por tarea ya está verificada en [TC-001](./TC-001-listado-tareas-sla-a-tiempo-happy.md), [TC-002](./TC-002-tarea-due-date-pasado-vencida-happy.md) y [TC-003](./TC-003-tarea-at-risk-time-pasado-en-riesgo-limite.md).

## Datos de prueba

| Campo              | Valor                                                                              | Notas                                                 |
| ------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Usuario            | `usuario.prueba` [propuesto]                                                       | Cuenta válida del ambiente de referencia              |
| Tareas «a tiempo»  | 3 tareas con `due_date` = Hoy + 5 días [propuesto]                                 | Sin `at_risk_time` alcanzado                          |
| Tareas «en riesgo» | 2 tareas con `due_date` = Hoy + 1 día y `at_risk_time` = Hoy − 2 horas [propuesto] | `at_risk_time` ya pasado                              |
| Tareas «vencida»   | 1 tarea con `due_date` = Hoy − 1 día [propuesto]                                   | Vencimiento pasado                                    |
| `size` de página   | `25` [propuesto]                                                                   | Mayor que el total, para que todo quepa en una página |

## Pasos de ejecución

| #   | Actor       | Acción                                                                                                                            | Resultado esperado del paso                                                                                                               |
| --- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sistema     | Mapea la respuesta de API-13 (`data.stats`) de un usuario con 6 tareas (3 a tiempo, 2 en riesgo, 1 vencida) al resumen de dominio | El mapeo produce `onTime = 3`, `atRisk = 2`, `overdue = 1` y `total = 6`, tomados de `stats.onTrack/atRisk/overdue/total` de la respuesta |
| 2   | Sistema     | Mapea la respuesta de un usuario sin tareas (`stats.total = 0`)                                                                   | El mapeo devuelve los cuatro valores en cero, sin error                                                                                   |
| 3   | Usuario     | Abre el módulo «Mis tareas»                                                                                                       | El listado carga las seis tareas desde API-13 (`PUT /rest/bpm/wle/v1/tasks?calcStats=true`) con `size=25`                                 |
| 4   | Usuario     | Observa el resumen que encabeza el listado                                                                                        | Muestra 3 a tiempo, 2 en riesgo y 1 vencida, tomados directamente de `stats`, no recalculados a partir de las filas visibles              |
| 5   | Usuario     | Cuenta las filas del listado por estado de SLA                                                                                    | El recuento manual de las filas coincide exactamente con los conteos del resumen (en este caso las 6 tareas caben en una sola página)     |
| 6   | Verificador | Comprueba la suma del resumen                                                                                                     | La suma de los tres conteos es igual a `stats.total` devuelto por el servidor                                                             |

## Resultado esperado final

El resumen que encabeza «Mis tareas» muestra los conteos 3 a tiempo, 2 en riesgo y 1 vencida, calculados por el servidor (`stats` de API-13) sobre el total real de tareas del usuario. En este caso coinciden además con las filas visibles porque las 6 tareas caben en una sola página; que el resumen siga siendo exacto cuando NO caben todas en una página es lo que cubre [TC-006](./TC-006-resumen-conteos-solo-pagina-cargada-limite.md).

## Observaciones

Con la migración a la API nativa WLE (API-13, ADR-015), el resumen de SLA ya no se calcula en el cliente sobre las tareas cargadas: la propia respuesta de búsqueda (`calcStats=true`) trae un bloque `stats` calculado en el servidor sobre el total de tareas que cumplen la búsqueda (`totalCount`), independientemente del tamaño de página (`size`) usado. Verificado en vivo: con 5 tareas reales de un usuario, `stats.total` coincidió con `totalCount` sin importar el `size` solicitado. El caso de esta prueba (todo en una página) ya no es una casualidad del volumen de datos, sino el mismo comportamiento garantizado que [TC-006](./TC-006-resumen-conteos-solo-pagina-cargada-limite.md) confirma con más tareas que el tamaño de página.
