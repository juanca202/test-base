# Reporte de trazabilidad — US-006-rendimiento-equipo

**Fecha:** 2026-09-16 11:25
**Rama:** feature/US-006-rendimiento-equipo
**Commit:** ab2e8de
**Trabajo:** [US-006](./README.md)
**Veredicto:** ⚠️ APROBADO CON OBSERVACIONES

## Resumen

El único criterio de aceptación de la historia (AC-001) queda cubierto: la cadena completa
scraping (`executeServiceByName` → `fauxRedirect.lsw`) → parseo del literal HTML → filtrado por
`processAppName` propio → presentación por tarjeta (nombre, gráfico de estado, conteos
vencido/en riesgo/a tiempo) tiene prueba unitaria en sus cuatro capas. La observación: esta US no
tiene carpeta `test-cases/` (decisión registrada en `progress.md` de TK-001), así que el mapeo
criterio↔prueba es **inferido** de los archivos del repo, no declarado vía `TC-XXX` — de ahí el
veredicto con observaciones en vez de un `APPROVED` limpio.

**Pruebas:** caché fresca de `quality-check` (commit `ab2e8de`, 2026-09-16, generada en esta misma
corrida de cierre — ver `docs/audits/quality-check.md`). unit `PASS` (642 passed, incluidas las 4
suites de este trabajo) · coverage `PASS` (95.6% líneas, umbral 80%) · e2e `PASS` (1 passed —
smoke genérico de arranque, no específico de AC-001, el repo no declara ningún flujo crítico de
este panel como exigencia E2E).

**Cobertura de criterios de aceptación**

| Total | ✅ COVERED | ⚠️ PARTIAL | ❌ UNCOVERED |
| ----- | ---------- | ---------- | ------------ |
| 1     | 1          | 0          | 0            |

## Cobertura por criterio

| Criterio | Descripción                                                                                                                                                                | Estado     | Observaciones                                                                                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-001   | El sistema DEBE mostrar, por grupo/equipo, los totales de tareas vencidas, en riesgo y a tiempo, para todos los grupos disponibles (sin filtrar por el grupo del usuario). | ✅ COVERED | Mapeo inferido desde los tests del repo — sin `test-cases/` documentados (decisión de TK-001). Sin prueba E2E propia: el estándar de testing solo exige E2E para flujos críticos declarados por producto, y este panel no está en esa lista. |

## Matriz de trazabilidad

| Criterio | TC  | Tipo | Evidencia                                                                                                                 | Ejecución     | Resultado |
| -------- | --- | ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------- | --------- |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/utils/team-performance-parser.spec.ts`                                           | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/services/team-performance-repository.spec.ts`                                    | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/components/team-performance/team-performance-card/team-performance-card.spec.ts` | quality-check | ✅ PASS   |
| AC-001   | —   | Unit | `frontend/src/app/features/baw-processes/components/team-performance/team-performance.spec.ts`                            | quality-check | ✅ PASS   |

## Observaciones y pendientes

- TK-001/IT-07 (verificar efectos colaterales de invocar `executeServiceByName` sin sesión de navegador previa) quedó como **verificación parcial, no concluyente** — ver la sección "Verificación IT-07" en `TK-001-repositorio-metricas-equipo-scraping.md`. No afecta la cobertura de AC-001 (es un riesgo operativo de producción, no un hueco de prueba), pero es una acción pendiente que el equipo debe resolver antes de habilitar esta vía en producción.
- Sin carpeta `test-cases/` para esta US: si se decide documentar `TC-XXX` más adelante (vía `test-define`), este reporte debería revalidarse con `revalidate` para pasar de mapeo inferido a declarado.

<!-- coverage-verify:verdict=APPROVED_WITH_NOTES · fingerprint=b7eb082bf6d642e3f70feb03ceb0e04d39c57dab · spec=c07a49ae6bc5bb2cfab62ba4f282883d5275f3a6 · generated=2026-09-16 -->
