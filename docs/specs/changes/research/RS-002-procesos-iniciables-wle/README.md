# RS-002 — Listado de procesos iniciables vía la API clásica de WLE (`/rest/bpm/wle/v1/exposed/process`)

**Estado:** Ready
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202
**Fecha:** 2026-09-15

## Pregunta de investigación

¿Existe, en la familia `/bpm/` o en la familia WLE (`/rest/bpm/wle/v1/`) de la API de BAW, un endpoint para listar los **procesos** (no instancias) que el usuario autenticado puede iniciar, y qué contrato tiene?

## Contexto

La documentación técnica de la capability (`portal-procesos-baw.md`, MD-02 y API-03) ya deja registrado, con evidencia de la definición OpenAPI de la familia `/bpm/` (validada en vivo el 2026-09-11), que **no existe ningún endpoint para descubrir los procesos arrancables** en esa familia: `POST /bpm/processes` permite _arrancar_ un proceso si ya se conoce su `model`/`container`, pero no permite _listarlos_. Ese hallazgo bloquea AC-001 de [US-002 (Iniciar nuevos procesos)](../../../archive/user-stories/US-002-iniciar-nuevos-procesos/README.md), que quedó en `Draft` con una "Decisión pendiente (bloqueante)" explícita sobre el origen del catálogo, y lo mismo señala el punto 2 de las Observaciones del documento técnico.

La propia documentación ya identificaba el candidato sin validar: la familia clásica de WLE, concretamente `GET /rest/bpm/wle/v1/exposed/process`. Esta investigación valida ese candidato en vivo, siguiendo la misma metodología que [RS-001](../RS-001-detalle-tarea-wle/README.md) (llamadas reales contra el ambiente de referencia, capturando petición y respuesta, limitada a lecturas — sin iniciar ninguna instancia real).

## Hallazgos

Todo lo siguiente se verificó en vivo contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`), usuario `juancarlos.altamirano`, el 2026-09-15.

### 1. `GET /rest/bpm/wle/v1/exposed/process` existe, responde 200 y devuelve exactamente el catálogo que el usuario puede iniciar

```
GET /rest/bpm/wle/v1/exposed/process
→ 200
{
  "status": "200",
  "data": { "exposedItemsList": [
    { "processAppName": "Gestión de Siniestros", "processAppAcronym": "GDS", "display": "Proceso Menthoring Baw", "startURL": "/rest/bpm/wle/v1/process?action=start&bpdId=25.8a2bbd3a-...&processAppId=2066.7530c0db-...", ... },
    { "processAppName": "Vacation Request", "processAppAcronym": "VR", "display": "Sick Leave", "startURL": "...", ... },
    { "processAppName": "Hiring Sample", "processAppAcronym": "HSS", "display": "Standard HR Open New Position", "startURL": "...", ... },
    { "processAppName": "Vacation Request", "processAppAcronym": "VR", "display": "Vacation request", "startURL": "...", ... }
  ] }
}
```

Cuatro procesos, cada uno con `processAppName`/`processAppAcronym` (la process app contenedora), `display` (el nombre visible del proceso/BPD dentro de ella — dos procesos distintos, "Sick Leave" y "Vacation request", conviven en la misma process app "Vacation Request"), `snapshotID`/`snapshotName`, `branchID`/`branchName`, y un `startURL` ya resuelto. Es una respuesta completamente distinta, en forma y semántica, de MD-02 (`model`/`container`) — ver hallazgo 5.

### 2. Superficie descubierta vía WADL (`OPTIONS`)

`OPTIONS /rest/bpm/wle/v1/exposed/process` (`Allow: HEAD, GET, OPTIONS`) documenta el recurso real como `GET /rest/bpm/wle/v1/exposed/{type}` (con `{type}=process` en nuestro caso), con estos parámetros de query:

| Parámetro                                                | Verificado              | Efecto observado                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `includeDescription` (boolean)                           | Sí                      | Cambia `itemDescription` de `null` a `""` — el campo existe pero está vacío en los 4 procesos de este ambiente. Confirma que MD-02.`description` **sí tiene origen en BAW** vía este parámetro, aunque sin datos de prueba que lo demuestren poblado                                    |
| `filterByName`                                           | Sí                      | Ver hallazgo 3                                                                                                                                                                                                                                                                          |
| `excludeProcessStartUrl` (boolean)                       | Sí                      | Anula `branchID`, `branchName` y `startURL` (los pone en `null`) sin afectar al resto                                                                                                                                                                                                   |
| `includeNonStartBPDs` (boolean)                          | Sí, pero no concluyente | Con y sin el parámetro se obtuvieron los mismos 4 procesos — este ambiente no tiene ningún BPD "no arrancable" con el que distinguir si el filtro realmente excluye algo por defecto                                                                                                    |
| `forUser`                                                | Sí                      | Con un usuario inexistente devuelve **400** `CWTBG0012E` ("El parámetro 'forUser' no es válido"), no 403 ni una lista vacía — sugiere que valida contra el directorio de usuarios real, pero no se probó con un usuario válido distinto por no tener credenciales de un segundo usuario |
| `includeServiceSubtypes`, `excludeReferencedFromToolkit` | No probados             | Sin efecto observado documentado                                                                                                                                                                                                                                                        |

También aparece un recurso hermano `GET /rest/bpm/wle/v1/exposed/process/performanceMetrics` — **sin probar**, pero relevante como pista para el bloqueante de FR-007/API-10 (rendimiento por proceso), fuera del alcance de esta pregunta.

### 3. `filterByName` es coincidencia **exacta**, no búsqueda parcial

Probado sistemáticamente sobre el `display` de los 4 procesos:

| Valor enviado                                       | Resultado       |
| --------------------------------------------------- | --------------- |
| `Vacation request` (exacto)                         | 1 coincidencia  |
| `Sick Leave` (exacto)                               | 1 coincidencia  |
| `vacation` (minúsculas)                             | 0 coincidencias |
| `Sick`, `Request`, `Credito`, `aprobar` (parciales) | 0 coincidencias |

**No sirve como búsqueda de texto libre** (no cubriría un FR-009 equivalente para el módulo de "Iniciar procesos" si existiera): es un filtro de coincidencia exacta y sensible a mayúsculas contra `display`, más útil para "tráeme este proceso por su nombre conocido" que para autocompletado o búsqueda.

### 4. Autenticación: este `GET` **no exige** `x-xsrf-token`, a diferencia del `PUT` de API-13

```
GET /rest/bpm/wle/v1/exposed/process   (con cookies de sesión, SIN header x-xsrf-token)
→ 200  (mismo catálogo completo)

