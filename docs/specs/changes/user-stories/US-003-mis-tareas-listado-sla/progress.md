# Progreso

## US-003: Mis tareas — listado y SLA

<!-- work:id=US-003 · status=Done -->

**Estado:** Done
**Tipo:** historia de usuario
**Fecha de creación:** 2026-09-11 17:40
**Ultima actualizacion:** 2026-09-15 00:36

## Unidades

### TK-001: Modelo, mapper y repositorio de tareas del usuario

<!-- unit:id=TK-001 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-11 17:40
**Finalizado:** 2026-09-11 17:50
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- frontend/src/app/features/baw-processes/models/user-task.ts
- frontend/src/app/features/baw-processes/utils/task-mapper.ts
- frontend/src/app/features/baw-processes/utils/task-mapper.spec.ts
- frontend/src/app/features/baw-processes/services/user-task-repository.ts
- frontend/src/app/features/baw-processes/services/user-task-repository.spec.ts
  `

**Notas:**

- Formato real de fecha de BAW no confirmado en vivo (sin acceso al ambiente de referencia): `parseBawDate` es tolerante — dígitos puros se tratan como epoch en milisegundos, cualquier otra cadena delega en `new Date(string)` (ISO-8601 nativo). Misma laguna ya señalada en portal-procesos-baw.md, Observaciones punto 1; pendiente confirmar contra el ambiente real.
- `isClaimedByCurrentUser` y `now` son parámetros explícitos del mapper (no reloj/sesión interna), para mantenerlo puro (ADR-012); el repositorio resuelve ambos antes de invocarlo.
- Serialización de `states`/`sort` como query params repetidos vía `HttpParams({ fromObject })`: el contrato OpenAPI no declara `collectionFormat`, es un supuesto razonable no confirmado en vivo.
- `UserTaskRepository.findAll` devuelve `Promise<UserTaskPage>` directo (no `getResourceCollection`, cuya forma `{data, total}` no encaja con `{tasks, previous, next}` de API-05); queda disponible para que TK-002 lo envuelva con `getResource()` si necesita signals reactivos.

**Decisiones adicionales:**
[]

**Cobertura de test cases:**

- TC-001, TC-002 y TC-003 cubiertos como unit tests en `task-mapper.spec.ts`, referenciados por nombre en cada `it`.

### TK-002: Listado de «Mis tareas» con estado de SLA y paginación

<!-- unit:id=TK-002 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-11 17:52
**Finalizado:** 2026-09-11 18:00
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- frontend/src/app/features/baw-processes/services/tasks-manager.ts
- frontend/src/app/features/baw-processes/services/tasks-manager.spec.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.html
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts
  `

**Notas:**

- `tasks.css` queda sin cambios (vacío): el listado se resuelve enteramente con clases del sistema de diseño ya existentes (`ft-page`, `ft-table`, `ft-badge`, `ft-center`) más utilidades Tailwind, sin CSS propio nuevo.
- `TasksManager` envuelve `UserTaskRepository.findAll` con `getResource()` (`core/utils/async-resources.ts`), tal como TK-001 dejó previsto. `notifyError: false` en cada `load()` interno: el toast global de `notify()` sería redundante con el `ErrorPlaceholder` propio de la vista.
- Paginación por `offset`/`size` (tamaño de página 25) llevada como estado propio del manager (`offsetState`), porque `UserTaskPage` no expone el offset usado; `hasPrevious`/`hasNext` se derivan de la presencia de los enlaces `previous`/`next` de la respuesta (no se parsean como URLs), suficiente para habilitar/deshabilitar los controles de paginación.
- Indicador de SLA con icono + texto (`check--circle`/`warning`/`close--circle` de `factoricons-slim`, mapeados a clases `ft-badge--success/warning/danger`), no solo color, conforme al mínimo WCAG AA de `AGENTS.md`.
- Orden por vencimiento (`sort: ['due_date:asc']`) fijo, sin control de usuario: no está en el alcance de esta tarea (AC-001/AC-004), solo en el de TK-004 si se decidiera exponerlo.
- `tasks.ts`/`tasks.spec.ts` mockean `TasksManager` directamente (no HTTP/MSW): el objetivo de estas pruebas es la orquestación de estado y la vista, no el contrato HTTP, ya cubierto en `user-task-repository.spec.ts` (TK-001) y en `tasks-manager.spec.ts` (mock de `UserTaskRepository`).

**Decisiones adicionales:**
[]

**Cobertura de test cases:**

