# TK-003: Completar tarea con comentario condicional (con mocks)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-007](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Completar una tarea ya reclamada (AC-003, AC-004 y BR-01 de US-007): mostrar un botón de acción por cada "outcome" disponible según el detalle de la tarea, junto con el campo de comentario; exigir el comentario solo cuando la acción elegida esté marcada como rechazo (`isRejection = true`); al confirmar, completar la tarea enviando los valores del formulario, la variable de decisión de la acción elegida y el comentario, cuando el proceso lo define como variable de negocio. Para esta tarea, la acción de completar y las acciones disponibles se obtienen de un mock (MSW) que ya entrega esa información resuelta; no hay llamada real a BAW.

## Dependencias

- [TK-001: Formulario dinámico de detalle de tarea](./TK-001-formulario-dinamico-detalle-tarea.md) — provee `task-detail` y `dynamic-task-form`, cuyos valores se envían al completar.
- [TK-002: Reclamar tarea](./TK-002-reclamar-tarea.md) — la tarea debe estar reclamada (`state = claimed`) antes de habilitar el completado.
- `task-detail-repository.ts` — se le agrega la mutación de completar.
- `TaskMapper` — se extiende con el mapeo de las acciones de tarea (MD-07).
- `TasksManager` — para refrescar el listado de "Mis tareas" tras completar con éxito.
- `notify` (puente de notificaciones de Core) — para notificar éxito o error al completar.

## Referencias

- **Arquitectura:** [ADR-001: Arquitectura híbrida por capas y por funcionalidades](../../../frontend/docs/adr/ADR-001-hybrid-layered-feature-architecture.md) (repositorio `frontend`)
- **Arquitectura:** [ADR-009: Puente de notificaciones por eventos en Core (`notify`)](../../../frontend/docs/adr/ADR-009-core-event-notification-bridge.md) (repositorio `frontend`)
- **Arquitectura:** [ADR-010: Patrón Repository para comunicación REST API](../../../frontend/docs/adr/ADR-010-repository-pattern-rest-api.md) (repositorio `frontend`) — mutación de completar vía `getMutations()`.
- **Arquitectura:** [ADR-012: Mappers como objetos de funciones puras por feature](../../../frontend/docs/adr/ADR-012-feature-mappers-pure-functions.md) (repositorio `frontend`) — mapeo de las acciones de tarea.
- **Documentación técnica:** [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04) · [Campo de formulario dinámico](../../../specs/technical-docs/portal-procesos-baw.md#md-06) · [Acción de tarea (outcome)](../../../specs/technical-docs/portal-procesos-baw.md#md-07) · [Completar una tarea](../../../specs/technical-docs/portal-procesos-baw.md#api-08) · [Reclamar y completar con formulario dinámico (flujo)](../../../specs/technical-docs/portal-procesos-baw.md#fl-03)
- **Diseño:** [Wireframe de Detalle de tarea](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/tarea-detalle.md) — componentes clave "Campo de comentario" y "Botones de acción dinámicos"

## Archivos afectados

```text
frontend/
└── src/
    ├── + app/features/baw-processes/models/task-action.ts                    # MD-07: TaskAction (name/value/label/isRejection/requiresComment)
    ├── ~ app/features/baw-processes/models/user-task.ts                      # agrega actions: TaskAction[] al detalle de tarea
    ├── ~ mocks/tasks/user-task-detail.handlers.ts                            # agrega actions resueltas a la respuesta del detalle
    ├── + mocks/tasks/user-task-complete.handlers.ts                          # handler MSW POST .../complete
    ├── ~ mocks/handlers.ts                                                   # registra el nuevo handler
    ├── ~ app/features/baw-processes/utils/task-mapper.ts                     # mapeo DTO mock → TaskAction (ADR-012)
    ├── ~ app/features/baw-processes/services/task-detail-repository.ts       # agrega mutación de completar (ADR-010)
    ├── + app/features/baw-processes/components/task-detail/task-action-bar/task-action-bar.ts     # botones de acción + campo de comentario
    └── ~ app/features/baw-processes/components/task-detail/task-detail.ts    # integra task-action-bar cuando state=claimed
```

## Plan de implementación

- [x] **IT-01** — Modelar la acción de tarea (MD-07)
      `TaskAction`: `name`, `value`, `label`, `isRejection`, `requiresComment`. Agregar `actions: TaskAction[]` al detalle de tarea.
- [x] **IT-02** — Resolver las acciones en el mock del detalle y crear el mock de completar
      Extender `user-task-detail.handlers.ts` para incluir al menos dos acciones (p. ej. "Aprobar" con `isRejection = false`, "Rechazar" con `isRejection = true, requiresComment = true`); crear `POST /bpm/user-tasks/:taskId/complete` en `user-task-complete.handlers.ts` (200 en éxito).
- [x] **IT-03** — Construir la barra de acciones (`task-action-bar`)
      Un botón por `TaskAction`; campo de comentario visible siempre, marcado obligatorio cuando la acción seleccionada tenga `requiresComment = true` (BR-01); deshabilitar el envío mientras el comentario obligatorio esté vacío.
- [x] **IT-04** — Agregar la mutación de completar al repositorio
      `getMutations()` (ADR-010): envía los valores del formulario (`dynamic-task-form`, de TK-001), la variable de decisión (`name`/`value` de la acción elegida) y el comentario, cuando el proceso lo define como variable de negocio.
- [x] **IT-05** — Manejar la respuesta
      Éxito: notificar y refrescar el listado de "Mis tareas" (`TasksManager`). Error: notificar vía `notify` (ADR-009).

## Observaciones

- Sin pendientes documentados.
