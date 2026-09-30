# Automatización de pruebas

## US-001: Autenticación y acceso al portal

**Estado:** Done
**Sistema bajo prueba:** Portal de procesos BAW (frontend) sobre IBM BAW — variables: `BASE_URL`, `API_BASE_URL`, `TEST_USER_NAME`, `TEST_USER_PASSWORD`
**Fecha de creación:** 2026-09-23 14:10
**Ultima actualizacion:** 2026-09-29 23:59

## Unidades

### TC-001: Login con credenciales válidas accede al módulo inicial

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-001-login-credenciales-validas.e2e.spec.ts
+ tests/api/us-001/tc-001-login-credenciales-validas.api.spec.ts
```

**Cobertura de test cases:**

- Automatizado como API + E2E, uno por nivel del TC.
- Paso 3 (`csrf_token` y `username` en almacenamiento efímero): no se asertan; el portal guarda una sesión opaca (`baw_sess`). Se cubre de forma indirecta: usuario visible en el encabezado y petición posterior con cookie y `BPMCSRFToken`.
- Credenciales de `getBawCredentials()` (`.env`) en lugar de los datos `[propuesto]`.

**Hallazgos:**

Ninguno.

### TC-002: Acceso sin sesión redirige al login

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-002-acceso-sin-sesion-redirige-login.e2e.spec.ts
```

**Cobertura de test cases:**

- Rutas reales `/tasks` y `/signin` en lugar de `/mis-tareas` y `/login` `[propuesto]`.
- Paso 1: se verifica que el contexto nuevo no tiene cookies ni sesión del portal, no las claves `csrf_token`/`username`.

**Hallazgos:**

Ninguno.

### TC-003: Login con credenciales inválidas

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ src/helpers/invalid-credentials.ts
+ src/helpers/login-failure.ts
+ tests/e2e/us-001/tc-003-login-credenciales-invalidas.e2e.spec.ts
+ tests/api/us-001/tc-003-login-credenciales-invalidas.api.spec.ts
```

**Cobertura de test cases:**

- Automatizado como API + E2E.
- Usuarios `[propuesto]` sustituidos por datos generados: cuenta del `.env` con contraseña aleatoria incorrecta y usuario inexistente aleatorio.
- El mensaje de error se comprueba de forma genérica (visible, no vacío, sin detalles técnicos) y se exige que sea idéntico para ambos casos.
- Paso 4 (campo de contraseña vacío): prueba aparte marcada `test.fixme` por hallazgo. El resto del TC pasa.
- Cada corrida provoca 2 intentos fallidos contra la cuenta real (1 API + 1 E2E).

**Hallazgos:**

- TC-003 (paso 4) — esperado: campo de contraseña vacío tras el error · observado: el campo conserva la contraseña tecleada · prueba marcada: skip (`test.fixme`) · seguimiento: sin registrar

### TC-004: Petición autenticada por HTTPS con token CSRF

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/api/us-001/tc-004-peticion-autenticada-https-csrf.api.spec.ts
```

**Cobertura de test cases:**

- Automatizado como API Test.
- Paso 4 (esquema `https`): no verificado; `API_BASE_URL` es el proxy `http` del portal y el TC exige https sobre la URL de BAW. La prueba lo anota como «no verificado» y solo asierta https si el esquema lo es. Cubrirlo requiere una variable con la URL directa de BAW (p. ej. `BAW_BASE_URL`).
- Pasos 1-3: la petición se construye a mano con `BPMCSRFToken`; el interceptor del portal se observa en TC-001, no aquí.
- `csrf_token` real del login en lugar del `tok-csrf-valido` propuesto.

**Hallazgos:**

Ninguno.