- TC-001 (listado con SLA "a tiempo") y TC-004 (listado vacío sin error) cubiertos como unit tests en `tasks.spec.ts`.
- TC-010 (paginación de servidor, una sola llamada por página) cubierto como unit test en `tasks-manager.spec.ts` (verifica `offset`/`size` y que no se encadenan páginas).
- TC-011 (indicador de carga durante una respuesta lenta) cubierto como unit test en `tasks.spec.ts` (estado `loading` visible, sin tabla ni error mientras está pendiente) y en `tasks-manager.spec.ts` (signal `loading` durante una promesa pendiente). No se automatizó como E2E con latencia real de red (variantes de 2.8s/3.0s/6.0s contra BAW): requiere el ambiente de referencia en vivo, fuera del alcance de una prueba unitaria.

### TK-003: Resumen de conteos por estado de SLA

<!-- unit:id=TK-003 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-11 18:03
**Finalizado:** 2026-09-11 18:10
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- frontend/src/app/features/baw-processes/utils/sla-summary.ts
- frontend/src/app/features/baw-processes/utils/sla-summary.spec.ts
- frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.ts
- frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.html
- frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.css
- frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.spec.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.html
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.ts
  `

**Notas:**

- `slaSummary(tasks)` cuenta por `task.slaStatus` en un único recorrido, lo que garantiza `total = onTime + atRisk + overdue` y ningún conteo negativo por construcción.
- `SlaSummary` recibe `tasks` (no el resumen precalculado) como `input()` y deriva con `computed()`: la recarga/paginación de `TasksManager.tasks` recalcula el resumen sin trabajo adicional en `Tasks`.
- Tarjetas con `ft-card` (ya existente, sin uso previo en `features/`) y la misma paleta de severidad que `ft-badge--success/warning/danger` del indicador por fila.
- Nota explícita bajo las tarjetas de que el conteo es de la página cargada, no el total (AC-002/TC-006).
- Inserción en `tasks.html` acotada a 2 líneas antes de la tabla, para minimizar el conflicto de merge con TK-004 (también en curso sobre el mismo archivo).

**Retrabajo de cierre (2026-09-14, delegado desde `quality-check` al cerrar US-003):** una edición ajena ya comiteada en esta rama (`d21859b`) había quitado de `sla-summary.html` el aviso de esta unidad (AC-002/TC-006) y su contenedor `aria-label`. Se restauró el párrafo (ahora envolviendo las tarjetas en un `<div class="flex flex-col gap-2">` en vez del `<div aria-label>` original, para no chocar con la estructura actual) sin tocar la aserción de `sla-summary.spec.ts` que ya lo cubría.

**Decisiones adicionales:**
[]

**Cobertura de test cases:**

- TC-005 y TC-006 cubiertos como unit tests del cálculo (`sla-summary.spec.ts`) y del componente de presentación (`sla-summary.spec.ts` en `components/`); la porción de verificación contra el ambiente de referencia de BAW descrita en sus pasos de integración queda fuera de esta TK.

### TK-004: Filtros de servidor y búsqueda en cliente del listado

<!-- unit:id=TK-004 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-11 18:03
**Finalizado:** 2026-09-11 18:18
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- frontend/src/app/features/baw-processes/components/tasks/tasks-filters/tasks-filters.ts
- frontend/src/app/features/baw-processes/components/tasks/tasks-filters/tasks-filters.html
- frontend/src/app/features/baw-processes/components/tasks/tasks-filters/tasks-filters.css
- frontend/src/app/features/baw-processes/components/tasks/tasks-filters/tasks-filters.spec.ts
  ~ frontend/src/app/features/baw-processes/services/tasks-manager.ts
  ~ frontend/src/app/features/baw-processes/services/tasks-manager.spec.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.html
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts
  `

**Notas:**

- `TasksManager` gana `TaskFilterCriteria` (`states`/`model`/`processId`), `setFilters()` (siempre relanza `load(0)`, nunca conserva offset — IT-02) y `setSearchTerm()` (solo local, sin HTTP). `tasks()` combina el resultado del `resource` con el término de búsqueda (case-insensitive sobre `name`/`processName`/`teamName`), por lo que el resumen de SLA de TK-003 (que ya lee `tasks()`) queda coherente sin cambios adicionales (IT-06).
- Conflicto de merge esperado en `tasks.ts` (ambas TK-003 y TK-004 tocaron el array `imports` del `@Component`): resuelto combinando `SlaSummary` y `TasksFilters` en el mismo array; `tasks.html` mergeó automáticamente sin conflicto (cada TK insertó en un bloque propio). Verificado con la suite del paquete completo tras resolver (98/98 en verde) antes de cerrar el merge.
- `<select matNativeControl>` en vez de `<mat-select>`: compatible con Signal Forms (`[formField]`) y permite tests con DOM nativo, sin depender de `@angular/cdk/testing` (ausente en el repo).

