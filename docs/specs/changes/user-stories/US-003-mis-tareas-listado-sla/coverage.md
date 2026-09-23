# Reporte de trazabilidad — US-003-mis-tareas-listado-sla

**Fecha:** 2026-09-15 01:05
**Rama:** feature/US-003-mis-tareas-listado-sla
**Commit:** 816a604
**Trabajo:** [US-003](./README.md)
**Veredicto:** ⚠️ APPROVED_WITH_NOTES

## Resumen

Los cuatro criterios de aceptación tienen cobertura automatizada a nivel unitario/integración (MSW), pero ninguno tiene cobertura E2E propia — el repositorio no tiene más que un smoke test genérico (`e2e/example.spec.ts`), sin flujos de "Mis tareas". Además, **TC-007 quedó desalineado con la implementación**: describe un filtro de servidor (`states` sobre `GET /bpm/user-tasks`, API-05) que la migración a API-13/WLE (TK-008) retiró — el filtro de estado ahora se resuelve en el cliente, y ningún test valida la aserción literal de TC-007. Ningún criterio queda completamente sin cobertura (`UNCOVERED`), así que el veredicto es `APPROVED_WITH_NOTES`, no bloqueante — pero el hallazgo de TC-007 merece atención antes de dar la cobertura de AC-003 por cerrada.

**Pruebas:** caché fresca de `quality-check` (commit `816a604`, 2026-09-15). unit `PASS` (502 passed) · e2e `PASS` (1 passed, smoke genérico sin relación con US-003).

**Cobertura de criterios de aceptación**

| Total | COVERED | PARTIAL | UNCOVERED |
| ----- | ------- | ------- | --------- |
| 4     | 0       | 4       | 0         |

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción                                                                     | Estado     | Observaciones                                                                                                                                                                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-001   | Listado de tareas asignadas con nombre, instancia, equipo, vencimiento y SLA    | ⚠️ PARTIAL | E2E declarado en TC-001/TC-002/TC-003/TC-004 sin automatizar — no hay suite E2E propia de "Mis tareas".                                                                                                                                                                                                                                                                      |
| AC-002   | Resumen de conteos por estado de SLA, calculado por el servidor sobre el total  | ⚠️ PARTIAL | E2E declarado en TC-005 sin automatizar. Unit e Integration cubiertos por completo, incluyendo el caso de TC-006 (el resumen no cambia al paginar).                                                                                                                                                                                                                          |
| AC-003   | Filtros de servidor por estado/modelo/instancia + búsqueda por texto en cliente | ⚠️ PARTIAL | **TC-007 desalineado con el código**: describe filtro de servidor `states` sobre `GET /bpm/user-tasks` (API-05, retirado); TK-008 degradó el filtro de estado a cliente por falta de un `field`/`operator` de WLE confirmado — ningún test valida la aserción de TC-007 tal como está escrita (ver Observaciones y pendientes). E2E de TC-007/TC-008/TC-009 sin automatizar. |
| AC-004   | Carga del listado en ≤ 3 s con paginación de servidor (`offset`/`size`)         | ⚠️ PARTIAL | E2E declarado en TC-010 sin automatizar. TC-011 cubierto solo por un test funcional del indicador de carga (sin las variantes de retardo 2,8 s/3,0 s/6,0 s, que requieren el ambiente de referencia en vivo). La medición del umbral de 3 s de TC-010 tampoco está automatizada, por la misma razón.                                                                         |

## Matriz de trazabilidad

Vista auditable: **una fila por cada combinación criterio × caso de prueba × tipo de prueba declarado**.

| Criterio | TC     | Tipo        | Evidencia                                                                                         | Ejecución     | Resultado    |
| -------- | ------ | ----------- | ------------------------------------------------------------------------------------------------- | ------------- | ------------ |
| AC-001   | TC-001 | Integration | `frontend/src/app/features/baw-processes/services/user-task-repository.spec.ts`                   | quality-check | ✅ PASS      |
| AC-001   | TC-001 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-001   | TC-002 | Unit        | `frontend/src/app/features/baw-processes/utils/task-mapper.spec.ts`                               | quality-check | ✅ PASS      |
| AC-001   | TC-002 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-001   | TC-003 | Unit        | `frontend/src/app/features/baw-processes/utils/task-mapper.spec.ts`                               | quality-check | ✅ PASS      |
| AC-001   | TC-003 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-001   | TC-004 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-002   | TC-005 | Unit        | `frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.spec.ts`        | quality-check | ✅ PASS      |
| AC-002   | TC-005 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-002   | TC-006 | Unit        | `frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.spec.ts`        | quality-check | ✅ PASS      |
| AC-002   | TC-006 | Integration | `frontend/src/app/features/baw-processes/services/user-task-repository.spec.ts`                   | quality-check | ✅ PASS      |
| AC-003   | TC-007 | Integration | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-003   | TC-007 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-003   | TC-008 | Unit        | `frontend/src/app/features/baw-processes/services/tasks-manager.spec.ts`                          | quality-check | ✅ PASS      |
| AC-003   | TC-008 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-003   | TC-009 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-004   | TC-010 | Integration | `frontend/src/app/features/baw-processes/services/user-task-repository.spec.ts`                   | quality-check | ✅ PASS      |
| AC-004   | TC-010 | E2E         | —                                                                                                 | —             | ❌ UNCOVERED |
| AC-004   | TC-011 | Integration | `frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts`, `tasks-manager.spec.ts` | quality-check | ✅ PASS      |

## Observaciones y pendientes

- **AC-003 / TC-007 — TC desactualizado, requiere `/test-define`.** El texto de TC-007 (pasos 2-3 y la sección de Observaciones) afirma que el filtro de estado viaja como parámetro de servidor (`states` en `GET /bpm/user-tasks`) y que "no se resuelve descartando filas en el cliente". Desde TK-008 (migración a API-13/WLE), `GET /bpm/user-tasks` está retirado para el listado y el filtro de estado se aplica **en el cliente** sobre la página cargada (`UserTaskRepository.applyClientSideFilters`), porque no hay un `field`/`operator` de `conditions` de WLE confirmado para filtrar por estado — decisión documentada en `progress.md` de TK-008. Es decir, TC-007 describe exactamente el comportamiento contrario al actual. Igual que ya se hizo con TC-005/TC-006 en esta misma migración, TC-007 necesita pasar por `/test-define` para reescribirse contra el contrato vigente antes de poder cerrarse como cubierto.
- No hay suite E2E propia de "Mis tareas": `e2e/` solo contiene el smoke genérico de arranque (`example.spec.ts`, ADR-005). Es la causa transversal de todas las filas E2E en `UNCOVERED` de los cuatro criterios.
- TC-008/TC-009/TC-010/TC-011 mencionan literalmente `GET /bpm/user-tasks` en su texto (endpoint retirado); a diferencia de TC-007, el comportamiento que describen (búsqueda de cliente, una sola llamada por página con `offset`/`size`, indicador de carga) sigue siendo válido con API-13 — es solo la referencia al endpoint la que quedó obsoleta. No bloquea cobertura, pero conviene refrescarlo vía `/test-define` en la misma pasada que TC-007.
- La medición real del umbral de 3 s (TC-010) y las variantes de retardo 2,8 s/3,0 s/6,0 s (TC-011) no están automatizadas: requieren el ambiente de referencia de BAW en vivo, ya señalado como limitación en TK-002/TK-005.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=f54da1cb8562968efc0d1bca4e9c7aaca3fa4f29 · spec=52bc9c3f74c523165108d9c85cca0bf8fdec92ab · generated=2026-09-15 -->
