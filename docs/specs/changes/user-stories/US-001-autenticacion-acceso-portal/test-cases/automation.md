# Automatización de pruebas

## US-001: Autenticación y acceso al portal

**Estado:** In Progress
**Sistema bajo prueba:** Portal de procesos BAW (frontend) sobre IBM BAW — variables: `BASE_URL`, `API_BASE_URL`, `TEST_USER_NAME`, `TEST_USER_PASSWORD`
**Fecha de creación:** 2026-09-23 14:10
**Ultima actualizacion:** 2026-09-23 14:50

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

**Estado:** Pending

### TC-004: Petición autenticada por HTTPS con token CSRF

**Estado:** Pending

### TC-005: Petición sin token CSRF rechazada

**Estado:** Pending

### TC-006: Cierre de sesión desde el menú lateral

**Estado:** Pending

### TC-007: Sesión expira durante un formulario

**Estado:** Pending

### TC-008: Acceso directo por URL con sesión inválida

**Estado:** Pending

### TC-009: BAW inaccesible en el login

**Estado:** Pending

### TC-011: Layout de escritorio con navegación completa

**Estado:** Pending

### TC-012: Layout de tablet con navegación colapsada

**Estado:** Pending

### TC-013: Layout móvil con menú hamburguesa

**Estado:** Pending

### TC-014: Breakpoints 768 y 1280 (límite)

**Estado:** Pending
