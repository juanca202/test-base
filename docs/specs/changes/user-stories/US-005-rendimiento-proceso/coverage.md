# Reporte de trazabilidad — US-005-rendimiento-proceso

**Fecha:** 2026-09-16 12:00
**Rama:** feature/US-005-rendimiento-proceso
**Commit:** 83e4158
**Trabajo:** [US-005](./README.md)
**Veredicto:** ⚠️ APPROVED_WITH_NOTES

## Resumen

Los dos criterios de aceptación de US-005 (AC-001, AC-002) están cubiertos por pruebas unitarias de TK-001 y TK-002, todas en verde. La US no tiene carpeta `test-cases/` (lo documenta `progress.md`: se implementó con TDD directo sobre AC-001/las IT-XX de cada TK, sin `test-define` previo), así que el mapeo criterio → test se **infirió** de los nombres de test y de la estructura de cada `.spec.ts`, no de un vínculo declarado — el caveat que motiva el `⚠️`.

**Pruebas:** caché fresca de `quality-check` (commit `48529ed`, 2026-09-16T11:56:46-05:00; el commit actual `83e4158` solo añade el propio informe de `quality-check`, documentación excluida del fingerprint). Resultado por suite: unit ✅ `PASS` (656 passed, 0 failed) · coverage ✅ `PASS` (line 97.2%, umbral 80%) · e2e ✅ `PASS` (1 passed, prueba `e2e/example.spec.ts` no relacionada con esta US).

**Cobertura de criterios de aceptación**

| Total | COVERED | PARTIAL | UNCOVERED |
| ----- | ------- | ------- | --------- |
| 2     | 2       | 0       | 0         |

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción                                                                                                                                                                | Estado     | Observaciones                                                                                                                                                                                                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-001   | El sistema DEBE mostrar, por tipo de proceso, indicadores agregados (instancias en curso, desglose de SLA a tiempo/en riesgo/vencida) para todos los procesos disponibles. | ✅ COVERED | Mapeo inferido, no declarado (sin `test-cases/`). El script de humo de TK-001 IT-05 (verificación contra un ambiente real de los dos Ajax Services que alimentan este criterio) aún no se ha ejecutado contra ningún ambiente — riesgo residual documentado en `progress.md`/`TK-001`, pendiente para el primer despliegue. |
| AC-002   | Al seleccionar un proceso, el sistema DEBE mostrar su diagrama con el estado de las tareas superpuesto, traducido a BPMN 2.0 y renderizado con `bpmn-js`.                  | ✅ COVERED | Mapeo inferido, no declarado. La traducción a BPMN 2.0 la realiza `ProcessDiagramMapper`, componente preexistente de WI-003 (no forma parte de los archivos nuevos de TK-001/TK-002); TK-002 lo reutiliza sin duplicarlo, generalizando `TaskFlowModal` para aceptar `{ piid, severityClass }` directo.                     |

## Matriz de trazabilidad

Vista auditable: una fila por cada combinación criterio × caso de prueba × tipo de prueba hallado (sin `test-cases/`, el `TC` queda `—` y el tipo es el del artefacto hallado en el repo).

| Criterio | TC  | Tipo | Evidencia                                                                                                                                                                                                                                                                               | Ejecución     | Resultado |
| -------- | --- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/utils/process-performance-mapper.spec.ts` (`toDetail`: "should translate riskState to TaskSlaStatus and aggregate SLA counts (AC-001)")                                                                                                        | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/services/process-performance-repository.spec.ts` (`getDetail`, `listOverview`: "should list the summaries of every process ProcessRepository.findStartable() exposes (TK-001 IT-03)")                                                          | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/components/process-performance/process-performance.spec.ts` (grid de tarjetas por proceso, estados vacío/carga/error)                                                                                                                          | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/components/process-performance/process-performance-card/process-performance-card.spec.ts` (conteos vencido/en riesgo/a tiempo con badges, donut por estado)                                                                                    | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/components/process-performance/process-performance-detail/process-performance-detail.spec.ts` (estadísticas rápidas, listado "Instancias en curso" con riskState/dueDate/age)                                                                  | quality-check | ✅ PASS   |
| AC-002   | —   | Unit | `frontend/src/app/features/baw-processes/components/process-performance/process-performance-detail/process-performance-detail.spec.ts` (pestaña "Diagrama": lista instancias y abre `TaskFlowModal` con `{ piid, severityClass }` al elegir una — TK-002 IT-05)                         | quality-check | ✅ PASS   |
| AC-002   | —   | Unit | `frontend/src/app/features/baw-processes/components/task-flow/task-flow-modal.spec.ts` (bloque "direct instance data ({ piid, severityClass }, US-005 TK-002)": obtiene el modelo visual por `piid`, resalta `activeTasks` con la `severityClass` dada, fallback si falla la obtención) | quality-check | ✅ PASS   |
| AC-002   | —   | Unit | `frontend/src/app/features/baw-processes/utils/process-diagram-mapper.spec.ts` (traducción del modelo visual de WLE a BPMN 2.0 — dependencia preexistente de WI-003, reutilizada por TK-002)                                                                                            | quality-check | ✅ PASS   |

## Observaciones y pendientes

- La US no tiene carpeta `test-cases/` (sin paso previo por `test-define`): todo el mapeo criterio → test de este reporte es **inferido** desde los nombres de test y la estructura de cada `.spec.ts`, no un vínculo declarado. Si se documentan TCs para esta US más adelante, revalidar con `revalidate` para pasar a mapeo declarado.
- La suite `e2e` (1 passed) corresponde a `e2e/example.spec.ts`, no relacionada con esta US: no hay flujo E2E crítico de "Rendimiento del proceso" priorizado por producto todavía (`docs/standards/testing.md`), por lo que su ausencia no es un hueco de este reporte.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=fcda15e8099a78d3c82a6103ba58b1b0e610ef07 · spec=6ce9adabd6af511d4925a3546be55c1bd6694bbf · generated=2026-09-16 -->
