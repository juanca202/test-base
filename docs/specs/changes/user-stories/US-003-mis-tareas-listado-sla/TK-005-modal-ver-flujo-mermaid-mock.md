# TK-005: Modal "Ver flujo" con diagrama Mermaid (mock)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Habilitar la acción "Ver flujo" del menú contextual de cada fila de "Mis tareas" (`TASK_ROW_ACTIONS` en `tasks.ts`, hoy presente pero deshabilitada) para que abra un modal con el diagrama del flujo de la tarea, renderizado con Mermaid a partir de datos mock del proceso — sin consumir ninguna API de BAW. Es una implementación exploratoria y desacoplada de la fuente real del diagrama, cuya integración vive en [US-005](../US-005-rendimiento-proceso/README.md) (AC-002, bloqueada por falta de confirmación de API-12).

## Dependencias

- `IconButtonContext` (`shared/components/icon-button-context`) — dispara el `click` del ítem `flow` ya existente en `TASK_ROW_ACTIONS` de `tasks.ts`.
- `UserTask` (`features/baw-processes/models/user-task.ts`) — provee `name`/`processName`/`processId`/`teamName` para el título del modal.
- `MatDialog` (`@angular/material/dialog`) — ya disponible en el proyecto (usado indirectamente vía `@factor_ec/ui`; `MatButtonModule`/`MatMenuModule` ya se importan directamente en `tasks.ts`).
- `mermaid` (nueva dependencia npm) — renderiza la definición del diagrama mock a SVG en el navegador.

## Referencias

- **Diseño:** [Modal "Ver flujo" (mock)](./wireframes/README.md#5-modal-ver-flujo-mock) · [wireframe](./wireframes/ver-flujo-modal.svg)

## Archivos afectados

```text
frontend/
└── src/
    ├── + app/features/baw-processes/mocks/task-flow-diagram.mock.ts     # definición Mermaid mock por tarea/proceso, con el paso activo marcado
    ├── + app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.ts
    ├── + app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.html
    ├── + app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.css
    ├── + app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.spec.ts
    ├── ~ app/features/baw-processes/components/tasks/tasks.ts           # habilita el ítem 'flow' y lo conecta a MatDialog.open(TaskFlowModal)
    ├── ~ app/features/baw-processes/components/tasks/tasks.spec.ts
    └── ~ package.json                                                   # agrega dependencia `mermaid`
```

## Plan de implementación

- [x] **IT-01** — Agregar la dependencia `mermaid` al `package.json` del frontend.
- [x] **IT-02** — Crear el mock del diagrama (`task-flow-diagram.mock.ts`): una función que, dado un `UserTask`, retorna una definición Mermaid (`flowchart TD`) con 3-5 pasos genéricos y el paso correspondiente al estado/nombre de la tarea marcado como activo (misma paleta de severidad que `ft-badge--success/warning/danger` para el resaltado). Sin llamada HTTP.
- [x] **IT-03** — Crear `TaskFlowModal` (standalone), recibiendo la tarea vía `MAT_DIALOG_DATA`: título "Ver flujo: {name}" + subtítulo `{processName}:{processId} · {teamName}`, contenedor del diagrama y botón "Cerrar".
      Inicializar el render de Mermaid (`mermaid.render(...)`) sobre la definición mock tras la primera pintura de la vista (`afterNextRender`), inyectando el SVG resultante en el contenedor.
- [x] **IT-04** — En `tasks.ts`: quitar `disabled: true` del ítem `flow` de `TASK_ROW_ACTIONS` y asignarle `click` para abrir `TaskFlowModal` vía `MatDialog.open(...)`, pasando la fila (`UserTask`) actual como dato.
- [x] **IT-05** — Foco: al cerrar el modal (botón "Cerrar", ✕ o `Escape`), devolver el foco al botón "Ver flujo" que lo abrió (comportamiento estándar de `MatDialog`; no se pierde por el `stopPropagation()` del menú contextual, que solo afecta la apertura del trigger de `IconButtonContext`, no el propio `MatDialog`).
- [x] **IT-06** — Actualizar `tasks.spec.ts` (y agregar `task-flow-modal.spec.ts`) cubriendo: clic en "Ver flujo" abre el modal con los datos de la fila seleccionada; el contenedor del diagrama recibe el SVG renderizado; el resto de acciones del menú (`edit`/`history`/`instance`) siguen `disabled`.
