# TK-001: Repositorio de procesos iniciables (WLE)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-002](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Crear el repositorio de datos para el catálogo de procesos que el usuario autenticado puede iniciar y para el arranque de una instancia, contra la familia WLE de la API de BAW: `GET /rest/bpm/wle/v1/exposed/process` (API-03) y `POST /rest/bpm/wle/v1/process?action=start&bpdId=...&processAppId=...` (API-14). Es infraestructura pura — sin UI — que TK-002 consume para poblar y accionar el menú "Iniciar proceso" de "Mis tareas".

## Dependencias

- `BaseRepository` (`core/services/base-repository.ts`) — clase base del patrón Repository (ADR-010).
- `getApiUrl` (`core/utils/async-resources.ts`) — construcción de URLs respetando el proxy de desarrollo.
- `getMutations` (`core/utils/async-resources.ts`) — wrapper de escritura con notificación de error configurable (ADR-009), mismo patrón que `TaskDetailRepository.claim`/`complete`.
- `wleAuthInterceptor` (US-003, TK-007, ya `Ready`) — agrega `x-xsrf-token` a toda request bajo `rest/bpm/wle/v1/`; cubre ambas llamadas de esta tarea sin cambios adicionales.
- `proxy.conf.js` (US-003, TK-007, ya `Ready`) — ya rutea `/rest` en desarrollo; sin cambios adicionales.

## Referencias

- **Arquitectura:** [ADR-010 — Patrón Repository](../../../../frontend/docs/adr/ADR-010-repository-pattern-rest-api.md) · [ADR-012 — Mappers como funciones puras](../../../../frontend/docs/adr/ADR-012-feature-mappers-pure-functions.md) · [ADR-015 — API REST nativa WLE](../../../../frontend/docs/adr/ADR-015-native-baw-wle-rest-api.md) (repo `frontend`)
- **Documentación técnica:** [MD-02: Proceso iniciable](../../../specs/technical-docs/portal-procesos-baw.md#md-02) · [API-03: Listar procesos iniciables](../../../specs/technical-docs/portal-procesos-baw.md#api-03) · [API-14: Iniciar una instancia de proceso (WLE)](../../../specs/technical-docs/portal-procesos-baw.md#api-14)
- **Investigación:** [RS-002 — Procesos iniciables vía WLE](../../research/RS-002-procesos-iniciables-wle/README.md) — fixtures reales de request/response para los tests

## Archivos afectados

```text
frontend/
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── + models/process.ts                  # DTOs de API-03/API-14 + modelo de dominio StartableProcess / StartedProcessInstance
                ├── + services/process-repository.ts       # findStartable() (API-03) y start() (API-14)
                ├── + services/process-repository.spec.ts  # Object Mother con fixtures reales de RS-002
                └── + utils/process-mapper.ts               # DTO WLE → StartableProcess
```

## Plan de implementación

- [x] **IT-01** — Modelar los DTOs y el modelo de dominio en `models/process.ts`
      `BawExposedProcessItem`: claves tal como las devuelve API-03 (`itemID`, `processAppID`, `processAppName`, `processAppAcronym`, `display`, `itemDescription`, `branchID`, `branchName`, `startURL`, `isMobileReady`, resto opcional/`null`). `BawExposedProcessResponse = { status: string; data: { exposedItemsList: BawExposedProcessItem[] | null } }` — `null` es una respuesta válida (`filterByName` sin coincidencias, MD-02/API-03). `BawStartProcessResponse`: solo los campos que el dominio necesita de la respuesta real de API-14 (`piid: string`, `name: string`, `processTemplateName: string`, `state: string`). Dominio: `StartableProcess = { id: string; processAppId: string; name: string; processAppName: string; description?: string }` (`id` = `itemID`/`bpdId`, `name` = `display`, confirmado idéntico a `processTemplateName` en RS-002). `StartedProcessInstance = { piid: string; name: string }`.
- [x] **IT-02** — `process-mapper.ts`: `mapExposedProcessDtoToStartableProcess` y `mapExposedProcessResponseToList`
      Uno por elemento y uno para la envoltura completa; el segundo trata `exposedItemsList: null` como lista vacía, nunca lanza. `itemDescription: ""` o `null` se traduce a `description: undefined` (cadena vacía no es una descripción real, ver RS-002 hallazgo 2).
- [x] **IT-03** — `ProcessRepository.findStartable()` (API-03)
      `GET` a `getApiUrl('rest/bpm/wle/v1/exposed/process')` con query `includeDescription=true` (puebla `itemDescription` cuando existe) y `avoidBasicAuthChallenge=true` (evita el diálogo nativo de Basic Auth del navegador ante una sesión caída, mismo criterio que API-13). Sin `x-xsrf-token` explícito: lo agrega `wleAuthInterceptor` por ruta, no por método, y esta llamada es un `GET` sin la protección CSRF de escritura (confirmado en vivo, API-03) — no falla si el header llega de más. Respuesta mapeada con `mapExposedProcessResponseToList`.
- [x] **IT-04** — `ProcessRepository.start(process: StartableProcess)` (API-14)
      `POST` a `getApiUrl('rest/bpm/wle/v1/process')` con query `action=start`, `bpdId=process.id`, `processAppId=process.processAppId` (mismos parámetros que el `startURL` que trae cada elemento del catálogo — no se persiste ni reconstruye esa URL, se recompone con los dos identificadores ya en el dominio). Sin cuerpo. Usar `getMutations` (mismo patrón que `TaskDetailRepository.claim`) con `notifyError: false`: **el llamador (TK-002) decide** cómo presentar cada tipo de falla (AC-003 exige distinguir timeout/red del resto), así que este método no debe notificar por su cuenta ni interpretar el error — solo propagarlo.
- [x] **IT-05** — Tests del repositorio (`process-repository.spec.ts`)
      Object Mother con la fixture real de `GET /rest/bpm/wle/v1/exposed/process` (4 procesos, RS-002 hallazgo 1) y de `POST .../process?action=start` (`Vacation request:303`, RS-002 hallazgo 5). Casos: `findStartable` mapea los 4 elementos correctamente; `findStartable` con `exposedItemsList: null` devuelve `[]` sin lanzar; `start` envía `action=start`/`bpdId`/`processAppId` en la query y ningún cuerpo; `start` propaga el error sin notificar (`notifyError: false`) ante un rechazo simulado.

## Observaciones

- Ninguna.
