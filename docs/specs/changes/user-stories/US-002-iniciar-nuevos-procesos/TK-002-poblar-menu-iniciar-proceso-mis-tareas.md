# TK-002: Poblar el menú "Iniciar proceso" en Mis tareas

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-002](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Reemplazar el catálogo mockeado `STARTABLE_PROCESSES` del menú "Iniciar proceso" (barra superior de "Mis tareas", `tasks.ts`/`tasks.html`) por el catálogo real de `ProcessRepository` (TK-001), y cablear cada opción del menú para arrancar la instancia correspondiente. Cubre AC-001 (renderizado del listado real), AC-002 (arranque), AC-003 (sin reintento automático ante timeout/red) y AC-004 (estado vacío/error del catálogo).

**Fuera de alcance de esta tarea:** la pantalla dedicada "Iniciar" del wireframe aprobado (sidebar propio, buscador de proceso, tarjetas) — decisión explícita del usuario al planificar esta US: esta ronda cubre únicamente el menú ya existente en "Mis tareas". Si se retoma la pantalla dedicada, es una tarea nueva a planificar aparte.

## Dependencias

- **TK-001** (`ProcessRepository`, `StartableProcess`, `StartedProcessInstance`) — fuente de datos y acción de arranque de esta tarea.
- `Tasks` (`components/tasks/tasks.ts`/`.html`) — componente a modificar: el botón `matMenuTriggerFor` y el `mat-menu` ya existen (mock), con `STARTABLE_PROCESSES` importado hoy.
- `notify` (`core/utils/notification.ts`, ADR-009) — confirmación de instancia creada y aviso de error.
- `ProgressPlaceholder` (`shared/components/progress-placeholder/progress-placeholder.ts`) — ya usado en `Tasks` para el estado de carga del listado; reutilizable dentro del menú.

## Referencias

- **Documentación técnica:** [FL-04: Iniciar una instancia de proceso](../../../specs/technical-docs/portal-procesos-baw.md#fl-04) · [API-14: Iniciar una instancia de proceso (WLE)](../../../specs/technical-docs/portal-procesos-baw.md#api-14)
- **Diseño:** [Wireframe de Iniciar](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/iniciar.md) — referencia de intención (nombre/ícono de proceso, acción de arranque); la pantalla dedicada que describe queda fuera de esta tarea, ver Descripción.

## Archivos afectados

```text
frontend/
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── + services/start-process-manager.ts      # Manager (ADR-011): carga StartableProcess[] y orquesta start()
                ├── + services/start-process-manager.spec.ts  # tests del manager
                ├── ~ components/tasks/tasks.ts                # quita STARTABLE_PROCESSES; inyecta StartProcessManager; startProcess()
                ├── ~ components/tasks/tasks.html               # estados carga/vacío/error/datos del mat-menu; quita disabled
                └── ~ components/tasks/tasks.spec.ts            # casos nuevos del menú "Iniciar proceso"
```

## Plan de implementación

- [x] **IT-01** — `StartProcessManager` (Manager, ADR-011)
      Envuelve `ProcessRepository.findStartable()` con el mismo patrón de `TasksManager` (`getResource`): expone `processes` (computed, `[]` por defecto), `loading`, `error` como signals, y `load()`/`reload()`. Agrega `start(process: StartableProcess): Promise<StartedProcessInstance>` que delega en `ProcessRepository.start(process)` sin envolver el error (la interpretación de timeout/red vs. otros errores es de `Tasks`, IT-04) — el manager solo orquesta, no decide presentación (mismo criterio que `TasksManager`).
- [x] **IT-02** — Cargar el catálogo en `Tasks.ngOnInit`
      Inyectar `StartProcessManager`, llamar `startProcessManager.load()` junto a `manager.loadFirstPage()` (en paralelo, sin bloquear uno al otro). Quitar la constante `STARTABLE_PROCESSES` y el campo `startableProcesses` respaldados por el mock; reemplazar por los signals del manager (`protected readonly processes = this.startProcessManager.processes;` y análogos para `loading`/`error`).
- [x] **IT-03** — Estados del `mat-menu` en `tasks.html`
      Dentro de `#startProcessMenu`: si `processesLoading()`, un `ProgressPlaceholder` compacto (o equivalente) en vez de la lista; si `processesError()`, un ítem con el mensaje de error y una opción "Reintentar" que llame a `startProcessManager.reload()`; si `processes().length === 0` (y sin loading/error), un ítem no interactivo "No hay procesos disponibles para iniciar" (AC-004); en el resto de los casos, la lista real vía `@for` sobre `processes()`, con `(click)="startProcess(process)"` y **sin** el atributo `disabled` que tiene hoy — el ícono se mantiene fijo (`flow`, como hoy) porque el catálogo de API-03 no trae ícono.
- [x] **IT-04** — `startProcess(process: StartableProcess)` en `Tasks`
      Deshabilita el botón que abre el menú mientras la petición está en curso (evita doble click sobre `start`, coherente con AC-003 aunque el requisito hable de reintento automático, no de doble click humano). Llama `startProcessManager.start(process)`:
  - **Éxito:** `notify` con un mensaje de confirmación que incluya el `name`/`piid` de la instancia creada (`StartedProcessInstance`), nivel informativo.
  - **Error de timeout o corte de red** (sin código de estado HTTP, o `status === 0`): `notify` con un mensaje que advierta que **el resultado es incierto** (pudo haberse creado la instancia) y **NO reintentar automáticamente** (AC-003). No hay todavía una pantalla "Procesos" en este repositorio a la que remitir (US-004 sin implementar): omitir esa parte del mensaje del flujo documentado en FL-04 hasta que exista, sin inventar una navegación rota — dejar anotado en Observaciones.
  - **Otro error** (p. ej. 401/403 — sesión caída o sin _Expose to start_ para ese proceso): `notify` de error con el mensaje de BAW si está disponible, igual que el resto de errores no especiales del repo.
  - En cualquier caso, rehabilita el botón del menú al terminar (éxito o error).
- [x] **IT-05** — Tests (`tasks.spec.ts` + `start-process-manager.spec.ts`)
      Manager: `load()` puebla `processes` desde el repositorio mockeado; `start()` delega en el repositorio y propaga tanto el resultado como el error sin transformarlos. Componente: el menú muestra el estado de carga mientras `processesLoading()`; muestra el estado vacío con `processes: []`; muestra el estado de error con `processesError()` y que "Reintentar" llama a `reload()`; clic en una opción del menú llama a `startProcess` con el proceso correcto y este a `startProcessManager.start` con `bpdId`/`processAppId`; un rechazo simulado sin `status` (timeout) dispara el mensaje de resultado incierto y no se observa ninguna segunda llamada a `start` (sin reintento automático).

## Observaciones

- Ninguna. La divergencia con [FL-04](../../../specs/technical-docs/portal-procesos-baw.md#fl-04) (mensaje de resultado incierto sin remitir a "Procesos") y el alcance frente al wireframe quedan resueltos en IT-04 y en "Fuera de alcance" (Descripción), respectivamente — no son pendientes de esta tarea.