GET /rest/bpm/wle/v1/exposed/process   (sin ninguna cookie de sesión)
→ 401
WWW-Authenticate: Basic realm="BPMRESTAPI"
```

Esto es una diferencia de comportamiento no documentada hasta ahora dentro de la propia familia WLE: [API-13](../../../specs/technical-docs/portal-procesos-baw.md#api-13) (`PUT /rest/bpm/wle/v1/tasks`) sí exige `x-xsrf-token` porque es una escritura desde la perspectiva del framework (aunque semánticamente sea una lectura); este endpoint, al ser un `GET` real, no pasa por esa protección CSRF — solo necesita las cookies de sesión (`JSESSIONID`, `LtpaToken2`). El 401 sin sesión reproduce el mismo `WWW-Authenticate: Basic realm="BPMRESTAPI"` que ya se documentaba para la familia `/bpm/`, lo que aporta evidencia nueva para el punto 18 de Observaciones (formato de 401 en WLE, hasta ahora sin provocar).

### 5. El arranque real usa el `startURL` propio del catálogo, **no** `POST /bpm/processes` — confirmado con una llamada de escritura real

MD-02 documenta `model` (nombre del modelo) y `container` (acrónimo de la process app) como los identificadores que exige `POST /bpm/processes` (API-04). Este catálogo WLE no devuelve esos nombres: devuelve `bpdId` + `processAppId` y resuelve el arranque en su propio `startURL` (`POST /rest/bpm/wle/v1/process?action=start&bpdId=...&processAppId=...`). **Se ejecutó esa llamada real, autorizada explícitamente por el usuario**, contra el proceso de ejemplo "Vacation request" (`bpdId=25.2aef25cd-...`, `processAppId=2066.cc01cf46-...`):

```
POST /rest/bpm/wle/v1/process?action=start&bpdId=25.2aef25cd-3b97-455f-8f10-7f789a153710&processAppId=2066.cc01cf46-fd58-4209-a348-f4654947c15b
→ 200
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
    "tasks": [ { "displayName": "Submit request", "state": "STATE_CLAIMED", "owner": "andres.perez", ... } ],
    ...
  }
}
```

**Confirmado sin ambigüedad:**

- El endpoint funciona con solo `bpdId`/`processAppId` (los mismos GUIDs que devuelve el catálogo) — no hace falta `model`/`container` en ningún momento.
- `processTemplateName` de la respuesta (`"Vacation request"`) **coincide exactamente** con `display` del catálogo — confirma que `display` es, en efecto, el nombre del proceso/BPD.
- La respuesta es un objeto "instancia" propio de WLE, de forma distinta a `process` (MD-03, familia `/bpm/`): trae `piid` (id corto, no el `id` largo de MD-03), la lista de `tasks` ya creadas con su contrato completo (equivalente a MD-04 pero en otra forma más), el diagrama del BPD y el modelo de datos — mucho más rico que MD-03, y **sin necesidad de una llamada adicional** para ver la primera tarea generada.
- **Efecto colateral real, con autorización explícita del usuario:** esta llamada creó una instancia de negocio real y verificable (`Vacation request:303`, PIID `303`) en el ambiente de referencia, con una tarea ya asignada a `andres.perez` (equipo `EquipoFGM`). El usuario decidió dejarla como está (ambiente de referencia/demo, app de ejemplo de IBM) en vez de terminarla.

## Decisiones pendientes / opciones evaluadas

- ~~**¿Con qué endpoint arrancar la instancia una vez elegido el proceso de este catálogo?**~~ **Resuelto.** `POST /rest/bpm/wle/v1/process?action=start&bpdId=...&processAppId=...` (el `startURL` del propio catálogo) es el mecanismo confirmado — ver hallazgo 5. `POST /bpm/processes` (API-04, model/container) queda descartado para este flujo: nunca hubiera podido recibir esos dos campos desde este catálogo sin inventarlos.
- **¿El catálogo respeta de verdad la autorización "Expose to start" por usuario?** — el nombre del recurso (`exposed`) y el parámetro `forUser` (que valida usuarios reales) son evidencia fuerte a favor, pero **no se hizo la prueba diferencial** (mismo ambiente, un segundo usuario con menos equipos asignados, comparar catálogos). Recomendación: si esta decisión se planifica como trabajo, vale la pena esa prueba antes de dar la autorización por garantizada — el riesgo de asumirlo mal es mostrar procesos que el usuario no puede realmente iniciar.

## Conclusión y recomendación

**Sí existe un endpoint para listar los procesos iniciables, y también el endpoint correcto para arrancarlos — ambos en la familia WLE, no en la familia `/bpm/`** (que se reconfirma sin esa capacidad, consistente con lo ya documentado en MD-02/API-03). `GET /rest/bpm/wle/v1/exposed/process` responde con el catálogo real de procesos disponibles para el usuario de sesión, y su propio `startURL` (`POST /rest/bpm/wle/v1/process?action=start&bpdId=...&processAppId=...`, confirmado con una llamada de escritura real) arranca la instancia sin necesitar `model`/`container`.

**Recomendación concreta:**

1. **Usar `GET /rest/bpm/wle/v1/exposed/process`** (con `includeDescription=true` si se necesita el campo descripción, y `avoidBasicAuthChallenge` como en API-13 para no disparar el diálogo nativo del navegador en una SPA) como fuente del catálogo, y **`POST /rest/bpm/wle/v1/process?action=start&bpdId=...&processAppId=...`** (el `startURL` que el propio catálogo devuelve) para arrancar la instancia elegida. Ambos confirmados en vivo.
2. **Documentar este contrato formalmente** en `portal-procesos-baw.md` (actualizar MD-02 de "Confirmado (ausente)" a confirmado con el nuevo endpoint; reemplazar API-03 "No existe" por el contrato real; y documentar el arranque como una operación nueva de la familia WLE, distinta de API-04) — vía `design-define`, ya que ese documento vive fuera del alcance de escritura de este skill.
3. **Antes de cerrar la decisión de producto**, considerar validar la autorización por "Expose to start" con un segundo usuario si hay alguno disponible en el ambiente de referencia.

## Impacto en el artefacto / próximo paso

N/A — investigación independiente. No obstante, resuelve de facto el bloqueante documentado en [US-002](../../../archive/user-stories/US-002-iniciar-nuevos-procesos/README.md) (Observaciones, DoR "Inputs/outputs claros" y "Sin decisiones técnicas pendientes") y en el punto 2 de Observaciones de `portal-procesos-baw.md`:

- **`design-define`**: actualizar MD-02/API-03 del documento técnico con el contrato confirmado de `GET /rest/bpm/wle/v1/exposed/process` y documentar el arranque vía `POST /rest/bpm/wle/v1/process?action=start&...` como operación nueva de la familia WLE.
- **`work-define`**: retomar US-002 con AC-001 y AC-002 ahora respaldados por fuentes de datos y de arranque concretas y confirmadas.
- Investigación de seguimiento (este mismo skill, con autorización explícita de escritura), si se planifica como trabajo: la prueba diferencial de autorización "Expose to start" con un segundo usuario.

## Fuentes

- Ambiente de referencia de BAW: `https://192.168.120.100:9443` — llamadas en vivo, 2026-09-15 (login, `GET`/`OPTIONS` sobre `/rest/bpm/wle/v1/exposed/process` y `/rest/bpm/wle/v1/process`, variaciones de `filterByName`, `forUser`, `includeDescription`, `excludeProcessStartUrl`, `includeNonStartBPDs`, pruebas de autenticación sin `x-xsrf-token` y sin sesión, y una llamada de escritura real —autorizada explícitamente por el usuario— a `POST /rest/bpm/wle/v1/process?action=start&...` que creó la instancia de prueba `Vacation request:303`, PIID `303`).
- [`portal-procesos-baw.md` — MD-02, API-03, Observaciones punto 2](../../../specs/technical-docs/portal-procesos-baw.md).
- [US-002 — Iniciar nuevos procesos](../../../archive/user-stories/US-002-iniciar-nuevos-procesos/README.md).
- [RS-001 — metodología de validación en vivo contra el ambiente de referencia](../RS-001-detalle-tarea-wle/README.md).
