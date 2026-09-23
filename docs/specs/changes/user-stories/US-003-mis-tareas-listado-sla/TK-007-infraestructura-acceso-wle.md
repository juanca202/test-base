# TK-007: Infraestructura de acceso a la API nativa WLE

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Dejar el frontend en condiciones de llamar a la API REST nativa de BAW/WLE (`/rest/bpm/wle/v1/*`, ADR-015): el proxy de desarrollo debe rutear `/rest` hacia el backend igual que ya rutea `/bpm`, y toda llamada a esa API debe enviar el header CSRF que exige (`x-xsrf-token`, valor de la cookie `XSRF-TOKEN`), sin afectar el mecanismo de autenticación existente (`BPMCSRFToken`) que siguen usando las llamadas a `/bpm/*`. Es infraestructura compartida: TK-008 (repositorio de tareas) y cualquier historia futura que consuma WLE dependen de esto.

## Dependencias

- `proxy.conf.js` — proxy de desarrollo Angular, hoy solo rutea `/bpm`.
- `src/app/core/interceptors/` — carpeta de interceptores HTTP existentes (`baw-auth-interceptor.ts`, `client-interceptor.ts`, `language-interceptor.ts`, `session-expiry-interceptor.ts`).
- `src/app/app.config.ts` — `provideHttpClient(withInterceptors([...]))`, donde se registran los interceptores.

## Referencias

- **Arquitectura:** [ADR-015](../../../../frontend/docs/adr/ADR-015-native-baw-wle-rest-api.md) (repo `frontend`) · [API Standards](../../../../frontend/docs/standards/api.md) — `api/CR-002` (proxy `/rest`), `api/CR-003` (header `x-xsrf-token`)
- **Documentación técnica:** [API-13: Buscar tareas del usuario (WLE)](../../../specs/technical-docs/portal-procesos-baw.md#api-13) — sección de autenticación y cabecera `x-xsrf-token`

## Archivos afectados

```text
frontend/
├── ~ proxy.conf.js                                          # agrega entrada '/rest' con el mismo target/secure/changeOrigin que '/bpm'
└── src/
    └── app/
        ├── + core/interceptors/wle-auth-interceptor.ts       # agrega x-xsrf-token (cookie XSRF-TOKEN) solo a requests hacia rest/bpm/wle/v1/
        ├── + core/interceptors/wle-auth-interceptor.spec.ts  # cubre: header agregado en rest/*, no agregado en bpm/*, cookie ausente
        └── ~ app.config.ts                                   # registra wleAuthInterceptor en withInterceptors([...])
```

## Plan de implementación

- [x] **IT-01** — Agregar la ruta `/rest` a `proxy.conf.js`
      Misma configuración que la entrada `/bpm` existente (`target: 'https://192.168.120.100:9443'`, `secure: false`, `changeOrigin: true`, mismo `onProxyRes` que relaja `Secure`/`SameSite=Strict` de las cookies) — es el mismo backend BAW, solo un context root distinto.
- [x] **IT-02** — Crear `wleAuthInterceptor`
      `HttpInterceptorFn` que, solo para requests cuya URL contenga `rest/bpm/wle/v1/` (discriminar por ruta, no por método — API-13 es un `PUT` de solo lectura, ver nota de API-13), lee la cookie `XSRF-TOKEN` (parseando `document.cookie`, no hay utilidad de cookies existente en el repo) y, si tiene valor, clona el request agregando el header `x-xsrf-token`. Si la cookie no existe (sesión no iniciada aún), deja pasar el request sin el header — que BAW responda 401/403 en ese caso es responsabilidad de `sessionExpiryInterceptor`, no de este interceptor.
- [x] **IT-03** — Registrar el interceptor en `app.config.ts`
      Agregarlo a `withInterceptors([...])`. Orden: después de `sessionExpiryInterceptor` (que ya discrimina por `error_number` de la familia `/bpm/`, ver `FL-02`) y antes de `clientInterceptor`/`languageInterceptor` (agregan headers informativos, sin relación con el orden de autenticación).
- [x] **IT-04** — Tests del interceptor
      Verificar: (a) una request a `rest/bpm/wle/v1/tasks` con cookie `XSRF-TOKEN` presente recibe el header `x-xsrf-token` con ese valor; (b) una request a `bpm/user-tasks` NO recibe el header (no debe interferir con `BPMCSRFToken`); (c) sin cookie `XSRF-TOKEN`, la request a `rest/*` pasa sin el header, sin lanzar error.

## Observaciones

- Ninguna.
