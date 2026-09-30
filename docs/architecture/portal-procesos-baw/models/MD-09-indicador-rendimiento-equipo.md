<a id="md-09"></a>

# MD-09: Indicador de rendimiento por equipo

Estado agregado por grupo/equipo (FR-008), para **todos** los grupos (SRS 2.6 difiere los roles). **Estado de validación: Confirmado (ausente)** en esta familia de API.

| Campo                             | Tipo    | Requerido | Descripción               | Validaciones / restricciones                                        |
| --------------------------------- | ------- | --------- | ------------------------- | ------------------------------------------------------------------- |
| teamId                            | string  | Sí        | Identificador del equipo  | De `assignments.potential_owners.team.id` ([MD-04](MD-04-tarea.md)) |
| teamName                          | string  | Sí        | Nombre del equipo         | De `...team.name`                                                   |
| description                       | string  | No        | Descripción del grupo     | **Sin origen en BAW**                                               |
| total / onTime / atRisk / overdue | integer | Sí        | Conteos por estado de SLA | `total = onTime + atRisk + overdue`                                 |

**Relaciones:** Agrega sobre Tarea ([MD-04](MD-04-tarea.md)) por equipo.

> **No hay endpoint de equipos ni de métricas por equipo.** El nombre del equipo solo aparece **dentro de una tarea**, vía `optional_parts=team_details`. Es decir, el portal solo puede conocer los equipos que aparecen en las tareas que logra listar, y **solo puede agregar sobre tareas, no sobre instancias de proceso** — que es lo que pide FR-008 («estado de los procesos por grupo»).
>
> No hay forma de enumerar todos los grupos existentes, así que **«para todos los grupos» no es alcanzable** con esta API: se mostrarían los grupos presentes en las tareas visibles. La `description` del wireframe no tiene origen. FR-008 necesita revisión de alcance.
