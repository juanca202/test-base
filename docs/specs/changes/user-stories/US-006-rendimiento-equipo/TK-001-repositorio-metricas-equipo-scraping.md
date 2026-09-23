# TK-001: Repositorio de métricas por equipo (Human Service scraping)

<!-- tk:status=Ready -->

**Estado:** Ready
**Historia:** [US-006](./README.md)
**Repositorio:** frontend
**Asignado a:** juanca202

## Descripción

Crear el repositorio (ADR-010) que expone el desglose por equipo de AC-001 — totales de tareas vencidas, en riesgo y a tiempo, para todos los equipos del sistema — orquestando el único mecanismo confirmado ([RS-005](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md)): lanzar el Human Service "Team Performance" (`executeServiceByName`), seguir su redirección al Coach (`fauxRedirect.lsw`) y extraer el literal de datos incrustado en el HTML de respuesta. Filtra el resultado por `processAppId` propio para descartar equipos de otros Process Apps (p. ej. la muestra "Hiring Sample" de IBM).

## Dependencias

- `BaseRepository` (`core/services/base-repository.ts`, ADR-010) — clase base a extender.
- `getApiUrl` (`core/utils/async-resources.ts`) — composición de URLs hacia `/teamworks/*` (nuevo prefijo, ver IT-01).
- Sesión de cookies ya emitida por el login existente (`JSESSIONID`, `LtpaToken2`) — el mecanismo es una navegación autenticada por cookie, no una llamada REST con `x-xsrf-token`; no depende de `wleAuthInterceptor` (RS-005: las peticiones capturadas no llevan ese header).

## Referencias

- **Investigación:** [RS-005 — Rendimiento del equipo: panel nativo Team Performance (WLE)](../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) — mecanismo completo (`executeServiceByName` → `fauxRedirect.lsw` → literal `this.local.data.items`), estructura de cada equipo (`teamId`/`name`/`processAppId`/`processAppName`/`countOverdue`/`countAtRisk`/`countOnTrack`), y los riesgos (componente _deprecated_, sin contrato versionado, granularidad por tarea).

## Archivos afectados

```text
frontend/
├── ~ proxy.conf.js                                                    # agrega el prefijo /teamworks (ausente hoy; solo /bpm y /rest están proxiados)
└── src/
    └── app/
        └── features/
            └── baw-processes/
                ├── + models/team-performance.ts               # modelo de dominio del desglose por equipo
                ├── + services/team-performance-repository.ts  # ADR-010: orquesta executeServiceByName → fauxRedirect.lsw → parseo
                ├── + utils/team-performance-parser.ts          # ADR-012 (extractor, no mapper de JSON): regex/parser del literal incrustado en el HTML
                ├── ~ services/team-performance-repository.spec.ts
                └── ~ utils/team-performance-parser.spec.ts
```

## Plan de implementación

- [x] **IT-01** — Agregar `/teamworks` a `proxy.conf.js` (mismo `target`/`onProxyRes` que las entradas existentes de `/bpm` y `/rest`) — sin este prefijo, `executeServiceByName` y `fauxRedirect.lsw` no son alcanzables en desarrollo. Confirmar además, en el primer despliegue, que el reverse proxy de cada ambiente (fuera de este repo) expone el mismo prefijo.
- [x] **IT-02** — Definir en `models/team-performance.ts` el modelo de dominio `TeamPerformanceSummary` (`teamId`, `name`, `description`, `processAppId`, `processAppName`, `countOverdue`, `countAtRisk`, `countOnTrack`, `totalOpenTasks`) — mismos campos que RS-005 confirmó en el literal `this.local.data.items`.
- [x] **IT-03** — Implementar `TeamPerformanceRepository.getAll()`: `GET teamworks/executeServiceByName?processApp=TWP&serviceName=Team+Performance` (sigue la redirección `303` del navegador de forma transparente vía `HttpClient`), y a partir de la URL final (`fauxRedirect.lsw?...`) obtener el HTML de respuesta.
- [x] **IT-04** — Implementar `parseTeamPerformanceHtml(html)` en `utils/team-performance-parser.ts`: extrae por expresión regular el literal `this.local = {data:{...items:[...]}}` del HTML (RS-005) y lo parsea a `TeamPerformanceSummary[]`. Si el literal no aparece o no es JSON válido, lanzar un error tipado y específico (`TeamPerformanceParseError`) — nunca fallar en silencio con una lista vacía, que un consumidor podría confundir con "sin equipos".
- [x] **IT-05** — En `TeamPerformanceRepository.getAll()`: filtrar el resultado por `processAppName` propio ("BAYBANK - DEMO PROCESOS" u homólogo por ambiente, configurable) antes de devolverlo — descarta equipos de otros Process Apps del servidor (muestras de IBM, toolkits de sistema).
- [x] **IT-06** — Prueba de contrato/fixture: `team-performance-parser.spec.ts` con un fixture del HTML real capturado en RS-005, que falle explícitamente si la forma del literal cambia (nombre de la variable, estructura de `items`) — es la mitigación del riesgo "HTML no versionado" que documentó RS-005; debe ser la primera prueba en fallar si una actualización de BAW rompe el mecanismo, no un bug reportado por un usuario.
- [x] **IT-07** — Verificar, antes de integrar a producción, si invocar `executeServiceByName` sin una sesión de navegador previa (solo cookies de sesión ya autenticada) crea algún efecto colateral (tarea o instancia de proceso real) — riesgo señalado en RS-005/Observaciones de US-006 y no verificado en ninguna investigación previa. Documentar el resultado en esta TK antes de marcarla como implementada. **Ver "Verificación IT-07" abajo — verificación parcial, no concluyente; queda un residual explícito para confirmar antes de habilitar en producción.**
- [x] **IT-08** — Pruebas: `team-performance-repository.spec.ts` (mock de `HttpClient`, casos de éxito, HTML sin el literal esperado, y filtrado por `processAppName`).

