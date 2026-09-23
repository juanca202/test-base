# RS-001 — Viabilidad de `action=getData` de WLE como fuente de datos del formulario dinámico de tarea (US-007)

**Estado:** Ready
**Flujo:** Analizar decisiones pendientes
**Artefacto referenciado:** US-007
**Creado por:** juanca202
**Fecha:** 2026-09-15

## Pregunta de investigación

¿`GET /rest/bpm/wle/v1/task/{id}?action=getData&fields=<nombre>` sirve como fuente de datos para pintar el formulario dinámico de tarea de US-007 (AC-002, MD-06), actualizando o confirmando la conclusión de RS-001 (`docs/specs/research/RS-001-detalle-tarea-wle`)?

## Contexto

US-007/AC-002 exige renderizar dinámicamente el formulario de la tarea a partir de los campos que retorna el servicio de tareas, "ya resueltos según el contrato de campo de formulario dinámico" (MD-06: `type`, `label`, `required`, `options`). La historia deja **explícitamente fuera de alcance** el mecanismo real de configuración por proceso en BAW que resolvería esos metadatos, y para esta implementación los simula con mocks (ver "Fuera de alcance" y "Observaciones" del `README.md` de US-007). TK-001 ya implementó ese renderizador sobre el mock (`Done`).

Por otro lado, ADR-015/`api/CR-001` (repo `frontend`) exige que ningún repository de datos BPM llame fuera de `/rest/bpm/wle/v1/*`. `TaskDetailRepository.findById`/`complete` siguen hoy sobre el contrato A (`/bpm/user-tasks/{id}`, API-06/API-08) — ver el comentario de `WLE_TASK_PATH` en `frontend/src/app/features/baw-processes/services/task-detail-repository.ts:18-24` — precisamente porque **RS-001** (`docs/specs/research/RS-001-detalle-tarea-wle/README.md`) investigó esto en 2026-09-15 y concluyó que `GET /rest/bpm/wle/v1/task/{tkiid}` (sin `action`) devuelve `data.variables` con las claves de la Coach pero **todos los valores en `null`**, y que no se llegó a probar ningún valor de `action`/`fields` que los poblara (hallazgo 3 y 4 de RS-001).

El usuario ejecutó en vivo `GET /rest/bpm/wle/v1/task/556?action=getData&fields=solicitud` contra `https://btq-srv-bawodm.bayteqec.local` (host distinto al de RS-001, `192.168.120.100:9443`) y obtuvo `200 OK`. Esta es exactamente la prueba que RS-001 dejó pendiente.

## Hallazgos

### 1. `action=getData&fields=<nombre>` sí devuelve valores — a diferencia de la llamada simple que probó RS-001

El body de la respuesta (aportado por el usuario) trae `data.result` (string JSON) y `data.resultMap.solicitud` con contenido real, no `null`:

```json
{
  "solicitud": {
    "id": "356",
    "deudor": {
      "cedula": "",
      "nombre": "",
      "apellido": "",
      "ingresos": 0.0,
      "egresos": 0.0,
      "@metadata": { "className": "Prospecto", "...": "..." }
    },
    "buro": {
      "score": "",
      "calificacion": "",
      "@metadata": { "className": "Buro", "...": "..." }
    },
    "precalificacion": {
      "color": "",
      "esPep": false,
      "esAML": false,
      "esLegal": false,
      "infraccion": "",
      "@metadata": { "className": "precalificacion", "...": "..." }
    },
    "@metadata": { "className": "SolicitudCredito", "...": "..." }
  }
}
```

Esto **actualiza el hallazgo 3 de RS-001**: sí existe una vía REST plana de WLE que devuelve el contenido de un Business Object de negocio para una tarea COACHFLOW — al menos para `solicitud`/`SolicitudCredito` en este ambiente —, contra lo que RS-001 había concluido con la llamada sin `action`.

