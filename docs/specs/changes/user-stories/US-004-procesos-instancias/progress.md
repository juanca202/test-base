# Progreso

## US-004: Procesos — instancias en ejecución y completadas

<!-- work:id=US-004 · status=Done -->

**Estado:** Done
**Tipo:** historia de usuario
**Fecha de creación:** 2026-09-16 09:30
**Ultima actualizacion:** 2026-09-16 10:24

## Unidades

### TK-001: Modelo y repositorio de instancias de proceso

<!-- unit:id=TK-001 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-16 09:30
**Finalizado:** 2026-09-16 09:51
**Implementador:** juanca202 / Cursor / Grok 4.6 / 71594878-6158-4e42-a320-c4e0e05ec847

**Archivos:**
`

- frontend/src/app/features/baw-processes/models/process-instance.ts
- frontend/src/app/features/baw-processes/utils/process-instance-mapper.ts
- frontend/src/app/features/baw-processes/utils/process-instance-mapper.spec.ts
- frontend/src/app/features/baw-processes/services/process-instance-repository.ts
- frontend/src/app/features/baw-processes/services/process-instance-repository.spec.ts
- frontend/src/mocks/processes/process-instance.handlers.ts
- frontend/src/mocks/processes/process-instance.handlers.spec.ts
  ~ frontend/src/mocks/handlers.ts
  `

**Notas:**

- `FindProcessInstancesQuery` vive en el repositorio, igual que `FindUserTasksQuery`. Los arrays de query (`states`, `containers`, `versions`, `sort`) se serializan como params repetidos con `HttpParams.append`; el OpenAPI no declara `collectionFormat`.
- El spec del repositorio usa un `setupServer()` propio, no el `server` global de `mocks/node`, para no arrastrar los handlers de US-007 al umbral de cobertura de una corrida acotada.
- `offset` se envía como string, tal como lo tipa API-09. No se pide `optional_parts`.

**Decisiones adicionales:**

- La paginación conserva `previous`/`next` como enlaces opacos (pathname + search), sin recomponer la query a ciegas ni inventar `totalCount`.

### TK-002: Listado de procesos — Activo y Completado

<!-- unit:id=TK-002 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-16 09:52
**Finalizado:** 2026-09-16 09:56
**Implementador:** juanca202 / Cursor / Grok 4.6 / 71594878-6158-4e42-a320-c4e0e05ec847

**Archivos:**
`

- frontend/src/app/features/baw-processes/services/process-instances-manager.ts
- frontend/src/app/features/baw-processes/services/process-instances-manager.spec.ts
- frontend/src/app/features/baw-processes/components/processes/processes.ts
- frontend/src/app/features/baw-processes/components/processes/processes.html
- frontend/src/app/features/baw-processes/components/processes/processes.spec.ts
  ~ frontend/src/app/features/baw-processes/baw-processes-routes.ts
  `

**Notas:**

- `hasNext`/`hasPrevious` salen de los enlaces opacos `next`/`previous`; `total` del `Datagrid` se infiere como `offset + filas + 1` si hay `next`, nunca recorriendo páginas.
- No se tocó `main-layout.spec.ts`: el ítem de menú `/processes` ya estaba cubierto y el spec sobreescribe el template.

**Decisiones adicionales:**

- Pestañas Activo/Completado como `role="tablist"` con `matButton` filled/outlined: el proyecto no usa `mat-tab-group` todavía y el wireframe no impone un componente concreto.

### TK-003: Búsqueda y filtros de servidor del listado de procesos

<!-- unit:id=TK-003 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-16 09:57
**Finalizado:** 2026-09-16 10:00
**Implementador:** juanca202 / Cursor / Grok 4.6 / 71594878-6158-4e42-a320-c4e0e05ec847

**Archivos:**
`~ frontend/src/app/features/baw-processes/models/process.ts
~ frontend/src/app/features/baw-processes/utils/process-mapper.ts
~ frontend/src/app/features/baw-processes/utils/process-mapper.spec.ts
~ frontend/src/app/features/baw-processes/services/process-repository.spec.ts
~ frontend/src/app/features/baw-processes/services/process-instances-manager.ts
~ frontend/src/app/features/baw-processes/services/process-instances-manager.spec.ts
~ frontend/src/app/features/baw-processes/components/processes/processes.ts
~ frontend/src/app/features/baw-processes/components/processes/processes.html
~ frontend/src/app/features/baw-processes/components/processes/processes.spec.ts`

**Notas:**

- `processAppAcronym` se expone en `StartableProcess` para alimentar el desplegable `containers`; si el catálogo iniciable no trae acrónimos, el filtro queda como texto.
- No hay suite e2e de `/processes` en el repo: la corrida e2e de cierre de esta implementación no aplica. La bateria formal queda para `quality-check`.

**Decisiones adicionales:**

- Búsqueda, modelo, process app y snapshot van todos al servidor (`setFilters`). No hay `setSearchTerm` de cliente, a diferencia de «Mis tareas».
