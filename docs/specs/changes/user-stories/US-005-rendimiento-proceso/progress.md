# Progreso

## US-005-rendimiento-proceso

<!-- work:id=US-005 · status=Done -->

**Estado:** Done
**Tipo:** historia de usuario
**Fecha de creación:** 2026-09-16 00:00
**Ultima actualizacion:** 2026-09-16 00:00

<!-- Cierre vía work-integrate: quality-check APPROVED, code-review omitida (verification.codeReview.enabled=false),
coverage-verify APPROVED_WITH_NOTES (AC-001/AC-002 COVERED). feature/US-005-rendimiento-proceso mergeada a
develop en el submódulo frontend (commit de merge 86a77f4), resolviendo el conflicto trivial y esperado en
baw-processes-routes.ts (ruta hermana de US-006) conservando ambas rutas. Archivado de esta carpeta: omitido
— implementation.archiveMode=ask sin canal interactivo disponible en esta sesión de cierre. -->

## Unidades

### TK-001: Repositorio de métricas de rendimiento por proceso

<!-- unit:id=TK-001 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-16 00:00
**Finalizado:** 2026-09-16 00:00
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**

```
+ frontend/src/app/features/baw-processes/models/process-performance.ts
+ frontend/src/app/features/baw-processes/services/process-performance-repository.ts
+ frontend/src/app/features/baw-processes/services/process-performance-repository.spec.ts
+ frontend/src/app/features/baw-processes/utils/process-performance-mapper.ts
+ frontend/src/app/features/baw-processes/utils/process-performance-mapper.spec.ts
+ frontend/scripts/smoke/process-performance-services.mjs
```

**Notas:**

- Esta US no tiene carpeta `test-cases/`; se continuó la implementación sin definirlos primero (Auto Mode), usando AC-001/las IT-XX de esta TK como insumo de comportamiento para el ciclo TDD.
- IT-05 (verificación de humo) se resolvió como script Node standalone documentado (`scripts/smoke/process-performance-services.mjs`), no como prueba de integración de la suite — este entorno de implementación no tiene sesión/cookies reales contra el BAW de pruebas. **No se ha ejecutado aún contra ningún ambiente real**; queda pendiente para quien despliegue TK-001 por primera vez a cada ambiente (pruebas, luego producción), como indica la propia IT-05.
- `Archivos afectados` de la TK no listaba el script de humo ni marcaba los `.spec.ts` como nuevos (`~`); ambos spec son en realidad `+` (no existían antes) y se añadió el script de humo como implementación concreta de "o script documentado" (IT-05).

**Decisiones adicionales:**

- `averageDurationMs` no aparece en el JSON literal que capturó RS-001 (solo se observó vía UI, "0m 16s"); se modeló como campo opcional hermano de `processInstances.items[]` en la respuesta del Ajax Service `1.492222d4-...`, documentado como supuesto en el TSDoc de `BawProcessInstancesResponse` y a verificar con el script de humo de IT-05.
- La forma anidada `data.categoricalData.plots.series.items[]` (una lista de series, cada una con su propio `{name, items}`) es una inferencia de la prosa de RS-004, no de una captura JSON literal — documentado igual en `BawRenewalRateResponse`.
- `ProcessRenewalPoint[]` se arma cruzando las series "Nuevas instancias"/"Instancias completadas" por índice (asumiendo mismos buckets temporales en ambas), no por búsqueda de timestamp exacto — más simple y suficiente dado que ambas series comparten la misma ventana/`numPeriods`.
- `listOverview()` usa `Promise.all` sin tolerancia a fallos parciales (si un proceso falla, falla todo el listado) — no había indicación en la TK de manejar fallos parciales y ningún otro repository del código existente lo hace.

**Cobertura de test cases:**
[]

### TK-002: Panel "Rendimiento del proceso"

<!-- unit:id=TK-002 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-16 00:00
**Finalizado:** 2026-09-16 00:00
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**

```
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance.ts
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance.html
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance.spec.ts
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance-card/process-performance-card.ts
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance-card/process-performance-card.html
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance-card/process-performance-card.spec.ts
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance-detail/process-performance-detail.ts
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance-detail/process-performance-detail.html
+ frontend/src/app/features/baw-processes/components/process-performance/process-performance-detail/process-performance-detail.spec.ts
~ frontend/src/app/features/baw-processes/components/task-flow/task-flow-modal.ts
~ frontend/src/app/features/baw-processes/components/task-flow/task-flow-modal.html
~ frontend/src/app/features/baw-processes/components/task-flow/task-flow-modal.spec.ts
~ frontend/src/app/features/baw-processes/baw-processes-routes.ts
```