Coincide además con el contrato oficial documentado por IBM para esta operación: `GET /rest/bpm/wle/v1/task/{taskId}?action=getData&fields=<lista separada por comas>`, con respuesta `{ result: "<string>", resultMap: {...} }`, uno de cuyos ejemplos oficiales es justo `fields=orderNumber,customerNumber,customerName` — nombres de variable de negocio, el mismo patrón que `fields=solicitud` [Task Instance Resource — GET (getData) Method](https://www.ibm.com/docs/SS8JB4/com.ibm.wbpm.ref.doc/rest/bpmrest/rest_bpm_wle_v1_task_taskid_get_getdata.htm).

### 2. `solicitud` es un Business Object compuesto y anidado, no una lista plana de campos

La respuesta trae `solicitud` como un objeto con `id` y tres sub-objetos de negocio propios — `deudor` (`Prospecto`), `buro` (`Buro`) y `precalificacion` — cada uno con sus propios campos primitivos y su propio bloque `@metadata` (`objectID`, `dirty`, `invalid`, `shared`, `rootVersionContextID`, `className`, `contentObject`, `supportsAdditionalProperties`). Es más profundo que el `data_object[]` plano `{ name, data }` que documenta MD-06 para el contrato A: mapear esto a `TaskFormField[]` (modelo de TK-001, `frontend/src/app/features/baw-processes/models/task-form-field.ts`) exigiría aplanar tres niveles y descartar el `@metadata` técnico, con lógica específica del Business Object `SolicitudCredito` de este proceso — no algo genérico reutilizable para otro proceso.

### 3. Ningún metadato de presentación (MD-06) viaja en esta respuesta — la misma laguna que el contrato A, ahora confirmada también en WLE

`@metadata` es información de control del objeto (versionado, estado `dirty`/`invalid`, tipo de clase), no de presentación: no hay `type` de campo UI, `label`, `required` ni `options`. Por ejemplo, `precalificacion.color` es una cadena vacía que probablemente representa un semáforo (una lista cerrada de valores, como "verde"/"amarillo"/"rojo"), pero la respuesta no declara esa lista en ningún punto; `esPep`/`esAML`/`esLegal` son booleanos sin etiqueta asociada. Esto es consistente con la documentación pública de IBM: la operación `getData` únicamente expone valores de variables, nunca metadatos de presentación — no hay ninguna acción del recurso `task` (`getData`, `setData`, `start`, `assign*`, `updateDueDate`, `updatePriority`, `finish`/`complete`, `cancel`) que devuelva esquema de Coach o de Business Object ([REST interface for BPD-related resources — Service Resource](https://www.ibm.com/docs/en/bpm/8.5.6?topic=service-get-getdata); listado de operaciones del recurso `task` en [ibpm-remote/bpm-api-docs](https://github.com/sammich/ibpm-remote/blob/master/generated/bpm-api-docs-8.6.0.0.md)).

Esto **extiende a la familia WLE** la conclusión ya "Confirmada" en `portal-procesos-baw.md` (MD-06) para el contrato A: _"BAW no expone el esquema del Coach... no hay tipo declarado, ni etiqueta, ni obligatoriedad, ni lista de opciones, ni orden, ni agrupación"_. No es una limitación de qué endpoint o familia se llama, sino del propio producto BAW/WLE.

### 4. Todos los valores observados están vacíos/por defecto — la evidencia no confirma aún que `getData` devuelva datos realmente diligenciados

`cedula`, `nombre`, `apellido`, `score`, `calificacion`, `color`, `infraccion` llegan como `""`; `ingresos`/`egresos` como `0.0`; `esPep`/`esAML`/`esLegal` como `false`. Son valores por defecto de un Business Object recién inicializado, no necesariamente `null` (a diferencia del hallazgo de RS-001), pero tampoco hay evidencia todavía de que la tarea `556` tenga un `solicitud` con datos reales capturados por un usuario. La documentación oficial de IBM lo anticipa: _"If the task has not been started, the default values of the fields are displayed"_. Falta repetir la prueba contra una tarea con `solicitud` ya diligenciada para confirmar que `getData` también expone valores capturados, no solo la forma vacía inicial del BO.

### 5. El ambiente de esta prueba no es el mismo que el de RS-001

RS-001 se ejecutó contra `https://192.168.120.100:9443` (usuario `juancarlos.altamirano`, tareas `478/480/481/484/485`, todas `serviceType: COACHFLOW`). Esta prueba se ejecutó contra `https://btq-srv-bawodm.bayteqec.local` (tarea `556`). Son hosts distintos — no se puede confirmar que ambos sean la misma instalación de BAW ni la misma versión; se anota como variable no controlada, aunque el comportamiento observado (contrato `result`/`resultMap`, forma del Business Object) es consistente con la documentación oficial de la plataforma en general, no específico de un ambiente.

## Decisiones pendientes / opciones evaluadas

- **¿Adoptar `action=getData&fields=<BO>` como la vía WLE para los valores del formulario dinámico, avanzando el punto 14 (`api/CR-001`) de `portal-procesos-baw.md`?** — opciones: (A) migrar ya `TaskDetailRepository` para traer los valores por esta vía; (B) confirmarla como candidato válido para los _valores_, pero no migrar hasta resolver aparte la falta de metadatos de presentación — la misma "configuración por proceso" que US-007 ya declaró fuera de alcance; (C) descartarla. **Recomendación: (B).** La llamada es viable técnicamente para obtener valores, pero por sí sola no resuelve MD-06 (sigue faltando `type`/`label`/`required`/`options`), que es la razón real por la que US-007 usa mocks hoy. Migrar solo la fuente de valores sin resolver la metadata dejaría el mismo problema sin cerrar, y sumaría el costo de aplanar a mano un Business Object anidado específico del proceso (`SolicitudCredito`).
- **¿Actualizar RS-001 con esta evidencia?** — opciones: (A) sí, añadir esta prueba como addendum/nueva sección a RS-001, que es la investigación "dueña" de la pregunta de migrar detalle de tarea a WLE y a la que ya referencia el código (`task-detail-repository.ts`); (B) dejar este RS como referencia separada. **Recomendación: (A)** — evita tener dos fuentes de verdad sobre el mismo tema.

## Conclusión y recomendación

**Parcialmente sí, pero no resuelve por sí sola el problema de pintar el formulario dinámico de US-007.** `action=getData&fields=<nombre>` es una vía WLE real y ahora confirmada para obtener los **valores** de un Business Object de negocio (aquí `solicitud`) — algo que RS-001 no había logrado con la llamada simple sin `action`. Pero, por diseño de la API — confirmado tanto por la documentación pública de IBM como por la forma de esta respuesta real —, esta operación **nunca** entrega metadatos de presentación (tipo de campo UI, etiqueta, obligatoriedad, opciones de una lista, agrupación u orden), que es exactamente la pieza que MD-06 necesita y que AC-002 de US-007 decidió mockear mientras no se resuelva "el mecanismo real de configuración por proceso" (ver "Fuera de alcance" del `README.md` de US-007). Además, `solicitud` llega como un objeto anidado con sub-objetos propios (`deudor`, `buro`, `precalificacion`) y bloques `@metadata` técnicos a descartar, así que mapearlo a `TaskFormField[]` exigiría lógica de aplanado específica de `SolicitudCredito`, no genérica.

**No se recomienda usar esta llamada para cerrar AC-002 de US-007 tal como está planteada la historia** (ya `Done`, con mocks por decisión deliberada). **Sí se recomienda conservarla como evidencia confirmada** para el trabajo futuro ya anotado en las Observaciones de US-007 y en el punto 14 de `portal-procesos-baw.md`: cuando se diseñe el mecanismo real de configuración por proceso, `action=getData&fields=<BO>` es el candidato confirmado para la parte de "traer los valores actuales", combinado con una configuración de metadatos de presentación mantenida por el portal — el mismo cierre que MD-06 ya recomienda para el contrato A.

**Información adicional necesaria para cerrar del todo el hallazgo 4:** repetir la llamada contra una tarea cuyo `solicitud` tenga datos realmente capturados (no vacíos por defecto), para confirmar que `getData` también expone valores ya diligenciados y no solo la forma vacía inicial del Business Object.

## Impacto en el artefacto / próximo paso

US-007 está `Done` y AC-002 ya se implementó (TK-001) sobre mocks, por una decisión de alcance ya tomada y documentada ("Fuera de alcance"/"Observaciones" del `README.md` de US-007). Este hallazgo **no reabre ni bloquea** nada de lo ya entregado. Es insumo para:

- **Actualizar RS-001** (`docs/specs/research/RS-001-detalle-tarea-wle/README.md`) con esta evidencia sobre `action=getData`, que contradice parcialmente su hallazgo 3 — vía una investigación de seguimiento (flujo Investigación libre, ya que RS-001 no tiene artefacto vinculado) o edición manual.
- **Servir de referencia técnica** para cuando se planifique el "mecanismo real de configuración por proceso" mencionado en Observaciones de US-007, y para avanzar el punto 14 (`api/CR-001`, hoy `Pending` en `frontend/docs/standards/api.md`) de `portal-procesos-baw.md`.

## Fuentes

- [Task Instance Resource — GET (getData) Method (IBM Documentation)](https://www.ibm.com/docs/SS8JB4/com.ibm.wbpm.ref.doc/rest/bpmrest/rest_bpm_wle_v1_task_taskid_get_getdata.htm) — contrato oficial de `action=getData`, consultado 2026-09-15.
- [REST interface for BPD-related resources — Service Resource — GET (getData) Method (IBM Documentation)](https://www.ibm.com/docs/en/bpm/8.5.6?topic=service-get-getdata) — consultado 2026-09-15.
- [ibpm-remote/generated/bpm-api-docs-8.6.0.0.md](https://github.com/sammich/ibpm-remote/blob/master/generated/bpm-api-docs-8.6.0.0.md) — listado de operaciones del recurso `task` de WLE, consultado 2026-09-15.
- `docs/specs/research/RS-001-detalle-tarea-wle/README.md` — investigación previa directamente relacionada.
- `docs/specs/user-stories/US-007-reclamar-completar-tarea/README.md` — artefacto referenciado (AC-002, Fuera de alcance, Observaciones).
- `docs/specs/technical-docs/portal-procesos-baw.md` — MD-06, Observaciones puntos 4 y 14.
- `frontend/src/app/features/baw-processes/services/task-detail-repository.ts` — comentario de `WLE_TASK_PATH` que referencia RS-001.
- `frontend/docs/adr/ADR-015-native-baw-wle-rest-api.md` y `frontend/docs/standards/api.md` (`api/CR-001`).
- Ejecución en vivo aportada por el usuario: `GET https://btq-srv-bawodm.bayteqec.local/rest/bpm/wle/v1/task/556?action=getData&fields=solicitud`, `200 OK`, 2026-09-15.
