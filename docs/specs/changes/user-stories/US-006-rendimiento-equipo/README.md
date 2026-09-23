# US-006: Rendimiento del equipo

<!-- us:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-16
**Repositorios:** frontend
**INVEST:** 🟢 5 · 🟡 1 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)

## Descripción

**COMO** usuario interno autenticado
**QUIERO** consultar el estado de los procesos por grupo/equipo
**PARA** identificar qué equipos tienen más carga o riesgo de incumplimiento

## Criterios de aceptación

- **AC-001 (Salidas del sistema):** El sistema DEBE mostrar, por grupo/equipo, los totales de tareas vencidas, en riesgo y a tiempo, para todos los grupos disponibles (sin filtrar por el grupo del usuario, dado que esta versión no distingue roles). _(Fuente decidida (2026-09-16): panel nativo "Rendimiento del equipo" — ver Observaciones.)_

## Referencias

- **Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)
- **Diseño / prototipo:** [Wireframe de Rendimiento del equipo](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/rendimiento-equipo.md)
- **Documentación técnica:** [Indicador de rendimiento por equipo](../../../specs/technical-docs/portal-procesos-baw.md#md-09) · [Obtener indicadores de rendimiento por equipo](../../../specs/technical-docs/portal-procesos-baw.md#api-11)
- **Investigación:** [RS-005: Rendimiento del equipo — panel nativo Team Performance (WLE)](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) — cambia el marco de la decisión pendiente de AC-001, sin cerrarla. [RS-001 (US-006): spike API-13 en modo administrador](research/RS-001-spike-api-13-modo-administrador/README.md) — descarta esa vía alterna.

## Observaciones

- **Decisión resuelta — AC-001 (2026-09-16):** [RS-005](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) confirmó, contra IBM Process Portal, que el panel nativo "Rendimiento del equipo" (`dashboards/TWP/Team+Performance`) sí agrega, por equipo y **para todos los equipos del sistema** (no solo los visibles al usuario), el desglose vencido/en riesgo/a tiempo que pide AC-001 — contradice la premisa de MD-09/API-11 de que no hay ninguna vía para ver "todos los grupos". El mecanismo real no es una llamada REST/Ajax discreta: los datos vienen incrustados como literal JavaScript en el HTML que devuelve el arranque de un Human Service (`executeServiceByName` → `fauxRedirect.lsw`), sobre un componente que la propia IBM marca como "Heritage… (deprecated)" — sin contrato JSON versionado, por lo que consumirlo exige _screen-scraping_ de ese HTML. Agrega por **tarea**, no por instancia de proceso (de ahí que el enunciado de AC-001 pasara de "instancias" a "tareas" vencidas/en riesgo/a tiempo — es lo único que este mecanismo, o cualquier otro investigado, puede entregar), y mezcla equipos de todos los Process Apps instalados en el servidor: la implementación deberá filtrar por `processAppId`/`processAppName` para descartar equipos ajenos al negocio (p. ej. la muestra "Hiring Sample" de IBM). [RS-001 (US-006)](research/RS-001-spike-api-13-modo-administrador/README.md) ejecutó el spike pendiente sobre `API-13` (`PUT /rest/bpm/wle/v1/tasks`) como vía alterna más robusta y lo **descartó**: su catálogo completo de `interaction` quedó confirmado (`claimed`, `available`, `claimed_and_available`, `completed`, `all`) y ninguno rompe el scoping al usuario que consulta, y su filtro `teams` resultó funcionalmente inerte. **El usuario decidió (2026-09-16)** aceptar el mecanismo de RS-005 pese a su fragilidad y deuda técnica conocidas — es la única vía confirmada para "todos los grupos disponibles". Riesgos que la `TK-XXX` de implementación debe tratar explícitamente: (1) el HTML no tiene contrato versionado y puede romperse con cualquier actualización de BAW — cubrir con una prueba de contrato/fixture, no solo pruebas de UI; (2) no se verificó si invocar `executeServiceByName` desde un backend (sin sesión de navegador) crea efectos secundarios (tareas o instancias de proceso reales) — confirmarlo antes de integrarlo en producción; (3) estabilidad del mecanismo entre el ambiente de pruebas y producción, sin verificar (mismo tipo de incógnita que el spike aún pendiente de [US-005](../US-005-rendimiento-proceso/README.md)).
- Esta laguna se resolvió a nivel de historia, no en el SRS-001 (que permanece en `Ready`).

---

## Validación

### Complejidad sugerida

- **Story points:** 13
- **Justificación:** el mecanismo decidido (RS-005) no es un endpoint REST sino _screen-scraping_ de un Human Service _deprecated_ — requiere un backend que orqueste login/redirect y parseo de HTML, más filtrado por `processAppId` y una prueba de contrato que detecte roturas ante cambios de BAW. El riesgo de implementación es mayor que el de un consumo REST estándar, aunque el descubrimiento ya está cerrado.

### INVEST

| Letra | Criterio      | Resultado | Notas                                                                                                                                                                                                                                                                     |
| ----- | ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I** | Independiente | Cumple    | La decisión de mecanismo ya está tomada (2026-09-16, RS-005/RS-001); no depende de ninguna otra decisión pendiente.                                                                                                                                                       |
| **N** | Negociable    | Cumple    | El alcance ("todos los grupos" vs. "grupos visibles") es negociable.                                                                                                                                                                                                      |
| **V** | Valiosa       | Cumple    | Ayuda a identificar carga por equipo, aunque el alcance final pueda reducirse.                                                                                                                                                                                            |
| **E** | Estimable     | Parcial   | El mecanismo y su contrato de datos están confirmados (RS-005), pero al ser HTML no versionado sobre un componente deprecado, la estimación debe incluir margen para el riesgo de implementación (parseo, filtrado por Process App, verificación de efectos secundarios). |
| **S** | Pequeña       | Parcial   | El descubrimiento ya cerró (RS-005/RS-001); queda solo implementación, pero de mayor complejidad de lo habitual por el backend de _scraping_ requerido.                                                                                                                   |
| **T** | Testeable     | Cumple    | Verificable contra el mecanismo confirmado en RS-005 (fixture del HTML de referencia + prueba de contrato).                                                                                                                                                               |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado | Notas                                                                                                                                                                                                                           |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependencias listas                | Cumple | [US-001: Autenticación y acceso al portal](../US-001-autenticacion-acceso-portal/README.md).                                                                                                                                    |
| Inputs/outputs claros              | Cumple | Contrato de datos confirmado en RS-005 (estructura `{teamId, name, processAppId, processAppName, countOverdue, countAtRisk, countOnTrack}`).                                                                                    |
| Repositorios definidos             | Cumple | `frontend`.                                                                                                                                                                                                                     |
| Sin decisiones técnicas pendientes | Cumple | Mecanismo decidido 2026-09-16 — ver Observaciones.                                                                                                                                                                              |
| Referencias de UI                  | Cumple | Wireframe de Rendimiento del equipo aprobado.                                                                                                                                                                                   |
| Sin aclaraciones pendientes        | Cumple | Los riesgos residuales (contrato no versionado, efectos secundarios de invocar el Human Service, estabilidad entre ambientes) quedan anotados en Observaciones para que la `TK-XXX` de implementación los trate explícitamente. |