**Decisiones adicionales:**
[]

**Retrabajo de cierre (2026-09-14, delegado desde `quality-check` al cerrar US-003):** una edición ajena ya comiteada en esta rama (`d21859b`) había quitado de `tasks.html` el aviso de esta unidad (IT-04) de que la búsqueda solo cubre la página cargada. Se restauró el párrafo en el mismo lugar (antes del datagrid) sin tocar la aserción de `tasks.spec.ts` que ya lo cubría.

**Cobertura de test cases:**

- TC-007, TC-008 y TC-009 cubiertos como unit tests (`tasks-manager.spec.ts`, `tasks-filters.spec.ts`, `tasks.spec.ts`); los campos exactos que la búsqueda de texto recorre (nombre, instancia, equipo) quedaron documentados en código como supuesto razonable, pendiente de confirmar contra el TC si difiere.

### TK-006: Migrar el diagrama del modal "Ver flujo" de Mermaid a bpmn-js (mock)

<!-- unit:id=TK-006 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-14 12:20
**Finalizado:** 2026-09-14 12:28
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`
~ frontend/package.json
~ frontend/package-lock.json
~ frontend/src/app/features/baw-processes/mocks/task-flow-diagram.mock.ts
~ frontend/src/app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.ts
~ frontend/src/app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.css
~ frontend/src/app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.spec.ts

- frontend/src/css.d.ts
  `

**Notas:**

- Verificación local: lint (`eslint`) y `ng build` limpios sobre los archivos afectados; `task-flow-modal.spec.ts` (5/5) y `tasks.spec.ts` (23/24, ver más abajo) en verde. `npm run arch` no se corrió (es de `quality-check`, no de esta unidad).
- Falla preexistente y ajena a TK-006 en `tasks.spec.ts` ("should indicate that the search only covers the loaded page..." / "página cargada"): ya documentada como falla previa en la nota de cierre de TK-005 — el texto lo quitó otra edición ya integrada en `develop` (US-007), no algo que TK-006 toque o pueda corregir dentro de su alcance.
- No se implementó el criterio de foco de IT-05 con una prueba dedicada (mismo criterio ya aplicado en TK-005): se apoya en el comportamiento estándar de `MatDialog`, no en lógica propia de esta unidad.

**Decisiones adicionales:**

- IT-05 pedía importar además `bpmn-js/dist/assets/bpmn-font/css/bpmn.css` para las formas BPMN. Se omitió: `TaskFlowModal.renderDiagram` solo dibuja `bpmn:task`, `bpmn:startEvent`/`endEvent` sin definición de evento y `bpmn:exclusiveGateway` — todos renderizados por `BpmnRenderer` con primitivas SVG puras (el marcador "X" del gateway es un `pathMap` interno, no un glifo de la fuente); el font CSS solo hace falta para íconos de subtipos (mensaje/temporizador/paleta del `Modeler`) que este mock no usa. Importarlo además rompía el build: sus reglas `@font-face` referencian `.eot`/`.svg`/`.woff` reales, y el loader de `esbuild` que Angular usa para un `import()` de CSS "suelto" (fuera de `styleUrl` de componente) no tiene configurados esos tipos de archivo.
- `diagram-js.css` (sí necesario, estilos base del canvas/conexiones) tampoco pudo ir en `task-flow-modal.css` vía `@import`: sumado a `bpmn.css` superaba el budget `anyComponentStyle` (16 kB) de `angular.json` — no se tocó ese budget global por una sola unidad. En su lugar, se importa dinámicamente como código (`import('bpmn-js/dist/assets/diagram-js.css')`) junto con `bpmn-js` dentro de `renderDiagram()`, generando su propio chunk lazy (`diagram-js-css`) en vez de contar contra el CSS del componente. Requiere un ambient module (`src/css.d.ts`: `declare module '*.css';`) para que `tsc` acepte el import; no hay una declaración previa en el repo para esto.
- Igual que en TK-005, `bpmn-js` se importa dinámicamente dentro de `renderDiagram()` (no en el scope del módulo) para no sumar su peso al chunk lazy `baw-processes-routes`.