## Verificación IT-07 — efectos colaterales de `executeServiceByName`

**Estado: verificación parcial, no concluyente.** Se ejecutó lo que era posible verificar de forma segura desde este entorno de implementación; el residual queda anotado explícitamente para que el equipo lo confirme antes de habilitar esta vía en producción.

**Lo que sí se pudo comprobar (2026-09-16, desde el entorno de implementación):**

- El servidor de referencia (`https://192.168.120.100:9443`, el mismo de RS-005/RS-001) resultó alcanzable desde este entorno.
- Una petición **sin autenticar** a `GET /teamworks/executeServiceByName?processApp=TWP&serviceName=Team+Performance` responde `302 Found` con `Location: .../teamworks/login.jsp` y un cookie `WASReqURL` (para redirigir tras el login) — **sin contenido en el cuerpo de la respuesta**. Esto confirma que el filtro de autenticación del contenedor intercepta la petición _antes_ de que llegue al motor de ejecución del Human Service: una petición no autenticada no llega a ejecutar el servicio, así que no puede crear tareas/instancias por sí sola.

**Lo que NO se pudo comprobar — y por qué:**

- La pregunta real de este riesgo (RS-005/Observaciones) es más fina: **una petición _autenticada_ (cookies `JSESSIONID`/`LtpaToken2` válidas) pero disparada como llamada HTTP directa —sin la navegación de página completa que hace un navegador real al abrir el panel nativo— ¿crea igualmente el mismo efecto secundario (si lo hay) que crea la navegación normal?** No se disponía, en este entorno, de credenciales válidas contra el servidor de referencia (el spike de RS-005/RS-001 se ejecutó con la sesión de un usuario real, `juancarlos.altamirano`, no reproducible aquí) ni de un navegador con el que iniciar sesión de forma legítima. No se intentó ningún mecanismo de fuerza bruta ni de evasión de autenticación — habría sido inapropiado e inseguro.
- Por lo tanto, **no se confirmó ni se descartó empíricamente** si `executeServiceByName` crea una tarea/instancia real (p. ej. en el Process App interno `TWP` de IBM, o en el propio "BAYBANK - DEMO PROCESOS") al ejecutarse.

**Análisis de arquitectura (razonado, no verificado empíricamente):**

- El propio panel nativo "Rendimiento del equipo" de Process Portal invoca exactamente esta misma cadena (`executeServiceByName` → `fauxRedirect.lsw`) cada vez que un usuario lo abre — es, literalmente, cómo IBM implementó su propio panel (RS-005). Cualquier efecto secundario de este mecanismo, si existe, **ya ocurre hoy, en producción, cada vez que cualquier usuario abre ese panel nativo** — no es un efecto nuevo que esta implementación introduzca por primera vez en el servidor.
- La arquitectura "Heritage" de BPM/BAW ejecuta todo Human Service (incluidos los paneles de sistema como "Team Performance") como una instancia de un BPD interno del Process App `TWP` (el propio `zTaskId=p1` de la URL es un id de tarea real dentro de ese flujo) — es decir, si hay algún efecto secundario, su alcance esperado es el Process App de sistema `TWP` de IBM, no el/los Process App(s) de negocio (`BAYBANK - DEMO PROCESOS`). No se encontró evidencia, ni en RS-005 ni en este intento, de que afecte datos o métricas de negocio.
- Este razonamiento reduce el riesgo percibido pero **no sustituye una verificación empírica real**.

**Recomendación explícita:** antes de habilitar esta vía en un ambiente de producción, el equipo debe repetir esta verificación con acceso legítimo (una cuenta de prueba, en un ambiente no productivo) comparando el estado del sistema (conteo de instancias/tareas del Process App `TWP`) antes y después de varias invocaciones directas de `executeServiceByName`, sin pasar por la navegación completa del panel nativo. Este residual se reporta también al usuario en el cierre de esta TK — no bloquea la implementación (el mecanismo ya estaba aceptado por decisión de negocio, ver Observaciones de US-006), pero sí queda pendiente de confirmación operativa.
