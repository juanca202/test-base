# TC-010 — Dado un usuario autenticado en condiciones normales de red, Cuando abre «Mis tareas», Entonces el listado queda cargado en no más de 3 segundos usando paginación de servidor

**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-004 (Eficiencia de rendimiento) — Carga del listado en ≤ 3 s con paginación de servidor (`offset`/`size`)
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-004 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene un volumen alto de tareas asignadas, muy superior al tamaño de página, para que la paginación sea relevante.
- La red está en condiciones normales, sin limitación artificial de ancho de banda ni latencia añadida, y BAW responde con normalidad.

## Datos de prueba

| Campo                       | Valor                       | Notas                                                   |
| --------------------------- | --------------------------- | ------------------------------------------------------- |
| Usuario                     | `usuario.carga` [propuesto] | Cuenta con volumen alto de tareas                       |
| Total de tareas del usuario | 200 [propuesto]             | Volumen representativo de un caso desfavorable realista |
| `size` de página            | `25` [propuesto]            | Tamaño de página configurado del listado                |
| Umbral de carga             | 3 segundos                  | Valor fijado por AC-004                                 |
| Repeticiones de medición    | 5 [propuesto]               | Para descartar una medición atípica                     |

## Pasos de ejecución

| #   | Actor       | Acción                                                                                           | Resultado esperado del paso                                                                                                           |
| --- | ----------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verificador | Prepara la medición desde la navegación al módulo hasta que el listado está pintado y utilizable | El criterio de fin de carga queda fijado antes de medir                                                                               |
| 2   | Usuario     | Abre el módulo «Mis tareas»                                                                      | El sistema invoca `GET /bpm/user-tasks` con los parámetros de paginación de servidor `offset` y `size`                                |
| 3   | Verificador | Inspecciona la petición emitida                                                                  | La petición incluye `size=25`; no se solicitan las 200 tareas del usuario de una vez                                                  |
| 4   | Verificador | Cuenta las llamadas emitidas para pintar la primera página                                       | Se emitió una sola llamada a `GET /bpm/user-tasks`; el portal no encadena páginas adicionales                                         |
| 5   | Sistema     | Recibe `200` y pinta el listado                                                                  | Se muestran 25 tareas con sus datos y su estado de SLA, más el resumen de conteos                                                     |
| 6   | Verificador | Registra el tiempo transcurrido desde el paso 2 hasta el listado utilizable                      | El tiempo medido es igual o inferior a 3 segundos                                                                                     |
| 7   | Usuario     | Avanza a la página siguiente                                                                     | El sistema invoca `GET /bpm/user-tasks` con el `offset` correspondiente y la nueva página también queda cargada en 3 segundos o menos |
| 8   | Verificador | Repite las mediciones de los pasos 2 a 7 cinco veces                                             | Todas las mediciones quedan dentro del umbral de 3 segundos                                                                           |

## Resultado esperado final

El listado de «Mis tareas» queda pintado y utilizable en 3 segundos o menos en todas las mediciones, tanto en la primera carga como al paginar. La carga se resuelve con una única llamada a `GET /bpm/user-tasks` por página, usando `offset` y `size`, sin traer todas las tareas del usuario.

## Observaciones

El tiempo se mide hasta que el listado es utilizable, no hasta la respuesta HTTP: el cálculo del estado de SLA y del resumen ocurre en el cliente y cuenta dentro del umbral. «Condiciones normales de red» debe fijarse como una configuración concreta y repetible del entorno de medición; si el equipo acuerda una latencia de referencia, anotarla aquí como dato de prueba. El comportamiento cuando la respuesta se acerca o supera el umbral lo cubre [TC-011](./TC-011-indicador-carga-respuesta-lenta-limite.md).