### TK-005: Modal "Ver flujo" con diagrama Mermaid (mock)

<!-- unit:id=TK-005 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-14 00:45
**Finalizado:** 2026-09-14 06:21
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`
~ frontend/package.json
~ frontend/package-lock.json

- frontend/src/app/features/baw-processes/mocks/task-flow-diagram.mock.ts
- frontend/src/app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.ts
- frontend/src/app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.html
- frontend/src/app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.css
- frontend/src/app/features/baw-processes/components/tasks/task-flow-modal/task-flow-modal.spec.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.html
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts
  `

**Notas:**

- Verificación local: typecheck (`ng build`) limpio, `eslint` limpio sobre los archivos afectados, `npm run arch` en 17/18 criterios PASS — el único FAIL (`testing/CR-005`, cobertura) lo arrastran 2 fallas preexistentes y ajenas a esta unidad (`tasks.spec.ts` e `sla-summary.spec.ts`, ambas sobre el texto "página cargada/página" que otra edición ya en el árbol de trabajo quitó de `tasks.html`/`sla-summary.html`); se reprodujeron igual sin ningún archivo de TK-005 en el stash. El resto de la suite: 471/473 en verde, incluyendo los 4 tests nuevos de `task-flow-modal.spec.ts` y los 2 nuevos de `tasks.spec.ts` (menú "Ver flujo").
- `mermaid` se importa dinámicamente dentro de `TaskFlowModal` (no en el scope del módulo): así su peso (~1 MB, varios sub-chunks por tipo de diagrama) no se suma al chunk lazy `baw-processes-routes` que ya usa el resto de "Mis tareas" — solo se descarga la primera vez que alguien abre el modal. Verificado con `ng build`: `baw-processes-routes` creció ~8 kB, el resto de mermaid quedó en chunks lazy aparte.
- No se implementó el criterio de foco de IT-05 con una prueba dedicada: se apoya en el comportamiento estándar de `MatDialog` (foco al primer elemento enfocable, devuelto al disparador al cerrar), no en lógica propia de esta unidad.

**Decisiones adicionales:**

- `TASK_ROW_ACTIONS` (constante estática, una sola instancia de `Action[]` compartida por todas las filas) pasó a ser `rowActions(task): Action[]` — un método por fila —, ya que el `click` de `flow` necesita cerrar sobre la `task` de esa fila específica para abrir `TaskFlowModal` con sus datos.
- `buildTaskFlowDiagram` deriva el paso activo únicamente del `state` de la tarea (no de su `name`, pese a que la descripción original de IT-02 mencionaba "estado/nombre"): es un mock exploratorio y desacoplado (ver alcance del TK), así que una señal más (el estado, ya con significado de negocio) alcanza sin sumar una regla adicional sin motivo funcional.
- Colores del diagrama (`classDef` de Mermaid) fijados como hexadecimales que replican `emerald/orange/red` de Tailwind, tomados de `theme/components/base/badge.css` (`ft-badge--success/warning/danger`): Mermaid no puede resolver clases Tailwind, solo estilos inline/`classDef` propios.
- `TaskFlowModal` usa `ViewEncapsulation.None`: el SVG de Mermaid se inyecta vía `innerHTML`, nunca pasa por el compilador de plantillas de Angular, así que el atributo de scoping de la encapsulación `Emulated` (la de por defecto) nunca llega a él — un selector `.task-flow-modal__diagram svg` scoped no lo alcanzaría.

### TK-007: Infraestructura de acceso a la API nativa WLE

<!-- unit:id=TK-007 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-15 00:14
**Finalizado:** 2026-09-15 00:17
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`
~ frontend/proxy.conf.js

- frontend/src/app/core/interceptors/wle-auth-interceptor.ts
- frontend/src/app/core/interceptors/wle-auth-interceptor.spec.ts
  ~ frontend/src/app/app.config.ts
  `

**Notas:**

- `npx eslint` limpio y `npx ng build` limpio sobre el proyecto (2 warnings preexistentes y ajenos: `@angular/localize` side-effect, presupuesto de `main-layout.css`). `wle-auth-interceptor.spec.ts` en verde (3/3, 100% cobertura del archivo); la corrida acotada a `core/interceptors/**/*.spec.ts` (5 archivos, 22/22 tests) dispara el umbral global de cobertura (80%) del builder al no incluir el resto del proyecto — falso negativo ya documentado en el cierre de TK-005/TK-006, no una regresión real; `npm run arch`/la batería completa quedan para `quality-check`.

