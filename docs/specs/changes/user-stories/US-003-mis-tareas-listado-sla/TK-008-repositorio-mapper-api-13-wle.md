# TK-008: Repositorio y mapper de "Mis tareas" contra API-13 (WLE)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Reemplazar la fuente de datos de "Mis tareas": `UserTaskRepository`/`TaskMapper` dejan de llamar a `GET /bpm/user-tasks` (API-05, obsoleto) y pasan a llamar a `PUT /rest/bpm/wle/v1/tasks` (API-13), traduciendo el contrato B de WLE (`TASK.TKIID`, `PI_NAME`, `STATE`, `DUE`, `IS_AT_RISK`, `stats`, …) al modelo de dominio `UserTask`/`UserTaskPage` ya existente, incluyendo el resumen de SLA calculado por el servidor (`data.stats`, MD-05) como parte de la página. El detalle/reclamo/completado de tarea (`task-detail-repository.ts`, US-007) NO cambia: sigue contra `/bpm/user-tasks/{task_id}` (contrato A, vigente) — el `TASK.TKIID` que WLE devuelve funciona sin transformar como `task_id` de esa API (verificado en vivo).

## Dependencias

- `UserTaskRepository` (`services/user-task-repository.ts`) — repositorio a reescribir.
- `TaskMapper` (`utils/task-mapper.ts`) — mapper a extender con el contrato B.
- `UserTask`, `UserTaskPage`, `BawUserTask`, `BawUserTasksResponse` (`models/user-task.ts`) — modelos DTO/dominio a ajustar.
- `SlaSummary`/`slaSummary()` (`utils/sla-summary.ts`) — el tipo `SlaSummary` (dominio) se reutiliza para modelar `data.stats`; la función `slaSummary()` que calcula en cliente queda en desuso para el listado (TK-009 la retira del componente de presentación).
- TK-007 — necesita el proxy `/rest` y el header `x-xsrf-token` ya cableados.

## Referencias

