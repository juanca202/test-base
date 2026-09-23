# TK-001: Repositorio de métricas de rendimiento por proceso

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-005](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Crear el repositorio (ADR-010) que expone los indicadores de AC-001 — instancias en curso, desglose de SLA (a tiempo/en riesgo/vencida), duración promedio y tasa de renovación, por tipo de proceso — consumiendo los dos Ajax Services de WLE confirmados en vivo por [RS-004](../../research/RS-004-metricas-rendimiento-proceso-wle/README.md) y validados con datos reales por [RS-001](research/RS-001-spike-apuntar-panel-proceso-propio/README.md), en vez de la familia `/bpm/` ya confirmada como ausente (MD-08, API-10). El listado inicial de "todos los procesos disponibles" no reutiliza el mecanismo nativo del panel (que RS-001 no investigó y probablemente comparte el patrón de HTML incrustado que [RS-005](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) sí documentó para equipos): en su lugar, se agrega en cliente sobre `ProcessRepository.findStartable()`, ya implementado (RS-002), evitando depender de _screen-scraping_ para esta historia.

## Dependencias

- `ProcessRepository.findStartable()` (`services/process-repository.ts`) — enumera los procesos de negocio expuestos a inicio (API-03); la base del listado agregado de AC-001.
- `BaseRepository` (`core/services/base-repository.ts`, ADR-010) — clase base a extender.
- `getApiUrl`/`getMutations` (`core/utils/async-resources.ts`) — composición de URLs, patrón ya usado por `ProcessRepository`/`ProcessInstanceRepository`.
- `wleAuthInterceptor` (`core/interceptors/wle-auth-interceptor.ts`) — añade `x-xsrf-token` a toda petición bajo `rest/bpm/wle/v1/`, incluida `POST rest/bpm/wle/v1/service/{serviceId}`; sin cambios.
- `TaskSlaStatus` (`features/baw-processes/models/user-task.ts`) — vocabulario de severidad (`onTime`/`atRisk`/`overdue`) al que se traduce el `riskState` de WLE (`OnTrack`/`AtRisk`/`Overdue`), para no introducir un segundo vocabulario de severidad en el dominio.

## Referencias

- **Investigación:** [RS-004 — Métricas de rendimiento por proceso](../../research/RS-004-metricas-rendimiento-proceso-wle/README.md) — descubrimiento de los Ajax Services (`serviceId`, forma de parámetros y respuesta). [RS-001 (US-005) — Spike apuntar el panel a un proceso propio](research/RS-001-spike-apuntar-panel-proceso-propio/README.md) — contrato validado con datos reales, parámetros `processId`/`appId`, y evidencia de estabilidad del `serviceId` dentro de la instalación.

## Archivos afectados

```text
frontend/
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── + models/process-performance.ts               # DTOs de los dos Ajax Services + modelo de dominio agregado por proceso
                ├── + services/process-performance-repository.ts  # ADR-010: invoca ambos Ajax Services parametrizados por processId/appId
                ├── + utils/process-performance-mapper.ts          # ADR-012: traduce riskState → TaskSlaStatus, calcula el resumen agregado
                ├── ~ services/process-performance-repository.spec.ts
                └── ~ utils/process-performance-mapper.spec.ts
```

## Plan de implementación

- [x] **IT-01** — Definir en `models/process-performance.ts` los DTOs crudos de ambos Ajax Services (`data.categoricalData.plots.series.items[]` de `1.66c1cf8c-...`; `data.processInstances.items[]` de `1.492222d4-...`, con `id`/`name`/`dueDate`/`riskState`/`age`) y el modelo de dominio: `ProcessPerformanceSummary` (instancesInProgress, overdue/atRisk/onTime counts, averageDurationMs) y `ProcessRenewalPoint` (timestamp, nuevas, completadas).
      Formas de respuesta confirmadas en RS-001, sección "Incógnita 1, contrato validado con datos reales".
- [x] **IT-02** — Implementar `ProcessPerformanceRepository.getDetail(processId, appId)`: invoca en paralelo (`Promise.all`) `POST rest/bpm/wle/v1/service/1.66c1cf8c-410f-429c-88df-5d2acdb3468f` (tasa de renovación) y `POST rest/bpm/wle/v1/service/1.492222d4-9c77-4bd4-beab-87e8abe5aa47` (instancias/`riskState`), con `action=start&createTask=false&parts=all` y el cuerpo `params` urlencoded que incluye `processId`/`appId` (renovación) o `{processInstanceListProperties: {...}, appId, processId}` (instancias) — mismos parámetros confirmados en RS-001.
      Los `serviceId` son identificadores de asset del Process App de sistema "TWP", no rutas REST documentadas — mantenerlos como constantes con un comentario que remita a RS-004/RS-001, igual que ya hace `ProcessDiagramRepository` con `VISUAL_PROCESS_MODEL_PATH`.
- [x] **IT-03** — Implementar `ProcessPerformanceRepository.listOverview()`: llama a `ProcessRepository.findStartable()` para obtener los procesos de negocio propios, y por cada uno invoca `getDetail` para agregar su desglose de SLA — construye así el listado que alimenta las tarjetas de la vista general, sin depender del panel nativo. Verificar durante la implementación que los procesos que el panel nativo mostraba en RS-001 ("Credito IA Generativa", "Proceso de Créditos") aparecen en `findStartable()`; si alguno no está expuesto a inicio, documentarlo como hallazgo y decidir si se amplía el alcance de `findStartable` o se acepta la omisión.
- [x] **IT-04** — Implementar `ProcessPerformanceMapper`: traduce `riskState` (`"Overdue"`/`"OnTrack"`/`"AtRisk"`) a `TaskSlaStatus` (`overdue`/`onTime`/`atRisk`), agrega los conteos por estado y expone `averageDurationMs`/`instancesInProgress` tal como los entrega el servicio, sin recalcularlos en cliente.
- [x] **IT-05** — Verificación de humo por ambiente: agregar un caso de prueba de integración (o script documentado) que, contra un ambiente dado, confirme que ambos `serviceId` siguen respondiendo `200` con la forma de contrato esperada — mitigación del riesgo residual de estabilidad entre ambientes que dejó abierto RS-001. Documentar el resultado la primera vez que se corra contra un ambiente nuevo (pruebas, luego producción).
- [x] **IT-06** — Pruebas: `process-performance-repository.spec.ts` y `process-performance-mapper.spec.ts`, con fixtures basadas en las respuestas reales capturadas en RS-004/RS-001 (incluida la serie de "Tasa de renovación" y los tres `riskState` — `Overdue`/`OnTrack` observados, `AtRisk` por simetría de RS-005).

## Verificación en vivo post-integración (2026-09-16) — 3 correcciones

Al probar el panel ya integrado contra el servidor real (no solo contra las pruebas unitarias), aparecieron tres discrepancias entre lo que este TK especificó y el contrato real — las tres corregidas el mismo día, commit `1a3d659` en `frontend`:

1. **Faltaban `callerModelId`/`callerModelBranchId`/`snapshotId` en la query.** El enunciado de IT-02 solo mencionaba `action=start&createTask=false&parts=all`, aunque el payload crudo de RS-001 ya traía los tres parámetros adicionales — se perdieron al resumir el contrato en este TK, no en la implementación. Sin ellos, WLE responde `404 ObjectDoesNotExistException` ("might have been deleted in the meantime"), indistinguible de que el `serviceId` realmente hubiera dejado de existir. Re-verificado en vivo: los tres valores son estables (misma captura, dos procesos de negocio distintos, horas de diferencia) — el riesgo de RS-001/RS-004 sobre estabilidad del `serviceId` seguía siendo válido en general, pero **no era la causa de esta falla concreta**.
2. **Los DTOs (IT-01) no modelaban el sobre de ejecución de WLE.** La respuesta real anida el resultado dos niveles (`data.data.categoricalData` / `data.data.processInstances`, no `data.categoricalData`/`data.processInstances`) — RS-001 lo aplanó al resumir la captura cruda en su README. `averageDurationMs` no existe en ningún nivel del sobre; el valor "0m 16s" que RS-001 vio en la UI del panel nativo tiene un origen que sigue sin confirmarse. El mapper ahora resuelve `averageDurationMs` siempre a `null` en vez de asumir un campo que nunca estuvo.
3. **`categoricalData` puede ser `null`** cuando no hay actividad de renovación en la ventana de 24 horas — un estado real y esperado (proceso con poco tráfico), no una falla. `toRenewalPoints` lo trata igual que una serie vacía.

Además, `listOverview()` (IT-03) se hizo resiliente por proceso (`.catch(() => null)` en vez de dejar que `Promise.all` propague el rechazo): un `500 UnexpectedFailureException` genuino del lado de BAW para un proceso específico de otro Process App (no relacionado con lo que este repositorio envía) ya no tumba el listado completo — ver el commit para el detalle exacto de cada corrección.
