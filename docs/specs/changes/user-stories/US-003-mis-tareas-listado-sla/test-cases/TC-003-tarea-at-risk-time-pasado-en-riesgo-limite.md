# TC-003 — Dada una tarea con `due_date` futuro pero `at_risk_time` ya pasado, Cuando el sistema deriva su estado de SLA, Entonces la tarea se muestra como «en riesgo»

**Perspectiva:** Límite
**Tipo de prueba:** Unit, E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado de tareas asignadas con estado de SLA derivado en el cliente
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=Unit, E2E · criterion=AC-001 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene asignada al menos una tarea cuyo `due_date` es futuro y cuyo `at_risk_time` ya pasó.
- La comparación de fechas se realiza en UTC contra el reloj del cliente.

## Datos de prueba

| Campo                                        | Valor                        | Notas                                       |
| -------------------------------------------- | ---------------------------- | ------------------------------------------- |
| Usuario                                      | `usuario.prueba` [propuesto] | Cuenta válida del ambiente de referencia    |
| Tarea en riesgo — `due_date`                 | Hoy + 1 día [propuesto]      | Futuro: no procede «vencida»                |
| Tarea en riesgo — `at_risk_time`             | Hoy − 3 horas [propuesto]    | Ya pasado: procede «en riesgo»              |
| Tarea sin `at_risk_time` — `due_date`        | Hoy + 1 día [propuesto]      | Mismo vencimiento, sin el campo opcional    |
| Tarea con `at_risk_time` futuro — `due_date` | Hoy + 1 día [propuesto]      | `at_risk_time` = Hoy + 12 horas [propuesto] |

## Pasos de ejecución

| #   | Actor   | Acción                                                                                 | Resultado esperado del paso                                                                      |
| --- | ------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Sistema | Aplica la regla de derivación a la tarea con `due_date` futuro y `at_risk_time` pasado | El primer paso (`due_date < ahora`) no se cumple; el segundo sí, y la regla devuelve «en riesgo» |
| 2   | Sistema | Aplica la regla a la tarea con el mismo `due_date` pero sin `at_risk_time`             | La regla devuelve «a tiempo»: sin el campo opcional, una tarea nunca pasa por «en riesgo»        |
| 3   | Sistema | Aplica la regla a la tarea con `at_risk_time` futuro                                   | La regla devuelve «a tiempo»                                                                     |
| 4   | Usuario | Abre el módulo «Mis tareas»                                                            | El listado carga las tareas del usuario desde `GET /bpm/user-tasks`                              |
| 5   | Usuario | Revisa la fila de la tarea con `at_risk_time` pasado                                   | Se muestra con el estado de SLA «en riesgo», visualmente distinguible de «a tiempo» y «vencida»  |
| 6   | Usuario | Revisa las filas de las otras dos tareas                                               | Ambas se muestran como «a tiempo», pese a compartir el mismo `due_date`                          |

## Resultado esperado final

Solo la tarea cuyo `at_risk_time` ya pasó aparece como «en riesgo»; las que comparten vencimiento pero carecen del campo o lo tienen en el futuro aparecen como «a tiempo». El estado «en riesgo» depende exclusivamente de `at_risk_time` y nunca se infiere de la proximidad del `due_date`.

## Observaciones

Es la perspectiva de límite del criterio porque «en riesgo» solo existe en la franja entre `at_risk_time` y `due_date`, y porque `at_risk_time` es opcional en el contrato de BAW: sin ese campo, la tarea salta directamente de «a tiempo» a «vencida». Esa ausencia es comportamiento esperado, no un defecto. Complementa a [TC-001](./TC-001-listado-tareas-sla-a-tiempo-happy.md) y [TC-002](./TC-002-tarea-due-date-pasado-vencida-happy.md), completando los tres estados de SLA.
