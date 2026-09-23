# TC-009 — Dado un usuario con más tareas que el tamaño de página, Cuando busca un término que solo coincide con una tarea de una página no cargada, Entonces esa tarea no aparece en los resultados

**Perspectiva:** Límite
**Tipo de prueba:** E2E
**Prioridad:** Baja
**Criterio de aceptación:** AC-003 (Interacción de usuario) — Filtros de servidor por estado, modelo e instancia, más búsqueda por texto en el cliente
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene más tareas asignadas que el tamaño de página configurado, de modo que el listado se pagina.
- Existe exactamente una tarea cuyo nombre contiene un término único, y esa tarea queda fuera de la primera página según el orden aplicado.

## Datos de prueba

| Campo                        | Valor                                           | Notas                                          |
| ---------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| Usuario                      | `usuario.carga` [propuesto]                     | Cuenta con volumen alto de tareas              |
| Total de tareas del usuario  | 30 [propuesto]                                  | Reparto irrelevante salvo por la tarea marcada |
| `size` de página             | `10` [propuesto]                                | Provoca al menos tres páginas                  |
| Tarea marcada — nombre       | `Conciliación extraordinaria QX7` [propuesto]   | Término único en todo el conjunto              |
| Posición de la tarea marcada | Página 3 según el orden por defecto [propuesto] | Fuera de la primera página cargada             |
| Término de búsqueda          | `QX7` [propuesto]                               | Coincide solo con la tarea marcada             |

## Pasos de ejecución

| #   | Actor       | Acción                                                                  | Resultado esperado del paso                                                                                                    |
| --- | ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Usuario     | Abre «Mis tareas»                                                       | Se carga la primera página con 10 tareas; la tarea marcada no está entre ellas                                                 |
| 2   | Verificador | Comienza a registrar el tráfico de red hacia BAW                        | El registro queda activo antes de escribir en el buscador                                                                      |
| 3   | Usuario     | Escribe el término de búsqueda `QX7`                                    | El listado queda vacío con el mensaje de que no hay resultados para la búsqueda                                                |
| 4   | Verificador | Inspecciona el registro de red                                          | No se emitió ninguna llamada a `GET /bpm/user-tasks`: la búsqueda no se extiende al servidor                                   |
| 5   | Verificador | Comprueba el comportamiento esperado                                    | La ausencia de la tarea marcada es el resultado correcto del caso, no un fallo: la búsqueda opera solo sobre la página cargada |
| 6   | Usuario     | Borra el término y navega hasta la página que contiene la tarea marcada | La tarea marcada aparece en el listado de esa página                                                                           |
| 7   | Usuario     | Vuelve a escribir el término `QX7` estando en esa página                | Ahora la tarea marcada sí aparece como resultado de la búsqueda                                                                |

## Resultado esperado final

Con la primera página cargada, buscar el término único no devuelve la tarea marcada y el listado muestra un estado vacío informativo sin error. Una vez cargada la página que contiene esa tarea, el mismo término sí la devuelve. Queda demostrado que la búsqueda es parcial por diseño y acotada a las tareas ya cargadas.

## Observaciones

Comportamiento aceptado, no un defecto: `GET /bpm/user-tasks` no ofrece búsqueda por texto de servidor, a diferencia de `GET /bpm/processes` con su `search_term`, y traer todas las páginas para buscar chocaría con el umbral de carga de AC-004. Si la interfaz advierte al usuario de que la búsqueda es sobre lo mostrado, verificar también ese texto. Si en el futuro BAW añadiera búsqueda de servidor para tareas, este caso debe revisarse.
