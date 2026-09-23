# US-007: Reclamar y completar tarea

<!-- us:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-13
**Repositorios:** frontend
**INVEST:** 🟢 5 · 🟡 1 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)

## Descripción

**COMO** usuario interno autenticado
**QUIERO** reclamar una tarea no asignada, revisar/completar su formulario y ejecutar la acción correspondiente, dejando constancia de un comentario cuando la rechazo
**PARA** resolver mis tareas asignadas sin salir del portal

## Fuera de alcance

- La definición y el mantenimiento del mecanismo real de configuración por proceso en BAW —qué campos usan tipo `select`/`file` (MD-06), cuál es la variable de decisión del proceso y sus valores (MD-07), y cómo se envía el comentario cuando BAW no ofrece una ruta REST nativa para ello— quedan fuera de esta historia. Para esta implementación se asume que el servicio de tareas del portal ya entrega esos datos resueltos, y mientras no exista la integración real, ese servicio se simula con mocks. La decisión de diseño sobre el mecanismo real de configuración por proceso se aborda en trabajo futuro, fuera de esta historia.

## Reglas de negocio

- **BR-01:** El comentario DEBE ser obligatorio cuando el usuario elige la acción configurada como rechazo al completar una tarea; para el resto de las acciones es opcional. → verificado por AC-004

## Criterios de aceptación

- **AC-001 (Casos de uso):** El sistema DEBE permitir reclamar (`POST /bpm/user-tasks/{task_id}/claim`) una tarea no asignada (`state = ready`) antes de completarla; si la tarea ya fue reclamada por otro usuario, el sistema DEBE informarlo con un mensaje claro y refrescar el listado, sin tratarlo como un error inesperado.
- **AC-002 (Casos de uso):** El sistema DEBE renderizar dinámicamente el formulario de la tarea a partir de los campos que retorne el servicio de tareas (`GET /bpm/user-tasks/{task_id}` con `optional_parts=data,actions,team_details`), ya resueltos según el contrato de campo de formulario dinámico (MD-06): tipo, etiqueta, obligatoriedad y opciones cuando el tipo lo requiera. Para esta implementación ese servicio se simula con mocks que ya entregan los campos resueltos, incluidos los tipos no inferibles automáticamente desde BAW (listas de selección y archivos/adjuntos); el mecanismo real que resuelve esa configuración por proceso queda fuera de alcance (ver Fuera de alcance).
- **AC-003 (Casos de uso):** El sistema DEBE completar la tarea (`POST /bpm/user-tasks/{task_id}/complete`) enviando los valores del formulario y la variable de decisión del proceso, identificada según el contrato de acción de tarea (MD-07). Para esta implementación, el nombre de esa variable y los valores que representa cada acción los entrega ya resueltos el servicio de tareas simulado con mocks; el mecanismo real que resuelve esa configuración por proceso queda fuera de alcance (ver Fuera de alcance).
- **AC-004 (Interacción de usuario):** El sistema DEBE exigir un comentario cuando la acción elegida esté marcada como rechazo (`isRejection = true` en el contrato de acción de tarea, MD-07; ver BR-01); para el resto de las acciones, el comentario es opcional. Para esta implementación, ese indicador y el envío del comentario los entrega ya resueltos el servicio de tareas simulado con mocks; el mecanismo real de comentarios y su integración con BAW quedan fuera de alcance (ver Fuera de alcance).

## Referencias

- **Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)
- **Diseño / prototipo:** [Wireframe de Detalle de tarea](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/tarea-detalle.md) (incluye el estado "Reclamar tarea")
- **Documentación técnica:** [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04) · [Campo de formulario dinámico](../../../specs/technical-docs/portal-procesos-baw.md#md-06) · [Acción de tarea (outcome)](../../../specs/technical-docs/portal-procesos-baw.md#md-07) · [Obtener el detalle de una tarea](../../../specs/technical-docs/portal-procesos-baw.md#api-06) · [Reclamar una tarea](../../../specs/technical-docs/portal-procesos-baw.md#api-07) · [Completar una tarea](../../../specs/technical-docs/portal-procesos-baw.md#api-08) · [Reclamar y completar con formulario dinámico (flujo)](../../../specs/technical-docs/portal-procesos-baw.md#fl-03)

## Observaciones

- **2026-09-13 — Alcance acotado a mocks.** Los servicios de tarea (detalle, reclamo, completar) se consumen mediante mocks en esta implementación: se asume que ya entregan los campos de formulario (MD-06) y la acción de decisión (MD-07) completamente resueltos. El mecanismo real de configuración por proceso en BAW —antes registrado como tres decisiones pendientes bloqueantes— queda fuera del alcance de esta historia (ver Fuera de alcance) y se revisará en trabajo futuro, cuando se decida cómo mantener esa configuración.

---

## Validación

### Complejidad sugerida

- **Story points:** 8
- **Justificación:** se reduce de 13 a 8 respecto de la versión anterior: la incertidumbre principal —la configuración por proceso en BAW aún sin decidir— queda fuera de alcance y se resuelve con mocks. Persiste el trabajo de reclamar, el motor de renderizado dinámico del formulario y el completado con la regla condicional de comentario obligatorio.

### INVEST

| Letra | Criterio      | Resultado | Notas                                                                                                                                                                                                                                                                                             |
| ----- | ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I** | Independiente | Cumple    | Depende de [US-001](../US-001-autenticacion-acceso-portal/README.md) y [US-003](../US-003-mis-tareas-listado-sla/README.md), ambas en `Estado: Ready` (US-003 ya integrada); no depende de trabajo incompleto. La configuración por proceso en BAW queda fuera de alcance (ver Fuera de alcance). |
| **N** | Negociable    | Cumple    | El alcance de tipos de campo y de la regla de rechazo, dentro del contrato mockeado, es negociable.                                                                                                                                                                                               |
| **V** | Valiosa       | Cumple    | Es el núcleo de la resolución de tareas del portal.                                                                                                                                                                                                                                               |
| **E** | Estimable     | Cumple    | Estimable con el contrato de datos mockeado (MD-06, MD-07); ya no depende de una decisión de configuración sin definir.                                                                                                                                                                           |
| **S** | Pequeña       | Parcial   | Agrupa reclamar, renderizar el formulario dinámico y completar con reglas condicionales; el tamaño se gestiona con la descomposición en TK de `work-plan` (p. ej. reclamar, motor de formulario, completar).                                                                                      |
| **T** | Testeable     | Cumple    | AC-001 a AC-004 son verificables contra el contrato mockeado (MD-06, MD-07).                                                                                                                                                                                                                      |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado | Notas                                                                                                                                              |
| ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependencias listas                | Cumple | [US-001](../US-001-autenticacion-acceso-portal/README.md) y [US-003](../US-003-mis-tareas-listado-sla/README.md) en `Ready` (US-003 ya integrada). |
| Inputs/outputs claros              | Cumple | Contrato de campo (MD-06) y de acción (MD-07) documentados; para esta historia se consumen vía mocks (ver Fuera de alcance).                       |
| Repositorios definidos             | Cumple | `frontend`.                                                                                                                                        |
| Sin decisiones técnicas pendientes | Cumple | La configuración real por proceso en BAW queda fuera de alcance de esta historia (ver Fuera de alcance); para esta implementación se usan mocks.   |
| Referencias de UI                  | Cumple | Wireframe de Detalle de tarea aprobado.                                                                                                            |
| Sin aclaraciones pendientes        | Cumple | Observaciones documenta la decisión de alcance ya tomada, sin preguntas abiertas.                                                                  |
