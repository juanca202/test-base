# TK-002: Listado de «Mis tareas» con estado de SLA y paginación

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003: Mis tareas — listado y SLA](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Convertir la vista `/tasks` —hoy un encabezado sin contenido— en el listado de tareas asignadas al usuario autenticado, con nombre de la tarea, instancia de proceso, equipo, vencimiento e indicador visual del estado de SLA, paginado contra el servidor.

Incluye el manager que orquesta la carga y la paginación, que es el punto por el que el resumen de SLA y los filtros se enganchan después al mismo conjunto de tareas cargadas.

## Dependencias

- [TK-001: Modelo, mapper y repositorio de tareas del usuario](./TK-001-modelo-repositorio-user-tasks.md) — modelo de dominio, estado de SLA derivado y consulta paginada.
- `Tasks` (`features/baw-processes/components/tasks/`) — componente de la vista, ya enrutado en `/tasks` bajo el shell autenticado.
- `async-resources` (`core/utils/async-resources.ts`) — carga asíncrona con estados y notificación de error.
- `ProgressPlaceholder` y `ErrorPlaceholder` (`shared/components/`) — estados de carga y de error de la vista.
- `@factor_ec/ui` (`ft-icon`) — indicador visual del estado de SLA y del vencimiento.

## Referencias

- **Diseño:** [Wireframe de Mis tareas](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/mis-tareas.md)
- **Documentación técnica:** [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04) · [Listar tareas del usuario](../../../specs/technical-docs/portal-procesos-baw.md#api-05) · [Componentes del frontend](../../../specs/technical-docs/portal-procesos-baw.md#dg-02)
- **Arquitectura:** ADR-011 del repositorio `frontend` — patrón Manager para orquestación ([`frontend/docs/adr/ADR-011-manager-pattern-orchestration.md`](../../../../frontend/docs/adr/ADR-011-manager-pattern-orchestration.md)) · ADR-006 del repositorio `frontend` — presentación con Tailwind CSS ([`frontend/docs/adr/ADR-006-presentation-tailwind-css.md`](../../../../frontend/docs/adr/ADR-006-presentation-tailwind-css.md))

## Archivos afectados

```text
frontend/
└── src/app/features/baw-processes/
    ├── + services/tasks-manager.ts        # orquesta carga, paginación y estado del listado
    ├── + services/tasks-manager.spec.ts
    ├── ~ components/tasks/tasks.ts        # estado de la vista y paginación
    ├── ~ components/tasks/tasks.html      # filas de tarea con indicador de SLA
    ├── ~ components/tasks/tasks.css
    └── ~ components/tasks/tasks.spec.ts
```

## Plan de implementación

- [x] **IT-01** — Crear `TasksManager` para orquestar el listado
      Clase `{Entidad}Manager` en `tasks-manager.ts`; coordina el repositorio y expone el estado del listado con signals. El acceso a datos sigue siendo del repositorio, no del manager.
- [x] **IT-02** — Cargar la primera página al entrar en la vista
      Con `optional_parts=team_details`, que es lo que trae el equipo de la tarea, y el orden por vencimiento que soporta el servidor.
- [x] **IT-03** — Pintar la fila de tarea con los campos del wireframe
      Nombre de la tarea, instancia de proceso, equipo y vencimiento. MD-04 indica preferir `display_name` sobre `name` cuando llegue, y `process_name` evita una segunda llamada por fila.
- [x] **IT-04** — Mostrar el indicador visual del estado de SLA
      A tiempo, en riesgo y vencida, tomados del campo derivado por el mapper de TK-001; distinguibles sin depender solo del color, conforme a los mínimos WCAG AA declarados en `AGENTS.md` del repositorio `frontend`.
- [x] **IT-05** — Paginar contra el servidor
      Con `offset` y `size`, y los enlaces `previous`/`next` de la respuesta. No traer todas las tareas de una vez: es la condición que sostiene el tiempo de carga que exige la historia.
- [x] **IT-06** — Resolver los estados de carga, error y listado vacío
      Reutilizando los placeholders compartidos del repositorio, sin dejar la vista en blanco mientras llega la respuesta.

> El botón «Abrir tarea» que aparece en el wireframe queda fuera del alcance de esta historia: el detalle de la tarea pertenece a [US-007: Reclamar y completar tarea](../US-007-reclamar-completar-tarea/README.md).