**Decisiones adicionales:**
[]

**Cobertura de test cases:**

- Sin `TC-XXX` propios: TK-007 es infraestructura transversal (proxy + interceptor CSRF), no cubre directamente ningún `AC-XXX` del README — habilita a TK-008/TK-009, que sí mapean a test cases existentes.

### TK-008: Repositorio y mapper de "Mis tareas" contra API-13 (WLE)

<!-- unit:id=TK-008 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-15 00:20
**Finalizado:** 2026-09-15 00:27
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`~ frontend/src/app/features/baw-processes/models/user-task.ts
~ frontend/src/app/features/baw-processes/utils/task-mapper.ts
~ frontend/src/app/features/baw-processes/utils/task-mapper.spec.ts
~ frontend/src/app/features/baw-processes/services/user-task-repository.ts
~ frontend/src/app/features/baw-processes/services/user-task-repository.spec.ts`

**Notas:**

- `npx eslint` limpio sobre los 5 archivos. `npx tsc --noEmit --strict` confirma que estos archivos (y sus specs) compilan sin error; los únicos errores del proyecto son en `tasks-manager.ts`/`tasks-manager.spec.ts` (TK-009, que arranca a continuación sin pausa) — esperado: `UserTaskPage` cambió de forma (IT-04) y esos archivos son justo lo que TK-009 adapta. `task-mapper.spec.ts` y `user-task-repository.spec.ts` no se pudieron correr con `ng test` de forma aislada porque el builder compila el bundle completo (incluye `tasks-manager.ts`); se verificaron con `tsc --noEmit` en su lugar. Se ejecutarán con `ng test` normal al cerrar TK-009.
- `mapResponseToPage` (contrato A, envoltura de página de API-05) y el tipo `BawUserTasksResponse` se eliminaron: quedaron sin ningún consumidor tras el cambio de forma de `UserTaskPage` (IT-04) — código muerto, no una decisión de alcance nueva. Sus tests (`describe('mapResponseToPage')`) se retiraron con ellos. `mapDtoToTask`/`mapDtoToTaskDetail` (contrato A a nivel de tarea) quedaron intactos, siguen sirviendo a `task-detail-repository.ts`.

**Decisiones adicionales:**

- **`model` (contrato B) no tiene campo dedicado** — MD-04 no lo lista entre las claves de `items[]`. Se deriva de `PI_NAME` (`"<Modelo>:<PIID>"`) quitando el sufijo `:<PIID>` conocido; si no coincide, cae al `PI_NAME` completo. Es una heurística, no un contrato confirmado — documentado en el propio código y cubierto con test. El plan de IT-02 no mencionaba `model`; sin esto, el campo (no opcional en `UserTask`) no podría llenarse.
- **`states`/`model`/`processId` se degradan a filtro client-side dentro del repositorio**, sobre la página ya cargada — misma naturaleza que la búsqueda de texto (AC-003). Para `states`, el plan de IT-05 ya autorizaba este fallback ante la falta de un `field`/`operator` de `conditions` confirmado. Para `model`/`processId`, el plan solo decía "validar en vivo antes de cablearlos", sin fallback explícito; se extendió el mismo criterio para no romper en silencio el filtrado de la UI de TK-004 (ya en producción). Efecto secundario conocido y sin resolver aquí: `totalCount`/paginación siguen reflejando el total del servidor **sin** este filtro aplicado, igual que ya ocurre con la búsqueda de texto — queda para la unidad de seguimiento que registran las Observaciones del TK.
- El body fijo de la petición usa solo 9 de las 12 propiedades válidas de `SavedSearchDefinition` (`organization`, `shared`, `teams`, `interaction`, `conditions`, `fields`, `sort`, `aliases`, `size`); `owner`/`id`/`name` se omiten (sin uso confirmado, MD-04/API-13).

**Cobertura de test cases:**

- Sin `TC-XXX` propios directos: TK-008 es la capa de datos (repositorio/mapper) que TK-009 conecta a la UI donde viven los `TC-XXX` de AC-001/AC-002/AC-003. La cobertura del contrato B se cubrió con tests de mapper y de repositorio no ligados a un TC específico.

### TK-009: Adaptar listado, paginación, filtros y resumen de SLA al contrato WLE