- **Arquitectura:** [ADR-015](../../../../frontend/docs/adr/ADR-015-native-baw-wle-rest-api.md) (repo `frontend`) — patrón Repository/Mapper por entidad (ADR-010, ADR-012 del mismo repo)
- **Documentación técnica:** [API-13: Buscar tareas del usuario (WLE)](../../../specs/technical-docs/portal-procesos-baw.md#api-13) · [MD-04: Tarea — Contrato B](../../../specs/technical-docs/portal-procesos-baw.md#md-04) · [MD-05: Resumen de SLA de la lista de tareas](../../../specs/technical-docs/portal-procesos-baw.md#md-05)

## Archivos afectados

```text
frontend/
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── ~ models/user-task.ts                    # +BawWleUserTask (contrato B), +BawWleTasksResponse (envoltura data/items/stats/totalCount), owner pasa a opcional en UserTask
                ├── ~ services/user-task-repository.ts        # PUT rest/bpm/wle/v1/tasks?calcStats=true&usersFullName=true&avoidBasicAuthChallenge=true; offset como query param (no body); body con organization/shared/teams/sort/conditions/fields/aliases/interaction/size
                ├── ~ services/user-task-repository.spec.ts   # Object Mother contrato B; casos: mapeo de página, stats, offset en query
                ├── ~ utils/task-mapper.ts                    # +mapWleDtoToTask, +mapWleResponseToPage (incluye stats), mapDtoToTask (contrato A) intacto para task-detail-repository
                └── ~ utils/task-mapper.spec.ts                # casos con fixtures del contrato B (evidencia real de API-13)
```

## Plan de implementación

- [x] **IT-01** — Modelar el contrato B y la envoltura de respuesta en `user-task.ts`
      `BawWleUserTask`: `'TASK.TKIID': string`, `'PROCESS_INSTANCE.PIID': string`, `PI_NAME: string`, `TAD_DISPLAY_NAME: string`, `STATE: string`, `STATUS: string`, `DUE: string`, `PRIORITY: number`, `IS_AT_RISK: boolean`, `ASSIGNED_TO_ROLE_DISPLAY_NAME: string`, `COMPLETED: string | null`, `KIND: string` (nombres de clave tal como los devuelve BAW, ver MD-04 — no son los alias de `fields`). `BawWleTasksResponse`: `{ status: string; data: { identifier: string; offset: number; size: number; requestedSize: number; totalCount: number; countLimitExceeded: boolean; countLimit: number; items: BawWleUserTask[]; stats?: BawWleStats } }`, con `BawWleStats = { total: number; open: number; onTrack: number; atRisk: number; overdue: number }`.
      En `UserTask`, cambiar `owner: string` a `owner?: string` (el contrato B no lo devuelve, MD-04 nota de Observaciones #15) y ajustar `isClaimedByCurrentUser` para que sea `false` cuando `owner` es `undefined`, en vez de asumir un tipo que ya no es siempre cierto.
- [x] **IT-02** — `mapWleDtoToTask` en `TaskMapper`
      Traduce `BawWleUserTask` a `UserTask` con la tabla de equivalencias de MD-04: `id = TASK.TKIID` (sin reconstruir el prefijo `2078.`, ya verificado que API-06 acepta la forma corta), `name = TAD_DISPLAY_NAME`, `processId = PROCESS_INSTANCE.PIID`, `processName = PI_NAME`, `state`: mapear `STATE` (`"STATE_READY"`, prefijo `STATE_`) al `BawTaskState` de dominio quitando el prefijo y pasando a minúsculas (`ready`); valores no observados (`STATE_CLAIMED`, etc.) siguen la misma regla hasta que aparezcan casos reales que la contradigan. `dueDate = DUE` (ya ISO 8601 UTC con sufijo `Z`, no requiere el `parseBawDate` tolerante del contrato A). `teamName = ASSIGNED_TO_ROLE_DISPLAY_NAME`. `completionTime = COMPLETED` (nullable). `priority`: convertir el entero a texto para mantener el tipo `string` del dominio (o documentar el cambio de tipo si se prefiere — decisión de esta tarea: mantener `string` para no romper `task-detail.html`, que ya muestra `priority` del contrato A). `owner`: no viene, queda `undefined`. `isClaimed`/`isClaimedByCurrentUser`: `isClaimed = STATE !== 'STATE_READY'` (regla documentada como no confirmada en MD-04 — no se observó ninguna tarea reclamada en la validación en vivo); `isClaimedByCurrentUser = false` siempre (no derivable sin `owner`, MD-04 Observaciones #15). `slaStatus`: aplicar la regla de MD-04 con `DUE` e `IS_AT_RISK` (`overdue` si `DUE < now`; si no y `IS_AT_RISK`, `atRisk`; si no, `onTime`) — misma precedencia que el contrato A, ya validada contra el servidor.
- [x] **IT-03** — `mapWleResponseToPage` en `TaskMapper`
      Mapea `data.items` con `mapWleDtoToTask`, y `data.stats` (si viene) al `SlaSummary` de dominio ya existente (`utils/sla-summary.ts`): `total = stats.total`, `onTime = stats.onTrack` (renombrado, MD-05 — el dominio conserva `onTime`), `atRisk = stats.atRisk`, `overdue = stats.overdue`. Devuelve además `offset`, `size` y `totalCount` de `data` (nueva forma de `UserTaskPage`, ver IT-04) para que `TasksManager`/`Tasks` (TK-009) puedan derivar la paginación exacta sin los enlaces `previous`/`next` que ya no existen.
- [x] **IT-04** — Actualizar `UserTaskPage`
      Reemplaza `previous?: string` / `next?: string` (API-05) por `offset: number`, `size: number`, `totalCount: number` y `stats?: SlaSummary` (API-13). Es un cambio de forma que TK-009 consume directamente.
- [x] **IT-05** — Reescribir `UserTaskRepository.findAll`
      `PUT` a `getApiUrl('rest/bpm/wle/v1/tasks')` con query params `calcStats=true&usersFullName=true&avoidBasicAuthChallenge=true` + `offset` (query, **nunca en el body** — un `offset` en el body devuelve 400 `CWTBG0618E`, ver API-13) cuando `query.offset` está definido. Body fijo con `organization: 'byTask'`, `shared: false`, `teams: []`, `aliases: []`, `interaction: 'claimed_and_available'` (resuelve el scoping por usuario — no agregar el usuario como condición), `sort` (traducido de `query.sort`), `size` (de `query.size`), `fields` (catálogo fijo: `taskSubject`, `instanceName`, `taskStatus`, `taskPriority`, `taskDueDate`, `assignedToRoleDisplayName`, `taskClosedDate`, `taskIsAtRisk`), y `conditions` con al menos `{ field: 'taskActivityType', operator: 'Equals', value: 'USER_TASK' }`. Filtro de estado (`query.states`): **sin campo de condición confirmado** para filtrar por estado de tarea en WLE (MD-04/API-13 solo validaron `Equals` sobre `taskActivityType`) — implementar agregando una condición candidata (p. ej. `{ field: 'taskStatus', operator: 'Equals', value: <estado WLE correspondiente> }`) y **validarla en vivo** contra el ambiente de referencia antes de dar la tarea por cerrada; si no funciona, degradar temporalmente el filtro de estado a client-side (como ya existe para la búsqueda de texto, AC-003) y dejarlo anotado en Observaciones de esta tarea para una unidad de seguimiento. Filtro de proceso (`query.model`): sin uso confirmado de `conditions` para `taskActivityType`/modelo — misma validación en vivo antes de cablearlo.
- [x] **IT-06** — Tests del repositorio y del mapper
      Repositorio: Object Mother con una respuesta `BawWleTasksResponse` real (fixture basado en la captura de evidencia de API-13); casos: la request incluye `offset` en la query y NUNCA en el body, los query params fijos siempre presentes, el body respeta exactamente las 12 propiedades válidas de `SavedSearchDefinition` (ninguna extra, o BAW responde 400). Mapper: casos con 1 tarea, con `stats` presente, con `stats` ausente (`calcStats` no solicitado), con `owner` ausente, con `IS_AT_RISK: true` y `DUE` pasado (debe ganar `overdue`, no `atRisk`, replicando la precedencia validada contra el servidor).

## Observaciones

- Ninguna.
