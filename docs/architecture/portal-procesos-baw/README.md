# Capability: portal-procesos-baw

**Fecha de creación:** 2026-09-11
**Última actualización:** 2026-09-16

## Propósito

Especificación técnica del consumo de la API REST de IBM Business Automation Workflow (BAW) desde el frontend Angular del portal: modelos que el frontend espera recibir, contratos de los endpoints que invoca, flujos de sesión y de ejecución de tareas, y la arquitectura de componentes que los materializa. Cubre los siete módulos del portal (autenticación, iniciar procesos, mis tareas, detalle/completado de tarea, procesos, rendimiento del proceso y rendimiento del equipo) definidos en [SRS-001](../../specs/changes/requirements/SRS-001-portal-procesos-baw/README.md).

**Fuera de alcance:** la lógica de negocio de los procesos (la gobierna BAW), la administración/configuración de BAW, el valor de negocio y los criterios de aceptación (viven en las US-XXX) y el plan de implementación (vive en las TK-XXX).

## Convenciones de este documento

#### Origen de la validación

El riesgo R-02 del SRS exige validar el contrato real de BAW antes de implementar cada módulo. **Esa validación se realizó en vivo contra el ambiente de referencia con un usuario de prueba el 2026-09-11**, recuperando la definición OpenAPI que la propia instancia publica en `GET /bpm/docs`:

> **IBM Business Automation Workflow Process REST Interface**, versión **8.6.1.18002**, `basePath: /bpm`, `schemes: [https]`, `securityDefinitions: basic_auth`.

Esa definición es el contrato autoritativo de la familia `/bpm/` en esta instancia y es la fuente de todo lo marcado _Confirmado_ con origen OpenAPI.

**Segunda validación en vivo — 2026-09-14, familia WLE.** Contra el mismo ambiente (`https://192.168.120.100:9443`) y con el usuario `juancarlos.altamirano` se ejecutaron **lecturas autenticadas reales**, capturando peticiones y respuestas completas. Es la primera evidencia de **ejecución** de este documento, no solo de contrato declarado. Cubrió cuatro comprobaciones:

| Comprobación                                        | Resultado                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUT /rest/bpm/wle/v1/tasks` con `calcStats=true`   | Contrato completo de [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks) y del contrato B de [MD-04](models/MD-04-tarea.md); **formato de fecha** (ISO 8601 UTC), **tipo de la prioridad** (entero) y **agregados de SLA de servidor** ([MD-05](models/MD-05-resumen-sla-lista-tareas.md)) |
| La misma búsqueda con `offset` en la **query**      | **Paginación de servidor confirmada**; `offset` en el cuerpo devuelve 400                                                                                                                                                                                                                      |
| `offset` dentro del cuerpo (caso negativo)          | 400 `CWTBG0618E`, que además enumeró **las 12 propiedades válidas** del cuerpo de búsqueda y confirmó que WLE comparte la numeración de errores `CWTBG…` de [MD-11](models/MD-11-error-api-baw.md)                                                                                             |
| `GET /bpm/user-tasks/478` con el id del listado WLE | **El puente listado → detalle funciona**: los identificadores de las dos familias son compatibles ([MD-04](models/MD-04-tarea.md))                                                                                                                                                             |

El _por qué_ de migrar a esta familia no se documenta aquí: vive en **ADR-015** del repositorio `frontend` (`frontend/docs/adr/ADR-015-native-baw-wle-rest-api.md`) y sus requisitos verificables `api/CR-001`…`CR-003` en `frontend/docs/standards/api.md`. Aquí se documenta solo el **contrato**.

**Tercera validación en vivo — 2026-09-16, `GET /bpm/processes`.** Contra el mismo ambiente (`https://192.168.120.100:9443`) y el mismo usuario `juancarlos.altamirano` se ejecutó el listado de instancias de la familia `/bpm/` con sesión (`POST /bpm/system/login` → 201) y cabecera `BPMCSRFToken`. Cubrió:

