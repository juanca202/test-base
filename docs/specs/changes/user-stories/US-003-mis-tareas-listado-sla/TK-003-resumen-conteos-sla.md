# TK-003: Resumen de conteos por estado de SLA

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003: Mis tareas — listado y SLA](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Encabezar el listado de «Mis tareas» con los conteos por estado de SLA —total, a tiempo, en riesgo y vencidas— calculados en el cliente sobre las tareas de la página cargada.

BAW no devuelve estos totales: la respuesta del listado trae la lista y los enlaces de paginación, nada más. El alcance del conteo es por tanto la página cargada, no el total de tareas del usuario, y la vista debe dejarlo claro para que el número no se lea como un agregado del que no lo es.

## Dependencias

- [TK-001: Modelo, mapper y repositorio de tareas del usuario](./TK-001-modelo-repositorio-user-tasks.md) — estado de SLA derivado por tarea.
- [TK-002: Listado de «Mis tareas» con estado de SLA y paginación](./TK-002-listado-tareas-sla-paginacion.md) — vista y manager que sostienen el conjunto de tareas cargadas.
- `@factor_ec/ui` (`ft-icon`) y los estilos base del repositorio — presentación de las tarjetas de conteo.

## Referencias

- **Diseño:** [Wireframe de Mis tareas](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/mis-tareas.md) — contadores Total, A tiempo, En riesgo y Vencidas
- **Documentación técnica:** [Resumen de SLA de la lista de tareas](../../../specs/technical-docs/portal-procesos-baw.md#md-05) · [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04) · [Listar tareas del usuario](../../../specs/technical-docs/portal-procesos-baw.md#api-05)

## Archivos afectados

```text
frontend/
└── src/app/features/baw-processes/
    ├── + utils/sla-summary.ts                              # conteo puro por estado de SLA
    ├── + utils/sla-summary.spec.ts
    ├── + components/tasks/sla-summary/sla-summary.ts       # tarjetas de conteo
    ├── + components/tasks/sla-summary/sla-summary.html
    ├── + components/tasks/sla-summary/sla-summary.css
    ├── + components/tasks/sla-summary/sla-summary.spec.ts
    └── ~ components/tasks/tasks.html                       # inserta el resumen sobre el listado
```

## Plan de implementación

- [x] **IT-01** — Implementar el conteo como función pura
      Recibe las tareas ya mapeadas y devuelve la estructura de MD-05; sin inyección Angular ni acceso a datos.
- [x] **IT-02** — Respetar la invariante del resumen
      El total es la suma de los tres estados, y ningún conteo puede ser negativo.
- [x] **IT-03** — Presentar las cuatro tarjetas del wireframe
      Total, a tiempo, en riesgo y vencidas, sobre el listado.
- [x] **IT-04** — Recalcular el resumen cuando cambie el conjunto cargado
      Estado derivado de las tareas de la página actual, de modo que paginar o filtrar lo actualice sin una llamada adicional.
- [x] **IT-05** — Indicar en la vista que el conteo es de la página cargada
      Es el compromiso que la historia acepta entre exactitud y tiempo de carga; sin ese indicio, el usuario leería el número como el total de sus tareas.
