# RS-001 — Spike: ¿admite `API-13` (`PUT /rest/bpm/wle/v1/tasks`) una búsqueda en modo administrador por todos los equipos?

**Estado:** Ready
**Flujo:** Analizar decisiones pendientes
**Artefacto referenciado:** US-006
**Creado por:** juanca202
**Fecha:** 2026-09-16

## Pregunta de investigación

¿El endpoint ya confirmado `PUT /rest/bpm/wle/v1/tasks` (API-13) admite una búsqueda en modo administrador que devuelva tareas de todos los equipos del sistema — no solo las del usuario que consulta —, para resolver el mecanismo de AC-001 de US-006 sin depender del _screen-scraping_ del panel "Rendimiento del equipo" que confirmó RS-005?

## Contexto

[RS-005](../../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) confirmó que el panel nativo "Rendimiento del equipo" sí agrega, por equipo y para todos los equipos del sistema, el desglose vencido/en riesgo/a tiempo que pide AC-001 de US-006 — pero vía un mecanismo frágil (HTML incrustado de un Human Service que IBM marca como _deprecated_, sin contrato JSON). Antes de comprometerse con esa vía, RS-005 recomendó verificar si `API-13` — ya confirmado y contractual, documentado en [`portal-procesos-baw.md#api-13`](../../../technical-docs/portal-procesos-baw.md#api-13) — admite un modo de búsqueda que cubra todos los equipos, no solo los del usuario. Ese es el spike que ejecuta este RS.

## Hallazgos

### El catálogo completo de `interaction` quedó confirmado — y no incluye ningún modo administrador

La documentación existente marcaba el catálogo de valores de `interaction` como "sin confirmar", con solo `claimed_and_available` verificado. Forzando un valor inválido, el propio servidor devuelve la lista completa en el mensaje de error:

> `CWTBG0613E: El valor de interacción '<valor>' no se encuentra en la lista de valores válidos: 'claimed, available, claimed_and_available, completed, all'.`

Cinco valores, los cinco probados en vivo contra `https://192.168.120.100:9443` (usuario `juancarlos.altamirano`): `claimed` (200), `available` (200, `totalCount: 0`), `claimed_and_available` (200, `totalCount: 3`), `all` (200, `totalCount: 27`). Ninguno se llama ni se comporta como un modo "todas las tareas del sistema" o "administrador".

### `interaction: "all"` sigue acotado al usuario — no es un modo de sistema

`all` sí amplía el resultado (27 tareas, incluyendo tareas **cerradas** de varios procesos distintos: "Proceso de Créditos", "Solicitar Credito", "Vacation request", "Sick Leave", "Proceso Menthoring Baw", "Credito IA Generativa"), lo que en un primer momento parecía prometedor. Pero sus agregados de SLA (`stats: {open: 3, atRisk: 1, overdue: 2}`) están muy por debajo de lo que RS-005 ya midió para **un solo equipo** vía el panel "Rendimiento del equipo": "Oficiales Crédito" sola reportaba `countOverdue: 7, totalOpenTasks: 7`. Si `all` fuera realmente un barrido de sistema, debería igualar o superar esa cifra — no quedarse en 2 vencidas contra las 7 de un único equipo. La lectura consistente con la evidencia es que `all` solo **añade las tareas completadas del propio usuario** (`claimed + available + completed`) a su historial personal — coherente con el nombre mismo del endpoint, "Buscar tareas **del usuario**" — no con una búsqueda administrativa de todo el sistema. La cuenta de prueba —con acceso administrativo a nivel de procesos, según [US-004](../../US-004-procesos-instancias/README.md)— no se traduce en visibilidad administrativa sobre las tareas de otros usuarios/equipos en este endpoint.

### El filtro `teams` del cuerpo es funcionalmente inerte

Documentado como campo requerido (`teams: string[]`), en la práctica resultó que:

- El shape correcto **no es un array de strings**, sino de objetos `SavedSearchDefnTeam` con exactamente 3 propiedades conocidas: `teamId`, `processAppName`, `teamName` (confirmado forzando un shape inválido — el servidor enumera las 3 en el error `CWTBG0618E`). Esto corrige/completa el contrato que documentaba [MD-04](../../../technical-docs/portal-procesos-baw.md#md-04).
- Pero **no filtra nada**: pasar un equipo real (`{teamName: "Oficiales Crédito"}`), un equipo inexistente (`{teamName: "EsteEquipoNoExiste123"}`) o un array vacío (`teams: []`) devuelven exactamente el mismo `totalCount` y el mismo `stats` en cada caso probado. El parámetro se acepta y se valida por forma, pero no participa en el filtrado real de la búsqueda en esta instalación.

### `assignedToRoleDisplayName` es `null` para todo lo que el usuario puede ver — no se pudo confirmar si alguna vez se puebla

El campo sí es aceptado como columna de proyección y como condición de filtro (`conditions: [{field: "assignedToRoleDisplayName", operator: "Equals", value: "..."}]` → 200, sin error), pero devuelve `null` en las 27 tareas del alcance `all` del usuario — abiertas, reclamadas y cerradas por igual —, contradiciendo la afirmación de MD-04 de que este campo trae el equipo "sin `optional_parts` ni segunda llamada". La lectura más plausible es que el campo solo se puebla mientras una tarea está **sin reclamar, disponible para un equipo** (`interaction: "available"`), y en este spike `available` devolvió `totalCount: 0` para el usuario de prueba — no hay ninguna tarea en ese estado, visible para él, con la que verificarlo. **Queda como pregunta abierta**, sin poder confirmarse ni descartarse con la evidencia de esta sesión.

## Decisiones pendientes / opciones evaluadas

- **Mecanismo de datos para AC-001 de US-006** — con la opción (b) de [RS-005](../../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) ya descartada por este spike:
  - **(a) Screen-scraping del panel "Rendimiento del equipo"** (confirmado funcional en RS-005): sigue siendo la **única vía confirmada** que entrega el desglose por equipo para **todos los equipos del sistema**. Persisten sus trade-offs ya documentados: HTML no contractual, componente que IBM marca _deprecated_, agregación por tarea (no por instancia), mezcla equipos de todos los Process Apps instalados.
  - **(b) `API-13` en algún modo ampliado** — **descartado por este spike**: ninguno de sus 5 valores de `interaction` ni su filtro `teams` ofrecen alcance más allá del propio usuario que consulta.
  - **(c) Diferir esta historia** a una versión futura, dado que su única vía viable tiene el perfil de riesgo de (a).
  - **Recomendación:** entre (a) y (c) — este spike no tiene elementos nuevos para inclinar la balanza más allá de lo que ya pesaba RS-005 (fragilidad y deuda técnica de (a) vs. valor de negocio de tener la vista). Es una decisión de producto, no técnica: corresponde al dueño de la historia, no a esta investigación, decidir si el valor de "ver todos los equipos" justifica construir sobre un componente deprecado. Si el volumen de datos por equipo es bajo (como en este ambiente: 7 equipos, conteos de un dígito), el costo de mantenimiento del _scraper_ es menor; si se anticipa un volumen mucho mayor en producción, el riesgo de mantenimiento crece con él — dato a confirmar con el dueño de producto, no con más investigación técnica.

## Conclusión y recomendación

**El spike responde negativamente**: `API-13` no ofrece ningún modo administrador o de sistema — su catálogo completo de `interaction` (`claimed`, `available`, `claimed_and_available`, `completed`, `all`) está confirmado y ninguno rompe el scoping al usuario que consulta, y su filtro `teams` resultó inerte. La opción (b) que RS-005 dejó abierta queda **cerrada**: no es viable.

Esto deja a la opción (a) — el mecanismo de RS-005 — como la **única vía técnicamente confirmada** para cumplir "todos los grupos disponibles" de AC-001. La decisión que le queda a US-006 ya no es de mecanismo (a vs. b): es **(a) vs. (c)**, aceptar la fragilidad conocida o diferir la historia — una decisión de producto que corresponde resolver en `work-define`, no en más investigación técnica.

## Impacto en el artefacto / próximo paso

AC-001 de US-006 sigue sin decisión cerrada, pero el espacio de opciones se redujo de tres a dos: (a) aceptar el mecanismo de scraping ya confirmado en RS-005, con sus trade-offs, o (c) diferir la historia. `work-define` debe actualizar las Observaciones de US-006 reflejando que (b) quedó descartada por este spike, y presentar al usuario la decisión final entre (a)/(c).

## Fuentes

- Inspección en vivo de `https://192.168.120.100:9443/` (usuario `juancarlos.altamirano`), 2026-09-16: llamadas `PUT /rest/bpm/wle/v1/tasks?calcStats=true` con los 5 valores de `interaction`, con distintos shapes de `teams`, y con `assignedToRoleDisplayName` como condición de filtro — ejecutadas vía `fetch()` en el contexto de la página ya autenticada.
- [`docs/specs/technical-docs/portal-procesos-baw.md#api-13`](../../../technical-docs/portal-procesos-baw.md#api-13) — contrato previamente confirmado de `API-13`.
- [`docs/specs/technical-docs/portal-procesos-baw.md#md-04`](../../../technical-docs/portal-procesos-baw.md#md-04) — contrato de Tarea, incluida la afirmación (ahora matizada) sobre `ASSIGNED_TO_ROLE_DISPLAY_NAME`.
- [RS-005: Rendimiento del equipo — panel nativo Team Performance (WLE)](../../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) — spike recomendado por este RS y línea base de comparación (`Oficiales Crédito`: 7 vencidas).