| Comprobación                                | Resultado                                                                                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /bpm/processes?states=running&size=5`  | **200**; cuerpo con `processes[]` y `next` (`/bpm/processes?offset=5&size=5&versions=[]&states=running`)                                                                         |
| `GET /bpm/processes?states=finished&size=5` | **200**, también con `next`                                                                                                                                                      |
| `search_term=Credito`                       | Instancias del modelo `Solicitar Credito` (p. ej. `Solicitar Credito:273` finished, `:274` y `:275` running)                                                                     |
| `model=Proceso de Créditos`                 | Solo ese modelo                                                                                                                                                                  |
| `containers=BTQDP`                          | Process app `BTQDP` / `BAYBANK - DEMO PROCESOS`                                                                                                                                  |
| Autorización                                | Usuario en `tw_admins` (también `tw_authors` y `tw_managers`, según `GET /rest/bpm/wle/v1/user`). **Decisión de producto (2026-09-16):** los usuarios del portal tendrán ese rol |
| `OPTIONS /rest/bpm/wle/v1/processes`        | **405**, `Allow: OPTIONS`, cuerpo vacío. **No hay listado WLE equivalente** en esa ruta                                                                                          |

Lo que sigue **sin** verificarse en ejecución de la familia `/bpm/` es la unidad de `expiration` de [MD-01](models/MD-01-sesion-credenciales.md) y los valores de `priority` de `user_task` — ver [Observaciones](#observaciones), punto 1. **`GET /bpm/processes` ([API-09](apis/API-016-procesos.md#get-bpm-processes)) sí se ejecutó el 2026-09-16.**

#### Estado de validación de cada elemento

| Estado                   | Significado                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Confirmado**           | Declarado en la definición OpenAPI de esta instancia, o verificado con una llamada real. Implementable tal cual.                                       |
| **Confirmado (ausente)** | **Verificado que NO existe** en esta API. No es una laguna de conocimiento: es una capacidad que hay que resolver por otra vía o recortar del alcance. |
| **Por confirmar**        | Ruta y/o forma desconocidas, o comportamiento en ejecución sin verificar. No implementar sin validar primero.                                          |

#### Superficie real de la familia `/bpm/`

La definición OpenAPI de esta instancia declara las siguientes operaciones, en tres grupos (`System`, `Process`, `User Task`):

| Operación                                 | Uso en el portal                                                                                                                                                                                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /bpm/system/login`                  | [API-01](apis/API-015-autenticacion.md#post-bpm-system-login)                                                                                                                                                                                                   |
| `GET /bpm/processes`                      | [API-09](apis/API-016-procesos.md#get-bpm-processes)                                                                                                                                                                                                            |
| `POST /bpm/processes`                     | [API-04](apis/API-016-procesos.md#post-bpm-processes) — **reemplazado por [API-14](apis/API-016-procesos.md#post-rest-bpm-wle-process) (WLE)** para el flujo de «Iniciar procesos»; documentado por completitud del contrato `/bpm/`, ya no lo invoca el portal |
| `GET /bpm/processes/{process_id}`         | Detalle de instancia                                                                                                                                                                                                                                            |
| `DELETE /bpm/processes/{process_id}`      | **No se usa** (el portal no borra instancias)                                                                                                                                                                                                                   |
| `GET /bpm/user-tasks`                     | [API-05](apis/API-017-tareas.md#get-bpm-user-tasks) — **obsoleto**, reemplazado por [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks)                                                                                                                     |
| `GET /bpm/user-tasks/{task_id}`           | [API-06](apis/API-017-tareas.md#get-bpm-user-tasks-task-id)                                                                                                                                                                                                     |
| `POST /bpm/user-tasks/{task_id}/claim`    | [API-07](apis/API-017-tareas.md#post-bpm-user-tasks-task-id-claim)                                                                                                                                                                                              |
| `POST /bpm/user-tasks/{task_id}/complete` | [API-08](apis/API-017-tareas.md#post-bpm-user-tasks-task-id-complete)                                                                                                                                                                                           |
| `POST /bpm/user-tasks/{task_id}/fail`     | **No se usa**                                                                                                                                                                                                                                                   |

**Todo lo que el SRS pide y no está en esa lista no existe en esta familia de API.** En concreto, y verificado: no hay logout, ni listado de procesos arrancables, ni comentarios, ni métricas de rendimiento, ni diagrama de proceso, ni listado de equipos. Cada ausencia se trata en el elemento correspondiente — y varias de ellas quedan reabiertas por la familia WLE, que sí tiene superficie para buscar tareas ([API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks)) y, sin validar aún, para procesos y equipos.

#### Superficie de la familia WLE (`/rest/bpm/wle/v1/`)

Esta instancia expone además la interfaz REST clásica de WLE, el motor de workflow subyacente. De ella hay estas operaciones validadas en vivo:

| Operación                                    | Uso en el portal                                                                                      | Estado                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `PUT /rest/bpm/wle/v1/tasks`                 | [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks) — listado de «Mis tareas»                     | **Confirmado** (ejecución real 2026-09-14)                                                                  |
| `GET /rest/bpm/wle/v1/exposed/process`       | [API-03](apis/API-016-procesos.md#get-rest-bpm-wle-exposed-process) — catálogo de procesos iniciables | **Confirmado** (ejecución real 2026-09-15)                                                                  |
| `POST /rest/bpm/wle/v1/process?action=start` | [API-14](apis/API-016-procesos.md#post-rest-bpm-wle-process) — arranque de una instancia              | **Confirmado** (ejecución real de escritura 2026-09-15, autorizada explícitamente para validar el contrato) |

El resto de la familia (diagrama del BPD fuera del arranque, equipos, métricas) **sigue sin validar**: no se ejecutó ninguna llamada contra esas rutas. No documentarlas como disponibles hasta tener evidencia.

#### Autenticación, en dos mecanismos

- `securityDefinitions` declara **`basic_auth` global**: todas las operaciones aceptan HTTP Basic.
- Además, **`BPMCSRFToken` es un parámetro de cabecera obligatorio en las nueve operaciones que no son el login**. Verificado en vivo: un `GET /bpm/user-tasks` con Basic válido pero sin esa cabecera responde **403** con `error_number: CWTBG0651E`.

El portal usa la combinación cookie de sesión + `BPMCSRFToken`, ya implementada en el repositorio `frontend`.

**La familia WLE usa un mecanismo CSRF distinto**: las mismas cookies de sesión que emite [API-01](apis/API-015-autenticacion.md#post-bpm-system-login) (`JSESSIONID`, `LtpaToken2`) más la cookie `XSRF-TOKEN`, cuyo valor se reenvía en la cabecera **`x-xsrf-token`** — **no** `BPMCSRFToken`. El modelo completo (qué cookie alimenta qué cabecera, y por qué no hace falta un login adicional) es materia de **ADR-015** y del requisito `api/CR-003` del estándar `frontend/docs/standards/api.md`; aquí solo se declara qué cabecera exige cada operación.

#### Familias de API de BAW

| Familia                                                     | Context root        | Estado                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Process REST Interface**                                  | `/bpm/`             | **Confirmada** vía OpenAPI. Cubre login, instancias y tareas. Ya cubierta por `proxy.conf.js`. **Su uso queda restringido** por `api/CR-001` de ADR-015: ningún repository de datos BPM debe llamar fuera de `/rest/bpm/wle/v1/*`, con la única excepción de `bpm/system/login` ([API-01](apis/API-015-autenticacion.md#post-bpm-system-login))                                                                                         |
| **REST interface for BPD-related resources** (WLE, clásica) | `/rest/bpm/wle/v1/` | **Confirmada para búsqueda de tareas** ([API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks), 2026-09-14) **y para el catálogo y arranque de procesos iniciables** ([API-03](apis/API-016-procesos.md#get-rest-bpm-wle-exposed-process)/[API-14](apis/API-016-procesos.md#post-rest-bpm-wle-process), 2026-09-15). **Sin validar** para diagrama, equipos y métricas. Requiere extender el proxy a `/rest` (`api/CR-002` de ADR-015) |

<a id="nomenclatura-de-campos"></a>

#### Nomenclatura de campos

Se sigue la convención ya vigente en el repositorio `frontend` (ADR-012, `{Entity}Mapper`): **el DTO conserva literalmente lo que viaja por el cable y el mapper lo traduce al modelo de dominio.** Lo que cambia con WLE es que hay **tres** convenciones de cable conviviendo, no una:

| Origen                                     | Convención en el cable                                       | Ejemplo                                                   |
| ------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------- |
| DTOs de la familia `/bpm/`                 | `snake_case` literal, sin traducir                           | `due_date`, `process_name`, `refresh_groups`              |
| **Cuerpo de petición de WLE**              | `camelCase`                                                  | `taskDueDate`, `assignedToRoleDisplayName`, `interaction` |
| **Claves de respuesta de WLE** (`items[]`) | `UPPER_SNAKE_CASE`, algunas con prefijo de tabla y **punto** | `DUE`, `PI_NAME`, `TASK.TKIID`, `PROCESS_INSTANCE.PIID`   |
| Modelos de dominio del frontend            | inglés en `camelCase`                                        | `dueDate`, `slaStatus`, `teamName`                        |

Consecuencias prácticas, porque condicionan el código y no solo la lectura:

- **Las claves con punto no son accesos anidados.** `TASK.TKIID` es una clave literal de un objeto plano: se lee `item['TASK.TKIID']`, nunca `item.TASK.TKIID`. Confundirlas es el error más fácil de cometer al escribir el mapper.
- **El nombre que se pide no es el nombre que vuelve.** En WLE el array `fields` de la petición usa alias en `camelCase` (`taskDueDate`) y la respuesta devuelve la columna en `UPPER_SNAKE_CASE` (`DUE`). La correspondencia está en [MD-04](models/MD-04-tarea.md).

Las descripciones van en español.

#### Convenciones comunes de las APIs

> **Host base:** `https://192.168.120.100:9443` (también `https://btq-srv-bawodm:9443`), parametrizado por ambiente en `environment.apiRestBaseUrl` (riesgo R-01). En desarrollo la base es cadena vacía y `proxy.conf.js` reenvía `/bpm`. Todas las llamadas van sobre HTTPS (NFR-002).
>
> **Autenticación común a API-04 … API-09:** cookie de sesión emitida por [API-01](apis/API-015-autenticacion.md#post-bpm-system-login) (`withCredentials: true`) **más** la cabecera `BPMCSRFToken`, **obligatoria y verificada en vivo**. La API acepta también HTTP Basic en todas las operaciones (`securityDefinitions.basic_auth`), mecanismo que el portal no usa salvo en el login.
>
> **Errores comunes a todas las operaciones:** `400` parámetros inválidos o ausentes, `500` error interno, ambas con cuerpo `exception` ([MD-11](models/MD-11-error-api-baw.md)). Las operaciones sobre un recurso concreto añaden `403` no autorizado y `404` inexistente; las que mutan añaden `409` conflicto. No se repiten en cada tabla.

## Modelos de datos

| ID    | Modelo                                                                                |
| ----- | ------------------------------------------------------------------------------------- |
| MD-01 | [Sesión y credenciales](models/MD-01-sesion-credenciales.md)                          |
| MD-02 | [Proceso iniciable](models/MD-02-proceso-iniciable.md)                                |
| MD-03 | [Instancia de proceso](models/MD-03-instancia-proceso.md)                             |
| MD-04 | [Tarea](models/MD-04-tarea.md)                                                        |
| MD-05 | [Resumen de SLA de la lista de tareas](models/MD-05-resumen-sla-lista-tareas.md)      |
| MD-06 | [Campo de formulario dinámico](models/MD-06-campo-formulario-dinamico.md)             |
| MD-07 | [Acción de tarea (outcome)](models/MD-07-accion-tarea.md)                             |
| MD-08 | [Indicador de rendimiento por proceso](models/MD-08-indicador-rendimiento-proceso.md) |
| MD-09 | [Indicador de rendimiento por equipo](models/MD-09-indicador-rendimiento-equipo.md)   |
| MD-10 | [Diagrama de proceso con estado](models/MD-10-diagrama-proceso-estado.md)             |
| MD-11 | [Error de la API de BAW](models/MD-11-error-api-baw.md)                               |

## APIs

| ID      | Grupo                                                   | Operaciones (id anterior)                                                                                                                                                                                                                                                                                            |
| ------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API-015 | [Autenticación y sesión](apis/API-015-autenticacion.md) | [API-01](apis/API-015-autenticacion.md#post-bpm-system-login), [API-02](apis/API-015-autenticacion.md#no-existe-cerrar-sesion)                                                                                                                                                                                       |
| API-016 | [Procesos](apis/API-016-procesos.md)                    | [API-03](apis/API-016-procesos.md#get-rest-bpm-wle-exposed-process), [API-04](apis/API-016-procesos.md#post-bpm-processes), [API-09](apis/API-016-procesos.md#get-bpm-processes), [API-12](apis/API-016-procesos.md#no-existe-diagrama-proceso), [API-14](apis/API-016-procesos.md#post-rest-bpm-wle-process)        |
| API-017 | [Tareas](apis/API-017-tareas.md)                        | [API-05](apis/API-017-tareas.md#get-bpm-user-tasks), [API-06](apis/API-017-tareas.md#get-bpm-user-tasks-task-id), [API-07](apis/API-017-tareas.md#post-bpm-user-tasks-task-id-claim), [API-08](apis/API-017-tareas.md#post-bpm-user-tasks-task-id-complete), [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks) |
| API-018 | [Rendimiento](apis/API-018-rendimiento.md)              | [API-10](apis/API-018-rendimiento.md#no-existe-indicadores-proceso), [API-11](apis/API-018-rendimiento.md#no-existe-indicadores-equipo)                                                                                                                                                                              |

## Flujos

| ID    | Flujo                                                                                                                 |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| FL-01 | [Autenticación y ciclo de vida de la sesión](flows/FL-01-autenticacion-ciclo-vida-sesion.md)                          |
| FL-02 | [Expiración de sesión durante el uso](flows/FL-02-expiracion-sesion-durante-uso.md)                                   |
| FL-03 | [Reclamar y completar una tarea con formulario dinámico](flows/FL-03-reclamar-completar-tarea-formulario-dinamico.md) |
| FL-04 | [Iniciar una instancia de proceso](flows/FL-04-iniciar-instancia-proceso.md)                                          |

## Diagramas

| ID    | Diagrama                                                           |
| ----- | ------------------------------------------------------------------ |
| DG-01 | [Contexto de la capability](diagrams/DG-01-contexto-capability.md) |
| DG-02 | [Componentes del frontend](diagrams/DG-02-componentes-frontend.md) |

## Observaciones

Estado tras las validaciones en vivo del 2026-09-11 (OpenAPI de `/bpm/`), del **2026-09-14 (ejecución real contra WLE)** y del **2026-09-16 (ejecución real de `GET /bpm/processes`)**. Las marcadas **bloqueante** impiden implementar la funcionalidad afectada tal como está enunciada en el SRS.

1. **Las lecturas con sesión de la familia `/bpm/` ya no están del todo pendientes.** ~~No se llegó a ejecutar ninguna lectura autenticada con datos reales.~~ **Parcialmente resuelto el 2026-09-14** con la ejecución contra [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks): el **formato de fecha** de las tareas quedó confirmado como ISO 8601 UTC con sufijo `Z` (`DUE`), el **tipo de la prioridad** como entero en WLE (`PRIORITY: 30`, frente a la cadena que declara `user_task`), y el **estado «en riesgo»** como alcanzable sin depender de que `at_risk_time` llegue poblado, porque WLE lo entrega ya resuelto en `IS_AT_RISK`. **El 2026-09-16 se ejecutó además `GET /bpm/processes` ([API-09](apis/API-016-procesos.md#get-bpm-processes))** contra el mismo ambiente, con **200** y cuerpo real (`processes[]`, `next`, filtros `states` / `search_term` / `model` / `containers`). **Sigue pendiente** de esa familia: la unidad de `expiration` ([MD-01](models/MD-01-sesion-credenciales.md)) y los valores reales de `priority` (cadena) en `user_task`.
2. ~~**(Bloqueante — FR-001) No existe endpoint para listar procesos arrancables**~~ **RESUELTO el 2026-09-15.** La familia `/bpm/` sigue sin ese endpoint, pero la familia WLE clásica sí lo tiene: `GET /rest/bpm/wle/v1/exposed/process` ([API-03](apis/API-016-procesos.md#get-rest-bpm-wle-exposed-process)) devuelve el catálogo real, y `POST /rest/bpm/wle/v1/process?action=start` ([API-14](apis/API-016-procesos.md#post-rest-bpm-wle-process)) lo arranca — ambos verificados con ejecución real, el segundo con una llamada de escritura real autorizada explícitamente. Detalle completo en [RS-002](../../specs/archived/research/RS-002-procesos-iniciables-wle/README.md). **Queda un matiz sin cerrar, no bloqueante:** no se validó con un segundo usuario si el catálogo respeta estrictamente _Expose to start_ por equipo (ver [MD-02](models/MD-02-proceso-iniciable.md)).
3. **(Bloqueante — FR-005) No existe forma de adjuntar un comentario** ([API-08](apis/API-017-tareas.md#post-bpm-user-tasks-task-id-complete)). El cuerpo de `complete` solo admite variables de negocio y no hay ruta de comentarios. FR-005 condicionaba su enunciado a que la API lo soportara: **no lo soporta**. Decidir entre variable de negocio por proceso, familia clásica, o recorte.
4. **(Bloqueante — FR-004 y BR-01) BAW no describe ni el formulario ni las decisiones** ([MD-06](models/MD-06-campo-formulario-dinamico.md), [MD-07](models/MD-07-accion-tarea.md)). `data_object` solo trae `{ name, data }`, y `actions` es un enum cerrado de operaciones sobre la tarea, no de outcomes de negocio. Con inferencia pura el portal cubre texto, número, booleano y fecha; `select`, `file` y las decisiones de negocio **exigen configuración propia del portal por proceso**. Las dos lagunas se cierran con una sola decisión de diseño, que conviene tomar antes de planificar la US de completado.
5. ~~**(Bloqueante — FR-006) `GET /bpm/processes` está restringido a administradores**~~ **RESUELTO el 2026-09-16** ([API-09](apis/API-016-procesos.md#get-bpm-processes)). OpenAPI sigue declarando «solo administrador de BAW o administrador de process app». En vivo, `GET /bpm/processes` devolvió **200** con el usuario `juancarlos.altamirano` (`tw_admins`; también `tw_authors` y `tw_managers`). **Decisión de producto (2026-09-16):** los usuarios del portal serán (o ya son) administradores en BAW; no hace falta un usuario no-admin para esta versión. El choque potencial con SRS 2.6 queda cerrado.
6. **(Bloqueante — FR-007 y FR-008) No hay métricas, ni diagrama, ni listado de equipos** ([API-10](apis/API-018-rendimiento.md#no-existe-indicadores-proceso), [API-11](apis/API-018-rendimiento.md#no-existe-indicadores-equipo), [API-12](apis/API-016-procesos.md#no-existe-diagrama-proceso)). La agregación en cliente es parcialmente viable para conteos; el listado de [API-09](apis/API-016-procesos.md#get-bpm-processes) sigue declarado solo para administradores, pero el punto 5 ya no bloquea el acceso del portal. Sigue sin permitir calcular duración promedio con fiabilidad —el contrato no trae hora de fin— y **no permite enumerar todos los grupos**, que es lo que FR-008 pide. `renewalRate` sigue sin definición de negocio y no es calculable en ningún escenario. Ambos requisitos necesitan revisión de alcance.
7. **(Bloqueante — FR-011) No existe logout en el servidor** ([API-02](apis/API-015-autenticacion.md#no-existe-cerrar-sesion)). El cierre de sesión es puramente local: la cookie sigue viva en BAW hasta caducar (máximo 7200 s). Decidir si se asume la limitación o si el cierre efectivo es un requisito de seguridad que obligue a buscar otra vía.
8. **CORS: resuelto en desarrollo, abierto en producción.** En desarrollo el enfoque **aceptado y confirmado** es el proxy propio del frontend (`proxy.conf.js`), que hace que el navegador vea un mismo origen y adapta los atributos de las cookies de BAW; es el camino vigente contra el ambiente de referencia y **no bloquea el desarrollo actual**. Para producción queda como **riesgo abierto**: sin proxy, el portal y BAW son orígenes distintos, así que BAW debería emitir `Access-Control-Allow-Origin` con el origen exacto del portal y `Access-Control-Allow-Credentials: true`, y su cookie de sesión viajar `SameSite=None; Secure`; la alternativa es introducir un proxy de despliegue. **Pendiente de confirmar con el equipo de infraestructura de BAW antes de desplegar.** No se registra ADR por ahora, por decisión del usuario.
9. **La búsqueda de FR-009 sigue siendo de cliente en «Mis tareas», pero ya no por imposibilidad.** `GET /bpm/processes` tiene `search_term` de servidor y [API-05](apis/API-017-tareas.md#get-bpm-user-tasks) no tenía ninguno; de ahí venía la restricción. [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks) introduce `conditions` con `operator`, y un operador de coincidencia parcial haría la búsqueda de servidor. **Solo se probó `Equals`**: el catálogo de operadores y de campos filtrables de WLE está sin validar. Mientras no se pruebe, FR-009 mantiene su alcance de cliente sobre la página cargada — pero es ahora una **laguna de validación**, no una limitación del contrato.
10. ~~**Los conteos de SLA de FR-002 no vienen de la API.**~~ **Resuelto el 2026-09-14** ([MD-05](models/MD-05-resumen-sla-lista-tareas.md)). [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks) los devuelve en `data.stats` con `calcStats=true`, calculados **en el servidor sobre el total de coincidencias** de la búsqueda, no sobre la página. La disyuntiva entre exactitud y NFR-003 desaparece: FR-002 puede exigir conteos exactos. Quedan dos matices menores, en los puntos 16 y el tope `countLimit` descrito en [MD-05](models/MD-05-resumen-sla-lista-tareas.md).
11. **El wireframe de «Procesos» pide un «grupo responsable» que el contrato no tiene** ([MD-03](models/MD-03-instancia-proceso.md)). El equipo solo existe a nivel de tarea. Derivarlo costaría N+1 llamadas; la alternativa es retirar la columna.
12. **La sesión dura como máximo 2 horas** ([MD-01](models/MD-01-sesion-credenciales.md)): `requested_lifetime` tiene un techo de 7200 s. [FL-02](flows/FL-02-expiracion-sesion-durante-uso.md) no es un caso de borde sino algo cotidiano, y merece un aviso cuidado.
13. **URL de producción de BAW sin confirmar** (riesgo R-01): se usa el host de referencia como valor provisional, parametrizado por ambiente.

### Abiertas por la validación WLE del 2026-09-14

14. **(Bloqueante para el cumplimiento de `api/CR-001`) Detalle, reclamo y completado siguen en la familia `/bpm/`.** `api/CR-001` de ADR-015 exige que **ningún** repository de datos BPM llame fuera de `/rest/bpm/wle/v1/*`, salvo el login. La evidencia del 2026-09-14 cubre solo la **búsqueda** de tareas: no se validó ningún equivalente WLE de [API-06](apis/API-017-tareas.md#get-bpm-user-tasks-task-id), [API-07](apis/API-017-tareas.md#post-bpm-user-tasks-task-id-claim) ni [API-08](apis/API-017-tareas.md#post-bpm-user-tasks-task-id-complete), que por eso siguen documentados sobre `/bpm/user-tasks/{task_id}` (contrato A de [MD-04](models/MD-04-tarea.md)). Mientras eso siga así, el repository de tareas incumple `CR-001` para tres de sus cuatro operaciones. **Hace falta validar en vivo las rutas WLE de detalle, reclamo y completado** y documentarlas aquí antes de poder cerrar el requisito. No se infieren por analogía: la forma de WLE difiere lo bastante del contrato custom como para que suponerla sea inventarla.

    **No es un bloqueo funcional, solo de cumplimiento.** El punto 20 verificó que el identificador del listado WLE sirve tal cual contra `/bpm/user-tasks/{task_id}`, así que la convivencia de las dos familias **funciona hoy** y US-003 puede implementarse sin esperar a esto. Lo que queda pendiente es alinear el repository con `CR-001`, no desbloquear la historia.

15. **(Abierta) El listado no sabe quién tiene reclamada cada tarea** ([MD-04](models/MD-04-tarea.md), contrato B). `items[]` no devuelve `owner`, así que `isClaimedByCurrentUser` no es derivable desde el listado. Si la UI de «Mis tareas» debe distinguir «reclamada por mí» de «disponible para mi equipo», hay que resolverlo por `STATE`/`KIND` —cuyas listas de valores no están confirmadas, solo se observó un valor de cada— o pidiendo el campo correspondiente en `fields`, que no se ha probado. **Afecta a AC-001 de US-003 si el listado debe mostrar esa distinción**; conviene confirmarlo con una captura que incluya al menos una tarea reclamada.

    **Pista nueva (2026-09-14), sin confirmar:** el mensaje del 400 `CWTBG0618E` reveló que `SavedSearchDefinition` —el cuerpo de [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks)— tiene una propiedad de primer nivel llamada **`owner`** entre sus 12 propiedades válidas. **No se verificó su semántica**, y lo más probable es que sea un _filtro de entrada_ por propietario, no un campo de salida — es decir, podría acotar la búsqueda pero no necesariamente hacer que el propietario aparezca en `items[]`. Dos vías a probar por quien retome esta laguna: (a) enviar `owner` en el cuerpo y observar si cambia el conjunto devuelto; (b) buscar un alias de `fields` que exponga el propietario en la respuesta. **No cerrar este punto con la pista sola.**

16. **La invariante de `stats` es observada, no demostrada** ([MD-05](models/MD-05-resumen-sla-lista-tareas.md)). En la única respuesta capturada con `calcStats=true`, `total`, `open` y `onTrack + atRisk + overdue` valen los tres 5, porque las cinco tareas estaban abiertas. Esa coincidencia **impide distinguir** si los tres estados de SLA parten `total` o parten `open`. Se necesita una captura con al menos una tarea cerrada para fijarlo. Hasta entonces, **no derivar ningún conteo restando** (`cerradas = total - open`): presentar solo los valores que el servidor entrega.
17. ~~**La paginación de [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks) está a medias verificada.**~~ **RESUELTO el 2026-09-14.** La paginación de servidor de WLE funciona y **AC-004 de US-003 es plenamente viable**. El hallazgo es que `offset` **no va en el cuerpo sino en la query string**: enviarlo en el cuerpo devuelve `400 CWTBG0618E` («Unrecognized field "offset" (class SavedSearchDefinition)»), porque el objeto de búsqueda no ignora propiedades desconocidas. Con `?offset=2` la respuesta fue `200` con `{"offset":2,"size":2,"requestedSize":2,"totalCount":5}` y las tareas 3.ª y 4.ª por vencimiento (TKIID 481 y 484). El contrato de [API-13](apis/API-017-tareas.md#put-rest-bpm-wle-tasks) ya lo documenta así, junto con la lista de las 12 propiedades válidas del cuerpo. **`size` en el cuerpo y `offset` en la query es asimétrico y contraintuitivo: es el error de implementación más probable de esta historia.**
18. **(Parcialmente resuelta) La detección de sesión expirada sobre WLE sigue sin verificar** ([MD-11](models/MD-11-error-api-baw.md)). **Lo que sí se resolvió:** un 400 provocado en vivo contra `/rest/bpm/wle/v1/tasks` devolvió `error_number: CWTBG0618E`, así que WLE **comparte la numeración `CWTBG…` y la estructura de [MD-11](models/MD-11-error-api-baw.md)** al menos en ese código — el normalizador de errores probablemente sirve para las dos familias. **Lo que sigue abierto es justo lo que hace falta:** no se ha provocado ningún **401 ni 403** contra WLE, y `isSessionExpired` discrimina por `CWTBG0651E`, que es el código del control `BPMCSRFToken`; WLE usa `x-xsrf-token`, otro mecanismo, y nada garantiza que falle con el mismo código. Capturar un 401 y un 403 de WLE (sesión caducada y `x-xsrf-token` ausente) antes de implementar el manejo de errores del listado, o [FL-02](flows/FL-02-expiracion-sesion-durante-uso.md) puede no dispararse.
19. **Valores de enum sin cerrar en el contrato B** ([MD-04](models/MD-04-tarea.md)). De `STATE` se observó `STATE_READY`, de `KIND` `KIND_PARTICIPATING` y de `STATUS` `Received`; de `interaction` solo `claimed_and_available`, y de `operator` solo `Equals`. Ninguna de esas listas está completa. Cualquier lógica de UI que ramifique por esos valores (etiquetas de estado, iconos, filtros) se apoya hoy en un solo valor observado por enum. Además, **no está confirmado si `STATUS` llega localizado** según `Accept-Language`, como sí ocurre con `error_message`: si lo está, no debe usarse como clave de lógica, solo como texto.
20. ~~**(Bloqueante) No está verificado que `TASK.TKIID` sirva como `task_id` de [API-06](apis/API-017-tareas.md#get-bpm-user-tasks-task-id).**~~ **RESUELTO el 2026-09-14, sin impacto.** `GET /bpm/user-tasks/478`, con el `TASK.TKIID` tomado tal cual del listado WLE, devuelve `200` y el detalle correcto, corroborado por dos campos independientes (`process_name` = `PI_NAME`, `name` = `TAD_DISPLAY_NAME`). El `id` canónico del contrato A es **`"2078." + TASK.TKIID`**, pero el endpoint **acepta las dos formas**, así que el mapper no necesita reconstruir prefijo alguno. **[FL-03](flows/FL-03-reclamar-completar-tarea-formulario-dinamico.md) (abrir tarea desde el listado) y el reclamo/completado no se rompen con la migración.** Matiz que queda anotado en [MD-04](models/MD-04-tarea.md), no como laguna: la forma corta funciona por tolerancia del endpoint, no por contrato declarado, así que lo que se persista (URLs compartibles, registros) debe ser el `id` largo.
21. **La ruta técnica de este documento es de una versión anterior del plugin.** La capability vive en `docs/specs/technical-docs/portal-procesos-baw.md` como archivo único, con ids de dos dígitos (`MD-04`, `API-13`), en vez de la estructura vigente `docs/architecture/[capability]/` con `models/`, `flows/` y `diagrams/` e ids de tres dígitos. Se conserva deliberadamente por decisión del usuario, para no romper las referencias ya escritas en las US. La normalización, si se decide hacerla, corresponde a `/plugin-migrate`, que actualiza también los enlaces entrantes; **no** debe hacerse a mano ni desde este documento.
