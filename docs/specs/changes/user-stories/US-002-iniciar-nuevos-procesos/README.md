# US-002: Iniciar nuevos procesos

<!-- us:status=Ready -->

**Estado:** Ready
**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-15
**Repositorios:** frontend
**INVEST:** 🟢 6 / 6
**DoR:** 🟢 6 / 6
**Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)

## Descripción

**COMO** usuario interno autenticado
**QUIERO** ver los procesos que puedo iniciar y arrancar una nueva instancia
**PARA** comenzar un trámite sin depender del Process Portal actual

## Criterios de aceptación

- **AC-001 (Interacción de usuario):** El sistema DEBE mostrar un listado de los procesos disponibles para que el usuario inicie una nueva instancia, obtenido mediante `GET /rest/bpm/wle/v1/exposed/process` (familia WLE de la API de BAW).
- **AC-002 (Casos de uso):** Al seleccionar un proceso del listado, el sistema DEBE iniciar una nueva instancia mediante `POST /rest/bpm/wle/v1/process?action=start`, usando el `bpdId` y el `processAppId` del proceso elegido (valores que ya trae cada elemento del listado de AC-001, en su campo `startURL`).
- **AC-003 (Fiabilidad):** El sistema NO DEBE reintentar automáticamente el inicio de una instancia tras un error de red o timeout, dado que la operación no es idempotente; DEBE informar el error al usuario y permitir que decida reintentar manualmente.
- **AC-004 (Interacción de usuario):** Si el listado de procesos iniciables está vacío o su carga falla, el sistema DEBE mostrar un estado vacío o de error explícito — distinto entre sí — en vez de dejar la vista en blanco o indefinida.

## Referencias

- **Requerimiento:** [SRS-001: Portal de administración de procesos IBM BAW](../../../specs/requirements/SRS-001-portal-procesos-baw/README.md)
- **Diseño / prototipo:** [Wireframe de Iniciar](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/iniciar.md)
- **Investigación:** [RS-002 — Procesos iniciables vía WLE](../../research/RS-002-procesos-iniciables-wle/README.md)
- **Documentación técnica:** [Proceso iniciable](../../../specs/technical-docs/portal-procesos-baw.md#md-02) · [Listar procesos iniciables](../../../specs/technical-docs/portal-procesos-baw.md#api-03) · [Iniciar una instancia de proceso (WLE)](../../../specs/technical-docs/portal-procesos-baw.md#api-14) · [Iniciar una instancia de proceso (flujo)](../../../specs/technical-docs/portal-procesos-baw.md#fl-04)

## Observaciones

- ~~**Decisión pendiente (bloqueante):** origen del catálogo de procesos iniciables sin resolver.~~ **Resuelta el 2026-09-15.** [RS-002](../../research/RS-002-procesos-iniciables-wle/README.md) confirmó en vivo — con lecturas y una llamada de escritura real autorizada explícitamente por el usuario — que `GET /rest/bpm/wle/v1/exposed/process` (catálogo) y `POST /rest/bpm/wle/v1/process?action=start` (arranque) son el contrato real de la familia WLE. AC-001 y AC-002 ya reflejan ese contrato confirmado; el documento técnico (MD-02, API-03, API-14) quedó actualizado en consecuencia.
- Esta laguna se resolvió a nivel de historia, no en el SRS-001 (que permanece en `Ready` con FR-001 condicionado a "según lo que la API de BAW exponga") — sigue aplicando sin cambios en el SRS.
- **Nota no bloqueante:** RS-002 no validó con un segundo usuario si el catálogo respeta estrictamente la autorización "Expose to start" por equipo (evidencia indirecta a favor: el nombre del recurso y el parámetro `forUser`, que valida usuarios reales del directorio, pero sin prueba diferencial). Si aparece evidencia en contrario durante la implementación o pruebas manuales, revisar este punto.

---

## Validación

### Complejidad sugerida

- **Story points:** 5
- **Justificación:** el contrato de listado y arranque ya está confirmado en vivo (RS-002), sin incertidumbre técnica residual sobre el origen de datos. El alcance restante es acotado: un repository/servicio nuevo que consuma ambos endpoints WLE, el listado en la pantalla «Iniciar» según el wireframe aprobado, la acción de arranque y sus estados vacío/error.

### INVEST

| Letra | Criterio      | Resultado | Notas                                                                                                                                                                  |
| ----- | ------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I** | Independiente | Cumple    | El origen del catálogo y el mecanismo de arranque ya están confirmados (RS-002); solo depende de [US-001](../US-001-autenticacion-acceso-portal/README.md), ya creada. |
| **N** | Negociable    | Cumple    | El detalle visual del listado es negociable.                                                                                                                           |
| **V** | Valiosa       | Cumple    | Es el punto de entrada para iniciar trámites.                                                                                                                          |
| **E** | Estimable     | Cumple    | Contrato de listado y arranque confirmados en vivo (RS-002); se puede estimar con certeza.                                                                             |
| **S** | Pequeña       | Cumple    | Alcance acotado: un repository/servicio, el listado y la acción de arranque.                                                                                           |
| **T** | Testeable     | Cumple    | Los cuatro `AC-XXX` son verificables contra el contrato ya confirmado.                                                                                                 |

### Definition of Ready (DoR)

| Criterio DoR                       | Estado | Notas                                                                                                                            |
| ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Dependencias listas                | Cumple | Depende de [US-001: Autenticación y acceso al portal](../US-001-autenticacion-acceso-portal/README.md), ya creada.               |
| Inputs/outputs claros              | Cumple | Origen del catálogo (`GET .../exposed/process`) y mecanismo de arranque (`POST .../process?action=start`) confirmados en RS-002. |
| Repositorios definidos             | Cumple | `frontend`.                                                                                                                      |
| Sin decisiones técnicas pendientes | Cumple | Resuelto por RS-002; ver Observaciones para la nota no bloqueante residual.                                                      |
| Referencias de UI                  | Cumple | Wireframe de Iniciar aprobado.                                                                                                   |
| Sin aclaraciones pendientes        | Cumple | Ver Observaciones.                                                                                                               |
