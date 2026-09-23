# TK-001: Modelo, mapper y repositorio de tareas del usuario

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-003: Mis tareas — listado y SLA](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Dejar disponible el acceso a las tareas del usuario desde el frontend: el DTO que devuelve BAW, el modelo de dominio que consumen las vistas, la función pura que traduce uno en otro derivando el estado de SLA, y el repositorio que expone la consulta con paginación, orden y filtros de servidor.

Es la pieza base de la historia: el listado, el resumen de SLA y los filtros se apoyan todos en ella, así que se resuelve primero para que esas tres tareas puedan avanzar en paralelo.

## Dependencias

- `BaseRepository` (`core/services/base-repository.ts`) — clase base de los repositorios del proyecto.
- `getApiUrl` (`core/utils/async-resources.ts`) — composición de la URL contra `environment.apiRestBaseUrl`.
- `HttpClient` (`@angular/common/http`) — transporte; la cookie de sesión y la cabecera `BPMCSRFToken` ya las inyecta el interceptor de autenticación.
- Feature `baw-processes` (`features/baw-processes/`) — ubicación del modelo, el mapper y el repositorio.

## Referencias

- **Documentación técnica:** [Tarea](../../../specs/technical-docs/portal-procesos-baw.md#md-04) · [Listar tareas del usuario](../../../specs/technical-docs/portal-procesos-baw.md#api-05) · [Componentes del frontend](../../../specs/technical-docs/portal-procesos-baw.md#dg-02)
- **Arquitectura:** ADR-010 del repositorio `frontend` — patrón Repository para REST API ([`frontend/docs/adr/ADR-010-repository-pattern-rest-api.md`](../../../../frontend/docs/adr/ADR-010-repository-pattern-rest-api.md)) · ADR-012 del repositorio `frontend` — mappers de feature como funciones puras ([`frontend/docs/adr/ADR-012-feature-mappers-pure-functions.md`](../../../../frontend/docs/adr/ADR-012-feature-mappers-pure-functions.md))

## Archivos afectados

```text
frontend/
└── src/app/features/baw-processes/
    ├── + models/user-task.ts                  # DTO snake_case de BAW y modelo de dominio de tarea
    ├── + utils/task-mapper.ts                 # TaskMapper: normalización y campos derivados
    ├── + utils/task-mapper.spec.ts            # derivación de slaStatus, equipo y propiedad
    ├── + services/user-task-repository.ts     # consulta de GET /bpm/user-tasks
    └── + services/user-task-repository.spec.ts
```

## Plan de implementación

- [x] **IT-01** — Declarar el DTO de la tarea y el modelo de dominio
      El DTO conserva el `snake_case` literal de BAW, igual que los ya existentes en `features/auth/models/auth.ts`; el modelo de dominio va en inglés `camelCase`. Los campos y su obligatoriedad están en MD-04.
- [x] **IT-02** — Implementar `TaskMapper` como objeto de funciones puras
      Sin inyección Angular ni dependencias de E/S; se limita a transformar y normalizar, sin lógica de negocio ni formateo para UI.
- [x] **IT-03** — Derivar en el mapper los campos que BAW no entrega
      `slaStatus`, `teamName`, `isClaimed` e `isClaimedByCurrentUser`, con las reglas de MD-04. `due_date` es obligatorio en el contrato, así que la regla de vencida siempre es evaluable; `at_risk_time` es opcional y sin él una tarea nunca pasa por «en riesgo».
- [x] **IT-04** — Normalizar las fechas de la tarea
      `creation_time`, `due_date` y `at_risk_time` llegan como cadena sin formato declarado en el contrato — es el punto 1 de las Observaciones del documento técnico —, así que la normalización tolera el formato real y lo deja confirmado contra el ambiente de referencia. La comparación del estado de SLA se hace en UTC contra el reloj del cliente.
- [x] **IT-05** — Implementar `UserTaskRepository`
      Clase `{Entity}Repository` con convenciones `find*`, con la URL compuesta solo con `getApiUrl` y el path sin barra inicial (`bpm/user-tasks`) para que el proxy de desarrollo funcione.
- [x] **IT-06** — Exponer los parámetros de servidor de la consulta
      `states`, `model`, `process_id`, `sort`, `offset` y `size`, más `optional_parts=team_details`, que es lo que trae la columna de equipo. No pedir `data` en el listado: es pesado y solo hace falta en el detalle de la tarea.
- [x] **IT-07** — Devolver los enlaces de paginación de la respuesta
      La respuesta de API-05 es la lista más `previous` y `next`; el repositorio los conserva para que el listado pueda paginar sin recomponer la consulta.
