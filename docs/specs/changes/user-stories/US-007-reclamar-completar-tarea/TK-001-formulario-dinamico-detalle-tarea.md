# TK-001: Formulario dinámico de detalle de tarea (con mocks)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-007](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Mostrar el formulario dinámico de una tarea (AC-002 de US-007): dada una tarea, renderizar sus campos a partir de los datos que retorna el servicio de detalle de tarea, soportando al menos los tipos texto, número, booleano y fecha, y también selección y archivo cuando el campo ya viene resuelto con esa información. Para esta tarea, ese servicio se implementa con un mock (MSW) que entrega los campos ya resueltos según el contrato de campo de formulario dinámico — no hay llamada real a BAW ni lógica de inferencia de tipos desde un `data_object` crudo.

Quedan **fuera de alcance de esta tarea**: el diálogo de confirmación de reclamo, el panel de historial/diagrama, el campo de comentario y los botones de acción ("outcomes") del wireframe de Detalle de tarea — se cubren en tareas posteriores de esta misma historia (reclamar y completar).

## Dependencias

- `UserTaskRepository` (`src/app/features/baw-processes/services/user-task-repository.ts`) — patrón Repository existente para tareas; el nuevo repositorio de detalle sigue la misma convención (ADR-010).
- `TaskMapper` (`src/app/features/baw-processes/utils/task-mapper.ts`) — mapper existente DTO → dominio para tareas; se extiende con el mapeo de los campos de formulario.
- `src/mocks/handlers.ts` — registro central de handlers MSW (hoy vacío); se añade el handler del detalle de tarea.
- `authGuard` y `MainLayout` — ya usados por la ruta `tasks` en `baw-processes-routes.ts`; la nueva ruta de detalle los reutiliza.
- Componente `Tasks` (`src/app/features/baw-processes/components/tasks/tasks.ts`) — listado existente ("Mis tareas"); cada fila debe enlazar a la nueva ruta de detalle.

## Referencias

- **Arquitectura:** [ADR-001: Arquitectura híbrida por capas y por funcionalidades](../../../frontend/docs/adr/ADR-001-hybrid-layered-feature-architecture.md) (repositorio `frontend`) — ubicación del nuevo código dentro de `features/baw-processes/`.
- **Arquitectura:** [ADR-010: Patrón Repository para comunicación REST API](../../../frontend/docs/adr/ADR-010-repository-pattern-rest-api.md) (repositorio `frontend`) — acceso a `GET /bpm/user-tasks/{task_id}`.
- **Arquitectura:** [ADR-011: Patrón Manager para orquestación de flujos de negocio y UX](../../../frontend/docs/adr/ADR-011-manager-pattern-orchestration.md) (repositorio `frontend`) — si la obtención y el estado del detalle de tarea requieren orquestación más allá del repository.
- **Arquitectura:** [ADR-012: Mappers como objetos de funciones puras por feature](../../../frontend/docs/adr/ADR-012-feature-mappers-pure-functions.md) (repositorio `frontend`) — mapeo DTO → dominio de los campos del formulario.
- **Arquitectura:** [ADR-007: Mocks de APIs HTTP con Mock Service Worker (MSW)](../../../frontend/docs/adr/ADR-007-http-api-mocks-msw.md) (repositorio `frontend`) — mecanismo de mock a usar.
- **Documentación técnica:** [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04) · [Campo de formulario dinámico](../../../specs/technical-docs/portal-procesos-baw.md#md-06) · [Obtener el detalle de una tarea](../../../specs/technical-docs/portal-procesos-baw.md#api-06)
- **Diseño:** [Wireframe de Detalle de tarea](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/tarea-detalle.md) — de sus componentes clave, esta tarea cubre únicamente el **Formulario dinámico**.

## Archivos afectados

```text
frontend/
└── src/
    ├── + app/features/baw-processes/models/task-form-field.ts             # MD-06: TaskFormField (type/label/required/options/…)
    ├── ~ app/features/baw-processes/models/user-task.ts                   # agrega detalle de tarea con fields: TaskFormField[]
    ├── + app/features/baw-processes/services/task-detail-repository.ts    # GET /bpm/user-tasks/{task_id} (ADR-010)
    ├── ~ app/features/baw-processes/utils/task-mapper.ts                  # mapeo DTO mock → TaskFormField (ADR-012)
    ├── + app/features/baw-processes/components/task-detail/task-detail.ts     # página de detalle: obtiene y muestra el formulario
    ├── + app/features/baw-processes/components/task-detail/task-detail.html
    ├── + app/features/baw-processes/components/task-detail/dynamic-task-form/dynamic-task-form.ts    # renderiza cada campo según su type
    ├── + app/features/baw-processes/components/task-detail/dynamic-task-form/dynamic-task-form.html
    ├── ~ app/features/baw-processes/baw-processes-routes.ts               # agrega ruta tasks/:id
    ├── ~ app/features/baw-processes/components/tasks/tasks.html           # enlaza cada fila a tasks/:id
    ├── + mocks/tasks/user-task-detail.handlers.ts                         # handler MSW del detalle mockeado, campos ya resueltos
    └── ~ mocks/handlers.ts                                                # registra el nuevo handler
```

## Plan de implementación

- [x] **IT-01** — Modelar `TaskFormField` y el detalle de tarea con sus campos
      Campos según MD-06: `name`, `value`, `type` (`text | number | boolean | date | datetime | select | file`), `label`, `required`, `readOnly`, `options?`, `group?`, `order?`. Extender el modelo de tarea existente (`user-task.ts`) con `fields: TaskFormField[]` para el detalle.
- [x] **IT-02** — Crear el mock MSW del detalle de tarea
      Handler para `GET /bpm/user-tasks/:taskId` en `mocks/tasks/user-task-detail.handlers.ts`, registrado en `mocks/handlers.ts` (ADR-007). Debe devolver al menos un caso de ejemplo con campos de los seis tipos soportados (`text`, `number`, `boolean`, `date`, `select`, `file`), ya resueltos (con `type`, `label`, `required` y `options` cuando aplique) — sin lógica de inferencia en el cliente.
- [x] **IT-03** — Crear el repositorio de detalle de tarea
      `task-detail-repository.ts` con un método de lectura de recurso único (`getResource()`, ADR-010) sobre `GET /bpm/user-tasks/{task_id}`, siguiendo la misma convención de `UserTaskRepository`.
- [x] **IT-04** — Mapear el DTO mockeado a `TaskFormField[]`
      Extender `task-mapper.ts` (ADR-012, funciones puras) con el mapeo del detalle de tarea y sus campos.
- [x] **IT-05** — Construir el renderizador dinámico del formulario
      Componente `dynamic-task-form` que reciba `TaskFormField[]` como `input()` y pinte cada campo según `type` con `@switch`/`@for` (patrón similar al de `app-filters`), usando Signal Forms (`@angular/forms/signals`); los tipos no soportados (`object`/`array` sin metadatos) se muestran de solo lectura.
- [x] **IT-06** — Crear la página de detalle de tarea y su ruta
      Componente `task-detail` que obtiene el detalle (mockeado) y renderiza `dynamic-task-form` dentro de `MainLayout`; agregar la ruta `tasks/:id` protegida con `authGuard` en `baw-processes-routes.ts`, y enlazar cada fila de `Tasks` (listado) a esa ruta.

## Observaciones

- Sin pendientes documentados.
