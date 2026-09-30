# TC-002 — Dada una tarea asignada cuyo `due_date` ya pasó, Cuando el sistema deriva su estado de SLA, Entonces la tarea se muestra como «vencida»

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
- El usuario tiene asignada al menos una tarea cuyo `due_date` es anterior al momento de la ejecución.
- La comparación de fechas se realiza en UTC contra el reloj del cliente.

## Datos de prueba

| Campo                                         | Valor                        | Notas                                             |
| --------------------------------------------- | ---------------------------- | ------------------------------------------------- |
| Usuario                                       | `usuario.prueba` [propuesto] | Cuenta válida del ambiente de referencia          |
| Tarea vencida — `due_date`                    | Hoy − 2 días [propuesto]     | Anterior al momento actual                        |
| Tarea vencida — `at_risk_time`                | Hoy − 3 días [propuesto]     | También pasado; `due_date` debe tener precedencia |
| Tarea vencida sin `at_risk_time` — `due_date` | Hoy − 1 hora [propuesto]     | Variante sin el campo opcional                    |
| Tarea de control — `due_date`                 | Hoy + 5 días [propuesto]     | Debe seguir mostrándose «a tiempo»                |

## Pasos de ejecución

| #   | Actor   | Acción                                                                                                 | Resultado esperado del paso                                                                            |
| --- | ------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 1   | Sistema | Aplica la regla de derivación de SLA a una tarea con `due_date` pasado y `at_risk_time` también pasado | La regla evalúa primero `due_date < ahora` y devuelve «vencida», sin llegar a evaluar `at_risk_time`   |
| 2   | Sistema | Aplica la regla a una tarea con `due_date` pasado y sin `at_risk_time`                                 | La regla devuelve «vencida»; la ausencia del campo opcional no altera el resultado                     |
| 3   | Sistema | Aplica la regla a la tarea de control con `due_date` futuro                                            | La regla devuelve «a tiempo»                                                                           |
| 4   | Usuario | Abre el módulo «Mis tareas»                                                                            | El listado carga las tareas del usuario desde `GET /bpm/user-tasks`                                    |
| 5   | Usuario | Revisa las filas correspondientes a las tareas vencidas                                                | Ambas se muestran con el estado de SLA «vencida», visualmente distinguible de «a tiempo» y «en riesgo» |
| 6   | Usuario | Revisa la fila de la tarea de control                                                                  | Se muestra con el estado «a tiempo», lo que confirma que la derivación no marca todo como vencido      |

## Resultado esperado final

Toda tarea cuyo `due_date` sea anterior al momento actual aparece en «Mis tareas» con el estado de SLA «vencida», tanto si `at_risk_time` está presente como si no, y con precedencia sobre «en riesgo». Las tareas con vencimiento futuro conservan su estado correspondiente.

## Observaciones

El estado «vencida» es el primer paso de la regla de derivación y siempre es evaluable, porque `due_date` es obligatorio en el contrato de BAW. La deriva entre el reloj del navegador y el del servidor es una imprecisión aceptada: los datos de prueba usan márgenes de horas o días para que no la afecte.
