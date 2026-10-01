# RS-005 — Rendimiento del equipo: panel nativo Team Performance (WLE) y su relación con el spike de Rendimiento del proceso

**Estado:** Ready
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202
**Fecha:** 2026-09-16

## Pregunta de investigación

¿El panel nativo "Rendimiento del equipo" de IBM Process Portal (`dashboards/TWP/Team+Performance`) expone, vía la API de BPM/WLE, métricas por equipo/grupo que resuelvan la decisión pendiente de AC-001 de US-006, y aporta evidencia para cerrar las dos incógnitas del spike pendiente de AC-001 de US-005 (apuntar el panel a un proceso propio, estabilidad del `serviceId`)?

## Contexto

**US-006 (Rendimiento del equipo)**, AC-001, tiene una decisión pendiente bloqueante: la familia `/rest/bpm/wle/v1/` ya validada (API-11) confirma que no existe ningún endpoint de equipos ni de métricas por equipo — el nombre del equipo solo es visible dentro de una tarea individual (`optional_parts=team_details`), así que la única agregación posible documentada hasta ahora es **por tarea, no por instancia de proceso**, y **limitada a los equipos que aparecen en las tareas visibles para el usuario**, nunca "todos los grupos" como exige el alcance de AC-001. Las opciones que dejó abiertas la US eran: (a) investigar la familia clásica de BAW, (b) redefinir el alcance a "equipos con tareas visibles", o (c) diferir la historia.

**US-005 (Rendimiento del proceso)**, AC-001, tiene un spike técnico pendiente (ver [RS-004](../RS-004-metricas-rendimiento-proceso-wle/README.md)): el panel nativo "Rendimiento del proceso" (`dashboards/TWP/Process+Performance`) sí calcula métricas de proceso vía Ajax Services de WLE (`POST /rest/bpm/wle/v1/service/{serviceId}`), pero quedaron dos incógnitas sin resolver: (1) cómo apuntar ese panel a un proceso de negocio propio (no un proceso de muestra de IBM), y (2) si los `serviceId` de esos Ajax Services son estables entre ambientes.

El usuario pidió inspeccionar en vivo, con el mismo enfoque de RS-003/RS-004, el panel hermano "Rendimiento del equipo" (`dashboards/TWP/Team+Performance`) para ver si resuelve la laguna de US-006 y, de paso, si aporta algo a las incógnitas del spike de US-005.

## Hallazgos

### El panel sí expone conteos por equipo, para todos los equipos del sistema — no solo los visibles al usuario

Inspección en vivo de `https://192.168.120.100:9443/ProcessPortal/dashboards/TWP/Team+Performance` (usuario `juancarlos.altamirano`): el panel "Rendimiento del equipo" muestra una tarjeta por equipo con el desglose exacto que pide AC-001 de US-006 — **vencido / en riesgo / a tiempo** — para **7 equipos**, mezclando equipos de IBM (`All Users`, `GeneralManagers`, `HiringManagers`, `Human Resources` — del Process App de muestra "Hiring Sample") con equipos propios del negocio (`Fábrica`, `Oficiales Crédito`, `Operaciones` — del Process App **"BAYBANK - DEMO PROCESOS"**, nuestro proceso). Esto **sí resuelve la exigencia de "todos los grupos disponibles"** de AC-001: es una vista a nivel de sistema, no acotada a los equipos del usuario que la consulta.

Estructura de cada elemento (ver "Mecanismo" abajo para su origen):

```
{
  teamId: "24.5f76446c-c6b7-4639-b1a7-58dc47ffbcb5",
  name: "Oficiales Crédito",
  description: "",
  processAppId: "2066.6d848843-bc7e-400b-81e0-ad3c46dcfd0d",
  processAppName: "BAYBANK - DEMO PROCESOS",
  countOverdue: 7,
  countAtRisk: 0,
  countOnTrack: 0,
  totalOpenTasks: 7,
  tasksCompletedToday: 1
}
```

### El mecanismo es distinto — y más frágil — que el de RS-003/RS-004

A diferencia de `visual/processModel/instances` (RS-003, endpoint REST nombrado) y de los Ajax Services por GUID invocados vía `POST /rest/bpm/wle/v1/service/{serviceId}` (RS-004, al menos una llamada discreta interceptable), **no se encontró ninguna petición XHR/fetch discreta que transporte los datos de equipos**. Se inspeccionaron las 31 peticiones `xhr`/`fetch` disparadas al cargar el panel — solo una llama a `POST /rest/bpm/wle/v1/service/1.a02a1d7b-...`, y su respuesta son mensajes de localización de controles (etiquetas de gráfico Gantt), no datos de equipos.

