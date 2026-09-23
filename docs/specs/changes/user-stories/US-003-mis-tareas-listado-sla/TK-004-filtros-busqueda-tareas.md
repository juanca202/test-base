# TK-004: Filtros de servidor y búsqueda en cliente del listado

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003: Mis tareas — listado y SLA](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Permitir acotar el listado de «Mis tareas» por estado de tarea, modelo de proceso e instancia usando los parámetros que la API de BAW soporta, y ofrecer además una búsqueda por texto libre aplicada en el cliente sobre las tareas ya cargadas.

El listado de tareas de BAW no tiene búsqueda por texto de servidor —a diferencia del de instancias de proceso—, así que la búsqueda solo puede recorrer la página cargada. Igual que en el resumen de SLA, la vista debe dejar explícito ese alcance para que el resultado no se lea como una búsqueda sobre todas las tareas del usuario.

## Dependencias

- [TK-002: Listado de «Mis tareas» con estado de SLA y paginación](./TK-002-listado-tareas-sla-paginacion.md) — vista y manager que sostienen la consulta y el conjunto cargado.
- `UserTaskRepository` (`features/baw-processes/services/`, de TK-001) — ya expone los parámetros de filtro de servidor.
- Signal Forms (`@angular/forms/signals`) y Angular Material — controles de búsqueda y de selección de filtros.

## Referencias

- **Diseño:** [Wireframe de Mis tareas](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/mis-tareas.md) — campo de búsqueda y selector de filtros
- **Documentación técnica:** [Listar tareas del usuario](../../../specs/technical-docs/portal-procesos-baw.md#api-05) · [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04)
- **Arquitectura:** ADR-011 del repositorio `frontend` — patrón Manager para orquestación ([`frontend/docs/adr/ADR-011-manager-pattern-orchestration.md`](../../../../frontend/docs/adr/ADR-011-manager-pattern-orchestration.md))

## Archivos afectados

```text
frontend/
└── src/app/features/baw-processes/
    ├── + components/tasks/tasks-filters/tasks-filters.ts     # controles de filtro y búsqueda
    ├── + components/tasks/tasks-filters/tasks-filters.html
    ├── + components/tasks/tasks-filters/tasks-filters.css
    ├── + components/tasks/tasks-filters/tasks-filters.spec.ts
    ├── ~ services/tasks-manager.ts                           # aplica filtros de servidor y búsqueda en cliente
    ├── ~ services/tasks-manager.spec.ts
    ├── ~ components/tasks/tasks.html                         # inserta los controles sobre el listado
    └── ~ components/tasks/tasks.ts
```

## Plan de implementación

- [x] **IT-01** — Ofrecer los filtros por estado de tarea, modelo de proceso e instancia
      Se traducen a los parámetros `states`, `model` y `process_id` de la consulta de servidor descrita en API-05. Los valores válidos del estado son los del enum de MD-04.
- [x] **IT-02** — Reconsultar el listado al cambiar un filtro
      Filtrar es una consulta nueva: vuelve a la primera página en lugar de conservar el desplazamiento anterior.
- [x] **IT-03** — Aplicar la búsqueda por texto en el cliente
      Sobre las tareas ya cargadas. La consulta de tareas de BAW no admite término de búsqueda; el de instancias de proceso sí, pero es otro endpoint.
- [x] **IT-04** — Indicar en la vista el alcance de la búsqueda
      El resultado abarca la página cargada, no todas las tareas del usuario; sin ese indicio la búsqueda resulta engañosa cuando el volumen es alto.
- [x] **IT-05** — Combinar filtros y búsqueda de forma predecible
      Los filtros acotan la consulta al servidor y la búsqueda acota lo ya recibido; limpiar cada uno deja el listado en el estado que corresponde sin recargas innecesarias.
- [x] **IT-06** — Mantener coherente el resumen de SLA con lo mostrado
      Filtrar o buscar cambia el conjunto sobre el que se cuenta, y el resumen se recalcula con él.