<!-- unit:id=TK-009 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-15 00:29
**Finalizado:** 2026-09-15 00:36
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`~ frontend/src/app/features/baw-processes/services/tasks-manager.ts
~ frontend/src/app/features/baw-processes/services/tasks-manager.spec.ts
~ frontend/src/app/features/baw-processes/components/tasks/tasks.ts
~ frontend/src/app/features/baw-processes/components/tasks/tasks.html
~ frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts
~ frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.ts
~ frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.html
~ frontend/src/app/features/baw-processes/components/tasks/sla-summary/sla-summary.spec.ts
~ frontend/src/app/features/baw-processes/services/user-task-repository.spec.ts`

**Notas:**

- `npx eslint` y `npx ng build` limpios sobre el proyecto completo (mismos 2 warnings preexistentes y ajenos ya señalados en TK-007/TK-008). Con TK-009 cerrado, el build ya no depende de nada pendiente: corrí junto todos los specs de TK-008+TK-009 (`tasks-manager`, `tasks`, `sla-summary`, `task-mapper`, `user-task-repository`) con `ng test --include` — 122/122 en verde.
- De paso corregí un bug real en un test de TK-008 (`user-task-repository.spec.ts`, caso "should filter the loaded page by model when provided"): el Object Mother de la segunda tarea cambiaba `PI_NAME` a `"Aprobar Factura:900"` pero no `PROCESS_INSTANCE.PIID` (seguía en `'274'` por defecto), así que la heurística de `model` no encontraba el sufijo `:900` y caía al `PI_NAME` completo — el test comparaba contra `'Aprobar Factura'` y fallaba. No es un defecto del código de producción (`mapWleDtoToTask`), es un dato de prueba inconsistente; corregido alineando ambos campos en el Object Mother del test.
- E2E: no hay ninguna prueba e2e de "Mis tareas" en `e2e/` (solo el placeholder `example.spec.ts`) — no hay nada que correr una sola vez al cierre de esta implementación.
- Cierre de la implementación (las 3 TK integradas en `feature/US-003-mis-tareas-listado-sla`): `npx eslint .` y `npx ng build` limpios sobre todo el repo. `npx ng test --coverage` completo: 500-502/502 en verde según la corrida (umbrales de cobertura del 80% superados en las 4 métricas cuando corre completo). Los 2-4 tests que fallan por corrida son _timeouts_ de 5s en archivos **distintos** cada vez (`filters.spec.ts`, `dynamic-task-form.spec.ts`, `task-detail.spec.ts`, `tasks.spec.ts` — ninguno tocado de forma consistente) — contención de recursos al correr las ~500 pruebas juntas, no una regresión: los mismos archivos que fallan en una corrida completa pasan limpios en aislamiento (`tasks.spec.ts` + `task-detail.spec.ts`: 46/46). No se investiga más a fondo aquí — es la batería completa, responsabilidad de `quality-check`, no de esta unidad.
- `hasPrevious`/`hasNext` de `TasksManager` dejaron de ser consumidos por `Tasks`/`tasks.html`: el paginator (`app-datagrid` → `mat-paginator`) ya deriva su propio estado habilitado/deshabilitado de `[length]="total()"` + `[pageIndex]`/`[pageSize]`, con `total` ahora exacto (API-13). Siguen siendo parte de la API pública de `TasksManager` (los usa internamente `loadNextPage`/`loadPreviousPage` para no pedir una página fuera de rango) y su cobertura vive en `tasks-manager.spec.ts`; el mock de `tasks.spec.ts` se simplificó quitándolos porque ya no afectan el render.

**Decisiones adicionales:**

- El wrapper `<div class="flex flex-col gap-2">` de `sla-summary.html` se retiró junto con el aviso de alcance parcial (IT-05): sin ese párrafo, envolvía un solo hijo (las tarjetas) sin aportar nada, y de hecho el `flex flex-wrap` interno competía con el `grid grid-cols-2 lg:grid-cols-4` que ya aplica el host del componente — las tarjetas ahora son hijas directas del host y caen correctamente en el grid.

**Cobertura de test cases:**

- TC-005 (resumen de SLA, una página) y TC-006 (resumen no cambia al paginar) migraron de construir una lista de `UserTask` y calcular `slaSummary(tasks)` a pasar directamente un `SlaSummaryCounts` como `stats` — ya no hay cálculo en el cliente que probar, solo que el componente renderice lo que recibe. El caso de TC-006 se readaptó como "el resumen no depende de `tasks`, solo de `stats`", que es la garantía real tras este cambio.
