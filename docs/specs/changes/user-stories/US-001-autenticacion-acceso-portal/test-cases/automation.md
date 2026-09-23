# Automatización de pruebas

## US-001: Autenticación y acceso al portal

**Estado:** In Progress
**Sistema bajo prueba:** Portal de procesos BAW (frontend) sobre IBM BAW — variables: `BASE_URL`, `API_BASE_URL`, `TEST_USER_NAME`, `TEST_USER_PASSWORD`
**Fecha de creación:** 2026-09-23 14:10
**Ultima actualizacion:** 2026-09-23 16:50

## Unidades

### TC-001: Login con credenciales válidas accede al módulo inicial

**Estado:** Done
**Iniciado:** 2026-09-23 14:10
**Finalizado:** 2026-09-23 14:30
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ src/config/env.ts
+ src/pages/LoginPage.ts
+ tests/e2e/us-001/tc-001-login-credenciales-validas.e2e.spec.ts
+ tests/api/us-001/tc-001-login-credenciales-validas.api.spec.ts
~ .env.example
```

**Cobertura de test cases:**

- TC-001 (Integration, E2E) se automatizó como API + E2E, según lo decidido con el usuario; sin desviación de nivel.
- Paso 3 (guardado de `csrf_token` y `username` en almacenamiento efímero): no se asertan esas claves. El portal guarda una sesión opaca (`baw_sess` / `baw_loc`) y es detalle de implementación interna; se verifica el comportamiento observable (redirección a `/tasks`, usuario visible en el encabezado y peticiones posteriores con cookie de sesión y `BPMCSRFToken`).
- `.env.example` no declaraba `TEST_USER_NAME` (las pruebas la consumen); se añadió sin valor.

**Hallazgos:**
Ninguno.

### TC-002: Acceso sin sesión redirige al login

**Estado:** Done
**Iniciado:** 2026-09-23 14:40
**Finalizado:** 2026-09-23 14:50
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ src/pages/TasksPage.ts
+ tests/e2e/us-001/tc-002-acceso-sin-sesion-redirige-login.e2e.spec.ts
```

**Cobertura de test cases:**

- Los datos de prueba `/mis-tareas` y `/login` del TC están marcados `[propuesto]`; se usaron las rutas reales del portal (`/tasks` y `/signin`).
- Paso 1 (sin `csrf_token` ni `username` en almacenamiento): se verifica que el contexto de navegador nuevo no tiene cookies; el portal guarda una sesión opaca y no esas claves (ver TC-001).

**Hallazgos:**

Ninguno.

### TC-003: Login con credenciales inválidas

**Estado:** Done
**Iniciado:** 2026-09-23 15:00
**Finalizado:** 2026-09-23 15:25
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-003-login-credenciales-invalidas.e2e.spec.ts
+ tests/api/us-001/tc-003-login-credenciales-invalidas.api.spec.ts
~ src/pages/LoginPage.ts
```

**Cobertura de test cases:**

- TC-003 (Integration, E2E) se automatizó como API + E2E, según lo decidido con el usuario; sin desviación de nivel.
- Paso 4, campo de contraseña vacío: prueba marcada `test.fixme` por hallazgo abierto (ver Hallazgos). El resto del TC (401, mensaje genérico e idéntico para usuario inexistente, permanencia en el login, sin sesión) está cubierto y en verde.
- Datos de prueba `[propuesto]`: usuario existente = `TEST_USER_NAME` del `.env` con contraseña incorrecta; usuario inexistente y contraseña incorrecta son constantes de la prueba.
- Cada corrida completa provoca 2 intentos fallidos contra la cuenta real (1 E2E + 1 API); si BAW aplica bloqueo por intentos, conviene tenerlo presente.

**Hallazgos:**

- TC-003 (paso 4) — esperado: campo de contraseña vacío tras el error · observado: el campo conserva la contraseña tecleada · prueba marcada: skip (`test.fixme`) · seguimiento: sin registrar

### TC-004: Petición autenticada por HTTPS con token CSRF

**Estado:** Done
**Iniciado:** 2026-09-23 15:45
**Finalizado:** 2026-09-23 16:00
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ src/helpers/baw-session.ts
+ tests/api/us-001/tc-004-peticion-autenticada-https-csrf.api.spec.ts
```

**Cobertura de test cases:**

- TC-004 (Unit, Integration) se automatizó como API Test, según lo decidido con el usuario (desviación de nivel: Unit/Integration → API).
- Cubierto: BAW acepta con `200` una petición posterior al login con la cookie de sesión y `BPMCSRFToken`, y no devuelve `403` con `CWTBG0651E` (paso 5).
- No verificado: el esquema `https` (paso 4). `API_BASE_URL` apunta al proxy de desarrollo del portal (`http`), y el TC indica que el `https` aplica a la URL configurada de BAW, que este repositorio no conoce. Tampoco se observa el interceptor del portal (pasos 2-3) desde API: la presencia de `BPMCSRFToken` y de la cookie en las peticiones del portal se comprueba en el E2E de TC-001.
- Para cubrir el `https` haría falta una variable con la URL directa de BAW (p. ej. `BAW_BASE_URL`) que hoy no existe en `.env`.

**Hallazgos:**

Ninguno.

### TC-005: Petición sin token CSRF rechazada

