# RS-003 — Diagrama de proceso vía la API visual de WLE (`/rest/bpm/wle/v1/visual/processModel/instances`)

**Estado:** Ready
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202
**Fecha:** 2026-09-15

## Pregunta de investigación

¿Cómo obtiene IBM Process Portal el diagrama de proceso (opción "Ver diagrama de proceso") del servicio WLE — qué endpoint, formato de respuesta y datos de estado de tareas trae — y es ese contrato consumible desde nuestra app para reemplazar el mock actual del modal "Ver flujo" (TK-005/TK-006, bloqueado en US-005 AC-002 por falta de confirmación de API-12)?

## Contexto

La documentación técnica de la capability (`portal-procesos-baw.md`) deja registrado que ninguna operación de la familia `/bpm/` devuelve el diagrama de un proceso (API-12: "No existe" en esa familia) y que la familia clásica WLE (`/rest/bpm/wle/v1/`) queda **sin validar** para diagrama ("Todo lo que el SRS pide y no está en esa lista no existe en esta familia de API... varias de ellas quedan reabiertas por la familia WLE... sin validar aún"). Esa laguna bloquea explícitamente AC-002 de [US-005 (Rendimiento del proceso)](../../user-stories/US-005-rendimiento-proceso/README.md) ("Fuente y formato del diagrama pendientes de decisión") y es la razón por la que [TK-005](../../user-stories/US-003-mis-tareas-listado-sla/TK-005-modal-ver-flujo-mermaid-mock.md)/[TK-006](../../user-stories/US-003-mis-tareas-listado-sla/TK-006-modal-ver-flujo-bpmn-js-mock.md) implementaron el modal "Ver flujo" como un mock exploratorio desacoplado de cualquier llamada HTTP real ("La integración con la fuente real del diagrama sigue viviendo en US-005 AC-002, bloqueada por falta de confirmación de API-12").

El usuario pidió verificar en vivo, contra la instancia de IBM Process Portal en `https://192.168.120.100:9443/ProcessPortal/`, cómo esa aplicación (que sí tiene la opción "Ver diagrama de proceso" funcionando) llama al servicio WLE para pintar el diagrama, y si ese contrato es consumible desde nuestra app.

## Hallazgos

### Dónde vive la opción en Process Portal y qué dispara

"Ver diagrama de proceso" **no está en las acciones de la instancia** (`Solicitar Credito:274` → Acciones solo ofrece "Abrir en una ventana nueva" / "Cerrar"), sino en el **menú de acciones de una tarea abierta**: al entrar a una tarea (`launchTaskCompletion?taskId=478`, tarea "Aprobar Credito") y abrir su menú "Acciones", aparecen `Volver a asignar al equipo`, `Ver instancia` y **`Ver diagrama de proceso`**. Al pulsarlo, Process Portal navega a:

```
GET https://192.168.120.100:9443/ProcessPortal/launchProcessDiagram?instanceId=274
```

(`274` es el `piid` de la instancia de proceso — el mismo identificador que ya usan `ProcessRepository`/`UserTaskRepository` en el frontend).

### Dos llamadas REST WLE distintas se disparan al abrir el diagrama

**1. `GET /rest/bpm/wle/v1/process/{piid}?parts=diagram|header`**
Devuelve el proceso con un bloque `diagram` embebido: `diagram.step[]` (un elemento por actividad/evento, con `type`, `lane`, `x`, `y`, `lines[]` — solo `to` + `name`, **sin puntos de trazado**) y `diagram.lanes[]` (solo `name`/`height`, sin geometría de caja). Es un formato reducido: alcanza para saber qué nodos y conexiones existen, pero no trae ni las cajas de swimlane completas ni el trazado de las líneas.

**2. `GET /rest/bpm/wle/v1/visual/processModel/instances?instanceIds=[{piid}]&showCurrentActivites=true&showExecutionPath=true&showNote=true&showColor=true`**
Este es el endpoint que efectivamente alimenta el render — su forma coincide exactamente con lo que se ve en pantalla (swimlanes con caja, líneas con codos, nodo activo resaltado). Devuelve:

