# TK-002: Expiración de sesión durante el uso y normalización del error de BAW

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-001: Autenticación y acceso al portal](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Detectar que la sesión contra BAW dejó de ser válida mientras el usuario opera dentro del portal y sacarlo a la pantalla de login con un aviso, en lugar de dejarlo con una vista rota. Hoy el bloqueo de acceso solo ocurre al entrar a un módulo protegido (`authGuard`); una sesión que caduca en pleno uso no se detecta, porque el interceptor heredado de `@factor_ec/utils` solo reacciona a `401` y BAW señala el token no verificable con `403`.

Para poder discriminar ese caso hace falta normalizar antes el cuerpo de error de la API: esta tarea entrega la utilidad de normalización y el interceptor que la consume.

## Dependencias

- [TK-001: Cierre de sesión local del portal](./TK-001-cierre-sesion-local.md) — rutina de descarte de credenciales y navegación a `/signin` que dispara este flujo.
- `AuthProvider` (`@factor_ec/utils`) — contrato inyectable desde `core`, ya usado así por `core/guards/auth-guard.ts`; evita que `core` importe la feature de autenticación.
- `notify` (`core/utils/notification.ts`) — puente de notificaciones para el aviso de sesión expirada.
- Cadena de interceptores HTTP declarada en `app.config.ts`.

## Referencias

- **Documentación técnica:** [Error de la API de BAW](../../../specs/technical-docs/portal-procesos-baw.md#md-11) · [Expiración de sesión durante el uso](../../../specs/technical-docs/portal-procesos-baw.md#fl-02) · [Autenticación y ciclo de vida de la sesión](../../../specs/technical-docs/portal-procesos-baw.md#fl-01)
- **Arquitectura:** ADR-001 del repositorio `frontend` — organización en capas y dirección de dependencias ([`frontend/docs/adr/ADR-001-hybrid-layered-feature-architecture.md`](../../../../frontend/docs/adr/ADR-001-hybrid-layered-feature-architecture.md)) · ADR-009 del repositorio `frontend` — puente de notificaciones por eventos ([`frontend/docs/adr/ADR-009-core-event-notification-bridge.md`](../../../../frontend/docs/adr/ADR-009-core-event-notification-bridge.md))

## Archivos afectados

```text
frontend/
└── src/app/
    ├── + core/utils/baw-error.ts                           # normaliza `exception` y deriva isSessionExpired
    ├── + core/utils/baw-error.spec.ts                      # casos 401, 403 CSRF, 403 de autorización
    ├── + core/interceptors/session-expiry-interceptor.ts   # dispara el cierre local ante sesión expirada
    ├── + core/interceptors/session-expiry-interceptor.spec.ts
    └── ~ app.config.ts                                     # registra el interceptor en la cadena HTTP
```

## Plan de implementación

- [x] **IT-01** — Crear la utilidad de normalización del error de BAW
      Traduce el cuerpo `exception` de MD-11 a una forma estable para el resto de la aplicación, conservando `error_number` y `error_message`. El mensaje llega localizado por BAW y es presentable al usuario, con un texto propio de respaldo cuando resulte demasiado técnico.
- [x] **IT-02** — Derivar `isSessionExpired` según la regla de MD-11
      `401`, o `403` con `error_number = CWTBG0651E`. La verificación en vivo del contrato dejó confirmado que el token ausente o caducado se manifiesta como `403`, no como `401`: discriminar por `error_number` y no solo por el código HTTP, para no confundirlo con un `403` de autorización sobre un recurso concreto.
- [x] **IT-03** — Añadir un interceptor propio de expiración de sesión
      Vive en `core` e inyecta `AuthProvider`, no la clase de la feature de autenticación: la dirección de dependencias prohíbe que `core` importe `features`.
- [x] **IT-04** — Ejecutar el cierre local y navegar a `/signin` con aviso de sesión expirada
      Reutiliza la rutina de TK-001. Varias peticiones en vuelo que fallen a la vez producen una sola redirección y un solo aviso (paso 4 de FL-02).
- [x] **IT-05** — Propagar al módulo cualquier otro error
      Los errores que no cumplen `isSessionExpired` se muestran en contexto sin sacar al usuario del portal (paso 3 de FL-02).
- [x] **IT-06** — Registrar el interceptor en `app.config.ts`
      Ordenado respecto a `authInterceptor` de forma que la respuesta de error pase por esta evaluación. La señal autoritativa de expiración es la respuesta de la API y no un temporizador local: MD-01 deja `expiration` declarado como entero sin unidad ni formato, por confirmar en ejecución.
