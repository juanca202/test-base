# Progreso

## US-002-iniciar-nuevos-procesos

<!-- work:id=US-002 · status=Done -->

**Estado:** Done
**Tipo:** historia de usuario
**Fecha de creación:** 2026-09-15 06:50
**Ultima actualizacion:** 2026-09-15 07:45

## Unidades

### TK-001: Repositorio de procesos iniciables (WLE)

<!-- unit:id=TK-001 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-15 06:50
**Finalizado:** 2026-09-15 07:00
**Implementador:** juanca202 / Claude / claude-sonnet-5

**Archivos:**
`

- frontend/src/app/features/baw-processes/models/process.ts
- frontend/src/app/features/baw-processes/utils/process-mapper.ts
- frontend/src/app/features/baw-processes/utils/process-mapper.spec.ts
- frontend/src/app/features/baw-processes/services/process-repository.ts
- frontend/src/app/features/baw-processes/services/process-repository.spec.ts
  `

**Notas:**
[]

**Decisiones adicionales:**

- `start()` compone la query (`action`/`bpdId`/`processAppId`) en vez de reutilizar el `startURL` crudo que trae el catálogo, para no acoplar el repositorio al formato de esa URL (mismos identificadores, misma llamada).

### TK-002: Poblar el menú "Iniciar proceso" en Mis tareas

<!-- unit:id=TK-002 · status=Done -->

**Estado:** Done
**Iniciado:** 2026-09-15 07:05
**Finalizado:** 2026-09-15 07:45
**Implementador:** juanca202 / Claude / claude-sonnet-5 (IT-01, servicio) + ui-specialist (IT-02–IT-05, componente/plantilla/tests)

**Archivos:**
`

- frontend/src/app/features/baw-processes/services/start-process-manager.ts
- frontend/src/app/features/baw-processes/services/start-process-manager.spec.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.ts
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.html
  ~ frontend/src/app/features/baw-processes/components/tasks/tasks.spec.ts
  `

**Notas:**
[]

**Decisiones adicionales:**

- El mensaje de error de conectividad (timeout/red) no remite a ninguna pantalla "Procesos" — ese módulo (US-004) no existe todavía en el repositorio; solo advierte que el resultado es incierto y que no hay reintento automático (divergencia deliberada con FL-04, ya anotada en TK-002).
- Estado de carga del menú reutiliza `app-progress-placeholder` (ya usado en el listado principal) en vez de un componente nuevo.
