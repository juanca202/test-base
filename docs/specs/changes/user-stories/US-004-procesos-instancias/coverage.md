# Reporte de trazabilidad — US-004-procesos-instancias

**Fecha:** 2026-09-16 10:23
**Rama:** feature/US-004-procesos-instancias
**Commit:** 3eeda9e
**Trabajo:** [US-004](./README.md)
**Veredicto:** ⚠️ APPROVED_WITH_NOTES

## Resumen

Los tres criterios de aceptación tienen cobertura unitaria/integración (MSW) sobre el listado Activo/Completado, los filtros de servidor y la paginación. No hay casos de prueba documentados (`TC-XXX`): el mapeo se infiere de los specs de la rama. AC-003 queda parcial porque el umbral de 3 s no está medido en automatización. El e2e del repo es solo el smoke de la ruta raíz; no hay flujo E2E de «Procesos».

**Pruebas:** caché fresca de `quality-check` (commit `3eeda9e`, 2026-09-16). unit `PASS` (618 passed) · e2e `PASS` (1 passed, smoke genérico sin relación con US-004).

**Cobertura de criterios de aceptación**

| Total | COVERED | PARTIAL | UNCOVERED |
| ----- | ------- | ------- | --------- |
| 3     | 2       | 1       | 0         |

## Cobertura por criterio

Vista de veredicto: un criterio por fila. El detalle de qué lo prueba está en la matriz de abajo.

| Criterio | Descripción                                                                                 | Estado     | Observaciones                                                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-001   | Listado de instancias con filtro Activo (`running`) / Completado (`finished`)               | ✅ COVERED | Mapeo inferido (no hay `TC-XXX`). Cubierto por repository, mapper, manager y vista.                                                                                                                    |
| AC-002   | Búsqueda por texto y filtros de servidor (`search_term`, `model`, `containers`, `versions`) | ✅ COVERED | Mapeo inferido. El manager envía los params al servidor y no refiltra la página en cliente.                                                                                                            |
| AC-003   | Carga del listado en ≤ 3 s con paginación de servidor (`offset`/`size`)                     | ⚠️ PARTIAL | La paginación (enlace opaco `next`/`previous`, sin inventar `totalCount`) está cubierta. El umbral de 3 s no está automatizado: exige el ambiente de referencia BAW en vivo. No hay E2E de «Procesos». |

## Matriz de trazabilidad

Vista auditable: **una fila por cada combinación criterio × caso de prueba × tipo de prueba declarado**.

| Criterio | TC  | Tipo        | Evidencia                                                                              | Ejecución     | Resultado |
| -------- | --- | ----------- | -------------------------------------------------------------------------------------- | ------------- | --------- |
| AC-001   | —   | Unit        | `frontend/src/app/features/baw-processes/utils/process-instance-mapper.spec.ts`        | quality-check | ✅ PASS   |
| AC-001   | —   | Integration | `frontend/src/app/features/baw-processes/services/process-instance-repository.spec.ts` | quality-check | ✅ PASS   |
| AC-001   | —   | Unit        | `frontend/src/app/features/baw-processes/services/process-instances-manager.spec.ts`   | quality-check | ✅ PASS   |
| AC-001   | —   | Unit        | `frontend/src/app/features/baw-processes/components/processes/processes.spec.ts`       | quality-check | ✅ PASS   |
| AC-002   | —   | Integration | `frontend/src/app/features/baw-processes/services/process-instance-repository.spec.ts` | quality-check | ✅ PASS   |
| AC-002   | —   | Unit        | `frontend/src/app/features/baw-processes/services/process-instances-manager.spec.ts`   | quality-check | ✅ PASS   |
| AC-002   | —   | Unit        | `frontend/src/app/features/baw-processes/components/processes/processes.spec.ts`       | quality-check | ✅ PASS   |
| AC-003   | —   | Integration | `frontend/src/app/features/baw-processes/services/process-instance-repository.spec.ts` | quality-check | ✅ PASS   |
| AC-003   | —   | Unit        | `frontend/src/app/features/baw-processes/services/process-instances-manager.spec.ts`   | quality-check | ✅ PASS   |
| AC-003   | —   | Unit        | `frontend/src/app/features/baw-processes/components/processes/processes.spec.ts`       | quality-check | ✅ PASS   |

## Observaciones y pendientes

- **AC-003 — umbral de 3 s no medido.** Los tests cubren `offset`/`size` y los enlaces opacos de paginación; no hay prueba que cronometre la carga contra BAW en vivo (2,8 s / 3,0 s / 6,0 s).
- No hay `TC-XXX` para esta historia (se continuó la implementación sin `test-define`). El mapeo criterio → spec es inferido.
- No hay suite E2E propia de «Procesos»: `e2e/` solo contiene el smoke genérico de arranque (`example.spec.ts`, ADR-005).

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=34de444d4df0451fc3509230d169a51ea38656de · spec=639db381fc2610df00cda004d9444e1ba6dc480a · generated=2026-09-16 -->