**Notas:**

- El árbol principal del submódulo `frontend` (rama `develop`) tenía cambios sin commitear de otra sesión al momento de crear el worktree de esta implementación (p. ej. `utils/process-diagram-mapper.ts` con soporte de gateways/`toBpmnElementId`, un componente `ProcessDetail` nuevo, `wle-process-instance-repository.ts`, etc.) — no se tocaron ni se commitearon, tal como indicó el usuario. El worktree de esta rama se creó desde el último commit real de `develop` (`ccef606`), así que el `ProcessDiagramMapper` que TK-002 consume en este commit **no** tiene `toBpmnElementId` ni soporte de gateways/ids con prefijo — solo `buildTaskFlowDiagram`. El highlight de instancia directa en `TaskFlowModal` usa el `flowObjectId` crudo como id de marcador (sin prefijo), que es válido contra este `ProcessDiagramMapper` committeado. Si la otra sesión integra su WIP primero, `TaskFlowModal` seguirá funcionando igual (el id crudo sigue siendo válido salvo que un id empiece con dígito, caso que esa otra rama sí maneja); no se requiere ningún cambio en `TaskFlowModal` para que ambas ramas convivan, pero vale la pena que quien mergee ambas features lo tenga presente.
- El `Archivos afectados` de la TK listaba `app.routes.ts`; el archivo real donde viven las rutas de "Procesos"/"Mis tareas" es `baw-processes-routes.ts` — se editó ese, no uno nuevo.
- No se agregó ninguna librería de gráficos (p. ej. Chart.js): el proyecto no tenía ninguna ya integrada (`package.json` sin dependencias de charting), así que el donut de `ProcessPerformanceCard` es SVG inline puro y la "Tasa de renovación" de `ProcessPerformanceDetail` se muestra como tabla accesible (hora/nuevas/completadas) en vez de un gráfico a medida — ver Decisiones adicionales.

**Decisiones adicionales:**

- Donut de `ProcessPerformanceCard`: SVG inline con `stroke-dasharray` por segmento, sin dependencia nueva — evita instalar una librería de charting solo para un donut de 3 segmentos, evita el riesgo de tocar `package.json`/`package-lock.json` en un worktree que enlaza `node_modules` por symlink al checkout principal (AGENTS.md), y facilita cumplir AXE/WCAG AA (el SVG es `aria-hidden`, la información real vive en las badges de texto).
- "Tasa de renovación" en `ProcessPerformanceDetail`: se optó por una tabla de datos (hora/nuevas/completadas) en vez de un gráfico visual a medida — cumple accesibilidad de forma directa (una tabla nativa no necesita tratamiento ARIA especial) y prioriza que el usuario vea los números concretos, en vez de invertir en un chart SVG propio con ejes/escala para 24 buckets.
- `ProcessPerformanceRepository.getDetail(processId, appId, processName)` (TK-001) exige `processName`, que ninguno de los dos Ajax Services devuelve — pero la ruta de detalle de `ProcessPerformanceDetail` solo tiene `processId`/`appId` como parámetros de ruta. Se resolvió pasando `processName` como query param (`?processName=...`) desde el link de la tarjeta en `ProcessPerformance` (que ya lo tiene en mano al navegar), con fallback a `processId` si se visita la URL directamente sin ese query param.
- No se usó la clase `ft-tab`/`ft-tab--active` para las pestañas de `ProcessPerformanceDetail` (no existe en el design system del proyecto, verificado por grep) — se implementó con utilidades Tailwind (`border-b-2`/`border-transparent`) en su lugar.
- Ninguno de los tres componentes nuevos tiene archivo `.css` propio (coincide con `Archivos afectados`, que no listaba ninguno) — se estilizaron solo con utilidades Tailwind y clases `ft-*` ya existentes (`ft-page`, `ft-badge`, `ft-card`, `ft-center`).
- Se exportó `SeverityClass`/`SEVERITY_CLASS_BY_SLA_STATUS` desde `task-flow-modal.ts` (antes privados) para que `ProcessPerformanceDetail` derive la clase de severidad del `riskState` de la instancia elegida sin introducir un segundo vocabulario, tal como pide la sección Dependencias de esta TK.

**Cobertura de test cases:**
[]
