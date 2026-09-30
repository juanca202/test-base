<a id="md-08"></a>

# MD-08: Indicador de rendimiento por proceso

Métricas agregadas por tipo de proceso (FR-007). **Estado de validación: Confirmado (ausente)** en esta familia de API.

| Campo                     | Tipo    | Requerido | Descripción                          | Validaciones / restricciones                         |
| ------------------------- | ------- | --------- | ------------------------------------ | ---------------------------------------------------- |
| model                     | string  | Sí        | Nombre del modelo de proceso         | Correlaciona con [MD-03](MD-03-instancia-proceso.md) |
| runningInstances          | integer | Sí        | Instancias en curso                  | Agregable en cliente: contar `state = running`       |
| onTime / atRisk / overdue | integer | Sí        | Instancias por estado de SLA         | Agregables en cliente desde `due_date`               |
| averageDurationMs         | number  | No        | Duración promedio de las completadas | Agregable **solo de forma aproximada**: ver nota     |
| renewalRate               | number  | No        | Tasa de renovación                   | **Sin definición**; ver nota                         |

**Relaciones:** Agrega sobre Instancia de proceso ([MD-03](MD-03-instancia-proceso.md)).

> **Confirmado que no hay endpoint de métricas.** Las siete operaciones de la API no incluyen ninguna de rendimiento; las métricas históricas de BAW viven en el Performance Data Warehouse, que esta interfaz no expone.
>
> **La agregación en cliente es posible pero degradada.** `GET /bpm/processes` ([API-09](../apis/API-016-procesos.md#get-bpm-processes)) permite filtrar por `states` y paginar, así que los conteos son calculables trayendo todas las páginas. Pero: (1) `averageDurationMs` necesita la duración de cada instancia completada, y el contrato **no trae hora de fin** —solo `creation_time` y `modification_time`—, así que sería una aproximación usando `modification_time`; (2) el listado está **restringido a administradores** (ver [API-09](../apis/API-016-procesos.md#get-bpm-processes)), lo que puede impedir la agregación al usuario final; (3) traer todas las instancias choca con NFR-003.
>
> **`renewalRate` sigue sin definición.** Métrica heredada del portal actual, sin fórmula, ventana ni denominador especificados. No es implementable ni testeable.
