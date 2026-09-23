# TK-006: Migrar el diagrama del modal "Ver flujo" de Mermaid a bpmn-js (mock)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Reemplazar el motor de renderizado del diagrama en `TaskFlowModal` (TK-005): dejar de usar `mermaid` y renderizar en su lugar un diagrama BPMN 2.0 con `bpmn-js`, manteniendo el resto del alcance de TK-005 sin cambios — sigue siendo un mock exploratorio, desacoplado de cualquier definición de proceso real de BAW (sin llamada HTTP), con el paso correspondiente al estado de la tarea resaltado con la misma paleta de severidad (`ft-badge--success/warning/danger`). La integración con la fuente real del diagrama sigue viviendo en [US-005](../US-005-rendimiento-proceso/README.md) (AC-002, bloqueada por falta de confirmación de API-12).

## Dependencias

- `TaskFlowModal` (`features/baw-processes/components/tasks/task-flow-modal`) — componente existente (TK-005) cuya lógica de render se reemplaza.
- `buildTaskFlowDiagram` (`features/baw-processes/mocks/task-flow-diagram.mock.ts`) — mock existente (TK-005), se reescribe para producir una definición BPMN 2.0 XML en vez de sintaxis `flowchart TD` de Mermaid.
- `UserTask` (`features/baw-processes/models/user-task.ts`) — ya usado por TK-005 para derivar el paso activo desde `state`/`slaStatus`.
- `bpmn-js` (nueva dependencia npm, sustituye a `mermaid`) — `Viewer` (de solo lectura, sin paleta ni edición) para importar la definición BPMN mock y renderizarla como SVG dentro del contenedor del modal.

## Referencias

- **Diseño:** [Modal "Ver flujo" (mock)](./wireframes/README.md#5-modal-ver-flujo-mock) · [wireframe](./wireframes/ver-flujo-modal.svg) — layout sin cambios respecto a TK-005 (título, subtítulo, contenedor del diagrama, botón "Cerrar"); solo cambia el motor de render dentro del contenedor.

## Archivos afectados

```text
frontend/
└── src/
    ├── ~ app/features/baw-processes/mocks/task-flow-diagram.mock.ts     # reescribe el mock como definición BPMN 2.0 XML; expone el id del elemento activo por separado
    ├── ~ app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.ts
    ├── ~ app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.html
    ├── ~ app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.css
    ├── ~ app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.spec.ts
    ├── ~ package.json                                                   # quita `mermaid`, agrega `bpmn-js`
    └── ~ package-lock.json
```

## Plan de implementación

- [x] **IT-01** — Reemplazar la dependencia `mermaid` por `bpmn-js` en `package.json`/`package-lock.json`.
- [x] **IT-02** — Reescribir `task-flow-diagram.mock.ts`: en vez de una cadena `flowchart TD`, construir una definición BPMN 2.0 XML válida (con su `bpmndi:BPMNDiagram`, formas y waypoints ya calculados a mano, sin plugin de auto-layout) del mismo flujo de ejemplo de TK-005 (inicio → revisar solicitud → validar saldo → gateway "¿Saldo suficiente?" → rama Sí: registrar en nómina + notificar aprobación; rama No: notificar rechazo → fin), con un id de elemento BPMN estable por paso. `buildTaskFlowDiagram(task)` retorna la definición XML; el id del elemento activo (mismo mapeo por `state` que TK-005) se expone como un valor separado (no embebido en el XML), ya que el resaltado en `bpmn-js` se aplica después del import, vía marcador sobre el elemento, no como parte de la definición.
- [x] **IT-03** — En `TaskFlowModal`: sustituir el import dinámico de `mermaid` por el de `bpmn-js` (`Viewer`, no `NavigatedViewer`: sin paleta ni edición, coherente con el uso de solo lectura de TK-005). Instanciar el `Viewer` sobre `diagramContainer` tras `afterNextRender`, `await viewer.importXML(definición)`, `canvas.zoom('fit-viewport')` y `canvas.addMarker(activeElementId, severityClass)` sobre el elemento activo. A diferencia de TK-005 (que inyectaba el SVG devuelto por `mermaid.render()` vía `innerHTML`), `bpmn-js` dibuja directamente dentro del contenedor que se le pasa como `container`: ya no hace falta manipular `innerHTML` a mano.
- [x] **IT-04** — Liberar el `Viewer` (`viewer.destroy()`) cuando el componente se destruye (`DestroyRef`/`ngOnDestroy`), para no dejar instancias huérfanas si el modal se abre y cierra repetidas veces.
- [x] **IT-05** — Actualizar `task-flow-modal.css`: reemplazar las reglas pensadas para el SVG de Mermaid por estilos de marcador sobre el SVG que dibuja `bpmn-js` (selectores `.highlight-success/warning/danger .djs-visual > :first-child`), con los mismos colores hexadecimales que replican `ft-badge--success/warning/danger` ya usados en TK-005. Importar además los estilos base de `bpmn-js` (`bpmn-js/dist/assets/diagram-js.css` y `bpmn-js/dist/assets/bpmn-font/css/bpmn.css`), indispensables para que las formas BPMN (eventos, gateways, tareas) se vean correctamente.
- [x] **IT-06** — Mantener visible, sin ocultarlo ni recortarlo por CSS, el enlace "powered by bpmn.io" que el propio `Viewer` fija en una esquina del contenedor: es la condición de la licencia open-source de `bpmn-js` para usarlo sin licencia comercial.
- [x] **IT-07** — Actualizar `task-flow-modal.spec.ts`: mockear `bpmn-js` (constructor `Viewer`, `importXML`, `get('canvas')` con `zoom`/`addMarker`) en vez de `mermaid`; cubrir que `importXML` se llama con la definición mock, que `addMarker` se invoca con el id del elemento activo y la clase de severidad esperada, que `viewer.destroy()` se invoca al destruir el componente, y que el mensaje de fallback ("No se pudo generar el diagrama del flujo") se muestra cuando `importXML` rechaza — mismos tres casos que ya cubría TK-005, adaptados al nuevo mock.
