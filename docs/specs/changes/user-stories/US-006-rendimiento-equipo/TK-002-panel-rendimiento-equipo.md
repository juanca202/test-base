# TK-002: Panel "Rendimiento del equipo"

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-006](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Construir la pantalla "Rendimiento del equipo": una tarjeta por equipo (nombre, gráfico circular de estado, conteos de vencido/en riesgo/a tiempo, descripción breve — AC-001), para todos los equipos disponibles, alimentada por el repositorio de TK-001.

## Dependencias

- `TeamPerformanceRepository` (TK-001) — fuente de datos del panel.
- `TaskSlaStatus`/clases `ft-badge--success/warning/danger` (`models/user-task.ts`) — mismo vocabulario de severidad ya usado en el resto de la app, para mapear `countOverdue`/`countAtRisk`/`countOnTrack` a la presentación de cada tarjeta.

## Referencias

- **Diseño:** [Wireframe de Rendimiento del equipo](../../../specs/requirements/SRS-001-portal-procesos-baw/assets/wireframes/rendimiento-equipo.md) — tarjeta por grupo (nombre, gráfico circular, conteos, descripción).
- **Investigación:** [RS-005](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) — captura de pantalla del panel nativo equivalente, usada como referencia de layout.

## Archivos afectados

```text
frontend/
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── + components/team-performance/team-performance.ts            # vista: grid de tarjetas por equipo
                ├── + components/team-performance/team-performance.html
                ├── + components/team-performance/team-performance.css
                ├── + components/team-performance/team-performance.spec.ts
                ├── + components/team-performance/team-performance-card/team-performance-card.ts   # tarjeta individual (nombre, gráfico circular, conteos SLA, descripción)
                ├── + components/team-performance/team-performance-card/team-performance-card.html
                ├── + components/team-performance/team-performance-card/team-performance-card.spec.ts
                └── ~ app.routes.ts                                              # registra la ruta del nuevo panel
```

## Plan de implementación

- [x] **IT-01** — Crear `TeamPerformanceCard`: tarjeta presentacional (nombre del equipo, descripción si existe, gráfico circular de estado, conteos vencido/en riesgo/a tiempo con las clases `ft-badge--success/warning/danger`), recibiendo un `TeamPerformanceSummary` (TK-001) por `input()` — mismo patrón visual que `ProcessPerformanceCard` (US-005, TK-002) para mantener consistencia entre los dos paneles de rendimiento.
- [x] **IT-02** — Crear `TeamPerformance`: grid de `TeamPerformanceCard` alimentado por `TeamPerformanceRepository.getAll()`; estados de carga, vacío (sin equipos tras el filtrado por `processAppName`) y error (p. ej. `TeamPerformanceParseError` de TK-001) con mensajes explícitos — no una pantalla en blanco.
- [x] **IT-03** — Registrar la ruta del panel en `app.routes.ts` y su entrada de navegación, siguiendo el patrón ya usado por "Procesos"/"Mis tareas".
- [x] **IT-04** — Pruebas: `team-performance.spec.ts` (carga, vacío, error) y `team-performance-card.spec.ts` (mapeo de conteos a clases de severidad, presentación de la descripción cuando está ausente).