Los datos reales aparecen **incrustados como literal JavaScript dentro del HTML** que devuelve `GET /teamworks/fauxRedirect.lsw?zComponentId=...&zTaskId=p1&...` — la página de arranque del Coach (`this.local = {data:{...items:[{teamId:...}]...}}`), servida tras seguir la cadena:

```
GET /teamworks/executeServiceByName?processApp=TWP&serviceName=Team+Performance&branchId=...
  → 303 → GET /teamworks/fauxRedirect.lsw?zComponentId=...&zWorkflowState=2&zTaskId=p1&...
  → 200, HTML con los datos ya calculados en el servidor e incrustados en un <script>
```

Es decir: el cálculo ocurre **server-side, en la ejecución de un Human Service** ("Team Performance", del Process App TWP), no en un endpoint de datos separado y reutilizable. El propio HTML de respuesta se identifica en su meta-tag `generator` como:

> `'coachDetails':{'project':'Heritage Process Portal (deprecated) (TWP)','humanService':'Team Performance','coach':'Team Overview Page'}` — sobre **IBM Business Process Manager V8.6.11.26000**.

IBM marca explícitamente este componente como **"Heritage… (deprecated)"** en sus propios metadatos.

**Consecuencia práctica:** para que nuestro backend consuma esto, tendría que (a) invocar `executeServiceByName` autenticado, (b) seguir la redirección 303 a un `fauxRedirect.lsw` con un `zTaskId` de sesión, y (c) hacer _screen-scraping_ del HTML resultante con una expresión regular/parser para extraer el literal `this.local = {...}` — no hay contrato JSON documentado ni versionado; el nombre de la variable, su forma y su posición en el bundle minificado pueden cambiar con cualquier actualización de BAW. Es un mecanismo bastante más frágil que los de RS-003/RS-004.

### Granularidad: por tarea, no por instancia de proceso

`countOverdue` / `countAtRisk` / `countOnTrack` sigue siendo, igual que documenta API-11, un conteo de **tareas abiertas** del equipo (`totalOpenTasks` lo confirma: en "Oficiales Crédito", `countOverdue=7` y `totalOpenTasks=7` — las 7 tareas abiertas del equipo están vencidas). AC-001 de US-006 pide "instancias vencidas, en riesgo y a tiempo" — la misma tensión tarea-vs-instancia que ya documentaba API-11 sigue presente; lo único que cambia es el alcance (ahora es "todos los equipos del sistema", no "equipos con tareas visibles para mí").

### Los datos mezclan equipos de todos los Process Apps instalados

El panel no está acotado a nuestro Process App: junto a los 3 equipos de "BAYBANK - DEMO PROCESOS" aparecen 4 equipos de la muestra de IBM "Hiring Sample" y del sistema. Cualquier consumo debería filtrar en cliente o servidor por `processAppId` para descartar equipos ajenos al negocio — el contrato no lo hace por nosotros.

### Relación con el spike de US-005: evidencia parcial, no lo cierra

Esta investigación confirma que el ambiente sí tiene datos de "BAYBANK - DEMO PROCESOS" alcanzables desde un panel nativo de Process Portal (algo que RS-004 no pudo verificar para "Rendimiento del proceso"). Pero **no resuelve ninguna de las dos incógnitas concretas del spike de US-005**: Team Performance es un mecanismo distinto (Human Service + HTML incrustado, no Ajax Service por GUID) del que investigó RS-004 para Process Performance, y no se intentó apuntar este panel a un proceso específico — su unidad de agregación es el equipo, no el proceso. El spike de AC-001 de US-005 sigue teniendo que resolverse contra el propio panel "Rendimiento del proceso".

## Decisiones pendientes / opciones evaluadas

