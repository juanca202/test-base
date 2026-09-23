# TK-001: Cierre de sesión local del portal

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-001: Autenticación y acceso al portal](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Dejar disponible una rutina de cierre de sesión propia del portal que descarte las credenciales locales (token anti-CSRF y usuario en sesión) y lleve al usuario a `/signin` mediante el router de Angular, sin invocar ningún endpoint de BAW.

Hoy `AuthService.logout()` delega en la implementación base de `@factor_ec/utils`, que termina asignando `location.href` a la URL de redirección configurada en `JWT_AUTH_CONFIG`. Ese token no está provisto en esta aplicación, así que la asignación resulta en una recarga completa de la URL actual en lugar de una navegación a la pantalla de login. Esta tarea corrige ese comportamiento y convierte el cierre de sesión en la pieza reutilizable que consumen tanto la acción del pie del menú lateral como el flujo de expiración de sesión.

## Dependencias

- `AuthService` (`features/auth/services/auth-service.ts`) — clase que sobrescribe el cierre de sesión.
- `AuthProvider` (`@factor_ec/utils`) — contrato inyectable por el que el resto de capas invoca el cierre de sesión.
- `Session` (`core/services/session.ts`) — estado local del usuario en sesión; su `clearAll()` ya se invoca hoy.
- `Router` (`@angular/router`) — navegación a `/signin`.

## Referencias

- **Documentación técnica:** [Cerrar sesión](../../../specs/technical-docs/portal-procesos-baw.md#api-02) · [Sesión y credenciales](../../../specs/technical-docs/portal-procesos-baw.md#md-01) · [Autenticación y ciclo de vida de la sesión](../../../specs/technical-docs/portal-procesos-baw.md#fl-01)
- **Arquitectura:** ADR-002 del repositorio `frontend` — accesibilidad explícita de miembros y `readonly` ([`frontend/docs/adr/ADR-002-explicit-member-accessibility-and-readonly.md`](../../../../frontend/docs/adr/ADR-002-explicit-member-accessibility-and-readonly.md))

## Archivos afectados

```text
frontend/
└── src/app/features/auth/services/
    ├── ~ auth-service.ts        # logout() propio: descarta credenciales y navega a /signin
    └── ~ auth-service.spec.ts   # comportamiento del cierre de sesión
```

## Plan de implementación

- [x] **IT-01** — Sobrescribir `logout()` en `AuthService` sin delegar en `super.logout()`
      El comportamiento heredado asigna `location.href` con la URL de `JWT_AUTH_CONFIG`, token que esta aplicación no provee; el resultado es una recarga de la URL actual, no una navegación a la pantalla de login.
- [x] **IT-02** — Descartar las credenciales locales al cerrar sesión
      Token anti-CSRF y usuario en sesión, es decir lo que MD-01 describe como estado de sesión del frontend. Mantener la limpieza de `Session` que ya hace la implementación actual.
- [x] **IT-03** — Navegar a `/signin` con el router de Angular
      Sin recarga de página y sin llamada a BAW: API-02 confirma que esta API no expone cierre de sesión en servidor y que el paso 2 del cierre es navegar a `/signin`, donde `authGuard` bloquea desde ese momento los módulos protegidos.
- [x] **IT-04** — Hacer la rutina idempotente
      Invocarla dos veces (p. ej. por varias peticiones fallidas en vuelo) no debe encadenar navegaciones ni avisos; es el requisito del paso 4 de FL-02, que consume esta rutina.
