# TC-008 — Dado un listado de tareas ya cargado, Cuando el usuario escribe un término en la búsqueda por texto libre, Entonces el listado se filtra en el cliente sin llamar de nuevo a BAW

**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-003 (Interacción de usuario) — Filtros de servidor por estado, modelo e instancia, más búsqueda por texto en el cliente
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El módulo «Mis tareas» está abierto con una página de tareas ya cargada, cuyos nombres e instancias son conocidos.
- Entre las tareas cargadas hay al menos dos cuyo nombre contiene el término de búsqueda y varias que no.

## Datos de prueba

| Campo                     | Valor                                            | Notas                                                                 |
| ------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| Usuario                   | `usuario.prueba` [propuesto]                     | Cuenta válida del ambiente de referencia                              |
| Tareas cargadas           | 8 [propuesto]                                    | Todas dentro de la primera página                                     |
| Tareas coincidentes       | 2, con nombre que contiene `Aprobar` [propuesto] | P. ej. «Aprobar solicitud» y «Aprobar presupuesto»                    |
| Término de búsqueda       | `aprobar` [propuesto]                            | En minúsculas, para verificar que la búsqueda no distingue mayúsculas |
| Término sin coincidencias | `zzzzz` [propuesto]                              | Para el estado sin resultados                                         |

## Pasos de ejecución

| #   | Actor       | Acción                                                                        | Resultado esperado del paso                                                                                |
| --- | ----------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Sistema     | Aplica el filtro de texto `aprobar` sobre el conjunto de ocho tareas cargadas | El filtro devuelve las dos tareas cuyo nombre contiene el término, sin distinguir mayúsculas ni minúsculas |
| 2   | Verificador | Comienza a registrar el tráfico de red hacia BAW                              | El registro queda activo antes de escribir en el buscador                                                  |
| 3   | Usuario     | Escribe el término de búsqueda en el campo de texto libre                     | El listado se reduce a las dos tareas coincidentes mientras el usuario escribe                             |
| 4   | Verificador | Inspecciona el registro de red                                                | No se emitió ninguna llamada a `GET /bpm/user-tasks`: la búsqueda se resolvió íntegramente en el cliente   |
| 5   | Usuario     | Borra el término de búsqueda                                                  | El listado vuelve a mostrar las ocho tareas cargadas, sin nueva llamada a BAW                              |
| 6   | Usuario     | Escribe el término sin coincidencias                                          | El listado queda vacío con un mensaje de que no hay resultados para la búsqueda, no un error               |
| 7   | Usuario     | Borra de nuevo el término                                                     | Se recupera el listado completo de la página cargada                                                       |

## Resultado esperado final

La búsqueda por texto libre filtra el listado en el cliente sobre las tareas ya cargadas, sin distinguir mayúsculas y sin emitir llamadas a BAW. Al vaciar el campo se restaura el listado completo de la página; un término sin coincidencias produce un estado vacío informativo, no un error.

## Observaciones

`GET /bpm/user-tasks` no expone parámetro de búsqueda por texto —a diferencia de `GET /bpm/processes`, que sí tiene `search_term`—, así que la búsqueda en cliente es la única opción posible en este módulo. Su consecuencia (una coincidencia que esté fuera de la página cargada no aparece) es un comportamiento aceptado y se verifica en [TC-009](./TC-009-busqueda-fuera-de-pagina-cargada-limite.md). Los campos exactos sobre los que busca el filtro (nombre, instancia, equipo) deben confirmarse contra la implementación y anotarse aquí si difieren del nombre de la tarea.
