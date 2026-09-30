<a id="md-05"></a>

# MD-05: Resumen de SLA de la lista de tareas

Conteos agregados que encabezan «Mis tareas» (FR-002). **Estado de validación: Confirmado** — **los provee el servidor**, en el bloque `data.stats` de [API-13](../apis/API-017-tareas.md#put-rest-bpm-wle-tasks).

> **Esto invierte lo que este elemento documentaba antes.** Hasta el 2026-09-14 MD-05 estaba marcado _Confirmado (ausente)_, y era correcto: la familia `/bpm/` efectivamente no entrega agregados ([API-05](../apis/API-017-tareas.md#get-bpm-user-tasks) devuelve solo lista y enlaces de paginación). La ausencia era de esa familia, no de BAW. La validación en vivo de WLE la revierte con evidencia de ejecución.

**`stats`** — bloque devuelto por [API-13](../apis/API-017-tareas.md#put-rest-bpm-wle-tasks) cuando la petición lleva `calcStats=true`:

| Campo   | Tipo    | Requerido | Descripción                       | Validaciones / restricciones                                                                             |
| ------- | ------- | --------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| total   | integer | Sí        | Tareas que cumplen la búsqueda    | ≥ 0. **No es el tamaño de `items`**; ver la nota sobre el alcance                                        |
| open    | integer | Sí        | Tareas **abiertas** (no cerradas) | ≥ 0. **Dimensión distinta de las tres siguientes**, no un cuarto estado de SLA; ver la nota sobre `open` |
| onTrack | integer | Sí        | Tareas a tiempo                   | ≥ 0. **Es el `onTime` del portal**; solo cambia el nombre                                                |
| atRisk  | integer | Sí        | Tareas en riesgo                  | ≥ 0                                                                                                      |
| overdue | integer | Sí        | Tareas vencidas                   | ≥ 0                                                                                                      |

**Modelo de dominio del portal** (lo que consume la cabecera de «Mis tareas»):

| Campo del portal | Origen              | Nota                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| total            | `stats.total`       | —                                                                                                                                                                                                                                                                                                                                             |
| onTime           | **`stats.onTrack`** | Renombrado en el mapper, siguiendo la convención de [nomenclatura de campos](../README.md#nomenclatura-de-campos): el dominio ya usaba `onTime` y el id `slaStatus = onTime` de [MD-04](MD-04-tarea.md) depende de ese nombre. **No renombrar el dominio para seguir a WLE**: rompería la correspondencia con los valores derivados por tarea |
| atRisk           | `stats.atRisk`      | —                                                                                                                                                                                                                                                                                                                                             |
| overdue          | `stats.overdue`     | —                                                                                                                                                                                                                                                                                                                                             |

**Relaciones:** Agrega sobre Tarea ([MD-04](MD-04-tarea.md)); entregado por [API-13](../apis/API-017-tareas.md#put-rest-bpm-wle-tasks).

> **El agregado es de servidor y cubre el resultado completo de la búsqueda, no la página.** En la respuesta observada, `items` trae 5 elementos con `size: 5`, `requestedSize: 25` y `totalCount: 5`, y `stats.total` vale 5: coincide con el `totalCount` del criterio (`interaction: claimed_and_available`), no con lo paginado. Ese es justamente el punto por el que el trade-off anterior desaparece.
>
> **Consecuencia sobre FR-002 — la disyuntiva anterior ya no existe.** La nota que este elemento tenía («calculados en el cliente reflejan solo las tareas cargadas; para que fueran exactos habría que traer todas las páginas, contra NFR-003») describía un conflicto entre exactitud y tiempo de carga que **ya no se plantea**: una sola llamada paginada devuelve a la vez la página y los totales exactos del conjunto completo. No hay que elegir. El criterio de verificación de FR-002 —y el AC correspondiente de la US que lo implemente— puede exigir **conteos exactos sobre el total del usuario**, no «sobre la página cargada».
>
> **`open` no es un cuarto estado de SLA.** En la respuesta observada `total`, `open` y `onTrack + atRisk + overdue` valen los tres 5, porque **las cinco tareas estaban abiertas**; esa coincidencia impide distinguir con esta única evidencia si los tres estados de SLA parten `total` o parten `open`. Lo que sí es seguro es que `open` cuenta por **apertura** (cerrada/no cerrada) y los otros tres por **vencimiento**: son ejes ortogonales, y sumar `open` a la cabecera de SLA como si fuera un estado más produciría un total del doble. La invariante `total = onTrack + atRisk + overdue` se documenta como **observada, no demostrada** — [Observaciones](../README.md#observaciones), punto 16.
>
> **El tope de conteo de WLE acota la exactitud.** La respuesta trae `countLimit: 500` y `countLimitExceeded: false`. Con más de 500 coincidencias, `totalCount` se trunca y `countLimitExceeded` pasa a `true`; **no se verificó si `stats` se trunca igual**. Mientras no se compruebe, la cabecera debe leer `countLimitExceeded` y, si es `true`, presentar los conteos como «más de N» en vez de como exactos.
