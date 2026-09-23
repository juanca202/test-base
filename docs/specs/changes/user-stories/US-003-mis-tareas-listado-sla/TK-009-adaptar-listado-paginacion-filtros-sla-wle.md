# TK-009: Adaptar listado, paginación, filtros y resumen de SLA al contrato WLE

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Adaptar `TasksManager`, `Tasks` y `SlaSummary` a la nueva forma de `UserTaskPage` que deja TK-008 (`offset`/`size`/`totalCount`/`stats` en vez de `previous`/`next`): paginación exacta basada en `totalCount` (offset 0-based, ya no 1-based), y el resumen de SLA (AC-002) pasa de calcularse en cliente sobre las tareas cargadas (`slaSummary(tasks)`) a mostrarse directamente desde el `stats` que trae el servidor sobre el total real del usuario.

## Dependencias

- `TasksManager` (`services/tasks-manager.ts`) — orquesta paginación y filtros; consume `UserTaskRepository` (TK-008).
- `Tasks` (`components/tasks/tasks.ts`/`.html`) — vista del listado; calcula `pageIndex`/`total` a partir del manager.
- `SlaSummary` (`components/tasks/sla-summary/sla-summary.ts`/`.html`) — hoy recibe `tasks` y calcula el resumen con `slaSummary()`.
- `slaSummary()` (`utils/sla-summary.ts`) — función de cálculo en cliente que este TK retira del camino del listado (queda sin consumidores tras esta tarea; no se borra el archivo salvo que se confirme que nada más la usa).
- TK-008 — provee la nueva forma de `UserTaskPage`/`FindUserTasksQuery`.

## Referencias

- **Arquitectura:** [ADR-015](../../../../frontend/docs/adr/ADR-015-native-baw-wle-rest-api.md) (repo `frontend`)
- **Documentación técnica:** [API-13: Buscar tareas del usuario (WLE)](../../../specs/technical-docs/portal-procesos-baw.md#api-13) — semántica de `offset`/`totalCount`/`requestedSize` · [MD-05: Resumen de SLA de la lista de tareas](../../../specs/technical-docs/portal-procesos-baw.md#md-05)

## Archivos afectados

```text
frontend/
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── ~ services/tasks-manager.ts                         # offset 0-based (FIRST_PAGE_OFFSET=0), hasNext/hasPrevious desde totalCount, expone stats de la página
                ├── ~ services/tasks-manager.spec.ts                    # casos de paginación/offset y exposición de stats actualizados
                ├── ~ components/tasks/tasks.ts                         # pageIndex/total desde offset/totalCount (ya no aproximado); pasa manager.stats a SlaSummary
                ├── ~ components/tasks/tasks.html                       # SlaSummary recibe [stats] en vez de [tasks]
                ├── ~ components/tasks/tasks.spec.ts                    # casos de paginación/total actualizados
                ├── ~ components/tasks/sla-summary/sla-summary.ts       # input `stats: SlaSummary | undefined` en vez de `tasks: UserTask[]`; sin cálculo propio
                ├── ~ components/tasks/sla-summary/sla-summary.html     # el aviso de "solo la página cargada" (AC-002/TC-006 anterior) se retira: el resumen ya es del total real
                └── ~ components/tasks/sla-summary/sla-summary.spec.ts  # casos con `stats` de entrada en vez de `tasks`
```

## Plan de implementación

- [x] **IT-01** — `TasksManager`: offset 0-based
      `FIRST_PAGE_OFFSET` pasa de `1` a `0` (API-13 es 0-based, a diferencia de API-05; ya no aplica la nota "BAW rechaza 0", WI-001). `loadNextPage`/`loadPreviousPage` avanzan/retroceden por `PAGE_SIZE` igual que hoy, pero comparando contra `totalCount` en vez de enlaces `previous`/`next`.
- [x] **IT-02** — `TasksManager`: `hasPrevious`/`hasNext`/`total`/`stats` exactos
      `hasPrevious = offset() > 0`; `hasNext = offset() + PAGE_SIZE < totalCount` (usar `data.totalCount` de la página cargada, expuesto por TK-008 en `UserTaskPage`); exponer un nuevo signal público `total = computed(() => this.resource.value()?.totalCount ?? 0)` y `stats = computed(() => this.resource.value()?.stats)` para que `Tasks`/`SlaSummary` los consuman directamente, sin aproximaciones.
- [x] **IT-03** — `Tasks`: `pageIndex`/`total` exactos
      `pageIndex = computed(() => Math.floor(this.manager.offset() / PAGE_SIZE))` (0-based, sin el `- 1` que compensaba el offset 1-based de API-05). `total = this.manager.total` directo — retira el cálculo aproximado (`offset - 1 + PAGE_SIZE + (hasNext ? 1 : 0)`) que ya no hace falta.
- [x] **IT-04** — `SlaSummary`: recibir `stats` en vez de `tasks`
      Cambia el `input<UserTask[]>('tasks', [])` por `input<SlaSummaryCounts | undefined>('stats')`; el `computed(() => slaSummary(this.tasks()))` se retira — las cuatro tarjetas (`SLA_SUMMARY_CARDS`) leen directamente del `stats` recibido, con `0` en cada conteo mientras `stats` es `undefined` (primera carga). `Tasks` pasa `[stats]="manager.stats()"` en `tasks.html` en vez de `[tasks]="tasks()"`.
- [x] **IT-05** — Retirar el aviso de alcance parcial
      `sla-summary.html` (o `tasks.html`, según dónde viva hoy) tenía un párrafo explícito de que el resumen es solo de la página cargada (IT-05 de TK-003, AC-002/TC-006 anterior) — ya no aplica: el resumen es del total real del usuario. Retirar ese texto; el aviso de que **la búsqueda por texto** sí sigue acotada a la página cargada (AC-003) se mantiene sin cambios, es un texto distinto.
- [x] **IT-06** — Tests
      `tasks-manager.spec.ts`: paginación con `offset` 0-based, `hasNext`/`hasPrevious` derivados de `totalCount`, `stats`/`total` expuestos correctamente. `tasks.spec.ts`: `pageIndex`/`total` ya no aproximados. `sla-summary.spec.ts`: reescribir los casos que armaban una lista de `UserTask` para pasarla como `tasks` — ahora arman directamente un `SlaSummaryCounts` y lo pasan como `stats`; cubre TC-005 (una página, resumen = total) y TC-006 (más tareas que el tamaño de página, resumen no cambia al paginar).

## Observaciones

- Ninguna.
