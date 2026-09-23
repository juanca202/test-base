# TC-007 — Dado un usuario con tareas en varios estados, Cuando filtra el listado por estado de tarea, Entonces el sistema usa el filtro de servidor de BAW y devuelve solo las tareas de ese estado

**Perspectiva:** Happy Path
**Tipo de prueba:** Integration, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-003 (Interacción de usuario) — Filtros de servidor por estado, modelo e instancia, más búsqueda por texto en el cliente
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=Integration, E2E · criterion=AC-003 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene tareas en al menos dos estados distintos: reclamadas (`claimed`) y no reclamadas (`ready`).
- El módulo «Mis tareas» está abierto sin filtros aplicados.

## Datos de prueba

| Campo              | Valor                                  | Notas                                                       |
| ------------------ | -------------------------------------- | ----------------------------------------------------------- |
| Usuario            | `usuario.prueba` [propuesto]           | Cuenta válida del ambiente de referencia                    |
| Tareas `claimed`   | 4 [propuesto]                          | Reclamadas por el usuario                                   |
| Tareas `ready`     | 5 [propuesto]                          | No reclamadas; `ready` = no reclamada en el contrato de BAW |
| Filtro aplicado    | Estado = reclamada (`states=claimed`)  | Parámetro de servidor de `GET /bpm/user-tasks`              |
| Filtro alternativo | Estado = no reclamada (`states=ready`) | Segunda variante a verificar                                |

## Pasos de ejecución

| #   | Actor       | Acción                                          | Resultado esperado del paso                                                                                                  |
| --- | ----------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Usuario     | Abre «Mis tareas» sin filtros                   | El listado muestra las nueve tareas del usuario, de ambos estados                                                            |
| 2   | Usuario     | Aplica el filtro de estado de tarea = reclamada | El sistema invoca `GET /bpm/user-tasks` incluyendo el parámetro de consulta `states=claimed`                                 |
| 3   | Verificador | Inspecciona la petición emitida                 | El filtro viaja como parámetro de servidor, no se resuelve descartando filas en el cliente                                   |
| 4   | Sistema     | Recibe la respuesta de BAW                      | BAW devuelve `200` con las cuatro tareas en estado `claimed`                                                                 |
| 5   | Usuario     | Revisa el listado filtrado                      | Se muestran solo las cuatro tareas reclamadas; ninguna tarea `ready` aparece                                                 |
| 6   | Usuario     | Cambia el filtro a no reclamada                 | El sistema invoca de nuevo `GET /bpm/user-tasks` con `states=ready` y el listado muestra solo las cinco tareas no reclamadas |
| 7   | Usuario     | Retira el filtro                                | El sistema vuelve a pedir el listado sin el parámetro `states` y se muestran de nuevo las nueve tareas                       |

## Resultado esperado final

Al filtrar por estado de tarea, el portal emite una nueva llamada a `GET /bpm/user-tasks` con el parámetro `states` correspondiente y el listado muestra únicamente las tareas de ese estado, con sus datos y su estado de SLA intactos. Al retirar el filtro se recupera el listado completo.

## Observaciones

Los filtros por estado, modelo de proceso (`model`) e instancia (`process_id`) son todos de servidor en `GET /bpm/user-tasks`; este caso los ejercita sobre `states`, el más representativo, y la misma mecánica aplica a los otros dos. Es la diferencia clave con la búsqueda por texto libre, que BAW no soporta para tareas y se resuelve en el cliente: ver [TC-008](./TC-008-busqueda-texto-libre-cliente-happy.md).
