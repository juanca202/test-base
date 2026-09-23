<!--
Convención de placeholders: sustituir manualmente cada {{texto}}; no es un motor de plantillas.
Las marcas `<!-- work:… -->` y `<!-- unit:… -->` SE CONSERVAN: son el ancla que `work-integrate` y

`pr-create` parsean para comprobar que cada unidad esta en `Done`.
-->

# Progreso

## US-006-rendimiento-equipo

<!-- work:id=US-006 · status=Done -->

**Estado:** Done
**Tipo:** historia de usuario
**Fecha de creación:** 2026-09-16 11:00
**Ultima actualizacion:** 2026-09-16 11:35 (mergeado a `develop` de `frontend`, commit `46a175b`)

## Unidades

### TK-001: Repositorio de métricas por equipo (Human Service scraping)

<!-- unit:id=TK-001 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-16 11:00
**Finalizado:** 2026-09-16 11:12
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`
~ proxy.conf.js

- src/app/features/baw-processes/models/team-performance.ts
- src/app/features/baw-processes/services/team-performance-repository.ts
- src/app/features/baw-processes/services/team-performance-repository.spec.ts
- src/app/features/baw-processes/utils/team-performance-parser.ts
- src/app/features/baw-processes/utils/team-performance-parser.spec.ts
  ~ src/app/core/models/environment.ts
  ~ src/environments/environment.ts
  ~ src/environments/environment.development.ts
  `

**Notas:**

- IT-07 quedó como verificación **parcial, no concluyente** — ver la sección "Verificación IT-07" al final de `TK-001-repositorio-metricas-equipo-scraping.md`: se confirmó que una petición sin autenticar a `executeServiceByName` es interceptada por el filtro de login del contenedor antes de llegar al motor (sin efecto), pero no se pudo probar con una sesión autenticada real (sin credenciales disponibles en este entorno) si la invocación directa (sin navegación completa de página) crea el mismo efecto — si alguno — que la navegación normal del panel nativo. Se documenta como residual explícito a confirmar por el equipo antes de producción; no bloquea el cierre de la TK porque la decisión de aceptar el mecanismo ya estaba tomada (Observaciones de US-006).
- No se encontró un archivo de HTML crudo capturado como artefacto físico en `RS-005` (solo la estructura documentada en su README) — el fixture de la prueba de contrato (IT-06) se construyó reproduciendo fielmente los marcadores confirmados (meta `generator`, variable `this.local`, forma de `items`) y los valores exactos del equipo "Oficiales Crédito" que sí quedaron citados textualmente en RS-005.

**Decisiones adicionales:**

- **Repositorio de specs con submódulos — adaptación del cierre.** Este repositorio (`smart-process-portal`) agrega `frontend` como submódulo git independiente; `work-implement`/`work-integrate` asumen un único repositorio. Adaptación aplicada: el worktree, las puertas de cierre (`quality-check`, `coverage-verify`) y el merge a `develop` corrieron **dentro del repositorio `frontend`**; los documentos de especificación (`progress.md`, checkboxes de TK, `coverage.md`) se editaron y commitearon en el repositorio de specs (este), sin merge propio — no hay rama por US en este repo, así que estos cambios van directo sobre `develop` del repo de specs. El pointer del submódulo `frontend` se actualiza en el mismo commit de cierre.
- **Merge sin tocar el árbol principal de `frontend`.** `frontend/develop` tenía cambios sin commitear de otra sesión en curso (US-005) que el usuario pidió no tocar ni commitear. Git no permite hacer `checkout`/`fetch a un ref` de una rama ya activa en otro worktree, así que el merge de `feature/US-006-rendimiento-equipo` se hizo en un worktree temporal sobre una rama temporal (`tmp-integrate-US-006`, creada desde `develop`), y el puntero de `develop` se actualizó después con `git update-ref` (movimiento de referencia puro, fast-forward verificado, sin tocar índice ni archivos de ningún otro worktree) — seguido de un `git reset` (sin rutas) en el árbol principal para sincronizar su índice con el nuevo `HEAD`, que tampoco toca archivos de trabajo. Verificado con hash de un archivo modificado por la otra sesión (`processes.html`) idéntico antes y después. El árbol principal de `frontend` sigue en `develop`, con los cambios sin commitear de la otra sesión intactos; ahora aparece "behind" su propia rama (esperado: los archivos nuevos de esta US no están materializados ahí hasta que esa sesión haga `pull`/`checkout`, decisión que le corresponde a ella, no a esta).
- **`code-review` omitido por política** (`verification.codeReview.enabled: false`) — no se ejecutó, no cuenta como aprobado.
- **Archivado del artefacto: omitido — sin canal de respuesta para confirmar.** `implementation.archiveMode` es `ask` y esta sesión no tuvo herramienta de preguntas estructuradas disponible (ejecución no interactiva). Aplicando el fallback documentado ("sin canal de respuesta, no archivar"): `US-006` permanece en `docs/specs/user-stories/` sin mover a `docs/archive/`. El usuario puede archivarlo corriendo `work-integrate` de nuevo (ya con las puertas en verde, solo restaría confirmar el archivado) o pedirlo directamente.
- Esta US no tiene carpeta `test-cases/` (no hay `TC-XXX` definidos). Se decide continuar sin ellos: el plan de implementación de TK-001/TK-002 ya detalla explícitamente, por IT-XX, las pruebas requeridas (incluida la de contrato IT-06), y `confirmByUnit: never` + `handoff: always` indican preferencia por avanzar sin pausas de decisión que el propio plan ya resuelve.
- Se agregó `teamPerformance.ownProcessAppName` al modelo `Environment` (`core/models/environment.ts`) y se configuró en ambos `environment.ts`/`environment.development.ts` como `'BAYBANK - DEMO PROCESOS'` — es el mecanismo concreto que hace "configurable por ambiente" el filtro de `processAppName` que pide IT-05 (no existía antes un lugar para ese tipo de configuración).
- `TeamPerformanceRepository.getAll()` usa `HttpClient` de forma directa (`firstValueFrom`), sin envolver con `getResource`/`getResourceCollection` de `async-resources` — la respuesta es texto HTML, no JSON, y el manejo de loading/error reactivo lo asumirá el componente consumidor en TK-002 (mismo patrón que `TaskDetail` envolviendo un repository directamente, sin manager, por no requerir orquestación adicional).

