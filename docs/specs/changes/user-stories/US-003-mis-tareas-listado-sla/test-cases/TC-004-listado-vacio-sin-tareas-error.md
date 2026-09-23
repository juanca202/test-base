# TC-004 — Dado un usuario autenticado sin tareas asignadas, Cuando abre «Mis tareas», Entonces ve el listado vacío con un mensaje adecuado y no un error

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado de tareas asignadas con estado de SLA derivado en el cliente
**Artefacto padre:** US-003
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-003 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario no tiene ninguna tarea asignada ni ninguna tarea de la que sea propietario potencial en ese ambiente.
- `GET /bpm/user-tasks` responde correctamente, con `user_task_instances` vacío.

## Datos de prueba

| Campo                     | Valor                               | Notas                                                          |
| ------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| Usuario                   | `usuario.sin.tareas` [propuesto]    | Cuenta válida del ambiente de referencia, sin tareas asignadas |
| Contraseña                | `********` [propuesto]              | Contraseña válida asociada al usuario                          |
| Respuesta esperada de BAW | `200` con `user_task_instances: []` | Lista vacía, no un error                                       |

## Pasos de ejecución

| #   | Actor   | Acción                                           | Resultado esperado del paso                                                                             |
| --- | ------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 1   | Usuario | Inicia sesión con la cuenta sin tareas asignadas | El usuario accede al portal autenticado                                                                 |
| 2   | Usuario | Abre el módulo «Mis tareas»                      | El sistema invoca `GET /bpm/user-tasks` con la cookie de sesión y la cabecera `BPMCSRFToken`            |
| 3   | Sistema | Recibe `200` con la lista de tareas vacía        | El sistema interpreta la respuesta como un resultado válido sin elementos                               |
| 4   | Sistema | Pinta el módulo                                  | Se muestra un estado vacío con un mensaje que indica que el usuario no tiene tareas asignadas           |
| 5   | Usuario | Revisa la pantalla                               | No se muestra mensaje de error, ni indicador de carga permanente, ni tabla con filas en blanco          |
| 6   | Usuario | Observa el resumen de conteos por estado de SLA  | El resumen se muestra con todos los conteos en cero, o se oculta de forma coherente con el estado vacío |

## Resultado esperado final

El módulo «Mis tareas» muestra un estado vacío informativo, con un mensaje que explica que no hay tareas asignadas. No aparece ningún mensaje de error ni indicador de fallo, el resto del portal sigue navegable y los controles de filtro y búsqueda permanecen operativos (aunque no arrojen resultados).

## Observaciones

Se clasifica como perspectiva de error porque valida que una condición legítima sin datos no se degrade a una pantalla de fallo: la lista vacía es una respuesta `200` válida de BAW, no una incidencia. El caso de BAW inaccesible pertenece a [US-001](../../US-001-autenticacion-acceso-portal/README.md) (AC-005) y queda fuera de este alcance.
