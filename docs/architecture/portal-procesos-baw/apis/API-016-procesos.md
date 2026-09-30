# API-016: Procesos

Grupo de operaciones de la capability [portal-procesos-baw](../README.md). Los identificadores `API-01`…`API-14` de los encabezados son los de la estructura anterior (archivo único), conservados porque el texto los cita.

| Operación                                      | Método y ruta                                                                          | Ancla                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| API-03: Listar procesos iniciables             | `GET /rest/bpm/wle/v1/exposed/process`                                                 | [#get-rest-bpm-wle-exposed-process](#get-rest-bpm-wle-exposed-process) |
| API-04: Iniciar una instancia de proceso       | `POST /bpm/processes`                                                                  | [#post-bpm-processes](#post-bpm-processes)                             |
| API-09: Listar instancias de proceso           | `GET /bpm/processes`                                                                   | [#get-bpm-processes](#get-bpm-processes)                               |
| API-12: Obtener el diagrama del proceso        | **No existe**                                                                          | [#no-existe-diagrama-proceso](#no-existe-diagrama-proceso)             |
| API-14: Iniciar una instancia de proceso (WLE) | `POST /rest/bpm/wle/v1/process?action=start&bpdId={bpdId}&processAppId={processAppId}` | [#post-rest-bpm-wle-process](#post-rest-bpm-wle-process)               |

<a id="get-rest-bpm-wle-exposed-process"></a>
<a id="api-03"></a>

## API-03: Listar procesos iniciables

- **Método y ruta:** `GET /rest/bpm/wle/v1/exposed/process` (familia WLE clásica; recurso real: `GET /rest/bpm/wle/v1/exposed/{type}` con `type=process`)
- **Autenticación:** cookies de sesión (`JSESSIONID`, `LtpaToken2`) emitidas por [API-01](API-015-autenticacion.md#post-bpm-system-login). **No exige `x-xsrf-token`** — a diferencia de [API-13](API-017-tareas.md#put-rest-bpm-wle-tasks), esta operación es un `GET` real y no pasa por la protección CSRF de escritura. Sin sesión responde `401` con `WWW-Authenticate: Basic realm="BPMRESTAPI"`, igual que la familia `/bpm/`.
- **Descripción:** Lista los procesos que el usuario autenticado puede iniciar (FR-001), ya resueltos por la autorización _Expose to start_ del lado de BAW.
- **Estado de validación: Confirmado** — ejecución real contra `https://192.168.120.100:9443` el 2026-09-15, detalle completo en [RS-002](../../../specs/archived/research/RS-002-procesos-iniciables-wle/README.md).

**Request**

| Parámetro                                            | Ubicación | Tipo    | Requerido | Descripción                                                                                                                                                                                                                       |
| ---------------------------------------------------- | --------- | ------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| includeDescription                                   | query     | boolean | No        | Si `true`, popula `itemDescription` (verificado: sin él, siempre `null`)                                                                                                                                                          |
| filterByName                                         | query     | string  | No        | Filtra por `display`. **Coincidencia exacta y sensible a mayúsculas** — verificado con 8 valores distintos; no sirve como búsqueda de texto libre                                                                                 |
| excludeProcessStartUrl                               | query     | boolean | No        | Si `true`, anula `branchID`, `branchName` y `startURL` en la respuesta                                                                                                                                                            |
| forUser                                              | query     | string  | No        | Consulta el catálogo de otro usuario. Con un valor que no es un usuario real del directorio, responde `400 CWTBG0012E`. **Sin probar con un usuario válido distinto** — semántica y nivel de autorización requerido sin confirmar |
| includeNonStartBPDs                                  | query     | boolean | No        | Probado con y sin el parámetro: mismo resultado en este ambiente — **no concluyente**, no hay ningún BPD "no arrancable" con el que distinguir el efecto                                                                          |
| includeServiceSubtypes, excludeReferencedFromToolkit | query     | —       | No        | Declarados en el WADL del recurso; sin probar                                                                                                                                                                                     |

**Responses**

| Código  | Condición                                                        | Cuerpo                                                                                                                                                                           |
| ------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **200** | Catálogo obtenido                                                | `{ status, data: { exposedItemsList: [ ] } }` — un array de [MD-02](../models/MD-02-proceso-iniciable.md); `exposedItemsList: null` si `filterByName` no encuentra coincidencias |
| 401     | Sin sesión                                                       | `WWW-Authenticate: Basic realm="BPMRESTAPI"`                                                                                                                                     |
| 400     | Parámetro inválido (p. ej. `forUser` con un usuario inexistente) | `{ status: "error", Data: { exceptionType, errorNumber, errorMessage } }` — mismo estilo `CWTBG…` que [MD-11](../models/MD-11-error-api-baw.md)                                  |

```json
{
  "status": "200",
  "data": {
    "exposedItemsList": [
      {
        "processAppName": "Vacation Request",
        "processAppAcronym": "VR",
        "itemID": "25.2aef25cd-3b97-455f-8f10-7f789a153710",
        "processAppID": "2066.cc01cf46-fd58-4209-a348-f4654947c15b",
        "display": "Vacation request",
        "branchID": "2063.e304e275-eeee-49b5-bd28-63fdde165ab3",
        "branchName": "Main",
        "startURL": "/rest/bpm/wle/v1/process?action=start&bpdId=25.2aef25cd-3b97-455f-8f10-7f789a153710&processAppId=2066.cc01cf46-fd58-4209-a348-f4654947c15b",
        "itemDescription": null,
        "isMobileReady": false
      }
    ]
  }
}
```

> **No hay parámetro de paginación** en el WADL de este recurso (`size`/`offset`). Con volúmenes grandes de procesos expuestos, la respuesta completa viaja de una vez — sin evidencia todavía de cómo se comporta con un catálogo grande, porque este ambiente solo tiene 4 procesos.

<a id="post-bpm-processes"></a>
<a id="api-04"></a>

## API-04: Iniciar una instancia de proceso

> ⚠️ **Reemplazado por [API-14](#post-rest-bpm-wle-process) desde 2026-09-15** para el flujo de «Iniciar procesos»: el catálogo real ([API-03](#get-rest-bpm-wle-exposed-process)) no expone `model`/`container`, así que esta operación no es alcanzable desde el listado que el portal usa. Se conserva documentada porque su contrato sigue siendo válido y confirmado — no es un endpoint dado de baja por BAW — solo dejó de ser el que invoca el portal.

- **Método y ruta:** `POST /bpm/processes` — `operationId: startProcess`
- **Autenticación:** Cookie de sesión + `BPMCSRFToken`. **Autorización: solo miembros de los equipos asignados a la opción _Expose to start_ del proceso.**
- **Descripción:** Arranca una nueva instancia del modelo indicado (FR-001).
- **Estado de validación: Confirmado.**

**Request**

| Parámetro      | Ubicación | Tipo                                 | Requerido | Descripción                                                 |
| -------------- | --------- | ------------------------------------ | --------- | ----------------------------------------------------------- |
| BPMCSRFToken   | header    | string                               | **Sí**    | Token anti-CSRF                                             |
| model          | query     | string                               | **Sí**    | Nombre del modelo de proceso                                |
| container      | query     | string                               | **Sí**    | Acrónimo de la process app                                  |
| version        | query     | string                               | No        | Acrónimo del snapshot; si se omite, el snapshot por defecto |
| branch_name    | query     | string                               | No        | Rama de la process app                                      |
| optional_parts | query     | enum[]                               | No        | `data`, `actions`                                           |
| input          | body      | `input` = `{ input: data_object[] }` | No        | Valores de variables del proceso. **El portal no lo envía** |

**Responses**

| Código  | Condición                                             | Cuerpo                                                    |
| ------- | ----------------------------------------------------- | --------------------------------------------------------- |
| **201** | Instancia creada                                      | `process` ([MD-03](../models/MD-03-instancia-proceso.md)) |
| 403     | El usuario no está en un equipo con _Expose to start_ | `exception` ([MD-11](../models/MD-11-error-api-baw.md))   |
| 409     | Conflicto en la petición                              | `exception`                                               |

> **No es idempotente.** Un reintento tras un timeout puede crear una segunda instancia: el portal **no reintenta automáticamente**. Ver [FL-04](../flows/FL-04-iniciar-instancia-proceso.md).

<a id="get-bpm-processes"></a>
<a id="api-09"></a>

## API-09: Listar instancias de proceso

- **Método y ruta:** `GET /bpm/processes` — `operationId: getProcessesList`
- **Autenticación:** Cookie de sesión + `BPMCSRFToken`.
- **Autorización:** OpenAPI declara «solo administrador de BAW o administrador de process app». **Cerrada para el portal (2026-09-16):** los usuarios del portal serán (o ya son) administradores en BAW.
- **Descripción:** Lista instancias con filtro por estado y búsqueda (FR-006, FR-009).
- **Estado de validación: Confirmado** — OpenAPI y ejecución real 2026-09-16 (200 con usuario de `tw_admins`).

**Request**

| Parámetro      | Ubicación | Tipo         | Requerido | Descripción                                                                                                                   |
| -------------- | --------- | ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| BPMCSRFToken   | header    | string       | **Sí**    | Token anti-CSRF                                                                                                               |
| states         | query     | enum[]       | No        | `running`, `finished`, `terminated`, `suspended`, `stopped`, `did_not_start`. **Activo = `running`; Completado = `finished`** |
| search_term    | query     | string       | No        | Filtra por nombre de modelo y de instancia, con comodines implícitos a ambos lados                                            |
| model          | query     | string       | No        | Filtra por modelo                                                                                                             |
| containers     | query     | string[]     | No        | Filtra por acrónimos de process app                                                                                           |
| versions       | query     | string[]     | No        | Filtra por acrónimos de snapshot                                                                                              |
| sort           | query     | enum[]       | No        | `creation_time`, `model`, `state`, `due_date`, cada uno `:asc` o `:desc`                                                      |
| offset         | query     | string       | No        | Posición de la primera instancia                                                                                              |
| size           | query     | integer (≥1) | No        | Máximo de instancias                                                                                                          |
| optional_parts | query     | enum[]       | No        | `data`, `actions`                                                                                                             |

**Responses**

| Código | Condición        | Cuerpo                                                                                          |
| ------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| 200    | Listado obtenido | `processes` = `{ processes[] ([MD-03](../models/MD-03-instancia-proceso.md)), previous, next }` |

> **Autorización verificada el 2026-09-16.** OpenAPI sigue declarando que solo un administrador de BAW o de process app puede invocar este listado. En vivo, `GET /bpm/processes` devolvió **200** (cookie de sesión + `BPMCSRFToken`) con el usuario `juancarlos.altamirano`, que pertenece a `tw_admins` (también `tw_authors` y `tw_managers`, según `GET /rest/bpm/wle/v1/user`). **Decisión de producto (2026-09-16):** los usuarios del portal tendrán ese rol de administrador en BAW. El choque potencial con SRS 2.6 (sin diferenciación de roles en el portal) queda cerrado para esta versión: no hace falta verificar con un usuario no-admin.
>
> Filtros de servidor también **200** el mismo día: `states=running` y `states=finished` (ambos con `next` de paginación), `search_term`, `model` y `containers`.
>
> **No hay listado WLE equivalente.** `OPTIONS /rest/bpm/wle/v1/processes` respondió 405 (`Allow: OPTIONS`, cuerpo vacío). No se documenta un endpoint WLE de listado de instancias.
>
> Es también la única operación **de esta familia** con búsqueda por texto de servidor, así que FR-009 se cumple bien aquí — al contrario que en «Mis tareas», donde sigue siendo de cliente mientras no se validen los operadores de `conditions` de [API-13](API-017-tareas.md#put-rest-bpm-wle-tasks).

<a id="no-existe-diagrama-proceso"></a>
<a id="api-12"></a>

## API-12: Obtener el diagrama del proceso

- **Método y ruta:** **No existe** en esta familia.
- **Estado de validación: Confirmado (ausente)** aquí; **Por confirmar** en la familia clásica.
- **Descripción:** FR-007, pestaña «Diagrama».

> Si se obtiene de la familia clásica, hay que extender `proxy.conf.js` a `/rest`. El formato de entrega sigue sin conocerse y decide el esfuerzo ([MD-10](../models/MD-10-diagrama-proceso-estado.md)).

<a id="post-rest-bpm-wle-process"></a>
<a id="api-14"></a>

## API-14: Iniciar una instancia de proceso (WLE)

- **Método y ruta:** `POST /rest/bpm/wle/v1/process?action=start&bpdId={bpdId}&processAppId={processAppId}` (familia WLE clásica)
- **Autenticación:** cookies de sesión (`JSESSIONID`, `LtpaToken2`) + cookie `XSRF-TOKEN` reenviada en la cabecera `x-xsrf-token` — **sí la exige**, a diferencia de [API-03](#get-rest-bpm-wle-exposed-process), por ser una escritura real. Mismo mecanismo que [API-13](API-017-tareas.md#put-rest-bpm-wle-tasks); materia de ADR-015 y `api/CR-003`.
- **Descripción:** Arranca una nueva instancia del proceso elegido en el catálogo de [API-03](#get-rest-bpm-wle-exposed-process) (FR-001). **Reemplaza a [API-04](#post-bpm-processes)** para este flujo.
- **Estado de validación: Confirmado** — ejecución real de escritura el 2026-09-15, autorizada explícitamente para validar el contrato. Creó la instancia de prueba `Vacation request:303` (`piid: "303"`) en el ambiente de referencia. Detalle completo en [RS-002](../../../specs/archived/research/RS-002-procesos-iniciables-wle/README.md).

**Request**

| Parámetro            | Ubicación | Tipo   | Requerido | Descripción                                                                                                                                                                               |
| -------------------- | --------- | ------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| x-xsrf-token         | header    | string | **Sí**    | Valor de la cookie `XSRF-TOKEN`                                                                                                                                                           |
| action               | query     | string | **Sí**    | Valor usado: `start`                                                                                                                                                                      |
| bpdId                | query     | string | **Sí**    | `itemID` del proceso elegido, tal como lo devuelve [API-03](#get-rest-bpm-wle-exposed-process)                                                                                            |
| processAppId         | query     | string | **Sí**    | `processAppID` del proceso elegido, tal como lo devuelve [API-03](#get-rest-bpm-wle-exposed-process)                                                                                      |
| branchId, snapshotId | query     | string | No        | Declarados en el WADL de `POST /rest/bpm/wle/v1/process`; sin probar — si se omiten, BAW asume la rama/snapshot por defecto del BPD (observado: `branchName: "Main"`, el snapshot activo) |

> **Más simple que construirla a mano:** el `startURL` que ya trae cada elemento de [API-03](#get-rest-bpm-wle-exposed-process) es exactamente esta URL con `bpdId`/`processAppId` ya rellenados — usarlo directamente evita recomponer la query string.

**Responses**

| Código    | Condición                                                                                                 | Cuerpo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **200**   | Instancia creada                                                                                          | Objeto de instancia WLE (`piid`, `name`, `processTemplateID`, `processTemplateName`, `processAppName`, `processAppAcronym`, `state`, `executionState`, `tasks[]` con la(s) tarea(s) inicial(es) ya creada(s) en el contrato de [MD-04](../models/MD-04-tarea.md)-WLE, `diagram`, `dataModel`, …) — **forma distinta de `process`** ([MD-03](../models/MD-03-instancia-proceso.md), familia `/bpm/`): más rica (incluye las tareas generadas y el diagrama en la misma respuesta), con `piid` como id corto en vez del `id` largo de MD-03 |
| 401 / 403 | Sesión caída o `x-xsrf-token` ausente/inválido; o el usuario no tiene _Expose to start_ para este proceso | **Sin provocar** — no se probó ninguno de los dos casos negativos                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

```json
{
  "status": "200",
  "data": {
    "piid": "303",
    "name": "Vacation request:303",
    "processTemplateID": "25.2aef25cd-3b97-455f-8f10-7f789a153710",
    "processTemplateName": "Vacation request",
    "processAppName": "Vacation Request",
    "processAppAcronym": "VR",
    "state": "STATE_RUNNING",
    "executionState": "Active",
    "tasks": [
      {
        "displayName": "Submit request",
        "state": "STATE_CLAIMED",
        "owner": "andres.perez",
        "tkiid": "503"
      }
    ]
  }
}
```

> **No es idempotente**, igual que [API-04](#post-bpm-processes) — no hay evidencia de lo contrario y el patrón (crear una instancia por llamada) es el mismo. Mantener la misma disciplina de no reintentar automáticamente ([FL-04](../flows/FL-04-iniciar-instancia-proceso.md)).
>
> **La forma de la respuesta no se documenta aún como el contrato completo de "instancia" de WLE** ([MD-03](../models/MD-03-instancia-proceso.md) sigue describiendo solo la forma `/bpm/`): esta ejecución capturó una respuesta real pero no se hizo el ejercicio de modelarla campo a campo como modelo de datos propio. Pendiente si se decide consumir más que el estado inmediato tras el arranque.
