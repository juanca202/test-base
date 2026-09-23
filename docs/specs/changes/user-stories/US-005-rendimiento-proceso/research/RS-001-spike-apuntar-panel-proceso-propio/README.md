# RS-001 — Spike: apuntar "Rendimiento del proceso" a un proceso propio y estabilidad del `serviceId`

**Estado:** Ready
**Flujo:** Analizar decisiones pendientes
**Artefacto referenciado:** US-005
**Creado por:** juanca202
**Fecha:** 2026-09-16

## Pregunta de investigación

¿Se puede apuntar el panel nativo "Rendimiento del proceso" (`dashboards/TWP/Process+Performance`) a un proceso de negocio propio para validar con datos reales el contrato de los Ajax Services que confirmó RS-004, y son esos `serviceId` (`1.66c1cf8c-...`, `1.492222d4-...`) estables o dependen de la instalación?

## Contexto

[RS-004](../../../research/RS-004-metricas-rendimiento-proceso-wle/README.md) confirmó que el panel "Rendimiento del proceso" calcula, vía Ajax Services de WLE, las métricas que pide AC-001 de US-005 — pero dejó dos incógnitas abiertas que bloquean planificar la tarea: (1) no logró apuntar el panel a un proceso propio (probó parámetros de URL genéricos `?processId=...&processAppId=...`, sin efecto — el panel seguía mostrando el proceso de muestra "Standard HR Open New Position", sin instancias cerradas con las que validar el contrato), y (2) no pudo confirmar si los `serviceId` de esos Ajax Services son estables entre instalaciones o específicos del ambiente de pruebas. Este RS ejecuta el spike que esas dos incógnitas dejaron pendiente.

## Hallazgos

### Incógnita 1 — resuelta: el panel base es una lista de procesos, no un proceso fijo

Navegar directamente a `dashboards/TWP/Process+Performance` **sin parámetros** no aterriza en el proceso de muestra como asumía RS-004 (esa vez se debió a un estado de sesión/Coach previo distinto): muestra un **"Panel de control de rendimiento de proceso"** con una tarjeta por cada tipo de proceso del sistema — en esta sesión: "Credito IA Generativa", "Standard HR Open New Position" y "Proceso de Créditos" — cada una con su propio desglose vencido/en riesgo/a tiempo, igual que el panel hermano de equipos (RS-005). Cada tarjeta es un enlace que navega a:

```
/ProcessPortal/dashboards/TWP/Process+Performance
  ?tw.local.selectedProcessId=25.54d6f626-b0d3-4eb7-a4f0-8bc7fb605214
  &tw.local.processAppId=2066.0050cf1a-48be-487a-a333-ad300b07b6e7
```

**Los nombres de parámetro correctos son `tw.local.selectedProcessId` y `tw.local.processAppId`** — no `processId`/`processAppId` a secas, que fue lo que RS-004 probó sin éxito. Con esos nombres, el panel apunta correctamente a "Credito IA Generativa" (proceso propio de "BAYBANK - DEMO PROCESOS") y muestra datos reales: **3 instancias en curso (2 vencidas, 1 a tiempo)**, duración promedio de instancias **"0m 16s"** (un valor real, no el "sin datos" que veía RS-004), el gráfico de "Tasa de renovación" con series por hora pobladas, y un listado "Instancias en curso" con 3 instancias reales (`Credito IA Generativa:407/409/415`) con fecha de vencimiento y edad.

### Incógnita 1, contrato validado con datos reales

La llamada al Ajax Service de instancias (`1.492222d4-...`) con el proceso propio ya seleccionado confirma el contrato completo:

```json
{
  "processInstanceListProperties": {
    "sortCriteria": "DUEDATE",
    "riskState": null,
    "stepRiskState": null,
    "stepId": null,
    "searchFilter": null,
    "maxRows": 26,
    "beginIndex": 0
  },
  "appName": null,
  "appId": "2066.0050cf1a-48be-487a-a333-ad300b07b6e7",
  "processName": null,
  "processId": "25.54d6f626-b0d3-4eb7-a4f0-8bc7fb605214"
}
```

Respuesta real:

```json
{
  "processInstances": {
    "items": [
      {
        "id": "407",
        "name": "Credito IA Generativa:407",
        "dueDate": "2026-09-16T05:40:35.215Z",
        "riskState": "Overdue",
        "age": 1071
      },
      {
        "id": "409",
        "name": "Credito IA Generativa:409",
        "dueDate": "2026-09-16T05:46:17.739Z",
        "riskState": "Overdue",
        "age": 1066
      },
      {
        "id": "415",
        "name": "Credito IA Generativa:415",
        "dueDate": "2026-09-16T22:33:23.814Z",
        "riskState": "OnTrack",
        "age": 59
      }
    ]
  }
}
```

**Esto es lo que RS-004 no pudo obtener**: `riskState` puebla con valores reales (`"Overdue"`, `"OnTrack"` confirmados en esta sesión; el tercer valor, `"AtRisk"`, se infiere por simetría con las etiquetas de UI ya confirmadas en RS-005 — `control.label.atRisk`/`onTrack`/`overdue` — pero no se observó un caso real en este set de datos). El campo `appId`/`processId` viaja como **parámetro de la llamada al servicio**, no como estado de sesión — es decir, **un backend propio podría invocar este Ajax Service directamente con nuestro `processId`/`appId`, sin pasar por la UI del dashboard en absoluto**.

### Incógnita 1 (bonus) — `averageDuration` también validado

