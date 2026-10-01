# RS-004 — Métricas de rendimiento por proceso: mecanismo real en Process Portal (Ajax Services WLE)

**Estado:** Ready
**Flujo:** Investigación libre
**Artefacto referenciado:** N/A
**Creado por:** juanca202
**Fecha:** 2026-09-15

## Pregunta de investigación

¿La familia clásica de BAW (`/rest/bpm/wle/v1/`) expone algún endpoint con métricas de rendimiento por proceso (instancias en curso, desglose por SLA, duración promedio, tasa de renovación) equivalente a lo que pide AC-001 de US-005, dado que la familia `/bpm/` ya confirmó no tenerlas (MD-08, API-10)?

## Contexto

La documentación técnica de la capability confirma, en la familia `/bpm/` ya validada, que **no existe ningún endpoint de métricas** (MD-08, API-10: "Confirmado (ausente)"): las métricas históricas de BAW viven en el Performance Data Warehouse, no expuesto por esa interfaz. MD-08 deja además dos gaps explícitos: `averageDurationMs` solo sería aproximable en cliente (el contrato no trae hora de fin) y `renewalRate` "sigue sin definición" (sin fórmula, ventana ni denominador). Esa laguna bloquea AC-001 de [US-005 (Rendimiento del proceso)](../../user-stories/US-005-rendimiento-proceso/README.md), que sigue en Draft.

RS-003 ya resolvió AC-002 de la misma US (diagrama) encontrando un endpoint WLE real y no documentado (`visual/processModel/instances`) mediante inspección en vivo de IBM Process Portal. El usuario pidió repetir ese enfoque para AC-001: verificar si Process Portal tiene alguna vista de rendimiento y, si la tiene, capturar qué llama.

## Hallazgos

### Sí existe un panel nativo "Rendimiento del proceso"

Menú principal → Paneles de control → **Rendimiento del proceso** (`https://192.168.120.100:9443/ProcessPortal/dashboards/TWP/Process+Performance`) — mismo nombre que nuestra US-005. Muestra, para un proceso de negocio:

- **Estadísticas rápidas:** "Instancias en curso" (conteo) y "Promedio de duración de las instancias".
- **Tasa de renovación:** un gráfico de series de tiempo con tres series — "Nuevas instancias", "Instancias completadas" y "Cambio en número de instancias activas" — por bucket horario (configurable: Horas/otros).
- **Duración media:** gráfico adicional (sin datos disponibles en la prueba: "no hay instancias cerradas").
- **Instancias en curso:** listado filtrable por texto de negocio.
- Una pestaña **Diagrama** aparte (el mismo tipo de vista que investigó RS-003, aquí a nivel de proceso en vez de instancia).

Esto en sí mismo es un hallazgo relevante: **IBM sí calcula y muestra estas métricas**, contradiciendo la premisa de que solo quedan las alternativas (b) agregación degradada o (c) diferir la historia — hay una tercera vía a evaluar.

### El mecanismo NO es un endpoint REST fijo como el de AC-002 — son Ajax Services por GUID

A diferencia de `visual/processModel/instances` (una ruta REST nombrada y estable), este dashboard funciona ejecutando **servicios BAW identificados por GUID** contra el endpoint genérico `POST /rest/bpm/wle/v1/service/{serviceId}` — el mismo mecanismo genérico de "ejecutar servicio" que usa cualquier Ajax Service de BPM, no un recurso de métricas dedicado. Se identificaron al menos tres invocaciones distintas al cargar el panel:

- **`1.66c1cf8c-410f-429c-88df-5d2acdb3468f`** — alimenta "Tasa de renovación". Parámetros: `{units: "Hour", numPeriods: 24, endPeriod, timezone, searchFilter, processId, processAppId, teamId}`. Respuesta: `data.categoricalData.plots.series.items[]`, cada serie ("Nuevas instancias", "Instancias completadas") con puntos `{name: <timestamp ISO>, value: <número>}` por bucket horario.
- **`1.492222d4-9c77-4bd4-beab-87e8abe5aa47`** — alimenta el listado de "Instancias en curso" y probablemente el desglose por SLA. Parámetros: `{processInstanceListProperties: {sortCriteria: "DUEDATE", riskState, stepRiskState, stepId, searchFilter, maxRows, beginIndex}, appId, processId}` — `riskState`/`stepRiskState` son exactamente los campos que permitirían el desglose a tiempo/en riesgo/vencida que pide AC-001. Respuesta: `data.processInstances.items[]` (vacío en la prueba, sin instancias del proceso por defecto).
- **`1.c5e86555-4e8f-4d07-819a-9b5aae19f260`** — metadatos de campos de negocio buscables; no aporta a las métricas en sí.

