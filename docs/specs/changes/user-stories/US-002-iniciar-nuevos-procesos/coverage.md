# Reporte de trazabilidad — US-002-iniciar-nuevos-procesos

**Fecha:** 2026-09-15 07:15
**Rama:** feature/US-002-iniciar-nuevos-procesos
**Commit:** f6fed41
**Trabajo:** [US-002](./README.md)
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

## Resumen

Los 4 AC-XXX de US-002 están cubiertos por pruebas automatizadas (unitarias) que pasan en verde. No hay `TC-XXX` documentados — el usuario optó por implementar directo sin pasar por `test-define` — así que el mapeo criterio → prueba se **infirió** directamente del código y sus tests, no de casos de prueba declarados. Es la única razón del `⚠️`: no hay ningún criterio sin cubrir ni ninguna prueba en rojo.

**Pruebas:** caché fresca de `quality-check` (commit `43f58a4`, 2026-09-15, `docs/audits/quality-check.md`, veredicto APPROVED). Resultado por suite: unit `PASS` (533 passed) · coverage `PASS` (97.5% líneas, umbral 80%) · e2e `PASS` (1 passed) · architecture `PASS` (14 criterios, 0 violaciones — no mapea a ningún AC-XXX).

**Cobertura de criterios de aceptación**

| Total | COVERED | PARTIAL | UNCOVERED |
| ----- | ------- | ------- | --------- |
| 4     | 4       | 0       | 0         |

## Cobertura por criterio

| Criterio | Descripción                                                                                              | Estado     | Observaciones                                                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-001   | El sistema DEBE mostrar el listado de procesos disponibles, obtenido de `GET .../exposed/process`        | ✅ COVERED | Sin `TC-XXX` documentado — mapeo inferido desde el código y sus tests (`ProcessRepository.findStartable`, `StartProcessManager.load`, estados del menú en `Tasks`)      |
| AC-002   | El sistema DEBE iniciar la instancia mediante `POST .../process?action=start` con `bpdId`/`processAppId` | ✅ COVERED | Sin `TC-XXX` documentado — mapeo inferido (`ProcessRepository.start`, `StartProcessManager.start`, `Tasks.startProcess`)                                                |
| AC-003   | El sistema NO DEBE reintentar automáticamente ante timeout/red; DEBE informar el error                   | ✅ COVERED | Sin `TC-XXX` documentado — mapeo inferido (`ProcessRepository.start` propaga sin notificar; `Tasks.notifyStartError` distingue el error de conectividad y no reintenta) |
| AC-004   | Si el listado está vacío o falla su carga, el sistema DEBE mostrar un estado vacío o de error explícito  | ✅ COVERED | Sin `TC-XXX` documentado — mapeo inferido (estados de carga/vacío/error del `mat-menu` en `tasks.spec.ts`)                                                              |

## Matriz de trazabilidad

| Criterio | TC  | Tipo | Evidencia                                                                                                                                      | Ejecución     | Resultado |
| -------- | --- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/services/process-repository.spec.ts` (`findStartable`)                                                | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/utils/process-mapper.spec.ts`                                                                         | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/services/start-process-manager.spec.ts` (`load`)                                                      | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts` (estados carga/vacío/error/datos del menú)                            | quality-check | ✅ PASS   |
| AC-002   | —   | Unit | `frontend/src/app/features/baw-processes/services/process-repository.spec.ts` (`start`)                                                        | quality-check | ✅ PASS   |
| AC-002   | —   | Unit | `frontend/src/app/features/baw-processes/services/start-process-manager.spec.ts` (`start`)                                                     | quality-check | ✅ PASS   |
| AC-002   | —   | Unit | `frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts` (clic → `startProcess` → `start` con `bpdId`/`processAppId`)          | quality-check | ✅ PASS   |
| AC-003   | —   | Unit | `frontend/src/app/features/baw-processes/services/process-repository.spec.ts` (propaga rechazo sin notificar)                                  | quality-check | ✅ PASS   |
| AC-003   | —   | Unit | `frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts` (timeout/red → aviso de resultado incierto, sin reintento automático) | quality-check | ✅ PASS   |
| AC-004   | —   | Unit | `frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts` (estado vacío del menú)                                               | quality-check | ✅ PASS   |
| AC-004   | —   | Unit | `frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts` (estado de error del menú + "Reintentar")                             | quality-check | ✅ PASS   |

## Observaciones y pendientes

- No existe `test-cases/` para US-002: toda la matriz de arriba es un mapeo **inferido** desde el código y sus tests, no derivado de `TC-XXX` documentados por `test-define`. Si más adelante se ejecuta `test-define` sobre esta US, revalidar (`revalidate`) para que el reporte pase a basarse en casos de prueba declarados.
- `architecture` (validaciones de arquitectura del repo) dio `PASS` (14 criterios, 0 violaciones) pero no se mapea a ningún `AC-XXX`: no es cobertura funcional.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=0a6115da6e6190c11991a14b5374f58ec1a7058b · spec=3e5b159b41f9bb29b2760e477852e934b93ff72e · generated=2026-09-15 -->
