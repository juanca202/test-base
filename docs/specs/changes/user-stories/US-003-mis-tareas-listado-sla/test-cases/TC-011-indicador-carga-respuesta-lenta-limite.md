# TC-011 — Dada una respuesta de BAW cercana o superior a 3 segundos, Cuando el usuario abre «Mis tareas», Entonces el sistema muestra un indicador de carga en lugar de una pantalla en blanco

**Perspectiva:** Límite
**Tipo de prueba:** Integration
**Prioridad:** Baja
**Criterio de aceptación:** AC-004 (Eficiencia de rendimiento) — Carga del listado en ≤ 3 s con paginación de servidor (`offset`/`size`)
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=Integration · criterion=AC-004 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- Se puede retardar de forma controlada la respuesta de `GET /bpm/user-tasks`, suplantándola o introduciendo latencia en el entorno de pruebas.
- El usuario tiene tareas asignadas suficientes para poblar una página del listado.

## Datos de prueba

| Campo                | Valor                        | Notas                                        |
| -------------------- | ---------------------------- | -------------------------------------------- |
| Usuario              | `usuario.prueba` [propuesto] | Cuenta válida del ambiente de referencia     |
| Retardo — variante A | 2,8 s [propuesto]            | Justo por debajo del umbral de AC-004        |
| Retardo — variante B | 3,0 s [propuesto]            | Exactamente en el umbral                     |
| Retardo — variante C | 6,0 s [propuesto]            | Claramente por encima del umbral             |
| Tareas de la página  | 25 [propuesto]               | Contenido a pintar cuando llega la respuesta |

## Pasos de ejecución

| #   | Actor       | Acción                                                            | Resultado esperado del paso                                                                                                                                     |
| --- | ----------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verificador | Configura el retardo de la variante A sobre `GET /bpm/user-tasks` | La respuesta de BAW tardará 2,8 s en llegar                                                                                                                     |
| 2   | Usuario     | Abre el módulo «Mis tareas»                                       | El sistema emite la petición y muestra de inmediato un indicador de carga; no queda una pantalla en blanco ni un área vacía sin explicación                     |
| 3   | Verificador | Observa la interfaz durante toda la espera                        | El indicador de carga permanece visible y el resto del portal (encabezado y navegación) sigue respondiendo                                                      |
| 4   | Sistema     | Recibe la respuesta de BAW y pinta el listado                     | El indicador desaparece y se muestran las 25 tareas con su estado de SLA y el resumen de conteos                                                                |
| 5   | Verificador | Repite los pasos 1 a 4 con la variante B (3,0 s)                  | El comportamiento es el mismo: indicador durante la espera y listado al llegar la respuesta                                                                     |
| 6   | Verificador | Repite los pasos 1 a 4 con la variante C (6,0 s)                  | El indicador se mantiene durante los 6 s sin degradarse a pantalla en blanco ni a un error prematuro; al llegar la respuesta, el listado se pinta correctamente |
| 7   | Verificador | Comprueba que no hay peticiones duplicadas                        | Durante la espera el portal no reemite `GET /bpm/user-tasks`                                                                                                    |

## Resultado esperado final

En las tres variantes de retardo, el usuario ve un indicador de carga desde que se emite la petición hasta que llega la respuesta, momento en el que el listado se pinta íntegro. En ningún caso aparece una pantalla en blanco, un listado vacío engañoso ni un error antes de que la respuesta llegue, y la petición no se duplica.

## Observaciones

Es la perspectiva de límite de AC-004: el criterio fija el umbral de 3 segundos como objetivo, y este caso verifica que superarlo degrada la experiencia de forma controlada en vez de romperla. Superar el umbral no es lo que este caso valida —eso lo mide [TC-010](./TC-010-carga-listado-3-segundos-paginacion-happy.md)—, sino qué ve el usuario mientras espera. Si el equipo define un tiempo máximo de espera tras el cual se muestra un error y se ofrece reintentar, debe añadirse aquí como dato de prueba y verificarse con una variante adicional.
