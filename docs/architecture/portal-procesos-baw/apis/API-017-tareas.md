# API-017: Tareas

Grupo de operaciones de la capability [portal-procesos-baw](../README.md). Los identificadores `API-01`…`API-14` de los encabezados son los de la estructura anterior (archivo único), conservados porque el texto los cita.

| Operación                                    | Método y ruta                             | Ancla                                                                          |
| -------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| API-05: Listar tareas del usuario (Obsoleto) | `GET /bpm/user-tasks`                     | [#get-bpm-user-tasks](#get-bpm-user-tasks)                                     |
| API-06: Obtener el detalle de una tarea      | `GET /bpm/user-tasks/{task_id}`           | [#get-bpm-user-tasks-task-id](#get-bpm-user-tasks-task-id)                     |
| API-07: Reclamar una tarea                   | `POST /bpm/user-tasks/{task_id}/claim`    | [#post-bpm-user-tasks-task-id-claim](#post-bpm-user-tasks-task-id-claim)       |
| API-08: Completar una tarea                  | `POST /bpm/user-tasks/{task_id}/complete` | [#post-bpm-user-tasks-task-id-complete](#post-bpm-user-tasks-task-id-complete) |
| API-13: Buscar tareas del usuario (WLE)      | `PUT /rest/bpm/wle/v1/tasks`              | [#put-rest-bpm-wle-tasks](#put-rest-bpm-wle-tasks)                             |

<a id="get-bpm-user-tasks"></a>
<a id="api-05"></a>

## API-05: Listar tareas del usuario (Obsoleto)

> ⚠️ **Obsoleto desde 2026-09-14. Reemplazado por [API-13](#put-rest-bpm-wle-tasks)** (`PUT /rest/bpm/wle/v1/tasks`) para el listado de «Mis tareas». Se conserva porque tiene consumidores que aún lo referencian y porque su contrato sigue siendo la explicación de por qué este documento decía antes que los agregados de SLA no existían ([MD-05](../models/MD-05-resumen-sla-lista-tareas.md)). **No implementar contra este endpoint**: `api/CR-001` de ADR-015 prohíbe llamar a datos BPM fuera de `/rest/bpm/wle/v1/*`.
>
> Además del criterio de arquitectura, hay un defecto funcional verificado en vivo: **este endpoint no acota el resultado al usuario autenticado**. Para el usuario de sesión devolvió tareas de otros usuarios y equipos. El diagnóstico y la decisión están en ADR-015; aquí solo consta que el contrato de abajo describe un endpoint que no debe usarse.

- **Método y ruta:** `GET /bpm/user-tasks` — `operationId: getUserTasksList`
- **Autenticación:** Cookie de sesión + `BPMCSRFToken`. **Autorización: administrador de BAW, propietario de la tarea, o propietario potencial de tareas no reclamadas** — cubre al usuario final.
- **Descripción:** Lista las tareas que el usuario puede ver (FR-002, FR-003, FR-009).
- **Estado de validación: Confirmado** como contrato declarado; **descartado para uso** (ver aviso).

**Request**

| Parámetro      | Ubicación | Tipo         | Requerido | Descripción                                                                  |
| -------------- | --------- | ------------ | --------- | ---------------------------------------------------------------------------- |
| BPMCSRFToken   | header    | string       | **Sí**    | Token anti-CSRF                                                              |
| states         | query     | enum[]       | No        | `claimed`, `ready`, `completed`, `terminated`, `suspended`                   |
| model          | query     | string       | No        | Filtra por modelo de proceso                                                 |
| process_id     | query     | string       | No        | Filtra por instancia                                                         |
| sort           | query     | enum[]       | No        | `creation_time:asc\|desc`, `completion_time:asc\|desc`, `due_date:asc\|desc` |
| offset         | query     | string       | No        | Posición de la primera tarea                                                 |
| size           | query     | integer (≥1) | No        | Máximo de tareas a devolver                                                  |
| optional_parts | query     | enum[]       | No        | `data`, `actions`, `team_details`, `container_data`                          |

**Responses**

| Código | Condición        | Cuerpo                                                                                         |
| ------ | ---------------- | ---------------------------------------------------------------------------------------------- |
| 200    | Listado obtenido | `user_tasks` = `{ user_task_instances[] ([MD-04](../models/MD-04-tarea.md)), previous, next }` |

> **La paginación y el orden son de servidor** (`offset`/`size`/`sort`, más las URLs `previous`/`next`), lo que permitía cumplir NFR-003 sin traerlo todo. Para el listado había que pedir `optional_parts=team_details` (columna «equipo»); **no** pedir `data` en el listado, que es pesado y solo hace falta en el detalle.
>
> **No existía búsqueda por texto para tareas en esta familia.** `GET /bpm/processes` sí tiene `search_term`; `GET /bpm/user-tasks` **no**. De ahí venía la restricción de FR-009 a búsqueda en cliente sobre la página cargada. WLE introduce `conditions` con operadores, que podría levantar esa restricción — **sin verificar**, ver [API-13](#put-rest-bpm-wle-tasks) y [Observaciones](../README.md#observaciones), punto 9.

<a id="get-bpm-user-tasks-task-id"></a>
<a id="api-06"></a>

## API-06: Obtener el detalle de una tarea

- **Método y ruta:** `GET /bpm/user-tasks/{task_id}` — `operationId: getUserTask`
- **Autenticación:** Cookie de sesión + `BPMCSRFToken`. **Autorización:** administrador, administrador de process app, propietario de la instancia, gestor del equipo, propietario o propietario potencial de la tarea, colaborador.
- **Descripción:** Devuelve la tarea con sus variables y las operaciones disponibles. Fuente del formulario dinámico (FR-004).
- **Estado de validación: Confirmado.**

**Request**

| Parámetro      | Ubicación | Tipo   | Requerido | Descripción                                                                                          |
| -------------- | --------- | ------ | --------- | ---------------------------------------------------------------------------------------------------- |
| BPMCSRFToken   | header    | string | **Sí**    | Token anti-CSRF                                                                                      |
| task_id        | path      | string | **Sí**    | Identificador de la tarea                                                                            |
| optional_parts | query     | enum[] | No        | `data`, `actions`, `team_details`, `container_data` — el portal pide **`data,actions,team_details`** |

**Responses**

| Código | Condición                     | Cuerpo                                                                                                                                                                                          |
| ------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200    | Detalle obtenido              | `user_task` ([MD-04](../models/MD-04-tarea.md)), con `input`/`output`/`internal` → [MD-06](../models/MD-06-campo-formulario-dinamico.md) y `actions` → [MD-07](../models/MD-07-accion-tarea.md) |
| 403    | No autorizado sobre esa tarea | `exception` ([MD-11](../models/MD-11-error-api-baw.md))                                                                                                                                         |
| 404    | Tarea inexistente             | `exception`                                                                                                                                                                                     |

> Sin `optional_parts` la respuesta **no trae variables ni acciones**, y el formulario quedaría vacío. `input`, `output` e `internal` llegan como arrays separados de `data_object`: el motor debe decidir cuáles renderiza y cuáles devuelve en `output` al completar ([API-08](#post-bpm-user-tasks-task-id-complete)).

<a id="post-bpm-user-tasks-task-id-claim"></a>
<a id="api-07"></a>

## API-07: Reclamar una tarea

- **Método y ruta:** `POST /bpm/user-tasks/{task_id}/claim` — `operationId: claimUserTask`
- **Autenticación:** Cookie de sesión + `BPMCSRFToken`. **Autorización: propietario potencial, solo si la tarea no tiene propietario asignado.**
- **Descripción:** Asigna la tarea al usuario autenticado (FR-003).
- **Estado de validación: Confirmado.**

**Request**

| Parámetro      | Ubicación | Tipo   | Requerido | Descripción                                         |
| -------------- | --------- | ------ | --------- | --------------------------------------------------- |
| BPMCSRFToken   | header    | string | **Sí**    | Token anti-CSRF                                     |
| task_id        | path      | string | **Sí**    | Identificador de la tarea                           |
| optional_parts | query     | enum[] | No        | `data`, `actions`, `team_details`, `container_data` |

**Responses**

| Código  | Condición                         | Cuerpo                                                                                           |
| ------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| 200     | Tarea reclamada                   | `user_task` ([MD-04](../models/MD-04-tarea.md)) con `owner` = usuario actual y `state = claimed` |
| **409** | **Ya reclamada por otro usuario** | `exception` ([MD-11](../models/MD-11-error-api-baw.md))                                          |
| 403     | No es propietario potencial       | `exception`                                                                                      |

> Pedir `optional_parts=data,actions` aquí **ahorra una llamada**: el reclamo devuelve la tarea completa, así que no hace falta repetir [API-06](#get-bpm-user-tasks-task-id) después.
>
> **La carrera por reclamar es esperable**, no excepcional: dos usuarios del mismo equipo abren la misma tarea. El 409 se trata como caso normal — mensaje claro y refresco del listado. Ver [FL-03](../flows/FL-03-reclamar-completar-tarea-formulario-dinamico.md).

<a id="post-bpm-user-tasks-task-id-complete"></a>
<a id="api-08"></a>

## API-08: Completar una tarea

- **Método y ruta:** `POST /bpm/user-tasks/{task_id}/complete` — `operationId: completeUserTask`
- **Autenticación:** Cookie de sesión + `BPMCSRFToken`. **Autorización: administrador, administrador de process app, propietario de la instancia o propietario de la tarea** (hay que haber reclamado antes).
- **Descripción:** Envía los valores del formulario y cierra la tarea (FR-004, FR-005).
- **Estado de validación: Confirmado** en el contrato; **Confirmado (ausente)** en el comentario.

**Request**

| Parámetro      | Ubicación | Tipo                                   | Requerido | Descripción                                                |
| -------------- | --------- | -------------------------------------- | --------- | ---------------------------------------------------------- |
| BPMCSRFToken   | header    | string                                 | **Sí**    | Token anti-CSRF                                            |
| task_id        | path      | string                                 | **Sí**    | Identificador de la tarea                                  |
| output         | body      | `output` = `{ output: data_object[] }` | No        | Variables de salida. Cada `data_object` = `{ name, data }` |
| optional_parts | query     | enum[]                                 | No        | `data`, `actions`, `team_details`, `container_data`        |

```json
{
  "output": [
    { "name": "montoSolicitado", "data": 15000 },
    { "name": "observaciones", "data": "Documentación completa" },
    { "name": "decision", "data": "approve" }
  ]
}
```

**Responses**

| Código | Condición                                 | Cuerpo                                                                  |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| 200    | Tarea completada                          | `user_task` ([MD-04](../models/MD-04-tarea.md)) con `state = completed` |
| 403    | La tarea no está reclamada por el usuario | `exception` ([MD-11](../models/MD-11-error-api-baw.md))                 |
| 409    | Conflicto (p. ej. ya completada)          | `exception`                                                             |

> **La decisión de negocio viaja como una variable más de `output`**, tal como `decision` en el ejemplo. El nombre de esa variable y sus valores admitidos **son específicos de cada proceso** y el portal debe conocerlos por configuración ([MD-07](../models/MD-07-accion-tarea.md)).
>
> **Confirmado: no existe forma de adjuntar un comentario.** El cuerpo admite exclusivamente `output` con `data_object`, y no hay ninguna ruta REST de comentarios en las siete operaciones (pese a que el enum `process_action` incluya `comment`). Por tanto **FR-005 no es implementable como comentario nativo de BAW**. Alternativas: (a) enviar el comentario como una variable de negocio del proceso, si el proceso define una —lo que exige configuración por proceso y **no** equivale al historial de comentarios de BAW—; (b) buscarlo en la familia clásica; (c) recortar FR-005. FR-005 ya condicionaba su enunciado a «cuando la API de BAW lo soporte»: **no lo soporta**.
>
> **BR-01 se valida antes de llamar:** si la acción elegida es de rechazo y el comentario está vacío, el portal no emite la petición. Depende de que `isRejection` esté configurado ([MD-07](../models/MD-07-accion-tarea.md)).

<a id="put-rest-bpm-wle-tasks"></a>
<a id="api-13"></a>

## API-13: Buscar tareas del usuario (WLE)

- **Método y ruta:** `PUT /rest/bpm/wle/v1/tasks`
- **Autenticación:** cookies de sesión ya emitidas por [API-01](API-015-autenticacion.md#post-bpm-system-login) (`JSESSIONID`, `LtpaToken2`) + cookie `XSRF-TOKEN` reenviada en la cabecera **`x-xsrf-token`**. **No lleva `BPMCSRFToken`.** El modelo completo es materia de ADR-015 y de `api/CR-003` en `frontend/docs/standards/api.md`.
- **Descripción:** Busca tareas con criterios, orden y paginación de servidor, y **devuelve además los agregados de SLA calculados en el servidor** ([MD-05](../models/MD-05-resumen-sla-lista-tareas.md)). **Reemplaza a [API-05](#get-bpm-user-tasks)** para el listado de «Mis tareas» (FR-002, FR-003, FR-009).
- **Estado de validación: Confirmado** — petición y respuesta capturadas en ejecución real el 2026-09-14 contra `https://192.168.120.100:9443` con el usuario `juancarlos.altamirano`.

> **Es un `PUT` que no muta nada.** La búsqueda es una lectura, pero viaja como `PUT` porque los criterios van en el cuerpo. Tiene dos consecuencias operativas: **no se puede cachear** como un `GET`, y **cualquier interceptor o guardia que trate los verbos de escritura de forma especial** (confirmaciones de salida, reintentos deshabilitados, indicadores de «guardando») tratará esta lectura como una escritura si discrimina por verbo. Discriminar por ruta, no por método.

**Request**

| Parámetro               | Ubicación | Tipo                           | Requerido | Descripción                                                                                                                                                                                                                                                                                       |
| ----------------------- | --------- | ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| x-xsrf-token            | header    | string                         | **Sí**    | Valor de la cookie `XSRF-TOKEN`                                                                                                                                                                                                                                                                   |
| Content-Type            | header    | string                         | **Sí**    | `application/json;charset=UTF-8`                                                                                                                                                                                                                                                                  |
| calcStats               | query     | boolean                        | No        | **`true` es lo que hace aparecer el bloque `stats`** ([MD-05](../models/MD-05-resumen-sla-lista-tareas.md)). Sin él no hay agregados                                                                                                                                                              |
| usersFullName           | query     | boolean                        | No        | Pide los nombres completos de usuario en lugar de los identificadores                                                                                                                                                                                                                             |
| avoidBasicAuthChallenge | query     | boolean                        | No        | Evita que un rechazo de autenticación devuelva `WWW-Authenticate` y el navegador abra su diálogo nativo de Basic. **Relevante para una SPA**: sin él, una sesión caída saca un diálogo del navegador en vez de dejar que [FL-02](../flows/FL-02-expiracion-sesion-durante-uso.md) maneje el error |
| **offset**              | **query** | integer                        | No        | Posición de la primera tarea. **Va en la query string, NO en el cuerpo** — ver el aviso de abajo. Verificado en vivo: `offset=2` devuelve `{"offset":2,"size":2,"requestedSize":2,"totalCount":5}` con las tareas 3.ª y 4.ª por vencimiento                                                       |
| organization            | body      | string                         | **Sí**    | Agrupación del resultado. Valor usado: `"byTask"`                                                                                                                                                                                                                                                 |
| shared                  | body      | boolean                        | **Sí**    | Si la búsqueda es una búsqueda guardada compartida. Valor usado: `false`                                                                                                                                                                                                                          |
| teams                   | body      | string[]                       | **Sí**    | Equipos por los que acotar. Valor usado: `[]` (sin acotar)                                                                                                                                                                                                                                        |
| **interaction**         | body      | string                         | **Sí**    | **El parámetro que resuelve el scoping por usuario.** Valor usado: `"claimed_and_available"` — tareas reclamadas por el usuario de sesión más las disponibles para él. Otros valores **sin confirmar**                                                                                            |
| conditions              | body      | `{ field, operator, value }[]` | **Sí**    | Criterios de filtrado. Valor usado: `[{ "field": "taskActivityType", "operator": "Equals", "value": "USER_TASK" }]` — solo tareas humanas. Catálogo de `field` y de `operator` **sin confirmar**: solo se probó `Equals`                                                                          |
| fields                  | body      | string[]                       | **Sí**    | Columnas a devolver, por alias en `camelCase`. Ver la correspondencia alias → clave de respuesta en [MD-04](../models/MD-04-tarea.md)                                                                                                                                                             |
| sort                    | body      | `{ field, order }[]`           | **Sí**    | Orden de servidor. Valor usado: `[{ "field": "taskDueDate", "order": "ASC" }]`. `order` admite `"ASC"`; `"DESC"` **sin probar**                                                                                                                                                                   |
| aliases                 | body      | string[]                       | **Sí**    | Alias de columnas calculadas. Valor usado: `[]`                                                                                                                                                                                                                                                   |
| size                    | body      | integer                        | **Sí**    | Tamaño de página. Valor usado: `25`                                                                                                                                                                                                                                                               |

> ⚠️ **`size` va en el cuerpo y `offset` en la query. No son simétricos, y confundirlos rompe la petición entera.** Enviar `offset` dentro del cuerpo devuelve **400 `CWTBG0618E`**: _«Unrecognized field "offset" (class SavedSearchDefinition), not marked as ignorable»_. Es el error más fácil de cometer al implementar la paginación, porque la intuición dice que los dos parámetros de página viajan juntos.
>
> **El cuerpo es un `SavedSearchDefinition` con exactamente 12 propiedades**, enumeradas por el propio mensaje de error: `size`, `interaction`, `owner`, `shared`, `teams`, `conditions`, `fields`, `id`, `aliases`, `organization`, `name`, `sort`. **Cualquier propiedad fuera de esa lista hace fallar la petición con 400** — el objeto no ignora lo desconocido. Tres de ellas no se han usado ni validado y no se documentan como parámetros arriba: **`owner`** (semántica sin confirmar; posible filtro por propietario — ver [Observaciones](../README.md#observaciones), punto 15), **`id`** y **`name`**, que por el nombre de la clase parecen servir para persistir o recuperar la búsqueda como _búsqueda guardada_, junto con el `shared` que sí usamos.

```json
{
  "organization": "byTask",
  "shared": false,
  "teams": [],
  "sort": [{ "field": "taskDueDate", "order": "ASC" }],
  "conditions": [
    { "field": "taskActivityType", "operator": "Equals", "value": "USER_TASK" }
  ],
  "fields": [
    "taskSubject",
    "instanceName",
    "taskStatus",
    "taskPriority",
    "taskDueDate",
    "assignedToRoleDisplayName",
    "taskClosedDate",
    "taskIsAtRisk"
  ],
  "aliases": [],
  "interaction": "claimed_and_available",
  "size": 25
}
```

**Segunda página** — mismo cuerpo, sin tocar, y el desplazamiento en la query:

```
PUT /rest/bpm/wle/v1/tasks?calcStats=true&usersFullName=true&avoidBasicAuthChallenge=true&offset=2
```

**Responses**

| Código    | Condición                                              | Cuerpo                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **200**   | Búsqueda ejecutada                                     | Sobre de WLE (tabla de abajo). **Una búsqueda sin coincidencias también es 200**, con `items: []` y `totalCount: 0` — no es un error                                                                      |
| **400**   | Propiedad no reconocida en el cuerpo (p. ej. `offset`) | `error_number: CWTBG0618E`, con el mensaje enumerando las 12 propiedades válidas de `SavedSearchDefinition`                                                                                               |
| 401 / 403 | Sesión caída o `x-xsrf-token` ausente o inválido       | **Forma del cuerpo sin verificar**: no se provocó ninguno de estos dos errores contra esta familia. Ver [MD-11](../models/MD-11-error-api-baw.md) y [Observaciones](../README.md#observaciones), punto 18 |

**Sobre de la respuesta** — el contenido útil **no está en la raíz**, sino bajo `data`:

| Campo                     | Tipo       | Descripción                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`                  | **string** | Código HTTP repetido en el cuerpo. **Es cadena, no número**: `"200"`. No usarlo como fuente de verdad; el estado real es el de la respuesta HTTP                                                                                                                                                                                                          |
| `data.identifier`         | string     | Clave primaria de cada fila de `items`. Valor observado: `"TASK.TKIID"`                                                                                                                                                                                                                                                                                   |
| `data.offset`             | integer    | Posición de la primera fila devuelta; refleja el `offset` de la query                                                                                                                                                                                                                                                                                     |
| `data.size`               | integer    | Filas **efectivamente devueltas** en `items`                                                                                                                                                                                                                                                                                                              |
| `data.requestedSize`      | integer    | El `size` pedido en el cuerpo (página 1: `size: 25` → `requestedSize: 25`). **No usarlo para decidir si hay página siguiente**: las dos capturas disponibles no bastan para distinguir «lo pedido» de «lo disponible desde `offset`», porque en la segunda coincide con el número de filas devueltas. La condición fiable es `offset + size < totalCount` |
| `data.totalCount`         | integer    | Coincidencias totales del criterio, **no de la página**. Truncado por `countLimit`                                                                                                                                                                                                                                                                        |
| `data.countLimit`         | integer    | Tope de conteo del servidor. Valor observado: `500`                                                                                                                                                                                                                                                                                                       |
| `data.countLimitExceeded` | boolean    | `true` si las coincidencias superan `countLimit`, y entonces `totalCount` está truncado                                                                                                                                                                                                                                                                   |
| `data.items`              | objeto[]   | Las tareas, en el contrato B de [MD-04](../models/MD-04-tarea.md)                                                                                                                                                                                                                                                                                         |
| `data.stats`              | objeto     | Agregados de SLA ([MD-05](../models/MD-05-resumen-sla-lista-tareas.md)). **Solo con `calcStats=true`**                                                                                                                                                                                                                                                    |

```json
{
  "status": "200",
  "data": {
    "identifier": "TASK.TKIID",
    "offset": 0,
    "size": 5,
    "requestedSize": 25,
    "totalCount": 5,
    "countLimitExceeded": false,
    "countLimit": 500,
    "items": [
      {
        "TASK.TKIID": "478",
        "PROCESS_INSTANCE.PIID": "274",
        "STATE": "STATE_READY",
        "DUE": "2026-09-08T21:47:35Z",
        "PRIORITY": 30,
        "ASSIGNED_TO_ROLE_DISPLAY_NAME": "Analistas",
        "STATUS": "Received",
        "IS_AT_RISK": true,
        "KIND": "KIND_PARTICIPATING",
        "TAD_DISPLAY_NAME": "Aprobar Credito",
        "PI_NAME": "Solicitar Credito:274",
        "COMPLETED": null
      }
    ],
    "stats": { "total": 5, "open": 5, "onTrack": 0, "atRisk": 0, "overdue": 5 }
  }
}
```

> **Una sola llamada cubre el listado completo de «Mis tareas».** Devuelve a la vez la página de tareas, el equipo asignado por tarea (sin el `optional_parts=team_details` que exigía [API-05](#get-bpm-user-tasks)), el total real del conjunto y los agregados de SLA. Donde [API-05](#get-bpm-user-tasks) obligaba a elegir entre exactitud y NFR-003, aquí no hay disyuntiva.
>
> **El scoping por usuario lo hace `interaction`, no un filtro de `conditions`.** No hay que añadir una condición por nombre de usuario: `"claimed_and_available"` ya acota al usuario de sesión. Filtrar además por usuario en `conditions` sería redundante y acoplaría el listado al identificador de sesión.
>
> **La búsqueda por texto de FR-009 podría pasar a ser de servidor.** `conditions` acepta `operator`, y un operador de coincidencia parcial la haría de servidor, eliminando la limitación «solo sobre la página cargada» que arrastraba [API-05](#get-bpm-user-tasks). **No se ha probado ningún operador distinto de `Equals`**: mientras no se valide, FR-009 mantiene su alcance de cliente. Ver [Observaciones](../README.md#observaciones), punto 9.
