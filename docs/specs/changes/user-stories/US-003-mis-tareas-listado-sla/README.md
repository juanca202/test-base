# US-003: Mis tareas — listado y SLA

<!-- us:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-14
**Repositorios:** frontend
**INVEST:** 🟢 6 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../requirements/SRS-001-portal-procesos-baw/README.md)

## Descripción

**COMO** usuario interno autenticado
**QUIERO** ver mis tareas asignadas con su estado de vencimiento y poder buscarlas/filtrarlas
**PARA** priorizar mi trabajo del día

## Contexto

La búsqueda por texto (AC-003) es un filtro del lado del cliente sobre la página cargada, no sobre el total de tareas del usuario: es un compromiso aceptado entre exactitud y el umbral de carga de NFR-003 del SRS de origen, ya que BAW no provee búsqueda de servidor por texto libre para este listado (ver documentación técnica, MD-04 y API-13). El resumen de SLA (AC-002), en cambio, se calcula en el **servidor** sobre el total real de tareas del usuario (bloque `stats` de API-13), sin ese compromiso — ver ADR-015 (repo `frontend`) y MD-05.

## Criterios de aceptación

- **AC-001 (Interacción de usuario):** El sistema DEBE mostrar al usuario autenticado el listado de tareas asignadas (API-13: `PUT /rest/bpm/wle/v1/tasks`), con nombre, instancia de proceso, equipo, vencimiento y estado de SLA (a tiempo, en riesgo, vencida) derivado a partir de los datos de vencimiento y riesgo que retorna BAW.
  Casos de prueba: [TC-001](./test-cases/TC-001-listado-tareas-sla-a-tiempo-happy.md) · [TC-002](./test-cases/TC-002-tarea-due-date-pasado-vencida-happy.md) · [TC-003](./test-cases/TC-003-tarea-at-risk-time-pasado-en-riesgo-limite.md) · [TC-004](./test-cases/TC-004-listado-vacio-sin-tareas-error.md)
- **AC-002 (Procesamiento de datos):** El sistema DEBE mostrar un resumen de conteos por estado de SLA (a tiempo, en riesgo, vencida), calculado por el servidor sobre el total real de tareas del usuario, no solo sobre la página cargada.
  Casos de prueba: [TC-005](./test-cases/TC-005-resumen-conteos-sla-pagina-happy.md) · [TC-006](./test-cases/TC-006-resumen-conteos-solo-pagina-cargada-limite.md)
- **AC-003 (Interacción de usuario):** El sistema DEBE permitir filtrar el listado por estado de tarea, modelo de proceso e instancia usando los parámetros de servidor que soporte la API de BAW; DEBE permitir además una búsqueda por texto libre aplicada en el cliente sobre las tareas ya cargadas.
  Casos de prueba: [TC-007](./test-cases/TC-007-filtro-estado-tarea-servidor-happy.md) · [TC-008](./test-cases/TC-008-busqueda-texto-libre-cliente-happy.md) · [TC-009](./test-cases/TC-009-busqueda-fuera-de-pagina-cargada-limite.md)
- **AC-004 (Eficiencia de rendimiento):** El sistema DEBE cargar el listado de "Mis tareas" en no más de 3 segundos bajo condiciones normales de red, usando paginación de servidor (`offset`/`size`) en vez de traer todas las tareas de una vez.
  Casos de prueba: [TC-010](./test-cases/TC-010-carga-listado-3-segundos-paginacion-happy.md) · [TC-011](./test-cases/TC-011-indicador-carga-respuesta-lenta-limite.md)

## Referencias

- **Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../requirements/SRS-001-portal-procesos-baw/README.md)
- **Diseño / prototipo:** [Wireframe de Mis tareas](../../requirements/SRS-001-portal-procesos-baw/assets/wireframes/mis-tareas.md) · [Wireframes de estados de esta historia](./wireframes/README.md) (listado base + SLA, filtros, vacío, carga lenta) · [Propuesta interactiva de distribución responsiva](https://claude.ai/code/artifact/04f111c6-c5fc-4b0c-b52a-c8acabf6fea9)
- **Documentación técnica:** [Tarea](../../../../architecture/portal-procesos-baw/models/MD-04-tarea.md) · [Resumen de SLA de la lista de tareas](../../../../architecture/portal-procesos-baw/models/MD-05-resumen-sla-lista-tareas.md) · [Buscar tareas del usuario (WLE)](../../../../architecture/portal-procesos-baw/apis/API-017-tareas.md#put-rest-bpm-wle-tasks)
- **Decisión arquitectónica:** ADR-015 — Integración con BAW vía la API REST nativa (WLE) en vez de contratos custom por historia (repo `frontend`)

## Observaciones

- El enunciado de AC-002 cambió (resumen de SLA: de cálculo en cliente sobre la página, a cálculo en servidor sobre el total). [TC-005](./test-cases/TC-005-resumen-conteos-sla-pagina-happy.md) y [TC-006](./test-cases/TC-006-resumen-conteos-solo-pagina-cargada-limite.md) quedan desalineados con la nueva redacción — TC-006 en particular verifica justo el comportamiento contrario (resumen limitado a la página). Pasar por `/test-define` para actualizarlos antes de dar por cerrada la cobertura de AC-002.

---

## Validación

### Complejidad sugerida

- **Story points:** 5
- **Justificación:** consumo de un listado paginado con filtros de servidor, más lógica de derivación de SLA por tarea en cliente y resumen agregado en servidor; complejidad moderada, sin bloqueantes de API.

### INVEST

| Letra | Criterio      | Resultado | Notas                                                                                 |
| ----- | ------------- | --------- | ------------------------------------------------------------------------------------- |
| **I** | Independiente | Cumple    | Depende solo de [US-001](../US-001-autenticacion-acceso-portal/README.md), ya creada. |
| **N** | Negociable    | Cumple    | El detalle visual del listado es negociable.                                          |
| **V** | Valiosa       | Cumple    | Es la pantalla principal de trabajo diario del usuario.                               |
| **E** | Estimable     | Cumple    | Contrato de API confirmado en vivo.                                                   |
| **S** | Pequeña       | Cumple    | Alcance acotado a un listado con filtros y resumen.                                   |
| **T** | Testeable     | Cumple    | AC-001 a AC-004 son verificables.                                                     |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado | Notas                                                                                                                                                                                                        |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dependencias listas                | Cumple | [US-001: Autenticación y acceso al portal](../US-001-autenticacion-acceso-portal/README.md).                                                                                                                 |
| Inputs/outputs claros              | Cumple | Contrato de API-13 (`PUT /rest/bpm/wle/v1/tasks`, WLE) confirmado en vivo, incluida paginación por `offset` de query y compatibilidad de `TASK.TKIID` con el detalle/reclamo/completado existente (ADR-015). |
| Repositorios definidos             | Cumple | `frontend`.                                                                                                                                                                                                  |
| Sin decisiones técnicas pendientes | Cumple | El compromiso de exactitud de la búsqueda por texto (AC-003) ya está aceptado (ver Contexto); el resumen de SLA (AC-002) ya no tiene ese compromiso.                                                         |
| Referencias de UI                  | Cumple | Wireframe de Mis tareas aprobado.                                                                                                                                                                            |
| Sin aclaraciones pendientes        | Cumple | Sin pendientes de negocio; queda un ajuste mecánico de TC-005/TC-006 vía `/test-define` (ver Observaciones), no una decisión abierta.                                                                        |
