# RS-001 — Viabilidad de migrar detalle, reclamo y completado de tarea a la familia WLE

**Estado:** Ready
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202
**Fecha:** 2026-09-15

## Pregunta de investigación

¿Es viable migrar el detalle de tarea, reclamo y completado (hoy contrato A, `/bpm/user-tasks/{id}`, API-06/07/08) a la familia WLE (`/rest/bpm/wle/v1/`), dado que `GET /rest/bpm/wle/v1/task/{tkiid}` existe pero su payload no da los `fields`/`actions` que el portal necesita — y cómo varía eso entre tareas COACHFLOW y no-COACHFLOW?

## Contexto

ADR-015 (repo `frontend`) migró el **listado** de "Mis tareas" (US-003) de la API custom obsoleta (API-05) a la API nativa WLE (API-13), pero dejó explícitamente sin resolver el detalle de tarea, el reclamo y el completado (API-06/07/08), que siguen en el contrato A (`/bpm/user-tasks/{id}` y sus subrecursos). El propio ADR registra esto como brecha abierta: `api/CR-001` de `frontend/docs/standards/api.md` exige que "ningún repository de datos BPM debe llamar fuera de `/rest/bpm/wle/v1/*`", con la única excepción declarada de `bpm/system/login` — es decir, el estándar vigente **ya exige** esta migración, pero nunca se validó si WLE tiene superficie equivalente para ella.

Durante una sesión de prueba manual de US-003 (tarea 478, "Aprobar Crédito"), se detectó que el detalle de tarea sigue llamando a `/bpm/user-tasks/478` en vez de a WLE. Se confirmó que existe un endpoint WLE de detalle no documentado hasta ahora (`GET /rest/bpm/wle/v1/task/{tkiid}`), lo que motivó esta investigación antes de decidir si migrarlo.

## Hallazgos

Todo lo siguiente se verificó en vivo contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, usuario `juancarlos.altamirano`) el 2026-09-15, con las 5 tareas reales disponibles para ese usuario (`478`, `480`, `481`, `484`, `485`).

### 1. `GET /rest/bpm/wle/v1/task/{tkiid}` existe y responde 200 real

No estaba documentado en `portal-procesos-baw.md` (MD-04 solo cubre el contrato B de _listado_, API-13). Devuelve una representación completa y distinta tanto del contrato A como del contrato B del listado — trae campos de bajo nivel del motor BPD (`activationTime`, `containmentContextID`, `serviceID`, `serviceSnapshotID`, `flowObjectID`, `collaboration`, etc.), no la forma "tarea + campos resueltos + acciones" que el portal necesita para `UserTaskDetail` (MD-06/MD-07).

### 2. Las 5 tareas del usuario son todas `serviceType: "COACHFLOW"`

No es un caso aislado de la tarea 478: es el tipo de servicio de **todas** las tareas disponibles en este ambiente de referencia (`Aprobar Credito` ×2, `Submit request`, `Create sick leave`, `Supervisor Approval`). `COACHFLOW` es el mecanismo de BPM para tareas renderizadas mediante una _Coach_ (una pantalla de UI definida en el proceso, con su propio motor de renderizado), no mediante un formulario genérico construido a partir de definiciones de campo planas.

### 3. El bloque `data.variables` trae los nombres de las variables de la Coach, pero **nunca sus valores**

Para las 5 tareas, `data.variables` devuelve las claves declaradas por la definición de la Coach (p. ej. la tarea 484 "Create sick leave" trae `reason`, `address`, `name` — nombres que sí parecen campos de negocio reales) pero **todos los valores son `null`**, sin excepción, incluso en tareas con formulario visiblemente pobladas en producción. Esto sugiere que los valores de una Coach no se sirven por esta vía genérica: probablemente requieren el motor de renderizado de Coaches (sesión/estado de Coach), no una llamada REST de datos planos.

