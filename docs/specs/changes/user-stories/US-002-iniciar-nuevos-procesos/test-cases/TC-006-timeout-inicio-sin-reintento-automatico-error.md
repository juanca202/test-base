# TC-006 — Dado que el POST de inicio excede el timeout de 5 s, Cuando el usuario intenta iniciar un proceso, Entonces el portal informa el error, no reintenta automáticamente y permite reintentar de forma manual

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-003 (Fiabilidad) — Sin reintento automático del inicio
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=E2E · criterion=AC-003 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Ambiente de referencia: BAW de desarrollo `https://192.168.120.100:9443`.
- Usuario autenticado; listado de «Iniciar» cargado.
- El `POST /rest/bpm/wle/v1/process?action=start` está interceptado y **no responde** dentro de 5 segundos (demora superior al timeout).

## Datos de prueba

| Campo                | Valor                                   | Notas                   |
| -------------------- | --------------------------------------- | ----------------------- |
| Usuario / Contraseña | `TEST_USER_NAME` / `TEST_USER_PASSWORD` | Variables de entorno    |
| Timeout              | 5 s                                     | Definido por el usuario |
| Proceso              | primera tarjeta del listado             |                         |

## Pasos de ejecución

| #   | Actor   | Acción                                                                             | Resultado esperado del paso                                          |
| --- | ------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Usuario | Activa el inicio del primer proceso                                                | El portal envía un `POST` de inicio                                  |
| 2   | Sistema | Espera a que se cumplan 5 s sin respuesta                                          | La petición se da por fallida por timeout                            |
| 3   | Usuario | Observa la pantalla                                                                | Se muestra un mensaje de error explícito sobre el inicio del proceso |
| 4   | Sistema | Espera un periodo adicional (p. ej. 10 s) y cuenta las peticiones `POST` de inicio | Solo se envió **una** petición; no hay reintento automático          |
| 5   | Usuario | Revisa los controles disponibles                                                   | Hay una acción para reintentar manualmente y no se perdió el listado |

## Resultado esperado final

Tras el timeout el usuario ve el error, el contador de `POST` de inicio permanece en 1 y puede decidir reintentar.

## Observaciones

- **Supuesto:** el mensaje y la etiqueta del control de reintento no están definidos en la US; se valida su presencia, no el texto literal.
- Complementa TC-007 (error de red).