**Hallazgo sobre `renewalRate`:** MD-08 lo marcaba "sin fórmula, ventana ni denominador especificados". La propia implementación de IBM resuelve esto: no lo trata como un porcentaje único, sino como el gráfico de tres series (nuevas vs. completadas vs. cambio neto) descrito arriba — esa es su definición operativa de facto.

### Limitaciones encontradas en esta investigación

- **El dashboard no acepta el proceso a mostrar por parámetros de URL.** Se probó navegar con `?processId=25.817b0b7b-...&processAppId=2066.52cbc4b2-...` (los ids reales de "Solicitar Credito", confirmados en RS-003) y el panel siguió mostrando "Standard HR Open New Position" (el proceso por defecto) sin cambios. La selección de proceso ocurre dentro de la lógica interna del Coach, no vía query string.
- **No se identificó, en el tiempo de esta investigación, desde qué vista de Process Portal se llega a este panel ya filtrado a un proceso de negocio propio** como "Solicitar Credito" — no aparece en el listado "Iniciar" de procesos expuestos a arranque, y el listado "Procesos" del menú principal muestra instancias individuales, no tipos de proceso con acceso directo a su rendimiento.
- **Por lo anterior, no se pudo validar el contrato de respuesta con datos reales poblados** (SLA real, duración promedio real): el proceso mostrado por defecto no tenía instancias cerradas. Los hallazgos de forma (parámetros, forma de la respuesta) están confirmados; los valores concretos de SLA/duración, no.
- **Estabilidad del `serviceId` entre entornos, sin confirmar.** El Process App "TWP" donde viven estos servicios parece ser un toolkit de sistema que IBM distribuye con Process Portal (no un asset de negocio nuestro), lo que sugiere que los GUID podrían ser estables entre instalaciones de una misma versión de BAW — pero, a diferencia de una ruta REST documentada, esto no es una garantía contractual de IBM: es un identificador de asset interno, y no se verificó contra una segunda instalación.

## Conclusión y recomendación

**Sí existe un mecanismo real, del lado de BAW, que calcula estas métricas** — contradice la premisa de MD-08 de que "ninguna operación... provee métricas de rendimiento": las provee, pero no como un endpoint REST documentado, sino como Ajax Services ejecutados vía `POST /rest/bpm/wle/v1/service/{serviceId}`, con contrato de parámetros y respuesta específico de cada servicio y no publicado por IBM.

Esto cambia el marco de la decisión de AC-001, pero **no la cierra**: antes de recomendar consumir este mecanismo hace falta un spike que resuelva sus dos incógnitas abiertas — (1) cómo llegar a este panel ya apuntado a un proceso de negocio propio, para validar el contrato con datos reales, y (2) si los `serviceId` (`1.66c1cf8c-...`, `1.492222d4-...`) son estables entre el ambiente de pruebas y producción o cambian por instalación del Process App "TWP". Sin esas dos respuestas, construir un repository sobre estos GUID sería más frágil que el ya confirmado `visual/processModel/instances` de RS-003 (una ruta REST nombrada, no un identificador de asset).

**No descarta** la alternativa (b) ya documentada en US-005 (agregación degradada sobre `GET /bpm/processes`), que sigue siendo la opción de fallback sin dependencias nuevas por resolver — pero si el spike confirma (1) y (2), este mecanismo daría datos más precisos (incluye duración real de instancias cerradas, que la alternativa degradada no puede calcular por falta de hora de fin) y ya resuelve la definición de `renewalRate`.

## Impacto en el artefacto / próximo paso

N/A — investigación independiente. (Referenciada como evidencia para AC-001 de US-005; la actualización de la US la hace `work-define`, no este RS.)

## Fuentes

- Inspección en vivo de `https://192.168.120.100:9443/ProcessPortal/` (usuario `juancarlos.altamirano`), 2026-09-15: Menú principal → Rendimiento del proceso (`dashboards/TWP/Process+Performance`), con captura de red (DevTools) de las peticiones `POST /rest/bpm/wle/v1/service/1.66c1cf8c-410f-429c-88df-5d2acdb3468f`, `POST /rest/bpm/wle/v1/service/1.492222d4-9c77-4bd4-beab-87e8abe5aa47` y `POST /rest/bpm/wle/v1/service/1.c5e86555-4e8f-4d07-819a-9b5aae19f260`, y captura de pantalla del panel renderizado.
- [`docs/specs/technical-docs/portal-procesos-baw.md`](../../../specs/technical-docs/portal-procesos-baw.md) — MD-08, API-10 (métricas confirmadas ausentes en la familia `/bpm/`).
- [`docs/specs/user-stories/US-005-rendimiento-proceso/README.md`](../../user-stories/US-005-rendimiento-proceso/README.md) — AC-001 y su decisión pendiente.
- [RS-003: Diagrama de proceso vía la API visual de WLE](../RS-003-diagrama-proceso-visual-wle/README.md) — mismo enfoque de inspección en vivo, aplicado a AC-002.
