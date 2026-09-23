# TK-002: Listado de procesos — Activo y Completado

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-004](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Convertir la entrada de menú `/processes` —hoy sin ruta— en el listado de instancias de proceso del usuario autenticado, con pestañas Activo (`running`) / Completado (`finished`), filas con nombre, identificador, fecha de creación y vencimiento, paginación de servidor y estados de carga, error y vacío.

Incluye el manager que orquesta la carga y la paginación, punto por el que TK-003 engancha después la búsqueda y los filtros al mismo conjunto.

## Dependencias

- [TK-001: Modelo y repositorio de instancias de proceso](./TK-001-modelo-repositorio-instancias-proceso.md) — modelo de dominio y consulta paginada.
- `MainLayout` (`shared/components/main-layout/`) — el ítem de menú `{ url: '/processes', label: 'Procesos' }` ya existe; esta tarea registra la ruta hija.
- `authGuard` — el shell autenticado de `baw-processes-routes.ts` ya lo aplica.
- `Datagrid` (`shared/components/datagrid/`) — tabla paginada reutilizada por «Mis tareas».
- `ProgressPlaceholder` y `ErrorPlaceholder` (`shared/components/`) — estados de carga y de error.
- `getResource` (`core/utils/async-resources.ts`) — carga asíncrona con signals, mismo patrón que `TasksManager`.

## Referencias

- **Diseño:** [Wireframe de Procesos](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/procesos.md)
- **Documentación técnica:** [MD-03: Instancia de proceso](../../../specs/technical-docs/portal-procesos-baw.md#md-03) · [API-09: Listar instancias de proceso](../../../specs/technical-docs/portal-procesos-baw.md#api-09) · [DG-02: Componentes del frontend](../../../specs/technical-docs/portal-procesos-baw.md#dg-02)
- **Arquitectura:** [ADR-011 — Patrón Manager](../../../../frontend/docs/adr/ADR-011-manager-pattern-orchestration.md) · [ADR-006 — Tailwind CSS](../../../../frontend/docs/adr/ADR-006-presentation-tailwind-css.md) (repo `frontend`)

## Archivos afectados

```text
frontend/
└── src/app/
    ├── features/baw-processes/
    │   ├── + services/process-instances-manager.ts         # orquesta carga, pestaña y paginación
    │   ├── + services/process-instances-manager.spec.ts
    │   ├── + components/processes/processes.ts             # vista /processes
    │   ├── + components/processes/processes.html
    │   ├── + components/processes/processes.spec.ts
    │   └── ~ baw-processes-routes.ts                       # hija path: 'processes'
    └── shared/components/main-layout/
        └── ~ main-layout.spec.ts                           # la ruta /processes deja de ser solo un enlace huérfano
```

## Plan de implementación

- [x] **IT-01** — Registrar la ruta `/processes` bajo el shell autenticado
      En `baw-processes-routes.ts`, junto a `tasks`. Título de página «Procesos». El ítem de menú de `MainLayout` ya apunta a esa URL.
- [x] **IT-02** — Crear `ProcessInstancesManager` para orquestar el listado
      Clase `{Entidad}Manager` (ADR-011). Coordina `ProcessInstanceRepository.findAll` y expone el estado con signals. El acceso HTTP sigue siendo del repositorio. Pestaña por defecto: Activo → `states=running`. Completado → `states=finished`. Cambiar de pestaña reinicia `offset` a la primera página.
- [x] **IT-03** — Pintar la fila de instancia con los campos que la API alimenta
      Nombre (`name`), identificador (`id`), fecha de creación (`creationTime`) y vencimiento (`dueDate` cuando existe; si falta, celda vacía — no inventar). **No** incluir la columna «grupo responsable» del wireframe: MD-03 no trae equipo.
- [x] **IT-04** — Paginar contra el servidor
      Con `offset` y `size`. Avanzar/retroceder según los enlaces `next`/`previous` de API-09. El contrato **no trae total**: no recorrer todas las páginas para fabricar uno (eso rompería el umbral de carga). Si `Datagrid` exige `total`, alimentarlo solo con lo que se pueda inferir de la página actual más la existencia de `next` — nunca con un recuento global inventado.
- [x] **IT-05** — Resolver los estados de carga, error y listado vacío
      Reutilizando los placeholders compartidos, con mensajes distintos entre vacío y error, sin dejar la vista en blanco.
