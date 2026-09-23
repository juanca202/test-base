# TK-002: Panel "Rendimiento del proceso"

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-005](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Construir la pantalla "Rendimiento del proceso": una vista general con una tarjeta por tipo de proceso (nombre, gráfico circular de estado, conteos de vencido/en riesgo/a tiempo, AC-001) y, al seleccionar una, un detalle con pestañas "Visión general" (estadísticas rápidas, tasa de renovación, instancias en curso) y "Diagrama" — esta última reutilizando, por instancia elegida por el usuario, el visor BPMN ya implementado por [WI-003](../../work-items/WI-003-diagrama-real-modal-ver-flujo/README.md) para AC-002, sin duplicar su traductor ni su componente.

## Dependencias

- `ProcessPerformanceRepository` (TK-001) — fuente de datos de la vista general y del detalle por proceso.
- `ProcessDiagramRepository`/`ProcessDiagramMapper` (`services/process-diagram-repository.ts`, `utils/process-diagram-mapper.ts`, WI-003) — obtención y traducción del diagrama BPMN de la instancia elegida; ya reciben un `piid` directamente, sin depender de `UserTask`.
- `TaskFlowModal` (`components/task-flow/task-flow-modal.ts`, WI-003/TK-006) — visor `bpmn-js` existente; su entrada está hoy tipada a `UserTask` (deriva `processId` y la clase de severidad desde ahí) y debe generalizarse para aceptar también un `piid` + clase de severidad directos, ya que una instancia de "Rendimiento del proceso" no es una `UserTask`.
- `TaskSlaStatus`/`SEVERITY_CLASS_BY_SLA_STATUS` (`models/user-task.ts`, `task-flow-modal.ts`) — mismo vocabulario de severidad que ya traduce `ProcessPerformanceMapper` (TK-001), reutilizado para las clases `ft-badge--success/warning/danger`.

## Referencias

- **Diseño:** [Wireframe de Rendimiento del proceso](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/rendimiento-proceso.md) — vista general (tarjeta por proceso) y detalle (`rendimiento-proceso-detalle.svg`: pestañas Visión general/Diagrama, estadísticas, instancias en curso).
- **Investigación:** [RS-001 (US-005)](research/RS-001-spike-apuntar-panel-proceso-propio/README.md) — captura de pantalla del panel nativo equivalente, usada como referencia de layout de estadísticas rápidas y listado de instancias.
- **Trabajo relacionado:** [WI-003](../../work-items/WI-003-diagrama-real-modal-ver-flujo/README.md) — visor y traductor de diagrama que esta tarea reutiliza para la pestaña "Diagrama".

## Archivos afectados

```text
frontend/
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── + components/process-performance/process-performance.ts     # vista general: grid de tarjetas por proceso
                ├── + components/process-performance/process-performance.html
                ├── + components/process-performance/process-performance.css
                ├── + components/process-performance/process-performance.spec.ts
                ├── + components/process-performance/process-performance-card/process-performance-card.ts   # tarjeta individual (nombre, gráfico circular, conteos SLA)
                ├── + components/process-performance/process-performance-card/process-performance-card.html
                ├── + components/process-performance/process-performance-card/process-performance-card.spec.ts
                ├── + components/process-performance/process-performance-detail/process-performance-detail.ts  # detalle: pestañas Visión general/Diagrama, estadísticas, instancias en curso
                ├── + components/process-performance/process-performance-detail/process-performance-detail.html
                ├── + components/process-performance/process-performance-detail/process-performance-detail.spec.ts
                ├── ~ components/task-flow/task-flow-modal.ts       # generaliza la entrada: acepta UserTask o { piid, severityClass } directo
                ├── ~ components/task-flow/task-flow-modal.spec.ts
                └── ~ app.routes.ts                                 # registra la ruta del nuevo panel
```

## Plan de implementación

- [x] **IT-01** — Crear `ProcessPerformanceCard`: tarjeta presentacional (nombre del proceso, gráfico circular de estado con `chart.js` o equivalente ya usado en el proyecto, conteos vencido/en riesgo/a tiempo con las mismas clases de severidad `ft-badge--success/warning/danger` del resto de la app), recibiendo un `ProcessPerformanceSummary` (TK-001) por `input()`.
- [x] **IT-02** — Crear `ProcessPerformance` (vista general): grid de `ProcessPerformanceCard` alimentado por `ProcessPerformanceRepository.listOverview()`; al hacer clic en una tarjeta, navega al detalle del proceso (`processId`/`appId` como parámetros de ruta).
- [x] **IT-03** — Crear `ProcessPerformanceDetail`: pestañas "Visión general" (estadísticas rápidas — instancias en curso, duración promedio —, gráfico de tasa de renovación, listado "Instancias en curso" con `riskState`/`dueDate`/`age`) y "Diagrama", alimentadas por `ProcessPerformanceRepository.getDetail(processId, appId)` (TK-01).
- [x] **IT-04** — Generalizar `TaskFlowModal`: aceptar por `MAT_DIALOG_DATA` una unión `UserTask | { piid: string; severityClass: SeverityClass }`, derivando `processId`/clase de severidad según la variante recibida, sin cambiar el resto del flujo de render (`ProcessDiagramRepository.getVisualModel` + `ProcessDiagramMapper` ya reciben el `piid` directamente).
- [x] **IT-05** — En la pestaña "Diagrama" de `ProcessPerformanceDetail`: listar las mismas "Instancias en curso" que la pestaña "Visión general" y, al seleccionar una, abrir `TaskFlowModal` con `{ piid: instancia.id, severityClass: <derivada de instancia.riskState> }` — la instancia la elige el usuario, no se infiere automáticamente (decisión tomada al planificar esta TK).
- [x] **IT-06** — Registrar la ruta del panel en `app.routes.ts` y su entrada de navegación, siguiendo el patrón ya usado por "Procesos"/"Mis tareas".
- [x] **IT-07** — Pruebas: `process-performance.spec.ts`, `process-performance-card.spec.ts`, `process-performance-detail.spec.ts` (estados vacío/cargando/error, navegación tarjeta→detalle, apertura del modal de diagrama desde una instancia elegida) y actualizar `task-flow-modal.spec.ts` para cubrir la nueva variante de entrada `{ piid, severityClass }` sin romper la cobertura existente de `UserTask`.
