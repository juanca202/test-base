# TK-002: Reclamar tarea (con mocks)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-007](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Reclamar una tarea no asignada desde su detalle (AC-001 de US-007): al entrar al detalle de una tarea con `state = ready`, presentar el diálogo de confirmación de reclamo antes de mostrar el formulario dinámico; al confirmar, invocar el reclamo. Si la tarea ya fue reclamada por otro usuario (409), informarlo con un mensaje claro y refrescar el listado de "Mis tareas" — tratarlo como caso normal, no como error inesperado. Para esta tarea, el reclamo se implementa con un mock (MSW); no hay llamada real a BAW.

## Dependencias

- [TK-001: Formulario dinámico de detalle de tarea](./TK-001-formulario-dinamico-detalle-tarea.md) — provee la página `task-detail` y la ruta `tasks/:id` que esta tarea extiende con el gating de reclamo.
- `task-detail-repository.ts` (creado en TK-001) — se le agrega la mutación de reclamo.
- `TasksManager` (`src/app/features/baw-processes/services/tasks-manager.ts`) — para refrescar el listado de "Mis tareas" tras un 409.
- `notify` (puente de notificaciones de Core) — para el mensaje claro al usuario en caso de conflicto o error.

## Referencias

- **Arquitectura:** [ADR-001: Arquitectura híbrida por capas y por funcionalidades](../../../frontend/docs/adr/ADR-001-hybrid-layered-feature-architecture.md) (repositorio `frontend`)
- **Arquitectura:** [ADR-009: Puente de notificaciones por eventos en Core (`notify`)](../../../frontend/docs/adr/ADR-009-core-event-notification-bridge.md) (repositorio `frontend`) — mensaje claro ante el 409 o un error.
- **Arquitectura:** [ADR-010: Patrón Repository para comunicación REST API](../../../frontend/docs/adr/ADR-010-repository-pattern-rest-api.md) (repositorio `frontend`) — mutación de reclamo vía `getMutations()`.
- **Documentación técnica:** [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04) (estados `ready`/`claimed`) · [Reclamar una tarea](../../../specs/technical-docs/portal-procesos-baw.md#api-07) · [Reclamar y completar con formulario dinámico (flujo)](../../../specs/technical-docs/portal-procesos-baw.md#fl-03)
- **Diseño:** [Wireframe de Detalle de tarea](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/tarea-detalle.md), estado "Tarea no reclamada" — diálogo de confirmación: `../../requirements/SRS-001-portal-procesos-baw/assets/wireframes/tarea-detalle-reclamar.svg`

## Archivos afectados

```text
frontend/
└── src/
    ├── + mocks/tasks/user-task-claim.handlers.ts                        # handler MSW POST .../claim: éxito y 409 simulado
    ├── ~ mocks/handlers.ts                                              # registra el nuevo handler
    ├── ~ app/features/baw-processes/services/task-detail-repository.ts  # agrega mutación de reclamo (ADR-010)
    ├── + app/features/baw-processes/components/task-detail/claim-task-dialog/claim-task-dialog.ts    # diálogo de confirmación de reclamo
    ├── + app/features/baw-processes/components/task-detail/claim-task-dialog/claim-task-dialog.html
    ├── ~ app/features/baw-processes/components/task-detail/task-detail.ts    # gating: si state=ready, diálogo antes del formulario; maneja 409
    └── ~ app/features/baw-processes/services/tasks-manager.ts           # método para refrescar el listado tras un 409 (si no existe ya)
```

## Plan de implementación

- [x] **IT-01** — Extender el mock con el reclamo de tarea
      Handler `POST /bpm/user-tasks/:taskId/claim` en `mocks/tasks/user-task-claim.handlers.ts`: devuelve 200 con la tarea reclamada (`owner`, `state = claimed`) para el caso normal, y 409 para un `taskId` reservado que simula "ya reclamada por otro usuario".
- [x] **IT-02** — Agregar la mutación de reclamo al repositorio
      `getMutations()` (ADR-010) en `task-detail-repository.ts`, con notificación de error vía `notify` (ADR-009) cuando falle por una causa distinta del 409 esperado.
- [x] **IT-03** — Construir el diálogo de confirmación de reclamo y el gating en `task-detail`
      Si `state = ready`, mostrar `claim-task-dialog` antes de renderizar `dynamic-task-form` (de TK-001); al confirmar, invocar la mutación de reclamo.
- [x] **IT-04** — Manejar el 409 como caso normal
      Mostrar un mensaje claro vía `notify` y refrescar el listado de "Mis tareas" (`TasksManager`), sin tratarlo como error inesperado.

## Observaciones

- Sin pendientes documentados.
