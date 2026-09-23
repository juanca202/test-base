# TK-003: Búsqueda y filtros de servidor del listado de procesos

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-004](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Permitir acotar el listado de instancias de proceso por texto, modelo, process app y snapshot usando los parámetros de servidor de `GET /bpm/processes` (`search_term`, `model`, `containers`, `versions`).

A diferencia de «Mis tareas», la búsqueda es de servidor: un término que no esté en la página cargada sí puede aparecer si BAW lo incluye en el resultado filtrado.

## Dependencias

- [TK-002: Listado de procesos — Activo y Completado](./TK-002-listado-procesos-activo-completado.md) — vista y manager que sostienen la consulta y las pestañas de estado.
- `ProcessInstanceRepository` (TK-001) — ya expone `search_term`, `model`, `containers` y `versions`.
- `Filters` (`shared/components/filters/`) — barra de filtros reutilizada por «Mis tareas».
- `StartProcessManager` / `ProcessRepository` (US-002) — fuente opcional de acrónimos de process app para el desplegable `containers`; no es un catálogo de instancias.

## Referencias

- **Diseño:** [Wireframe de Procesos](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/procesos.md) — campo de búsqueda; las pestañas Activo/Completado ya las cubre TK-002
- **Documentación técnica:** [API-09: Listar instancias de proceso](../../../specs/technical-docs/portal-procesos-baw.md#api-09) · [MD-03: Instancia de proceso](../../../specs/technical-docs/portal-procesos-baw.md#md-03)
- **Arquitectura:** [ADR-011 — Patrón Manager](../../../../frontend/docs/adr/ADR-011-manager-pattern-orchestration.md) (repo `frontend`)

## Archivos afectados

```text
frontend/
└── src/app/features/baw-processes/
    ├── ~ services/process-instances-manager.ts          # aplica search_term / model / containers / versions y reinicia offset
    ├── ~ services/process-instances-manager.spec.ts
    ├── ~ components/processes/processes.ts              # arma los FilterItem y reacciona a filtersChange
    ├── ~ components/processes/processes.html            # inserta app-filters sobre el listado
    └── ~ components/processes/processes.spec.ts
```

## Plan de implementación

- [x] **IT-01** — Ofrecer búsqueda por texto de servidor
      El control de texto de `app-filters` se traduce a `search_term`. API-09 filtra por nombre de modelo y de instancia, con comodines implícitos. El debounce ya lo aplica `Filters` (300 ms).
- [x] **IT-02** — Ofrecer filtros por modelo, process app y snapshot
      Se traducen a `model`, `containers` y `versions`. Modelo y snapshot como texto (BAW no expone un catálogo de esos valores para instancias). Process app como desplegable si hay acrónimos disponibles en el catálogo iniciable de US-002 (`processAppAcronym` → `containers`); si el catálogo está vacío, el filtro se omite o queda como texto — no inventar opciones.
- [x] **IT-03** — Reconsultar el listado al cambiar búsqueda o filtro
      Es una consulta nueva: vuelve a la primera página y conserva la pestaña Activo/Completado (`states`) que ya maneja TK-002.
- [x] **IT-04** — Tests del manager y de la vista
      Cambiar `search_term` o un filtro dispara `findAll` con esos params y `offset` de primera página; la pestaña no se pierde. Un término de búsqueda no se aplica en cliente sobre la página cargada.