> **Actualizado el 2026-09-15 (ver [Actualización](#actualización-2026-09-15--actiongetdata-sí-devuelve-valores) más abajo).** Este hallazgo aplicaba a `GET /rest/bpm/wle/v1/task/{tkiid}` **sin** `action`. Con `action=getData&fields=<nombre>` — un valor de `action`/`fields` que esta investigación no llegó a probar (ver Hallazgo 4) — WLE **sí** devuelve el contenido del Business Object solicitado, no `null`. La vía de datos planos existe; lo que esta investigación no había encontrado era el parámetro correcto.

### 4. El recurso singular expone una superficie amplia, descubierta vía WADL (`OPTIONS`)

`OPTIONS /rest/bpm/wle/v1/task/{tkiid}` devuelve un documento WADL (`Allow: HEAD, POST, GET, OPTIONS, PUT`) que documenta parámetros no explorados hasta ahora:

- **`POST`/`PUT {taskid}`** aceptan `action`, `toTeam`, `toUser`, `toGroup`, `back`, `toMe`, `dueDate`, `priority`, `user`, `message`, `parts`, `params`, `failureMode`. Los parámetros `toMe`/`toUser`/`toTeam`/`toGroup` sugieren fuertemente que **reclamo y reasignación sí tienen equivalente en WLE** — semántica muy cercana a `POST /bpm/user-tasks/{id}/claim` (API-07) — pero **no se hizo ninguna llamada de escritura para confirmarlo**: una tarea real de este ambiente se habría reclamado/reasignado de verdad, con efecto de negocio real, y esta investigación se limitó deliberadamente a lecturas.
- **`GET {taskid}`** acepta además `parts`, `fields`, `action`, `includeURL` — sin documentación de qué valores toma `parts`/`fields` aquí; no se llegó a un valor que poblara `data.variables`.
- Sub-recursos descubiertos pero no resueltos: `{taskid}/summary` (responde `400 CWTBG0574E`, exige cabecera `X-Timezone` y, tras agregarla, un parámetro `authAlias` no documentado — probablemente pensado para integración con sistemas federados, no para este caso); `{taskid}/preview-header`; `{taskid}/clientSettings/{type}`; `{taskid}/summary/questions`. Un recurso `/actions` aparece en el WADL pero las dos rutas probadas (`/rest/bpm/wle/v1/actions` y `/rest/bpm/wle/v1/task/actions`) devolvieron `404` — su ruta real no se determinó.

### 5. Hallazgo colateral: `expiration` del login (MD-01) queda confirmado

El login (`POST /bpm/system/login`) devolvió `"expiration": 7200` — confirma en vivo que la unidad es **segundos**, resolviendo la laguna que MD-01 tenía abierta ("por confirmar en ejecución").

## Decisiones pendientes / opciones evaluadas

- **¿Migrar detalle de tarea a WLE ahora?** — opciones: (A) mantenerlo en contrato A indefinidamente; (B) migrar ya, asumiendo que `data.variables` se puede poblar con un parámetro aún no descubierto; (C) declarar explícitamente que el detalle de tareas COACHFLOW requiere una estrategia de renderizado de Coach distinta (fuera del paradigma de "formulario dinámico genérico" de MD-06), y tratar contrato A como la vía **correcta y definitiva** para estas tareas, no como deuda técnica. Recomendación: **(C)** — ver Conclusión.
- **¿Migrar reclamo/reasignación a WLE?** — opciones: (A) no tocar, sigue en contrato A; (B) validar en vivo con una llamada de escritura controlada (`POST .../task/{id}?action=claim&toMe=true` o similar) sobre una tarea de prueba dedicada, y si funciona, migrar. Recomendación: **(B)**, pero como una investigación de seguimiento separada y explícitamente autorizada, no dentro de esta.
- **¿Y completado?** — sin ningún candidato de parámetro (`action=complete` es una hipótesis razonable dado el patrón `action=` visto en POST/PUT, pero no se probó). Queda abierto.

## Conclusión y recomendación

> **Ver también la [Actualización (2026-09-15)](#actualización-2026-09-15--actiongetdata-sí-devuelve-valores):** el punto 1 de esta conclusión original queda matizado — sí hay una vía REST plana de WLE para los _valores_ de un Business Object de negocio (`action=getData`). Lo que sigue vigente es el punto 3 de esa actualización: la vía de _valores_ no resuelve la falta de metadatos de presentación (tipo, etiqueta, obligatoriedad, opciones), que es el motivo real por el que el detalle de tarea sigue sin poder pintarse dinámicamente sin configuración adicional del portal.

**Migrar el detalle de tarea a WLE tal como lo exige `api/CR-001` hoy no es viable sin antes resolver un problema más grande: las tareas de este BAW son COACHFLOW, y WLE no expone los valores de sus campos por la vía REST genérica que sí sirve para el listado.** No es una limitación de qué endpoint se llama, sino de qué _tipo_ de integración hace falta — probablemente el renderizado real de una Coach (iframe/SDK de Coach), no una traducción de JSON a formulario. Migrar esta parte sin resolver eso primero dejaría el detalle de tarea roto.

**Recomendación concreta:**

1. **No migrar detalle de tarea todavía.** Dejar `/bpm/user-tasks/{id}` (contrato A) como la vía vigente para detalle/formulario dinámico — funciona, está validado, y no hay reemplazo funcional confirmado. _(Matizado el 2026-09-15: hay un candidato confirmado para los **valores** — `action=getData` —, pero sigue sin reemplazo confirmado para los metadatos de presentación que el formulario dinámico también necesita.)_
2. **`api/CR-001` de `frontend/docs/standards/api.md` necesita una excepción explícita** para detalle/reclamo/completado, documentada vía `arch-manage` (ampliar ADR-015 o un ADR nuevo), en vez de dejarlo como una violación pendiente indefinida del estándar vigente. El estándar tal como está redactado hoy no refleja la realidad del sistema.
3. **Reclamo y reasignación son el candidato más prometedor** para una migración a WLE a futuro (parámetros `toMe`/`toUser`/`toTeam` en `POST`/`PUT {taskid}`), pero requiere una validación en vivo con escritura real — explícitamente fuera del alcance de esta investigación (solo lecturas) — antes de planificarse como trabajo.
4. **La pregunta de fondo — si el portal debe soportar tareas COACHFLOW con una Coach real, o si debe quedar fuera de alcance — es una decisión de producto**, no técnica: si BAW solo tiene tareas COACHFLOW en este ambiente, y el portal no puede renderizarlas de verdad, hay una laguna funcional más amplia que esta investigación no puede cerrar por sí sola.
5. **`action=getData&fields=<nombre>` (2026-09-15) es el candidato confirmado para la parte de _valores_** de un futuro mecanismo de configuración por proceso, combinado con metadatos de presentación mantenidos por el portal — ver la Actualización más abajo.

## Impacto en el artefacto / próximo paso

N/A — investigación independiente. No hay una US/WI en curso que dependa de esto; el hallazgo abre trabajo nuevo:

- **`arch-manage`**: documentar la excepción de `api/CR-001` para detalle/reclamo/completado (Hallazgo 1-3, Recomendación 1-2).
- Si se decide seguir la vía de reclamo/reasignación en WLE: una investigación de seguimiento (este mismo skill, con autorización explícita para escritura) antes de planificar un `WI-XXX`.
- La pregunta de producto sobre soporte a tareas COACHFLOW queda para quien decida el alcance funcional (no es un `work-plan`/`work-define` derivable directamente de este RS).

## Actualización (2026-09-15) — `action=getData` sí devuelve valores

Complementa el Hallazgo 3: una llamada en vivo aportada por el usuario contra un ambiente distinto (`https://btq-srv-bawodm.bayteqec.local`, tarea `556`) a `GET /rest/bpm/wle/v1/task/{id}?action=getData&fields=solicitud` devolvió `200 OK` con `data.resultMap.solicitud` **poblado**, no `null` — el valor de `action`/`fields` que el Hallazgo 4 de esta investigación dejó sin probar. Detalle completo, evidencia y análisis en [RS-001 — Viabilidad de `action=getData` de WLE como fuente de datos del formulario dinámico de tarea (US-007)](../../../archive/user-stories/US-007-reclamar-completar-tarea/research/RS-001-wle-getdata-formulario-dinamico/README.md) (numeración local a la carpeta `research/` de US-007, no relacionada con la de este documento).

**Qué cambia respecto a esta investigación:**

- **Se relativiza la conclusión "WLE no expone los valores de sus campos por la vía REST genérica".** Sí los expone, para Business Objects de negocio (`solicitud`/`SolicitudCredito`), a través de `action=getData&fields=<nombre>` — un parámetro del recurso singular que el Hallazgo 4 ya había detectado por WADL pero no había llegado a probar con un valor concreto.
- **Se mantiene sin cambios la conclusión de fondo sobre el formulario dinámico.** `getData` solo trae valores (además anidados en el BO, con `@metadata` técnico a descartar), nunca `type`/`label`/`required`/`options`. La necesidad de una integración distinta a "traducir JSON a formulario" (Coach real, o configuración de metadatos por proceso en el portal) **sigue vigente** — ahora con un candidato confirmado para la mitad "valores" de esa integración futura, no para la mitad "metadatos de presentación".
- **Ambiente no controlado:** esta prueba se ejecutó contra un host distinto al de la investigación original (`btq-srv-bawodm.bayteqec.local` vs. `192.168.120.100:9443`), así que no reemplaza una repetición completa de este RS en el mismo ambiente — ver el RS-001 de US-007 para el detalle de esa limitación.

## Fuentes

- Ambiente de referencia de BAW: `https://192.168.120.100:9443` — llamadas en vivo, 2026-09-15 (login, listado WLE de tareas, `GET`/`OPTIONS` sobre `/rest/bpm/wle/v1/task/{tkiid}` para las 5 tareas del usuario, subrecursos `{taskid}/summary`).
- [ADR-015 — Integración con BAW vía la API REST nativa (WLE)](../../../frontend/docs/adr/ADR-015-native-baw-wle-rest-api.md) (repo `frontend`).
- [API Standards — `api/CR-001`](../../../frontend/docs/standards/api.md) (repo `frontend`).
- [`portal-procesos-baw.md` — MD-01, MD-04](../technical-docs/portal-procesos-baw.md).
- [RS-001 — Viabilidad de `action=getData` de WLE como fuente de datos del formulario dinámico de tarea (US-007)](../../../archive/user-stories/US-007-reclamar-completar-tarea/research/RS-001-wle-getdata-formulario-dinamico/README.md) — actualización del 2026-09-15.
