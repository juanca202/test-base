<a id="md-07"></a>

# MD-07: Acción de tarea (outcome)

Acción que el usuario ejecuta sobre una tarea (FR-004, FR-005, BR-01). **Estado de validación: Confirmado** — y el hallazgo obliga a replantear el concepto.

**Lo que BAW llama `actions`** es un enum cerrado de **operaciones sobre la tarea**, no de decisiones de negocio:

`assign` · `update_due_date` · `update_priority` · `claim` · `cancel_claim` · **`complete`** · `view` · `set_data` · `fail`

| Campo           | Tipo    | Requerido | Descripción                                   | Validaciones / restricciones                                                                            |
| --------------- | ------- | --------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| name            | string  | Sí        | Nombre de la variable de decisión del proceso | **No viene de `actions`**; ver nota                                                                     |
| value           | string  | Sí        | Valor que se envía en esa variable            | Se envía dentro de `output` en [API-08](../apis/API-017-tareas.md#post-bpm-user-tasks-task-id-complete) |
| label           | string  | Sí        | Texto del botón                               | Configurado en el portal                                                                                |
| isRejection     | boolean | Sí        | Si la acción es de rechazo                    | Configurado en el portal                                                                                |
| requiresComment | boolean | Sí        | Si exige comentario                           | Regla del portal: `requiresComment = isRejection` (BR-01)                                               |

**Relaciones:** Acción N—1 Tarea ([MD-04](MD-04-tarea.md)).

> **Confirmado: el concepto de «outcome» de negocio no existe en esta API.** `actions` sirve para saber si el usuario puede completar, reclamar o cancelar el reclamo de la tarea —es control de permisos, útil para habilitar o deshabilitar botones—, pero **no enumera «Aprobar» y «Rechazar»**. Esas decisiones son **variables de negocio del proceso**, y se envían como un `data_object` más dentro de `output` al completar ([API-08](../apis/API-017-tareas.md#post-bpm-user-tasks-task-id-complete)).
>
> **Qué implica para FR-004 y BR-01.** El portal no puede descubrir dinámicamente qué decisiones ofrece una tarea: tiene que saber, por configuración, qué variable del proceso es la de decisión, qué valores admite y cuál de ellos es el rechazo. Es la **misma configuración por proceso** que exige [MD-06](MD-06-campo-formulario-dinamico.md) para `select` y `file`, así que ambas lagunas se cierran con una sola decisión de diseño. Sin ella, BR-01 (comentario obligatorio al rechazar) no es implementable, porque el portal no sabe qué es un rechazo.