### TC-005: Petición sin token CSRF rechazada

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/api/us-001/tc-005-peticion-sin-csrf-token-rechazada.api.spec.ts
```

**Cobertura de test cases:**

- Automatizado como API Test. Cubierto: `403` (no `401`) con `error_number: CWTBG0651E` y sin datos de tareas (pasos 1-3).
- El paso 4 (clasificación como sesión inválida por el portal) lo cubre TC-008.
- Discrepancia TC/sistema: el TC documenta un objeto `exception` con `error_number`; BAW devuelve `error_number` y `error_message` en la raíz. Probablemente el TC debe corregirse (`test-define`). La prueba principal asierta la forma real; la envoltura `exception` va en una prueba aparte `test.fixme`.
- No se verifica https (proxy `http`).

**Hallazgos:**

- TC-005 (envoltura `exception`) — esperado: cuerpo del `403` con objeto `exception` que contiene `error_number` · observado: `error_number` y `error_message` en la raíz del cuerpo · prueba marcada: skip (`test.fixme`) · seguimiento: sin registrar (posible corrección del TC en `test-define`)

### TC-006: Cierre de sesión desde el menú lateral

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-006-cierre-sesion-desde-menu-lateral.e2e.spec.ts
~ src/pages/PortalLayoutPage.ts
```

**Cobertura de test cases:**

- Pasos 1-2: no automatizables tal como están escritos; el portal no tiene menú lateral. Prueba aparte `test.fixme` con lo que documenta el TC.
- Paso 4 adaptado: «Cerrar sesión» se activa desde el menú de usuario del encabezado. AC-003 no fija la ubicación.
- Pasos 3-7 pasan: sin peticiones a `/bpm/` al cerrar, sesión del portal descartada (`baw_sess`), redirección a `/signin` y retroceso sin mostrar el módulo.
- Precondición TK-001 sin implementar ya no aplica. Rutas reales `/tasks`, `/processes`, `/signin`.

**Hallazgos:**

- TC-006 (pasos 1-2) — esperado: botón de cierre de sesión en el pie del menú lateral, visible expandido y colapsado · observado: el portal no tiene menú lateral; el cierre de sesión está en el menú de usuario del encabezado · prueba marcada: skip (`test.fixme`) · seguimiento: sin registrar (posible corrección del TC)

### TC-007: Sesión expira durante un formulario

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-007-sesion-expira-durante-formulario-error.e2e.spec.ts
~ src/helpers/portal-session.ts
~ src/pages/LoginPage.ts
~ src/pages/PortalLayoutPage.ts
```

**Cobertura de test cases:**

- Formulario: el portal no tiene un formulario editable alcanzable sin efectos en BAW; se usa el campo «Buscar» de Mis tareas como entrada sin guardar.
- Expiración (paso 3) quitando las cookies de BAW; BAW responde `401`. La acción que exige BAW es abrir la pestaña «Procesos» (el TC habla de «guardar»).
- El aviso «Tu sesión ha expirado…» es un snackbar transitorio y se asierta en una prueba aparte.
- Paso 6: el texto no persiste tras reautenticarse y nunca se envía a BAW (se comprueba con un listener de peticiones).

**Hallazgos:**

Ninguno.

### TC-008: Acceso directo por URL con sesión inválida

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-008-acceso-directo-url-sesion-invalida.e2e.spec.ts
~ src/helpers/portal-session.ts
```

**Cobertura de test cases:**

- Paso 1: no se puede sembrar un `csrf_token` inválido concreto; se inicia sesión y se quitan las cookies de BAW, conservando la del portal.
- BAW responde `401` (el TC admite `401` o `403`); `CWTBG0651E` no se comprueba, lo cubre TC-005.
- Se verifica redirección a `/signin`, credenciales del portal descartadas y ninguna celda de datos renderizada en ningún momento (observador de DOM).

**Hallazgos:**

Ninguno.

### TC-009: BAW inaccesible en el login

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-009-baw-inaccesible-en-login.e2e.spec.ts
~ src/pages/LoginPage.ts
```

**Cobertura de test cases:**

- Solo E2E, como indica el TC. Tres variantes con `page.route` sobre `POST /bpm/system/login`: error de red, tiempo de espera agotado (simulado, sin esperar el timeout real) y `500`.
- No hay un control «Reintentar» aparte; el reintento es reenviar el formulario (paso 7, con el mismo usuario tras restablecer BAW).
- Mensaje de indisponibilidad distinto del de credenciales y sin detalles técnicos.

**Hallazgos:**

Ninguno.

### TC-011: Layout de escritorio con navegación completa

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-011-layout-escritorio-navegacion-completa.e2e.spec.ts
~ src/pages/PortalLayoutPage.ts
```

