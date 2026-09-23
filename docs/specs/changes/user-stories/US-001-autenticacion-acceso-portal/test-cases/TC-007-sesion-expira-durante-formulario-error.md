# TC-007 — Dado un usuario autenticado que está completando un formulario, Cuando su sesión expira antes de guardar, Entonces el sistema lo redirige al login y los cambios no guardados se pierden

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-004 (Seguridad) — Sin acceso con sesión inválida o expirada; se pierden los cambios no guardados
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-004 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).
- El usuario tiene abierto un módulo con un formulario editable y ha introducido datos sin guardarlos.
- Se puede forzar la expiración de la sesión sin esperar las 2 horas de vida natural: borrando el `csrf_token` del almacenamiento efímero, invalidando la cookie de sesión, o suplantando la respuesta de BAW para que devuelva `403` con `error_number: CWTBG0651E`.

## Datos de prueba

| Campo                         | Valor                                          | Notas                                                             |
| ----------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Usuario                       | `usuario.prueba` [propuesto]                   | Cuenta válida del ambiente de referencia                          |
| Formulario de prueba          | Formulario de una tarea en curso [propuesto]   | Cualquier formulario del portal con cambios pendientes de guardar |
| Texto introducido sin guardar | `Borrador sin guardar 2026-09-11` [propuesto]  | Valor reconocible para comprobar que no persiste                  |
| Condición de expiración       | `403` + `error_number: CWTBG0651E` [propuesto] | Manifestación confirmada de sesión no verificable en BAW          |

## Pasos de ejecución

| #   | Actor       | Acción                                                                      | Resultado esperado del paso                                                                                          |
| --- | ----------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Usuario     | Abre el formulario de prueba en un módulo autenticado                       | El formulario se muestra editable, con la sesión vigente                                                             |
| 2   | Usuario     | Escribe el texto de prueba en el formulario y no lo guarda                  | Los cambios quedan solo en la interfaz, sin enviarse a BAW                                                           |
| 3   | Verificador | Fuerza la expiración de la sesión según la condición de los datos de prueba | La sesión deja de ser válida mientras el formulario sigue abierto                                                    |
| 4   | Usuario     | Intenta guardar el formulario o realiza cualquier acción que requiera BAW   | El sistema recibe de BAW una respuesta de sesión inválida (`403` con `CWTBG0651E`, o `401`)                          |
| 5   | Sistema     | Resuelve la condición de sesión expirada                                    | El sistema descarta las credenciales locales y redirige a la pantalla de login, informando que la sesión expiró      |
| 6   | Usuario     | Vuelve a iniciar sesión con credenciales válidas y regresa al formulario    | El formulario aparece vacío o con los datos previamente persistidos; el texto de prueba no guardado no está presente |

## Resultado esperado final

El usuario es llevado a la pantalla de login con un aviso de sesión expirada; el almacenamiento efímero queda sin `csrf_token` ni `username`. Tras reautenticarse, los cambios no guardados del formulario se han perdido: el texto de prueba no aparece ni en la interfaz ni en BAW. La pérdida de esos cambios es el comportamiento esperado, no un defecto.

## Observaciones

La sesión de BAW caduca como muy tarde a las 2 horas, así que este escenario es esperable en una jornada normal de trabajo y no un caso de borde. No se exige al portal preservar ni restaurar el borrador; si en el futuro se decidiera avisar antes de perder los cambios, sería un criterio nuevo y este caso habría que revisarlo.
