# TK-001: Modelo y repositorio de instancias de proceso

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-004](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Dejar disponible el acceso a las instancias de proceso desde el frontend: el DTO que devuelve BAW, el modelo de dominio que consumen las vistas, la función pura que traduce uno en otro, y el repositorio que consulta `GET /bpm/processes` con filtro de estado, búsqueda, filtros de servidor y paginación.

Es infraestructura pura — sin UI — y es una entidad distinta del catálogo de procesos iniciables (`ProcessRepository` / `models/process.ts`, US-002). TK-002 y TK-003 se apoyan en ella.

## Dependencias

- `BaseRepository` (`core/services/base-repository.ts`) — clase base del patrón Repository (ADR-010).
- `getApiUrl` (`core/utils/async-resources.ts`) — composición de la URL contra `environment.apiRestBaseUrl`.
- `HttpClient` (`@angular/common/http`) — transporte; la cookie de sesión y la cabecera `BPMCSRFToken` ya las inyecta el interceptor de autenticación (US-001). No usar `wleAuthInterceptor` ni `x-xsrf-token`: esta operación es de la familia `/bpm/`.
- `proxy.conf.js` — ya rutea `/bpm` en desarrollo; sin cambios.

## Referencias

- **Arquitectura:** [ADR-010 — Patrón Repository](../../../../frontend/docs/adr/ADR-010-repository-pattern-rest-api.md) · [ADR-012 — Mappers como funciones puras](../../../../frontend/docs/adr/ADR-012-feature-mappers-pure-functions.md) (repo `frontend`)
- **Documentación técnica:** [MD-03: Instancia de proceso](../../../specs/technical-docs/portal-procesos-baw.md#md-03) · [API-09: Listar instancias de proceso](../../../specs/technical-docs/portal-procesos-baw.md#api-09)
- **Diseño:** no aplica (sin UI)

## Archivos afectados

```text
frontend/
└── src/
    ├── app/features/baw-processes/
    │   ├── + models/process-instance.ts                    # DTO snake_case de API-09 + modelo de dominio ProcessInstance
    │   ├── + utils/process-instance-mapper.ts              # DTO → ProcessInstance; isActive; slaStatus si hay due_date
    │   ├── + utils/process-instance-mapper.spec.ts
    │   ├── + services/process-instance-repository.ts       # findAll() → GET bpm/processes
    │   └── + services/process-instance-repository.spec.ts
    └── mocks/
        ├── + processes/process-instance.handlers.ts        # MSW de GET /bpm/processes (running/finished, next, filtros)
        ├── + processes/process-instance.handlers.spec.ts
        └── ~ handlers.ts                                   # registra los handlers de instancias
```

## Plan de implementación

- [x] **IT-01** — Declarar el DTO de instancia y el modelo de dominio en `models/process-instance.ts`
      El DTO conserva el `snake_case` literal de BAW (`id`, `model`, `container`, `container_name`, `state`, `creation_time`, `due_date`, `name`, `version`, `version_name`, `branch_name`, `modification_time`). El dominio va en inglés `camelCase` (`ProcessInstance`). `due_date` es opcional (MD-03: puede faltar, observado el 2026-09-16 en `PerformanceMonitoringProcess`). La envoltura de listado es `{ processes[], previous?, next? }` — no hay `totalCount`.
- [x] **IT-02** — Implementar el mapper como objeto de funciones puras
      Sin inyección Angular ni E/S. Derivar `isActive` = `state === 'running'` (MD-03). Derivar `slaStatus` con la misma regla de MD-04 **solo si `due_date` está presente**; si falta, no inventar vencimiento. Fechas ISO 8601 UTC con sufijo `Z`, confirmadas en vivo el 2026-09-16.
- [x] **IT-03** — Implementar `ProcessInstanceRepository.findAll(query)`
      Clase `{Entity}Repository`. URL solo con `getApiUrl('bpm/processes')` (path sin barra inicial). Query params de API-09 que esta historia usa: `states`, `search_term`, `model`, `containers`, `versions`, `sort`, `offset`, `size`. No pedir `optional_parts=data` en el listado. Conservar `previous`/`next` de la respuesta para paginar sin recomponer a ciegas; no inventar un total que el contrato no trae.
- [x] **IT-04** — Tests del mapper y del repositorio con MSW
      Fixtures alineadas a la respuesta real del 2026-09-16 (instancias `running`/`finished`, `next` con `offset`/`size`/`states`, un caso sin `due_date`). Casos: mapeo de campos; `isActive`; `due_date` ausente no deriva SLA; `findAll` envía los query params y devuelve `processes` + `next`.