- `items[]`: un elemento por nodo (`type: "activity" | "start" | "end" | "swimlane"`) con `id`, `label`, `x`, `y`, `lane`; las swimlanes traen además `width`, `height`, `color` y `children` (referencias `{"_reference": id}` a los nodos que contiene).
- `links[]`: un elemento por conexión, con `start`/`end` (ids de nodo), `startPosition`/`endPosition`, y `gfx` — un JSON serializado con `intermediatePoints` (los codos del trazado ortogonal) e `inCriticalPath`.
- `tasks{}` / `activeTasks{}`: indexados por `flowObjectID`, con el **detalle completo de cada instancia de tarea** en ese nodo — `state` (`STATE_FINISHED`, `STATE_CLAIMED`, …), `isAtRisk`, `dueTime`, `atRiskTime`, `assignedTo`/`assignedToDisplayName`, `priority`, `tkiid` — el mismo vocabulario (`dueTime`/`atRiskTime`/`isAtRisk`) que hoy ya consume `deriveSlaStatus`/`deriveWleSlaStatus` en `task-mapper.ts` para calcular la severidad de una tarea.
- `tokens{}`: indexado por `flowObjectID`, marca en qué nodo(s) está el token de ejecución activo.

Verificado visualmente (captura de pantalla tomada tras la llamada): el diagrama muestra las tres lanes ("Ejecutivos Comerciales", "Analistas", "System"), el nodo completado "Solicitar Credito" con el avatar del responsable, el nodo activo "Aprobar Credito" resaltado con borde naranja y un marcador de token (`#1`), y las conexiones dibujadas con codos ortogonales — coincide con los campos de `items`/`links`/`tokens` descritos arriba.

El widget cliente que renderiza esto (visible en las peticiones de assets) es `com/ibm/bpm/wpd/document/bpd/view/templates/BPDViewer.html`, parte de `webviewer.zip` — un visor propietario de IBM, no reutilizable fuera de Process Portal.

### El payload no es BPMN 2.0 ni una imagen — es un modelo propietario de nodos/enlaces

Ninguna de las dos respuestas es una imagen (SVG/PNG) embebible ni un XML BPMN 2.0 con `bpmndi` importable directamente por `bpmn-js` (que ya usa TK-006 para el mock). Es un modelo propio de IBM: nodos con coordenadas absolutas (`x`, `y`, `width`, `height`) agrupados en swimlanes, y enlaces con `intermediatePoints`. Para "dibujar el flujo" con este contrato hay dos caminos, no uno:

- **(a) Traducir este JSON a BPMN 2.0 XML** (generar `bpmndi:BPMNShape`/`BPMNEdge` a partir de `items`/`links`) para seguir usando `bpmn-js` tal como lo dejó TK-006 — evita cambiar de librería, pero exige escribir y mantener ese traductor.
- **(b) Reemplazar `bpmn-js` por un render propio** (SVG a mano o una librería de diagramas genérica) que dibuje directamente `items`/`links`/`lanes` — evita el traductor, pero descarta el trabajo de TK-006 (visor BPMN de solo lectura, licencia bpmn.io) y exige reconstruir el resaltado, el auto-fit y el zoom que `bpmn-js` ya resuelve.

Ninguna opción es gratuita; el esfuerzo relativo entre ambas no se puede estimar sin un spike, porque depende de cuántos tipos de nodo/gateway reales aparecen en los procesos de negocio (el proceso de prueba usado aquí solo tiene tareas de usuario y eventos de inicio/fin, sin gateways).

Los colores de severidad (verde/ámbar/rojo del mock actual) **no vienen en el payload** — solo el color de fondo de cada swimlane (`#F8F8F8` en ambos casos observados). El resaltado naranja del nodo activo lo calcula el widget de IBM en cliente; nuestra app tendría que replicar esa lógica igual que ya hace hoy en el mock, pero con datos reales: el payload sí trae, por nodo activo, los mismos campos (`dueTime`, `atRiskTime`, `isAtRisk`) que ya alimentan `deriveSlaStatus`/`deriveWleSlaStatus`.

### Autenticación y accesibilidad desde el frontend actual

La llamada a `visual/processModel/instances` viaja autenticada por **cookies de sesión** (`JSESSIONID`, `LtpaToken2`) y protegida por `XSRF-TOKEN` — el mismo mecanismo que ya usan los endpoints WLE confirmados (API-03, API-13, API-14) y que ya cubre `wleAuthInterceptor` (`frontend/src/app/core/interceptors/wle-auth-interceptor.ts`): añade `x-xsrf-token` a toda petición bajo `rest/bpm/wle/v1/` leyendo la cookie `XSRF-TOKEN`, exactamente el header observado en la captura. No se requirió rol de administrador ni un token distinto al que ya usa el resto de la app — solo que el usuario autenticado tenga visibilidad sobre la instancia (aquí, ser el asignado de la tarea activa).