**Estado:** Done
**Iniciado:** 2026-09-23 15:45
**Finalizado:** 2026-09-23 16:00
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/api/us-001/tc-005-peticion-sin-csrf-token-rechazada.api.spec.ts
```

**Cobertura de test cases:**

- TC-005 (Integration) se automatizó como API Test, según lo decidido con el usuario (desviación de nivel: Integration → API).
- Cubierto: con la cookie de sesión vigente y sin `BPMCSRFToken`, BAW responde `403` (no `401`) con `error_number: CWTBG0651E` y sin datos de tareas (pasos 1-3).
- No cubierto en esta prueba: la clasificación de la respuesta como sesión inválida por parte del portal (paso 4); es comportamiento del portal y lo cubre TC-008. La precondición «desactivar el interceptor» se sustituye por emitir la petición directamente por API sin la cabecera.

**Hallazgos:**

Ninguno.

### TC-006: Cierre de sesión desde el menú lateral

**Estado:** Done
**Iniciado:** 2026-09-23 16:10
**Finalizado:** 2026-09-23 16:50
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ src/helpers/portal-session.ts
+ src/pages/PortalLayoutPage.ts
+ tests/e2e/us-001/tc-006-cierre-sesion.e2e.spec.ts
~ src/pages/LoginPage.ts
```

**Cobertura de test cases:**

- Pasos 1-2 (botón en el pie del menú lateral, expandido y colapsado): no automatizables tal como están escritos; el portal no tiene menú lateral (ver Hallazgos). Prueba marcada `test.fixme`.
- Paso 1 adaptado: se comprueba que «Cerrar sesión» está disponible en el menú de usuario del encabezado desde otro módulo (Procesos). AC-003 no fija la ubicación del control.
- Pasos 3-7 cubiertos y en verde: sin peticiones a BAW al cerrar sesión, redirección a `/signin` y retroceso del navegador sin mostrar el módulo.
- Paso 5: el portal no expone `csrf_token` ni `username`; se verifica que la cookie de sesión del portal (`baw_sess`) desaparece. La clave `baw_sess` de `localStorage` permanece tras el cierre; no se asierta por ser un valor opaco.
- La precondición del TC sobre TK-001 sin implementar ya no aplica: los pasos 5-7 pasan.

**Hallazgos:**

- TC-006 (pasos 1-2) — esperado: botón de cierre de sesión en el pie del menú lateral, visible expandido y colapsado · observado: el portal no tiene menú lateral; el cierre de sesión está en el menú de usuario del encabezado · prueba marcada: skip (`test.fixme`) · seguimiento: test-define (actualizar el TC al diseño vigente)

### TC-007: Sesión expira durante un formulario

**Estado:** Done
**Iniciado:** 2026-09-23 16:10
**Finalizado:** 2026-09-23 16:50
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-007-sesion-expira-durante-formulario.e2e.spec.ts
~ src/pages/TasksPage.ts
~ src/pages/PortalLayoutPage.ts
```

**Cobertura de test cases:**

- Formulario de prueba (paso 1-2): hoy no hay un formulario editable de tarea alcanzable desde fuera («Ejecutar» no muestra uno); se usó el campo «Buscar» de Mis tareas como entrada sin guardar. Desviación de datos de prueba respecto al TC.
- Expiración forzada (paso 3) eliminando las cookies de BAW y conservando la sesión del portal; BAW responde `401`, admitido por el TC.
- Verificado: aviso «Tu sesión ha expirado», redirección al login, credenciales del portal descartadas y texto sin guardar ausente tras reautenticarse.
- No verificado: que el texto tampoco exista en BAW; al ser una entrada local nunca se envía.

**Hallazgos:**

Ninguno.

### TC-008: Acceso directo por URL con sesión inválida

**Estado:** Done
**Iniciado:** 2026-09-23 16:10
**Finalizado:** 2026-09-23 16:50
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-008-acceso-directo-url-sesion-invalida.e2e.spec.ts
~ src/helpers/portal-session.ts
```

**Cobertura de test cases:**

- Paso 1: no se puede sembrar un `csrf_token` inválido concreto (el portal guarda una sesión opaca); la sesión se invalida quitando las cookies de BAW, alternativa que recoge la precondición del TC («la cookie de sesión caducó»).
- BAW responde `401` a la primera petición autenticada (el TC admite `401` o `403`); se verifica que todas sus respuestas son `401`/`403`.
- Verificado: redirección a `/signin`, credenciales del portal descartadas y ninguna celda de datos renderizada en ningún momento (observador de DOM), además de no aparecer el módulo.

**Hallazgos:**

Ninguno.

### TC-009: BAW inaccesible en el login

**Estado:** Done
**Iniciado:** 2026-09-23 16:10
**Finalizado:** 2026-09-23 16:50
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-009-baw-inaccesible-en-login.e2e.spec.ts
```

**Cobertura de test cases:**

- TC-009 (Integration, E2E): solo la parte E2E. La parte Integration/API no es automatizable: una prueba API no puede dejar BAW inaccesible de forma controlada, y suplantar la respuesta no ejercita a BAW.
- Las tres variantes se ejecutan con `page.route` sobre `POST /bpm/system/login` (error de red, tiempo de espera agotado, `500`). El tiempo de espera se simula abortando la petición como agotada, no esperando el timeout real del portal.
- Verificado por variante: mensaje de indisponibilidad distinto del de credenciales y sin detalles técnicos, login operativo con botón habilitado, sin sesión, módulo protegido devuelve al login y, restablecido BAW, el mismo usuario entra.

**Hallazgos:**

Ninguno.

### TC-011: Layout de escritorio con navegación completa

**Estado:** Pending

### TC-012: Layout de tablet con navegación colapsada

**Estado:** Pending

### TC-013: Layout móvil con menú hamburguesa

**Estado:** Pending

### TC-014: Breakpoints 768 y 1280 (límite)

**Estado:** Pending