- **Fuente de datos para AC-001 de US-006** — opciones:
  - **(a) Screen-scraping del Human Service "Team Performance"** (el mecanismo aquí descubierto): resuelve "todos los grupos", pero es frágil (HTML no contractual, componente marcado _deprecated_ por IBM, requiere simular la máquina de estados de un Coach: `executeServiceByName` → seguir 303 → parsear HTML), y sigue siendo agregación por tarea, no por instancia.
  - **(b) Verificar si el endpoint ya confirmado `PUT /rest/bpm/wle/v1/tasks` (API-13) admite una búsqueda a nivel de administrador que devuelva tareas de _todos_ los equipos, no solo las asignadas al usuario que consulta** — no verificado en esta investigación. Si el bloqueo de acceso de administrador ya resuelto para US-004 (2026-09-16) se extiende a este endpoint, agregar en cliente sobre esa búsqueda evitaría depender de un componente _deprecated_ y reusaría un endpoint REST ya contractual.
  - **(c) Diferir la historia.**
  - **Recomendación:** **(b) antes que (a)** — un spike acotado (una tarde) para confirmar si `API-13` puede consultarse en modo "todas las tareas del sistema" (no solo las mías) evitaría comprometerse con un mecanismo de scraping sobre un componente que IBM ya declara deprecado. Si `API-13` resulta igual de limitado a tareas del usuario/equipo propio incluso en modo administrador, **(a)** queda como respaldo — ya confirmado que técnicamente funciona y sí cubre "todos los grupos" — asumiendo el costo de fragilidad y el desajuste tarea/instancia.

## Conclusión y recomendación

**Sí existe un mecanismo real que expone conteos de SLA por equipo para todos los grupos del sistema** — el panel nativo "Rendimiento del equipo" (Human Service `Team Performance` del Process App `TWP`) —, lo que **cambia el marco de la decisión bloqueante de AC-001 de US-006**: la premisa de que "no existe ninguna vía para ver todos los grupos" ya no es cierta. Pero, a diferencia de lo encontrado en RS-003/RS-004, este mecanismo **no es una llamada REST/Ajax discreta y contractual**, sino HTML server-renderizado de un componente que la propia IBM marca como _Heritage… (deprecated)_, y mantiene la misma limitación de granularidad por tarea (no por instancia) que ya documentaba API-11.

**No cierra la decisión.** Antes de comprometerse con esta vía, recomiendo el spike acotado descrito arriba (opción b) sobre `API-13` en modo administrador; si no resulta viable, esta investigación deja confirmado que la opción (a) es un respaldo funcional, con sus trade-offs explícitos.

**Para US-005:** esta investigación **no aporta evidencia que cierre el spike pendiente de AC-001** — es un mecanismo distinto al de "Rendimiento del proceso". El spike de US-005 sigue teniendo que ejecutarse contra ese panel específico, tal como lo dejó planteado RS-004.

## Impacto en el artefacto / próximo paso

N/A — investigación independiente. (Referenciada como evidencia para AC-001 de US-006 — cambia el marco de su decisión pendiente sin cerrarla; la actualización de la US la hace `work-define`, no este RS. No aporta cambios a la decisión pendiente de AC-001 de US-005: se referencia solo como contexto negativo — la vía investigada no resuelve su spike.)

## Fuentes

- Inspección en vivo de `https://192.168.120.100:9443/ProcessPortal/` (usuario `juancarlos.altamirano`), 2026-09-16: navegación a `dashboards/TWP/Team+Performance`, captura de red (`GET /teamworks/executeServiceByName?processApp=TWP&serviceName=Team+Performance...` → 303 → `GET /teamworks/fauxRedirect.lsw?...zTaskId=p1...`), inspección del HTML de respuesta (literal `this.local.data.items` con 7 equipos) y captura de pantalla del panel renderizado.
- [`docs/specs/technical-docs/portal-procesos-baw.md`](../../../specs/technical-docs/portal-procesos-baw.md) — MD-09, API-11 (métricas de equipo confirmadas ausentes en la familia `/bpm/`), API-13 (`PUT /rest/bpm/wle/v1/tasks`, ya confirmado).
- [`docs/specs/user-stories/US-006-rendimiento-equipo/README.md`](../../user-stories/US-006-rendimiento-equipo/README.md) — AC-001 y su decisión pendiente.
- [`docs/specs/user-stories/US-005-rendimiento-proceso/README.md`](../../user-stories/US-005-rendimiento-proceso/README.md) — AC-001 y su spike pendiente.
- [RS-004: Métricas de rendimiento por proceso](../RS-004-metricas-rendimiento-proceso-wle/README.md) — mismo enfoque de inspección en vivo, aplicado al panel hermano "Rendimiento del proceso".