MD-08 dejaba como gap que `averageDurationMs` "solo sería aproximable en cliente, el contrato no trae hora de fin". El "0m 16s" mostrado en "Promedio de duración de las instancias" para Credito IA Generativa confirma que el servidor **sí** calcula y entrega esta métrica cuando hay instancias cerradas reales — cierra ese gap adicional de MD-08, no solo el spike original.

### Incógnita 2 — evidencia a favor de la estabilidad (no concluyente entre ambientes)

Los mismos tres `serviceId` que RS-004 documentó contra el proceso de muestra por defecto se reutilizaron, en la misma sesión, al consultar "Credito IA Generativa" (proceso propio):

| Servicio               | GUID                                     | Antes (RS-004, proceso de muestra) | Ahora (proceso propio)                                             |
| ---------------------- | ---------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Tasa de renovación     | `1.66c1cf8c-410f-429c-88df-5d2acdb3468f` | ✅                                 | ✅ (mismo GUID, `processId`/`processAppId` propios como parámetro) |
| Instancias/`riskState` | `1.492222d4-9c77-4bd4-beab-87e8abe5aa47` | ✅                                 | ✅ (mismo GUID)                                                    |
| Metadatos de campos    | `1.c5e86555-4e8f-4d07-819a-9b5aae19f260` | ✅                                 | ✅ (mismo GUID)                                                    |

El proceso que se muestra **no cambia el `serviceId` invocado** — cambia únicamente el `processId`/`appId` que viaja como parámetro dentro de la misma llamada. Esto es consistente con que estos servicios pertenezcan al **Process App de sistema "TWP"** (un toolkit que IBM distribuye con Process Portal, según ya observó RS-004), no a nuestro Process App de negocio — lo que los hace más parecidos a un asset de plataforma que a algo específico de "BAYBANK - DEMO PROCESOS". Esto **no confirma** que sean estables entre instalaciones distintas de BAW (test vs. producción): solo pudo verificarse **dentro de esta única instalación**, con dos procesos de negocio distintos. Sigue siendo, como ya señalaba RS-004, un identificador de asset interno sin garantía contractual de IBM — pero la evidencia de esta sesión es consistente con la hipótesis de estabilidad, no en contra de ella.

## Decisiones pendientes / opciones evaluadas

Ninguna decisión nueva por tomar: este spike **confirma la vía preferida** que el usuario ya eligió el 2026-09-15 (RS-004). No aplica.

## Conclusión y recomendación

**El spike responde positivamente a la incógnita 1**, con evidencia directa contra un proceso de negocio propio: el panel base es un listado navegable (no un proceso fijo), los parámetros correctos son `tw.local.selectedProcessId`/`tw.local.processAppId`, y el contrato de los Ajax Services queda validado con datos reales — incluido `riskState` (con dos de sus tres valores observados) y `averageDurationMs`, que MD-08 daba por no calculable.

**La incógnita 2 queda con evidencia a favor, no con confirmación definitiva**: los mismos `serviceId` sirvieron para dos procesos de negocio distintos dentro de esta instalación, consistente con que sean assets del toolkit de sistema "TWP" y no de nuestro Process App — pero la estabilidad **entre ambientes** (pruebas vs. producción) no se puede verificar sin acceso a un segundo ambiente.

**Recomendación:** la vía preferida (Ajax Services de WLE, `processId`/`appId` como parámetro) queda lista para planificarse como tarea (`work-plan`), sin necesidad del fallback degradado (b) ni de diferir la historia (c). Como mitigación del riesgo residual de la incógnita 2, la `TK-XXX` de implementación debería incluir una verificación de humo contra el `serviceId` al desplegar a cada ambiente nuevo (pruebas, producción), en vez de asumir su estabilidad sin comprobarla.

## Impacto en el artefacto / próximo paso

AC-001 de US-005 queda con su decisión pendiente resuelta: la vía preferida (Ajax Services de WLE) tiene su contrato validado con datos reales de un proceso propio, y el riesgo de estabilidad del `serviceId` pasa de "incógnita abierta" a "riesgo residual mitigable con una verificación de humo por ambiente". `work-define` debe actualizar Observaciones, la anotación de AC-001 y recalcular INVEST/DoR — la historia queda en condiciones de promoverse a `Ready`.

## Fuentes

- Inspección en vivo de `https://192.168.120.100:9443/ProcessPortal/dashboards/TWP/Process+Performance` (usuario `juancarlos.altamirano`), 2026-09-16: navegación al panel base (lista de procesos), clic en "Credito IA Generativa" (`tw.local.selectedProcessId=25.54d6f626-...&tw.local.processAppId=2066.0050cf1a-...`), captura de red de `POST /rest/bpm/wle/v1/service/1.492222d4-...` y `POST /rest/bpm/wle/v1/service/1.66c1cf8c-...` con datos reales, y captura de pantalla del panel renderizado.
- [RS-004: Métricas de rendimiento por proceso](../../../research/RS-004-metricas-rendimiento-proceso-wle/README.md) — línea base de este spike (serviceId, contrato parcial, incógnitas originales).
- [RS-005: Rendimiento del equipo — panel nativo Team Performance (WLE)](../../../research/RS-005-rendimiento-equipo-panel-nativo-wle/README.md) — confirma el mismo patrón de "panel base = listado navegable" en el panel hermano de equipos, y el origen de las etiquetas `atRisk`/`onTrack`/`overdue`.
- [`docs/specs/technical-docs/portal-procesos-baw.md#md-08`](../../../technical-docs/portal-procesos-baw.md#md-08) — gap de `averageDurationMs` que este spike cierra adicionalmente.