**Cobertura de test cases:**
[]

### TK-002: Panel "Rendimiento del equipo"

<!-- unit:id=TK-002 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-16 11:12
**Finalizado:** 2026-09-16 11:16
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- src/app/features/baw-processes/components/team-performance/team-performance.ts
- src/app/features/baw-processes/components/team-performance/team-performance.html
- src/app/features/baw-processes/components/team-performance/team-performance.css
- src/app/features/baw-processes/components/team-performance/team-performance.spec.ts
- src/app/features/baw-processes/components/team-performance/team-performance-card/team-performance-card.ts
- src/app/features/baw-processes/components/team-performance/team-performance-card/team-performance-card.html
- src/app/features/baw-processes/components/team-performance/team-performance-card/team-performance-card.spec.ts
  ~ src/app/features/baw-processes/baw-processes-routes.ts
  `

**Notas:**

- No se referenció `app.routes.ts` (como decía el listado de "Archivos afectados" de la TK) sino `baw-processes-routes.ts`: la ruta de "Procesos"/"Mis tareas" (el patrón que IT-03 pedía seguir) vive ahí, no en `app.routes.ts` (que solo hace lazy-load del feature); registrar en `app.routes.ts` habría sido inconsistente con el patrón real. `app.routes.ts` queda sin tocar.
- `TeamPerformanceCard` no tiene archivo `.css` propio (tal como ya indicaba el listado de archivos de la TK) — usa clases Tailwind inline y `ft-card`/`ft-badge` ya existentes.
- El gráfico circular de estado se implementó como SVG inline (arcos vía `stroke-dasharray`/`stroke-dashoffset`), sin librería de charts — no hay ninguna en el `package.json` del repo y no se justificaba agregar una dependencia nueva para un solo donut de 3 segmentos. Accesibilidad: el SVG decorativo lleva `aria-hidden`, el contenedor `role="img"` con `aria-label` describiendo el desglose completo en texto, y la leyenda (badges `ft-badge--success/warning/danger`) repite icono + etiqueta + conteo — nunca color solo (regla de `frontend/AGENTS.md`, WCAG AA).
- No se encontró `ProcessPerformanceCard` (US-005, TK-002) en el código — US-005 aún no está implementada (solo especificada; sus TK aparecían como archivos nuevos sin implementar al iniciar esta sesión). Se siguió en su lugar el patrón visual ya implementado y vigente en el repo para severidad SLA (`Tasks`/`SlaSummary`: `ft-badge--success/warning/danger` + icono + etiqueta), que es el mismo vocabulario que `ProcessPerformanceCard` habría tenido que seguir de todas formas.
- `npm run arch` (fitness functions) se corrió tras TK-002 y pasa sin advertencias (CR-009 getApiUrl, CR-014/015/016 mappers — `team-performance-parser.ts` no se nombra `*-mapper.ts` a propósito, ver Decisiones de TK-001, y el fitness function no lo señala como incumplimiento).

**Decisiones adicionales:**
[]

**Cobertura de test cases:**
[]
