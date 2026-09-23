# US-005: Rendimiento del proceso

<!-- us:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-16
**Repositorios:** frontend
**INVEST:** 🟢 6 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)

## Descripción

**COMO** usuario interno autenticado
**QUIERO** consultar indicadores agregados por tipo de proceso y ver su diagrama con el estado de las tareas
**PARA** identificar cuellos de botella en los procesos que sigo

## Criterios de aceptación

- **AC-001 (Salidas del sistema):** El sistema DEBE mostrar, por tipo de proceso, indicadores agregados: instancias en curso y el desglose por estado de SLA (a tiempo, en riesgo, vencida), para todos los procesos disponibles. _(Vía y contrato confirmados con datos reales — ver Observaciones.)_
- **AC-002 (Salidas del sistema):** Al seleccionar un proceso, el sistema DEBE mostrar su diagrama con el estado de las tareas superpuesto, traducido a BPMN 2.0 y renderizado con `bpmn-js`. _(Fuente y formato confirmados — ver Referencias y Observaciones.)_

## Referencias

- **Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)
- **Diseño / prototipo:** [Wireframe de Rendimiento del proceso](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/rendimiento-proceso.md)
- **Documentación técnica:** [Indicador de rendimiento por proceso](../../../specs/technical-docs/portal-procesos-baw.md#md-08) · [Diagrama de proceso con estado](../../../specs/technical-docs/portal-procesos-baw.md#md-10) · [Obtener indicadores de rendimiento por proceso](../../../specs/technical-docs/portal-procesos-baw.md#api-10) · [Obtener el diagrama del proceso](../../../specs/technical-docs/portal-procesos-baw.md#api-12)
- **Investigación:** [RS-003: Diagrama de proceso vía la API visual de WLE](../../research/RS-003-diagrama-proceso-visual-wle/README.md) — fuente y formato de AC-002. [RS-004: Métricas de rendimiento por proceso](../../research/RS-004-metricas-rendimiento-proceso-wle/README.md) — vía preferida de AC-001. [RS-005: Rendimiento del equipo — panel nativo Team Performance (WLE)](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) — panel hermano; no aportó al spike de AC-001. [RS-001 (US-005): spike apuntar el panel a un proceso propio](research/RS-001-spike-apuntar-panel-proceso-propio/README.md) — cierra el spike de AC-001 con datos reales.

## Observaciones

- **Decisión resuelta — AC-001 (2026-09-16):** [RS-004](../../research/RS-004-metricas-rendimiento-proceso-wle/README.md) confirmó, contra IBM Process Portal, que el panel nativo "Rendimiento del proceso" (`dashboards/TWP/Process+Performance`) sí calcula estas métricas — contradice a MD-08/API-10, que solo confirmaban su ausencia en la API REST ya documentada. El mecanismo real es un Ajax Service de BAW invocado vía `POST /rest/bpm/wle/v1/service/{serviceId}` (no un endpoint REST nombrado como el de AC-002): un servicio (`1.66c1cf8c-...`) entrega la serie temporal de "Tasa de renovación" (nuevas/completadas/cambio neto — la definición operativa que resuelve la ausencia de fórmula de `renewalRate`) y otro (`1.492222d4-...`) entrega instancias filtrables por `riskState`/`stepRiskState`, la fuente del desglose de SLA. El usuario decidió (2026-09-15) esta vía como **preferida**. [RS-001 (US-005)](research/RS-001-spike-apuntar-panel-proceso-propio/README.md) cerró el spike técnico que quedaba pendiente: (1) el panel base sin parámetros es un **listado navegable de todos los procesos**, y apuntarlo a uno propio se logra con `?tw.local.selectedProcessId=<processId>&tw.local.processAppId=<processAppId>` (los nombres de parámetro correctos — no `processId`/`processAppId` a secas, que fue lo que no funcionó en RS-004); con el proceso propio "Credito IA Generativa" seleccionado, el contrato quedó validado con datos reales, incluido `riskState` (`"Overdue"`/`"OnTrack"` observados) y `averageDurationMs` (que MD-08 daba por no calculable). El `processId`/`appId` viaja como **parámetro de la llamada al Ajax Service**, no como estado de sesión — un backend propio puede invocarlo directamente. (2) Los mismos `serviceId` sirvieron para dos procesos de negocio distintos dentro de esta instalación, consistente con que sean assets del toolkit de sistema "TWP" (no de nuestro Process App) — evidencia a favor de su estabilidad, aunque no confirma estabilidad **entre ambientes** (pruebas vs. producción), que sigue sin poder verificarse sin un segundo ambiente. **Riesgo residual a tratar en la `TK-XXX` de implementación:** incluir una verificación de humo contra el `serviceId` al desplegar a cada ambiente nuevo, en vez de asumir su estabilidad. [RS-005](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) investigó el panel hermano "Rendimiento del equipo" por el mismo enfoque; no aportó al cierre de este spike (mecanismo y unidad de agregación distintos), pero adelantó el mismo patrón de "panel base = listado navegable" que RS-001 confirmó aquí.
- **Decisión resuelta — AC-002 (2026-09-15):** [RS-003](../../research/RS-003-diagrama-proceso-visual-wle/README.md) confirmó en vivo, contra IBM Process Portal, que `GET /rest/bpm/wle/v1/visual/processModel/instances?instanceIds=[{piid}]&showCurrentActivites=true&showExecutionPath=true&showNote=true&showColor=true` es el endpoint real que expone el diagrama con nodos, enlaces, swimlanes y estado de tareas por nodo activo (`tasks`/`activeTasks`/`tokens`), consumible sin cambios de infraestructura (proxy y `wleAuthInterceptor` ya lo cubren). El usuario decidió el formato de entrega: traducir ese modelo propietario a BPMN 2.0 (`bpmndi:BPMNShape`/`BPMNEdge`) para seguir usando `bpmn-js` como en [TK-006](../US-003-mis-tareas-listado-sla/TK-006-modal-ver-flujo-bpmn-js-mock.md), en vez de un render propio — conserva el visor, el zoom y la licencia ya resueltos ahí, a cambio de escribir y mantener el traductor.
- El bloqueante de acceso de administrador de [US-004](../US-004-procesos-instancias/README.md) quedó **resuelto el 2026-09-16** (`GET /bpm/processes` 200; producto: los usuarios del portal serán administradores en BAW). Eso informa el fallback (b) de AC-001 de esta historia (agregación en cliente sobre API-09), que ya no está vetado por permisos; el spike de la vía preferida sigue pendiente.
- Esta laguna se resolvió a nivel de historia, no en el SRS-001 (que permanece en `Ready`).

---

## Validación

### Complejidad sugerida

- **Story points:** 13
- **Justificación:** AC-002 tiene fuente y formato decididos (RS-003), pero exige escribir y mantener un traductor de modelo WLE a BPMN 2.0; AC-001 tiene su vía confirmada con datos reales (RS-004, RS-001), incluido `processId`/`appId` como parámetro de la llamada al Ajax Service, pero conserva un riesgo residual de estabilidad del `serviceId` entre ambientes que la tarea debe verificar por humo al desplegar. El riesgo del conjunto bajó de "bloqueante" a "mitigable durante implementación".

### INVEST

| Letra | Criterio      | Resultado | Notas                                                                                                                                                                                               |
| ----- | ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I** | Independiente | Cumple    | Ninguno de los dos criterios depende ya de una decisión de producto/arquitectura pendiente (RS-004/RS-001 para AC-001, RS-003 para AC-002).                                                         |
| **N** | Negociable    | Cumple    | El alcance real puede reducirse si se prioriza.                                                                                                                                                     |
| **V** | Valiosa       | Cumple    | Ayuda a identificar cuellos de botella.                                                                                                                                                             |
| **E** | Estimable     | Cumple    | AC-002 estimable (traductor a BPMN 2.0 sobre `bpmn-js`); AC-001 estimable con el contrato ya validado con datos reales (RS-001), con margen para el riesgo residual de estabilidad entre ambientes. |
| **S** | Pequeña       | Cumple    | La investigación de ambos criterios ya cerró; queda solo implementación.                                                                                                                            |
| **T** | Testeable     | Cumple    | AC-002 verificable contra el endpoint confirmado; AC-001 verificable contra el contrato de los Ajax Services validado con datos reales (RS-001).                                                    |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado | Notas                                                                                                                                                        |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dependencias listas                | Cumple | [US-001: Autenticación y acceso al portal](../US-001-autenticacion-acceso-portal/README.md).                                                                 |
| Inputs/outputs claros              | Cumple | AC-002 claro (RS-003); AC-001 claro con contrato validado (RS-004, RS-001).                                                                                  |
| Repositorios definidos             | Cumple | `frontend`.                                                                                                                                                  |
| Sin decisiones técnicas pendientes | Cumple | AC-002 resuelta (RS-003); AC-001 resuelta (RS-004, RS-001) — ver Observaciones.                                                                              |
| Referencias de UI                  | Cumple | Wireframe de Rendimiento del proceso aprobado.                                                                                                               |
| Sin aclaraciones pendientes        | Cumple | El riesgo residual de estabilidad del `serviceId` entre ambientes queda anotado en Observaciones para que la `TK-XXX` lo trate con una verificación de humo. |
