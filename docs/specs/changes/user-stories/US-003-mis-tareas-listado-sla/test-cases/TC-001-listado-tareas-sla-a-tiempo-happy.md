# TC-001 — Dado un usuario autenticado con tareas asignadas cuyo vencimiento está lejano, Cuando abre «Mis tareas», Entonces el listado muestra cada tarea con sus datos y el estado de SLA «a tiempo»

**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado de tareas asignadas con estado de SLA derivado en el cliente
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene al menos tres tareas asignadas en ese ambiente, todas con `due_date` claramente futuro y sin `at_risk_time` alcanzado.
- Las tareas pertenecen a instancias de proceso con nombre y a equipos con nombre, para que todas las columnas del listado tengan valor.

## Datos de prueba

| Campo                    | Valor                        | Notas                                     |
| ------------------------ | ---------------------------- | ----------------------------------------- |
| Usuario                  | `usuario.prueba` [propuesto] | Cuenta válida del ambiente de referencia  |
| Tarea 1 — `due_date`     | Hoy + 5 días [propuesto]     | Vencimiento lejano                        |
| Tarea 1 — `at_risk_time` | Hoy + 4 días [propuesto]     | Aún no alcanzado                          |
| Tarea 2 — `due_date`     | Hoy + 2 días [propuesto]     | Vencimiento lejano                        |
| Tarea 2 — `at_risk_time` | Ausente [propuesto]          | Campo opcional en el contrato de BAW      |
| Tarea 3 — `due_date`     | Hoy + 7 días [propuesto]     | Vencimiento lejano                        |
| `optional_parts`         | `team_details`               | Necesario para poblar la columna «equipo» |

## Pasos de ejecución

| #   | Actor   | Acción                                              | Resultado esperado del paso                                                                                                              |
| --- | ------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Usuario | Abre el módulo «Mis tareas»                         | El sistema invoca `GET /bpm/user-tasks` con la cookie de sesión, la cabecera `BPMCSRFToken` y `optional_parts=team_details`              |
| 2   | Sistema | Recibe de BAW `200` con `user_task_instances[]`     | El sistema dispone de las tres tareas asignadas al usuario                                                                               |
| 3   | Sistema | Deriva el estado de SLA de cada tarea en el cliente | Como `due_date` es futuro y `at_risk_time` no ha pasado (o no viene), las tres tareas se derivan como «a tiempo»                         |
| 4   | Sistema | Pinta el listado                                    | Cada fila muestra nombre de la tarea, instancia de proceso, equipo, vencimiento y estado de SLA                                          |
| 5   | Usuario | Revisa las filas del listado                        | Las tres tareas aparecen con estado de SLA «a tiempo», y los valores de nombre, instancia, equipo y vencimiento coinciden con los de BAW |

## Resultado esperado final

El módulo «Mis tareas» muestra las tres tareas asignadas al usuario, cada una con nombre, instancia de proceso, equipo, fecha de vencimiento y el estado de SLA «a tiempo». Los datos mostrados coinciden con la respuesta de `GET /bpm/user-tasks` y ninguna tarea aparece sin estado de SLA.

## Observaciones

El nombre visible de la tarea usa `display_name` cuando BAW lo devuelve y `name` en caso contrario; el equipo procede de `assignments.potential_owners.team.name`, que solo llega si se pide `optional_parts=team_details`. No se debe pedir `optional_parts=data` en el listado: es pesado y solo hace falta en el detalle. Los estados «vencida» y «en riesgo» se cubren en [TC-002](./TC-002-tarea-due-date-pasado-vencida-happy.md) y [TC-003](./TC-003-tarea-at-risk-time-pasado-en-riesgo-limite.md).