`frontend/proxy.conf.js` **ya expone `/rest`** hacia `https://192.168.120.100:9443` (no solo `/bpm`) — es decir, `api/CR-002` de ADR-015, que el documento técnico registraba como pendiente ("Requiere extender el proxy a `/rest`"), **ya está aplicado** en el repo actual. Esto corrige esa nota: no hace falta tocar el proxy para consumir este endpoint en desarrollo.

Un nuevo método seguiría el mismo patrón que `ProcessRepository.findStartable()` (`frontend/src/app/features/baw-processes/services/process-repository.ts`, ADR-010): URL compuesta con `getApiUrl('rest/bpm/wle/v1/visual/processModel/instances')`, respuesta traducida por un mapper dedicado (ADR-012) a un modelo de dominio (nodos/enlaces/lanes) en vez de exponer la forma cruda de BAW a los componentes.

## Conclusión y recomendación

**Sí, es viable consumir el diagrama real desde WLE**, y el endpoint a usar es `GET /rest/bpm/wle/v1/visual/processModel/instances?instanceIds=[{piid}]&showCurrentActivites=true&showExecutionPath=true&showNote=true&showColor=true` — no `process/{piid}?parts=diagram|header`, que es más liviano pero le faltan las cajas de swimlane y el trazado de los enlaces necesarios para dibujar el diagrama completo. La autenticación, el proxy y el patrón Repository/Mapper para consumirlo ya existen en el repo sin cambios adicionales.

Lo que sigue sin resolver — y por lo que esta investigación **no cierra** AC-002 de US-005 por sí sola — es el formato de entrega: el payload es un modelo propietario de IBM, no BPMN 2.0 ni una imagen, así que hace falta decidir entre traducirlo a BPMN 2.0 (conservar `bpmn-js`, TK-006) o dibujarlo con un render propio (soltar `bpmn-js`). Esa decisión, junto con el mapeo de severidad por nodo activo (reutilizando `deriveSlaStatus`/`deriveWleSlaStatus`) y el reemplazo del mock de `task-flow-diagram.mock.ts`, es planificación concreta — corresponde a `work-plan` sobre US-005, no a este RS.

**Próximo paso recomendado:** `work-plan` sobre [US-005](../../user-stories/US-005-rendimiento-proceso/README.md) para descomponer AC-002 en TK, usando este hallazgo para decidir entre las opciones (a)/(b) de traducción — probablemente con un spike corto si el proceso real usa gateways u otros tipos de nodo no vistos en esta prueba.

## Impacto en el artefacto / próximo paso

N/A — investigación independiente. (Referenciada como evidencia para desbloquear AC-002 de US-005, que la actualiza su propio skill dueño — `work-define`/`work-plan` — no este RS.)

## Fuentes

- Inspección en vivo de `https://192.168.120.100:9443/ProcessPortal/` (usuario `juancarlos.altamirano`), 2026-09-15: navegación Acciones de tarea → "Ver diagrama de proceso" → `launchProcessDiagram?instanceId=274`, con captura de red (DevTools) de las peticiones `GET /rest/bpm/wle/v1/process/274?parts=diagram|header` y `GET /rest/bpm/wle/v1/visual/processModel/instances?instanceIds=[274]&showCurrentActivites=true&showExecutionPath=true&showNote=true&showColor=true`, y captura de pantalla del diagrama renderizado.
- [`docs/specs/technical-docs/portal-procesos-baw.md`](../../../specs/technical-docs/portal-procesos-baw.md) — API-12, MD-10, y la nota de superficie WLE "sin validar" para diagrama.
- [`docs/specs/user-stories/US-005-rendimiento-proceso/README.md`](../../user-stories/US-005-rendimiento-proceso/README.md) — AC-002 y su decisión pendiente bloqueante.
- [`docs/specs/user-stories/US-003-mis-tareas-listado-sla/TK-006-modal-ver-flujo-bpmn-js-mock.md`](../../user-stories/US-003-mis-tareas-listado-sla/TK-006-modal-ver-flujo-bpmn-js-mock.md) — mock actual del modal "Ver flujo" con `bpmn-js`.
- `frontend/proxy.conf.js`, `frontend/src/app/core/interceptors/wle-auth-interceptor.ts`, `frontend/src/app/features/baw-processes/services/process-repository.ts` — mecanismo de proxy, autenticación y patrón Repository ya vigentes en el repo.
