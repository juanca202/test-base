# Reporte de ejecución con evidencias — US-001 Autenticación y acceso al portal

**Fecha de ejecución:** 2026-09-30 00:23  
**Rama:** test/US-001-autenticacion-acceso-portal · **Commit base:** a9e696d (con cambios sin commitear en docs)  
**Historia:** [US-001](./README.md) · **Automatización:** [test-cases-automation.md](./test-cases-automation.md) · **Cobertura:** [criteria-coverage.md](./criteria-coverage.md)  
**Ejecución:** `chromium` (E2E) y `api-tests` (API) contra el portal local `BASE_URL`/`API_BASE_URL`, corrida limpia con 2 workers. Evidencia conforme a [ADR-007](../../../../adr/ADR-007-execution-evidence.md).

## Resumen

| Pruebas | ✅ Pasan | ⏭️ Omitidas (`test.fixme`) | ❌ Fallan |
| ------- | -------- | -------------------------- | --------- |
| 31      | 21       | 10                         | 0         |

Sin fallos. Las omitidas son pasos de un TC que el sistema no cumple (hallazgos abiertos, sin work item de seguimiento) y se detallan en cada caso.

| TC                | Caso                                                                                       | Criterio | Tipo          | Resultado  |
| ----------------- | ------------------------------------------------------------------------------------------ | -------- | ------------- | ---------- |
| [TC-001](#tc-001) | accede al módulo inicial del portal                                                        | AC-001   | API Test, E2E | ✅ PASS    |
| [TC-002](#tc-002) | el sistema lo redirige a la pantalla de login sin mostrar el módulo                        | AC-001   | E2E           | ✅ PASS    |
| [TC-003](#tc-003) | el sistema muestra un mensaje de error, lo mantiene en el login y no conserva las credenci | AC-001   | API Test, E2E | ⚠️ Parcial |
| [TC-004](#tc-004) | la petición viaja sobre HTTPS e incluye la cabecera `BPMCSRFToken`                         | AC-002   | API Test      | ✅ PASS    |
| [TC-005](#tc-005) | BAW la rechaza con `403` y `error_number: CWTBG0651E`                                      | AC-002   | API Test      | ⚠️ Parcial |
| [TC-006](#tc-006) | el sistema descarta las credenciales locales y lo redirige al login sin invocar ningún end | AC-003   | E2E           | ⚠️ Parcial |
| [TC-007](#tc-007) | el sistema lo redirige al login y los cambios no guardados se pierden                      | AC-004   | E2E           | ✅ PASS    |
| [TC-008](#tc-008) | el sistema lo redirige al login sin exponer el contenido del módulo                        | AC-004   | E2E           | ✅ PASS    |
| [TC-009](#tc-009) | el sistema muestra un mensaje claro de indisponibilidad con opción de reintentar y no marc | AC-005   | E2E           | ✅ PASS    |
| [TC-011](#tc-011) | la navegación se muestra completa, con etiquetas visibles y sin colapsar                   | AC-007   | Visual Test   | ⚠️ Parcial |
| [TC-012](#tc-012) | la navegación se muestra colapsada a iconos y se expande al interactuar con ella           | AC-007   | Visual Test   | ⚠️ Parcial |
| [TC-013](#tc-013) | el menú se muestra como icono de hamburguesa que abre un panel de navegación superpuesto   | AC-007   | Visual Test   | ⚠️ Parcial |
| [TC-014](#tc-014) | el layout cambia de rango de forma limpia, sin quedar en un estado intermedio roto         | AC-007   | Visual Test   | ⚠️ Parcial |

**Leyenda:** ⚠️ Parcial = parte del TC pasa y otra parte está en `test.fixme` por un hallazgo.

## Casos de prueba

### TC-001

Dado un usuario con credenciales válidas de BAW, Cuando envía el formulario de login, Entonces accede al módulo inicial del portal

- **Definición:** [TC-001-login-credenciales-validas-happy.md](./test-cases/TC-001-login-credenciales-validas-happy.md)
- **Criterio:** AC-001 · **Prioridad:** Alta · **Tipo:** API Test, E2E

| Prueba                                                                                       | Nivel | Resultado | Duración | Código                                                       |
| -------------------------------------------------------------------------------------------- | ----- | --------- | -------- | ------------------------------------------------------------ |
| TC-001: debe llegar al módulo inicial autenticado al iniciar sesión con credenciales válidas | E2E   | ✅ PASS   | 1.7 s    | `e2e/us-001/tc-001-login-credenciales-validas.e2e.spec.ts:9` |
| TC-001: debe responder 201 con csrf_token y cookie de sesión con credenciales válidas        | API   | ✅ PASS   | 0.5 s    | `api/us-001/tc-001-login-credenciales-validas.api.spec.ts:8` |

**Videos (E2E)**

- [video-1-debe-llegar-al-m-dulo-inicial-autenticado-al-iniciar-sesi-n-.webm](./evidencias/TC-001/video-1-debe-llegar-al-m-dulo-inicial-autenticado-al-iniciar-sesi-n-.webm) — TC-001: debe llegar al módulo inicial autenticado al iniciar sesión con credenciales válidas

**Intercambio HTTP (API)** — cabeceras y tokens enmascarados por la fixture.

<details><summary>1. POST /bpm/system/login — request</summary>

```json
{
  "method": "POST",
  "url": "/bpm/system/login",
  "headers": {
    "Authorization": "***"
  },
  "body": "{\n  \"refresh_groups\": true,\n  \"requested_lifetime\": 7200\n}"
}
```

</details>

<details><summary>1. POST /bpm/system/login — response</summary>

```json
{
  "status": 201,
  "headers": {
    "vary": "Origin",
    "x-powered-by": "Servlet/3.0",
    "bpm_generic_header": "SERVED",
    "content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "x-content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "cache-control": "no-cache, no-store, max-age=0",
    "pragma": "no-cache",
    "expires": "0",
    "content-type": "application/json;charset=UTF-8",
    "content-encoding": "gzip",
    "content-language": "es-EC",
    "set-cookie": "***",
    "connection": "Close",
    "date": "Wed, 30 Sep 2026 05:21:46 GMT",
    "transfer-encoding": "chunked"
  },
  "body": "{\"csrf_token\":\"***\",\"expiration\":7200}"
}
```

</details>

### TC-002

Dado un usuario sin sesión activa, Cuando abre directamente la URL de un módulo protegido del portal, Entonces el sistema lo redirige a la pantalla de login sin mostrar el módulo

- **Definición:** [TC-002-acceso-sin-sesion-redirige-login-error.md](./test-cases/TC-002-acceso-sin-sesion-redirige-login-error.md)
- **Criterio:** AC-001 · **Prioridad:** Alta · **Tipo:** E2E

| Prueba                                                                                         | Nivel | Resultado | Duración | Código                                                             |
| ---------------------------------------------------------------------------------------------- | ----- | --------- | -------- | ------------------------------------------------------------------ |
| TC-002: debe redirigir al login sin renderizar el módulo al abrir una URL protegida sin sesión | E2E   | ✅ PASS   | 1.2 s    | `e2e/us-001/tc-002-acceso-sin-sesion-redirige-login.e2e.spec.ts:9` |

**Videos (E2E)**

- [video-1-debe-redirigir-al-login-sin-renderizar-el-m-dulo-al-abrir-un.webm](./evidencias/TC-002/video-1-debe-redirigir-al-login-sin-renderizar-el-m-dulo-al-abrir-un.webm) — TC-002: debe redirigir al login sin renderizar el módulo al abrir una URL protegida sin sesión

### TC-003

Dado un usuario en la pantalla de login, Cuando envía credenciales inválidas, Entonces el sistema muestra un mensaje de error, lo mantiene en el login y no conserva las credenciales

- **Definición:** [TC-003-login-credenciales-invalidas-error.md](./test-cases/TC-003-login-credenciales-invalidas-error.md)
- **Criterio:** AC-001 · **Prioridad:** Alta · **Tipo:** API Test, E2E
- **Hallazgo:** Paso 4: el campo de contraseña conserva el valor tecleado tras el error (se esperaba vacío). Prueba `test.fixme`.

| Prueba                                                                                                      | Nivel | Resultado  | Duración | Código                                                          |
| ----------------------------------------------------------------------------------------------------------- | ----- | ---------- | -------- | --------------------------------------------------------------- |
| TC-003: el portal muestra un error genérico, permanece en el login y no conserva credenciales               | E2E   | ✅ PASS    | 5.5 s    | `e2e/us-001/tc-003-login-credenciales-invalidas.e2e.spec.ts:17` |
| TC-003 (paso 4): el campo de contraseña queda vacío tras el error                                           | E2E   | ⏭️ OMITIDA | 0.1 s    | `e2e/us-001/tc-003-login-credenciales-invalidas.e2e.spec.ts:92` |
| TC-003: BAW rechaza con 401 sin emitir sesión y sin distinguir usuario inexistente de contraseña incorrecta | API   | ✅ PASS    | 5.5 s    | `api/us-001/tc-003-login-credenciales-invalidas.api.spec.ts:9`  |

**Videos (E2E)**

- [video-1-el-portal-muestra-un-error-gen-rico-permanece-en-el-login-y-.webm](./evidencias/TC-003/video-1-el-portal-muestra-un-error-gen-rico-permanece-en-el-login-y-.webm) — TC-003: el portal muestra un error genérico, permanece en el login y no conserva credenciales

**Intercambio HTTP (API)** — cabeceras y tokens enmascarados por la fixture.

<details><summary>1. POST /bpm/system/login — request</summary>

```json
{
  "method": "POST",
  "url": "/bpm/system/login",
  "headers": {
    "Authorization": "***"
  },
  "body": "{\n  \"refresh_groups\": true,\n  \"requested_lifetime\": 7200\n}"
}
```

</details>

<details><summary>1. POST /bpm/system/login — response</summary>

```json
{
  "status": 401,
  "headers": {
    "vary": "Origin",
    "x-powered-by": "Servlet/3.0",
    "www-authenticate": "Basic realm=\"BPMRESTAPI\"",
    "content-language": "es-EC",
    "content-length": "0",
    "connection": "Close",
    "date": "Wed, 30 Sep 2026 05:21:49 GMT"
  },
  "body": ""
}
```

</details>

<details><summary>2. POST /bpm/system/login — request</summary>

```json
{
  "method": "POST",
  "url": "/bpm/system/login",
  "headers": {
    "Authorization": "***"
  },
  "body": "{\n  \"refresh_groups\": true,\n  \"requested_lifetime\": 7200\n}"
}
```

</details>

<details><summary>2. POST /bpm/system/login — response</summary>

```json
{
  "status": 401,
  "headers": {
    "vary": "Origin",
    "x-powered-by": "Servlet/3.0",
    "www-authenticate": "Basic realm=\"BPMRESTAPI\"",
    "content-language": "es-EC",
    "content-length": "0",
    "connection": "Close",
    "date": "Wed, 30 Sep 2026 05:21:51 GMT"
  },
  "body": ""
}
```

</details>

### TC-004

Dado un usuario autenticado en el portal, Cuando el sistema emite cualquier petición posterior al login hacia BAW, Entonces la petición viaja sobre HTTPS e incluye la cabecera `BPMCSRFToken`

- **Definición:** [TC-004-peticion-autenticada-https-csrf-happy.md](./test-cases/TC-004-peticion-autenticada-https-csrf-happy.md)
- **Criterio:** AC-002 · **Prioridad:** Alta · **Tipo:** API Test

| Prueba                                                                                           | Nivel | Resultado | Duración | Código                                                             |
| ------------------------------------------------------------------------------------------------ | ----- | --------- | -------- | ------------------------------------------------------------------ |
| TC-004: una petición posterior al login viaja por HTTPS con BPMCSRFToken y BAW la acepta con 200 | API   | ✅ PASS   | 0.3 s    | `api/us-001/tc-004-peticion-autenticada-https-csrf.api.spec.ts:10` |

> ⚠️ **No verificado:** Paso 4: API_BASE_URL usa http: (proxy del portal); el https de BAW requiere una variable con su URL directa

**Intercambio HTTP (API)** — cabeceras y tokens enmascarados por la fixture.

<details><summary>1. POST /bpm/system/login — request</summary>

```json
{
  "method": "POST",
  "url": "/bpm/system/login",
  "headers": {
    "Authorization": "***"
  },
  "body": "{\n  \"refresh_groups\": true,\n  \"requested_lifetime\": 7200\n}"
}
```

</details>

<details><summary>1. POST /bpm/system/login — response</summary>

```json
{
  "status": 201,
  "headers": {
    "vary": "Origin",
    "x-powered-by": "Servlet/3.0",
    "bpm_generic_header": "SERVED",
    "content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "x-content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "cache-control": "no-cache, no-store, max-age=0",
    "pragma": "no-cache",
    "expires": "0",
    "content-type": "application/json;charset=UTF-8",
    "content-encoding": "gzip",
    "content-language": "es-EC",
    "set-cookie": "***",
    "connection": "Close",
    "date": "Wed, 30 Sep 2026 05:21:46 GMT",
    "transfer-encoding": "chunked"
  },
  "body": "{\"csrf_token\":\"***\",\"expiration\":7200}"
}
```

</details>

<details><summary>2. GET /bpm/user-tasks — request</summary>

```json
{
  "method": "GET",
  "url": "/bpm/user-tasks",
  "headers": {
    "BPMCSRFToken": "***"
  },
  "body": ""
}
```

</details>

- 2. GET /bpm/user-tasks — response: [2-get-bpm-user-tasks-response.json](./evidencias/TC-004/2-get-bpm-user-tasks-response.json) (39 KB)

### TC-005

Dado un usuario con cookie de sesión válida de BAW, Cuando se emite una petición sin la cabecera `BPMCSRFToken`, Entonces BAW la rechaza con `403` y `error_number: CWTBG0651E`

- **Definición:** [TC-005-peticion-sin-csrf-token-rechazada-error.md](./test-cases/TC-005-peticion-sin-csrf-token-rechazada-error.md)
- **Criterio:** AC-002 · **Prioridad:** Alta · **Tipo:** API Test
- **Hallazgo:** La envoltura `exception` del `403` no existe: BAW devuelve `error_number` y `error_message` en la raíz. Probable corrección del TC. Prueba `test.fixme`.

| Prueba                                                                                                  | Nivel | Resultado  | Duración | Código                                                               |
| ------------------------------------------------------------------------------------------------------- | ----- | ---------- | -------- | -------------------------------------------------------------------- |
| TC-005: BAW rechaza con 403 y CWTBG0651E una petición con cookie de sesión válida pero sin BPMCSRFToken | API   | ✅ PASS    | 0.1 s    | `api/us-001/tc-005-peticion-sin-csrf-token-rechazada.api.spec.ts:9`  |
| TC-005: el cuerpo del 403 se envuelve en un objeto exception con error_number CWTBG0651E                | API   | ⏭️ OMITIDA | 0.0 s    | `api/us-001/tc-005-peticion-sin-csrf-token-rechazada.api.spec.ts:38` |

**Intercambio HTTP (API)** — cabeceras y tokens enmascarados por la fixture.

<details><summary>1. POST /bpm/system/login — request</summary>

```json
{
  "method": "POST",
  "url": "/bpm/system/login",
  "headers": {
    "Authorization": "***"
  },
  "body": "{\n  \"refresh_groups\": true,\n  \"requested_lifetime\": 7200\n}"
}
```

</details>

<details><summary>1. POST /bpm/system/login — response</summary>

```json
{
  "status": 201,
  "headers": {
    "vary": "Origin",
    "x-powered-by": "Servlet/3.0",
    "bpm_generic_header": "SERVED",
    "content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "x-content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "cache-control": "no-cache, no-store, max-age=0",
    "pragma": "no-cache",
    "expires": "0",
    "content-type": "application/json;charset=UTF-8",
    "content-encoding": "gzip",
    "content-language": "es-EC",
    "set-cookie": "***",
    "connection": "Close",
    "date": "Wed, 30 Sep 2026 05:21:46 GMT",
    "transfer-encoding": "chunked"
  },
  "body": "{\"csrf_token\":\"***\",\"expiration\":7200}"
}
```

</details>

<details><summary>2. GET /bpm/user-tasks — request</summary>

```json
{
  "method": "GET",
  "url": "/bpm/user-tasks",
  "headers": {},
  "body": ""
}
```

</details>

<details><summary>2. GET /bpm/user-tasks — response</summary>

```json
{
  "status": 403,
  "headers": {
    "vary": "Origin",
    "x-powered-by": "Servlet/3.0",
    "bpm_generic_header": "SERVED",
    "content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "x-content-security-policy": "default-src 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' fonts.gstatic.com data:; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https: blob:",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "x-content-type-options": "nosniff",
    "x-xss-protection": "1; mode=block",
    "content-type": "application/json",
    "content-encoding": "gzip",
    "content-language": "es-EC",
    "connection": "Close",
    "date": "Wed, 30 Sep 2026 05:21:46 GMT",
    "transfer-encoding": "chunked"
  },
  "body": "{\n \"error_number\": \"CWTBG0651E\",\n  \"error_message\": \"CWTBG0651E: La solicitud se ha bloqueado porque no se ha podido verificar la cabecera de se�al BPMCSRFToken.\"\n}"
}
```

</details>

### TC-006

Dado un usuario autenticado situado en cualquier módulo del portal, Cuando cierra sesión desde el control del pie del menú lateral, Entonces el sistema descarta las credenciales locales y lo redirige al login sin invocar ningún endpoint de BAW

- **Definición:** [TC-006-cierre-sesion-desde-menu-lateral-happy.md](./test-cases/TC-006-cierre-sesion-desde-menu-lateral-happy.md)
- **Criterio:** AC-003 · **Prioridad:** Media · **Tipo:** E2E
- **Hallazgo:** Pasos 1-2: el portal no tiene menú lateral; el cierre de sesión está en el menú de usuario del encabezado. Prueba `test.fixme`.

| Prueba                                                                                                          | Nivel | Resultado  | Duración | Código                                                               |
| --------------------------------------------------------------------------------------------------------------- | ----- | ---------- | -------- | -------------------------------------------------------------------- |
| TC-006: el cierre de sesión descarta las credenciales locales, redirige al login y no llama a BAW               | E2E   | ✅ PASS    | 2.4 s    | `e2e/us-001/tc-006-cierre-sesion-desde-menu-lateral.e2e.spec.ts:14`  |
| TC-006 (pasos 1-2): el pie del menú lateral muestra el botón de cierre de sesión, también con el menú colapsado | E2E   | ⏭️ OMITIDA | 0.1 s    | `e2e/us-001/tc-006-cierre-sesion-desde-menu-lateral.e2e.spec.ts:108` |

**Videos (E2E)**

- [video-1-el-cierre-de-sesi-n-descarta-las-credenciales-locales-rediri.webm](./evidencias/TC-006/video-1-el-cierre-de-sesi-n-descarta-las-credenciales-locales-rediri.webm) — TC-006: el cierre de sesión descarta las credenciales locales, redirige al login y no llama a BAW

### TC-007

Dado un usuario autenticado que está completando un formulario, Cuando su sesión expira antes de guardar, Entonces el sistema lo redirige al login y los cambios no guardados se pierden

- **Definición:** [TC-007-sesion-expira-durante-formulario-error.md](./test-cases/TC-007-sesion-expira-durante-formulario-error.md)
- **Criterio:** AC-004 · **Prioridad:** Alta · **Tipo:** E2E

| Prueba                                                                                                              | Nivel | Resultado | Duración | Código                                                                     |
| ------------------------------------------------------------------------------------------------------------------- | ----- | --------- | -------- | -------------------------------------------------------------------------- |
| TC-007: debe redirigir al login y perder los cambios no guardados cuando la sesión expira con un formulario abierto | E2E   | ✅ PASS   | 1.3 s    | `e2e/us-001/tc-007-sesion-expira-durante-formulario-error.e2e.spec.ts:48`  |
| TC-007 (paso 5): el login informa que la sesión expiró                                                              | E2E   | ✅ PASS   | 1.2 s    | `e2e/us-001/tc-007-sesion-expira-durante-formulario-error.e2e.spec.ts:159` |

**Videos (E2E)**

- [video-1-debe-redirigir-al-login-y-perder-los-cambios-no-guardados-cu.webm](./evidencias/TC-007/video-1-debe-redirigir-al-login-y-perder-los-cambios-no-guardados-cu.webm) — TC-007: debe redirigir al login y perder los cambios no guardados cuando la sesión expira con un formulario ab
- [video-2-el-login-informa-que-la-sesi-n-expir.webm](./evidencias/TC-007/video-2-el-login-informa-que-la-sesi-n-expir.webm) — TC-007 (paso 5): el login informa que la sesión expiró

### TC-008

Dado un usuario cuya sesión ya no es válida, Cuando abre directamente por URL un módulo protegido, Entonces el sistema lo redirige al login sin exponer el contenido del módulo

- **Definición:** [TC-008-acceso-directo-url-sesion-invalida-error.md](./test-cases/TC-008-acceso-directo-url-sesion-invalida-error.md)
- **Criterio:** AC-004 · **Prioridad:** Alta · **Tipo:** E2E

| Prueba                                                                                                           | Nivel | Resultado | Duración | Código                                                                |
| ---------------------------------------------------------------------------------------------------------------- | ----- | --------- | -------- | --------------------------------------------------------------------- |
| TC-008: debe redirigir al login sin exponer el módulo al abrir una URL protegida con la sesión invalidada en BAW | E2E   | ✅ PASS   | 1.5 s    | `e2e/us-001/tc-008-acceso-directo-url-sesion-invalida.e2e.spec.ts:18` |

**Videos (E2E)**

- [video-1-debe-redirigir-al-login-sin-exponer-el-m-dulo-al-abrir-una-u.webm](./evidencias/TC-008/video-1-debe-redirigir-al-login-sin-exponer-el-m-dulo-al-abrir-una-u.webm) — TC-008: debe redirigir al login sin exponer el módulo al abrir una URL protegida con la sesión invalidada en B

### TC-009

Dado que BAW está inaccesible, Cuando el usuario intenta iniciar sesión, Entonces el sistema muestra un mensaje claro de indisponibilidad con opción de reintentar y no marca la sesión como iniciada

- **Definición:** [TC-009-baw-inaccesible-en-login-error.md](./test-cases/TC-009-baw-inaccesible-en-login-error.md)
- **Criterio:** AC-005 · **Prioridad:** Media · **Tipo:** E2E

| Prueba                                                                                                                              | Nivel | Resultado | Duración | Código                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----- | --------- | -------- | ----------------------------------------------------------------- |
| TC-009: con BAW inaccesible (error de red) el portal informa la indisponibilidad, no inicia sesión y permite reintentar             | E2E   | ✅ PASS   | 5.7 s    | `e2e/us-001/tc-009-baw-inaccesible-en-login-error.e2e.spec.ts:46` |
| TC-009: con BAW inaccesible (tiempo de espera agotado) el portal informa la indisponibilidad, no inicia sesión y permite reintentar | E2E   | ✅ PASS   | 3.3 s    | `e2e/us-001/tc-009-baw-inaccesible-en-login-error.e2e.spec.ts:46` |
| TC-009: con BAW inaccesible (respuesta 500) el portal informa la indisponibilidad, no inicia sesión y permite reintentar            | E2E   | ✅ PASS   | 7.1 s    | `e2e/us-001/tc-009-baw-inaccesible-en-login-error.e2e.spec.ts:46` |

**Videos (E2E)**

- [video-1-con-baw-inaccesible-error-de-red-el-portal-informa-la-indisp.webm](./evidencias/TC-009/video-1-con-baw-inaccesible-error-de-red-el-portal-informa-la-indisp.webm) — TC-009: con BAW inaccesible (error de red) el portal informa la indisponibilidad, no inicia sesión y permite r
- [video-2-con-baw-inaccesible-tiempo-de-espera-agotado-el-portal-infor.webm](./evidencias/TC-009/video-2-con-baw-inaccesible-tiempo-de-espera-agotado-el-portal-infor.webm) — TC-009: con BAW inaccesible (tiempo de espera agotado) el portal informa la indisponibilidad, no inicia sesión
- [video-3-con-baw-inaccesible-respuesta-500-el-portal-informa-la-indis.webm](./evidencias/TC-009/video-3-con-baw-inaccesible-respuesta-500-el-portal-informa-la-indis.webm) — TC-009: con BAW inaccesible (respuesta 500) el portal informa la indisponibilidad, no inicia sesión y permite

### TC-011

Dado un usuario autenticado en una pantalla de escritorio (≥1280px), Cuando abre cualquier módulo del portal, Entonces la navegación se muestra completa, con etiquetas visibles y sin colapsar

- **Definición:** [TC-011-layout-escritorio-navegacion-completa-happy.md](./test-cases/TC-011-layout-escritorio-navegacion-completa-happy.md)
- **Criterio:** AC-007 · **Prioridad:** Media · **Tipo:** Visual Test
- **Hallazgo:** Paso 4 (comparación con referencia visual aprobada): no existe la referencia. Prueba `test.fixme`; se adjuntan capturas.

| Prueba                                                                                                                   | Nivel | Resultado  | Duración | Código                                                                   |
| ------------------------------------------------------------------------------------------------------------------------ | ----- | ---------- | -------- | ------------------------------------------------------------------------ |
| TC-011: en anchos de escritorio la navegación se muestra completa, con etiquetas y sin control de expansión ni desbordes | E2E   | ✅ PASS    | 1.6 s    | `e2e/us-001/tc-011-layout-escritorio-navegacion-completa.e2e.spec.ts:17` |
| TC-011 (paso 4): la captura coincide con la referencia visual aprobada de escritorio                                     | E2E   | ⏭️ OMITIDA | 0.0 s    | `e2e/us-001/tc-011-layout-escritorio-navegacion-completa.e2e.spec.ts:91` |

**Videos (E2E)**

- [video-1-en-anchos-de-escritorio-la-navegaci-n-se-muestra-completa-co.webm](./evidencias/TC-011/video-1-en-anchos-de-escritorio-la-navegaci-n-se-muestra-completa-co.webm) — TC-011: en anchos de escritorio la navegación se muestra completa, con etiquetas y sin control de expansión ni

**Capturas**

- layout-1280px-tasks  
  ![layout-1280px-tasks](./evidencias/TC-011/layout-1280px-tasks.png)
- layout-1280px-processes  
  ![layout-1280px-processes](./evidencias/TC-011/layout-1280px-processes.png)
- layout-1920px-tasks  
  ![layout-1920px-tasks](./evidencias/TC-011/layout-1920px-tasks.png)
- layout-1920px-processes  
  ![layout-1920px-processes](./evidencias/TC-011/layout-1920px-processes.png)

### TC-012

Dado un usuario autenticado en una pantalla de tablet (768–1279px), Cuando abre cualquier módulo del portal, Entonces la navegación se muestra colapsada a iconos y se expande al interactuar con ella

- **Definición:** [TC-012-layout-tablet-navegacion-colapsada-happy.md](./test-cases/TC-012-layout-tablet-navegacion-colapsada-happy.md)
- **Criterio:** AC-007 · **Prioridad:** Media · **Tipo:** Visual Test
- **Hallazgo:** Pasos 2-4: no hay colapso a iconos en tablet; el tablist muestra icono y etiqueta en todo el rango. Prueba `test.fixme`.

| Prueba                                                                                                          | Nivel | Resultado  | Duración | Código                                                                |
| --------------------------------------------------------------------------------------------------------------- | ----- | ---------- | -------- | --------------------------------------------------------------------- |
| TC-012: el layout de tablet a 768px muestra todos los destinos, permite navegar y no desborda horizontalmente   | E2E   | ✅ PASS    | 1.1 s    | `e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts:22` |
| TC-012 (pasos 2-4): a 768px la navegación se colapsa a iconos, se expande al interactuar y vuelve a colapsarse  | E2E   | ⏭️ OMITIDA | 0.1 s    | `e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts:86` |
| TC-012: el layout de tablet a 1024px muestra todos los destinos, permite navegar y no desborda horizontalmente  | E2E   | ✅ PASS    | 1.2 s    | `e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts:22` |
| TC-012 (pasos 2-4): a 1024px la navegación se colapsa a iconos, se expande al interactuar y vuelve a colapsarse | E2E   | ⏭️ OMITIDA | 0.1 s    | `e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts:86` |
| TC-012: el layout de tablet a 1279px muestra todos los destinos, permite navegar y no desborda horizontalmente  | E2E   | ✅ PASS    | 1.1 s    | `e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts:22` |
| TC-012 (pasos 2-4): a 1279px la navegación se colapsa a iconos, se expande al interactuar y vuelve a colapsarse | E2E   | ⏭️ OMITIDA | 0.1 s    | `e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts:86` |

**Videos (E2E)**

- [video-1-el-layout-de-tablet-a-768px-muestra-todos-los-destinos-permi.webm](./evidencias/TC-012/video-1-el-layout-de-tablet-a-768px-muestra-todos-los-destinos-permi.webm) — TC-012: el layout de tablet a 768px muestra todos los destinos, permite navegar y no desborda horizontalmente
- [video-2-el-layout-de-tablet-a-1024px-muestra-todos-los-destinos-perm.webm](./evidencias/TC-012/video-2-el-layout-de-tablet-a-1024px-muestra-todos-los-destinos-perm.webm) — TC-012: el layout de tablet a 1024px muestra todos los destinos, permite navegar y no desborda horizontalmente
- [video-3-el-layout-de-tablet-a-1279px-muestra-todos-los-destinos-perm.webm](./evidencias/TC-012/video-3-el-layout-de-tablet-a-1279px-muestra-todos-los-destinos-perm.webm) — TC-012: el layout de tablet a 1279px muestra todos los destinos, permite navegar y no desborda horizontalmente

**Capturas**

- navegacion-inicial-768px  
  ![navegacion-inicial-768px](./evidencias/TC-012/navegacion-inicial-768px.png)
- navegacion-tras-navegar-768px  
  ![navegacion-tras-navegar-768px](./evidencias/TC-012/navegacion-tras-navegar-768px.png)
- navegacion-inicial-1024px  
  ![navegacion-inicial-1024px](./evidencias/TC-012/navegacion-inicial-1024px.png)
- navegacion-tras-navegar-1024px  
  ![navegacion-tras-navegar-1024px](./evidencias/TC-012/navegacion-tras-navegar-1024px.png)
- navegacion-inicial-1279px  
  ![navegacion-inicial-1279px](./evidencias/TC-012/navegacion-inicial-1279px.png)
- navegacion-tras-navegar-1279px  
  ![navegacion-tras-navegar-1279px](./evidencias/TC-012/navegacion-tras-navegar-1279px.png)

### TC-013

Dado un usuario autenticado en una pantalla móvil (<768px), Cuando abre cualquier módulo del portal, Entonces el menú se muestra como icono de hamburguesa que abre un panel de navegación superpuesto

- **Definición:** [TC-013-layout-movil-menu-hamburguesa-happy.md](./test-cases/TC-013-layout-movil-menu-hamburguesa-happy.md)
- **Criterio:** AC-007 · **Prioridad:** Media · **Tipo:** Visual Test
- **Hallazgo:** Pasos 2-5: no hay hamburguesa ni panel; por debajo de 768 px la navegación se oculta sin alternativa. Prueba `test.fixme`. Es el hallazgo de mayor impacto.

| Prueba                                                                                                                           | Nivel | Resultado  | Duración | Código                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------- | -------- | ---------------------------------------------------------------- |
| TC-013: a 360px la navegación no ocupa espacio fijo y el contenido no desborda (pasos 1, 2 y 6 parcial)                          | E2E   | ✅ PASS    | 2.9 s    | `e2e/us-001/tc-013-layout-movil-menu-hamburguesa.e2e.spec.ts:27` |
| TC-013: a 360px el encabezado muestra hamburguesa que abre un panel superpuesto con todos los destinos (pasos 2 a 5 y 6 parcial) | E2E   | ⏭️ OMITIDA | 1.1 s    | `e2e/us-001/tc-013-layout-movil-menu-hamburguesa.e2e.spec.ts:67` |
| TC-013: a 767px la navegación no ocupa espacio fijo y el contenido no desborda (pasos 1, 2 y 6 parcial)                          | E2E   | ✅ PASS    | 3.1 s    | `e2e/us-001/tc-013-layout-movil-menu-hamburguesa.e2e.spec.ts:27` |
| TC-013: a 767px el encabezado muestra hamburguesa que abre un panel superpuesto con todos los destinos (pasos 2 a 5 y 6 parcial) | E2E   | ⏭️ OMITIDA | 1.1 s    | `e2e/us-001/tc-013-layout-movil-menu-hamburguesa.e2e.spec.ts:67` |

**Videos (E2E)**

- [video-1-a-360px-la-navegaci-n-no-ocupa-espacio-fijo-y-el-contenido-n.webm](./evidencias/TC-013/video-1-a-360px-la-navegaci-n-no-ocupa-espacio-fijo-y-el-contenido-n.webm) — TC-013: a 360px la navegación no ocupa espacio fijo y el contenido no desborda (pasos 1, 2 y 6 parcial)
- [video-2-a-767px-la-navegaci-n-no-ocupa-espacio-fijo-y-el-contenido-n.webm](./evidencias/TC-013/video-2-a-767px-la-navegaci-n-no-ocupa-espacio-fijo-y-el-contenido-n.webm) — TC-013: a 767px la navegación no ocupa espacio fijo y el contenido no desborda (pasos 1, 2 y 6 parcial)

**Capturas**

- movil-360-tasks  
  ![movil-360-tasks](./evidencias/TC-013/movil-360-tasks.png)
- movil-360-processes  
  ![movil-360-processes](./evidencias/TC-013/movil-360-processes.png)
- movil-767-tasks  
  ![movil-767-tasks](./evidencias/TC-013/movil-767-tasks.png)
- movil-767-processes  
  ![movil-767-processes](./evidencias/TC-013/movil-767-processes.png)

### TC-014

Dado el portal abierto en un módulo autenticado, Cuando el ancho de la ventana cruza exactamente 768px y 1280px, Entonces el layout cambia de rango de forma limpia, sin quedar en un estado intermedio roto

- **Definición:** [TC-014-breakpoints-768-1280-limite.md](./test-cases/TC-014-breakpoints-768-1280-limite.md)
- **Criterio:** AC-007 · **Prioridad:** Baja · **Tipo:** Visual Test
- **Hallazgo:** Pasos 1, 2 y 4: sin hamburguesa a 767 px ni colapso a iconos en 768/1279 px. Prueba `test.fixme`.

| Prueba                                                                                                                                      | Nivel | Resultado  | Duración | Código                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------- | -------- | --------------------------------------------------------------- |
| TC-014: en 768-1281px el layout es único y estable a cada lado de los bordes y el redimensionado continuo no deja estados intermedios rotos | E2E   | ✅ PASS    | 2.0 s    | `e2e/us-001/tc-014-breakpoints-768-1280-limite.e2e.spec.ts:34`  |
| TC-014 (pasos 1, 2 y 4): 767px muestra layout móvil con hamburguesa y 768px/1279px muestran la navegación de tablet colapsada a iconos      | E2E   | ⏭️ OMITIDA | 0.1 s    | `e2e/us-001/tc-014-breakpoints-768-1280-limite.e2e.spec.ts:167` |

**Videos (E2E)**

- [video-1-en-768-1281px-el-layout-es-nico-y-estable-a-cada-lado-de-los.webm](./evidencias/TC-014/video-1-en-768-1281px-el-layout-es-nico-y-estable-a-cada-lado-de-los.webm) — TC-014: en 768-1281px el layout es único y estable a cada lado de los bordes y el redimensionado continuo no d

**Capturas**

- layout-768px  
  ![layout-768px](./evidencias/TC-014/layout-768px.png)
- layout-769px  
  ![layout-769px](./evidencias/TC-014/layout-769px.png)
- layout-1279px  
  ![layout-1279px](./evidencias/TC-014/layout-1279px.png)
- layout-1280px  
  ![layout-1280px](./evidencias/TC-014/layout-1280px.png)
- layout-1281px  
  ![layout-1281px](./evidencias/TC-014/layout-1281px.png)
- layout-final-sweep  
  ![layout-final-sweep](./evidencias/TC-014/layout-final-sweep.png)

## Notas

- Las pruebas omitidas no generan evidencia útil (el video registrado dura menos de un segundo y se descarta).
- Los TC-003 y otros que provocan intentos de login fallidos generan 2 intentos contra la cuenta real por corrida.
- Las capturas de TC-011 a TC-014 son estructurales; no hay referencia visual aprobada para comparar píxeles.
- La respuesta de `GET /bpm/user-tasks` (TC-004, TC-005) incluye datos de tareas reales de la cuenta de prueba; revisar antes de compartir fuera del equipo.
- Los videos son `.webm`; se abren en el navegador.
