# API-018: Rendimiento

Grupo de operaciones de la capability [portal-procesos-baw](../README.md). Los identificadores `API-01`…`API-14` de los encabezados son los de la estructura anterior (archivo único), conservados porque el texto los cita.

| Operación                                              | Método y ruta | Ancla                                                            |
| ------------------------------------------------------ | ------------- | ---------------------------------------------------------------- |
| API-10: Obtener indicadores de rendimiento por proceso | **No existe** | [#no-existe-indicadores-proceso](#no-existe-indicadores-proceso) |
| API-11: Obtener indicadores de rendimiento por equipo  | **No existe** | [#no-existe-indicadores-equipo](#no-existe-indicadores-equipo)   |

<a id="no-existe-indicadores-proceso"></a>
<a id="api-10"></a>

## API-10: Obtener indicadores de rendimiento por proceso

- **Método y ruta:** **No existe.**
- **Estado de validación: Confirmado (ausente).**
- **Descripción:** FR-007 pide indicadores agregados por tipo de proceso.

> Alternativa: agregar en cliente sobre [API-09](API-016-procesos.md#get-bpm-processes), con las tres limitaciones descritas en [MD-08](../models/MD-08-indicador-rendimiento-proceso.md) — restricción de administrador, ausencia de hora de fin y coste de traer todas las páginas. `renewalRate` no es calculable en ningún caso.

<a id="no-existe-indicadores-equipo"></a>
<a id="api-11"></a>

## API-11: Obtener indicadores de rendimiento por equipo

- **Método y ruta:** **No existe**, ni tampoco un listado de equipos.
- **Estado de validación: Confirmado (ausente).**
- **Descripción:** FR-008 pide el estado de los procesos por grupo, para todos los grupos.

> El equipo solo es visible dentro de una tarea (`optional_parts=team_details`), así que la agregación posible es **por tarea, no por instancia de proceso**, y limitada a los equipos que aparezcan en las tareas visibles. Ver [MD-09](../models/MD-09-indicador-rendimiento-equipo.md).