**Cobertura de test cases:**

- Visual Test automatizado como E2E con aserciones estructurales en 1280 y 1920 px, en `/tasks` y `/processes`: destinos con etiqueta, sin hamburguesa, sin etiquetas cortadas ni desborde horizontal.
- Comparación con referencia visual aprobada: no se automatiza (no existe la referencia y Mis tareas muestra datos vivos). Prueba aparte `test.fixme`; se adjuntan capturas por ancho y módulo.
- La «navegación» es el tablist del encabezado; el portal no tiene menú lateral.

**Hallazgos:**

Ninguno.

### TC-012: Layout de tablet con navegación colapsada

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-012-layout-tablet-navegacion-colapsada.e2e.spec.ts
```

**Cobertura de test cases:**

- Visual Test automatizado como E2E estructural. Pasan, en 768, 1024 y 1279 px: destinos presentes y accesibles, navegación entre módulos y sin desborde horizontal.
- Pasos 2-4 (colapso a iconos, expansión al interactuar y recolapso): pruebas `test.fixme` por hallazgo.
- Sin referencia visual aprobada: aserciones estructurales y capturas.

**Hallazgos:**

- TC-012 (pasos 2-4) — esperado: navegación colapsada a iconos entre 768 y 1279px, que se expande al interactuar y vuelve a colapsar · observado: el tablist del encabezado muestra icono y etiqueta en todo el rango; el `nav` lleva `hidden! md:flex!`, sin estado colapsado de tablet · prueba marcada: skip (`test.fixme`) · seguimiento: sin registrar

### TC-013: Layout móvil con menú hamburguesa

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-013-layout-movil-menu-hamburguesa.e2e.spec.ts
~ src/pages/PortalLayoutPage.ts
```

**Cobertura de test cases:**

- Visual Test automatizado como E2E estructural. Pasa en 360 y 767 px: pestañas no visibles, sin desborde horizontal y capturas adjuntas.
- Pasos 2-5 y 6 parcial (hamburguesa, panel superpuesto, elegir destino, abrir y cerrar sin perder el módulo): pruebas `test.fixme` por hallazgo. El cierre con `Escape` es una suposición del automatizador.
- Sin referencia visual aprobada.

**Hallazgos:**

- TC-013 (pasos 2-5) — esperado: por debajo de 768px, icono de hamburguesa que abre un panel superpuesto con todos los destinos · observado: no hay hamburguesa ni panel y la barra de pestañas se oculta (`hidden md:flex`); el usuario solo llega a otro módulo por URL · prueba marcada: skip (`test.fixme`) · seguimiento: sin registrar (defecto o desajuste con AC-007)

### TC-014: Breakpoints 768 y 1280 (límite)

**Estado:** Done
**Iniciado:** 2026-09-29 23:59
**Finalizado:** 2026-09-29 23:59
**Automatizador:** juanca202 / Claude

**Pruebas:**

```
+ tests/e2e/us-001/tc-014-breakpoints-768-1280-limite.e2e.spec.ts
~ src/pages/PortalLayoutPage.ts
```

**Cobertura de test cases:**

- Visual Test automatizado como E2E estructural. Pasa: 767-1281 px sin desborde y con navegación única; corte de 768 px existente; barrido de 360 a 1920 px (saltos de 40 px, no un arrastre continuo) sin coexistencia de navegación y hamburguesa.
- Pasos 1, 2 y 4 (hamburguesa a 767 px y colapso a iconos en 768/1279 px): prueba `test.fixme` por hallazgo.
- Sin referencia visual aprobada.

**Hallazgos:**

- TC-014 (pasos 1, 2, 4) — esperado: 767px con hamburguesa; 768 y 1279px con navegación colapsada a iconos; cambio de layout al cruzar 1280px · observado: 767px sin hamburguesa ni navegación; de 768 a 1920px el mismo tablist con etiquetas y sin cambio entre 1279 y 1280px · prueba marcada: skip (`test.fixme`) · seguimiento: sin registrar
