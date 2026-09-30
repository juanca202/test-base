# TC-005 — Dado un usuario con cookie de sesión válida de BAW, Cuando se emite una petición sin la cabecera `BPMCSRFToken`, Entonces BAW la rechaza con `403` y `error_number: CWTBG0651E`

**Perspectiva:** Error
**Tipo de prueba:** API Test
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Seguridad) — Comunicación con BAW sobre HTTPS/TLS con token anti-CSRF
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test · criterion=AC-002 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El login contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`) se completó con éxito y la cookie de sesión está vigente.
- La petición se emite directamente contra la API de BAW, sin pasar por el interceptor del portal, para poder omitir la cabecera anti-CSRF.

## Datos de prueba

| Campo                   | Valor                             | Notas                                              |
| ----------------------- | --------------------------------- | -------------------------------------------------- |
| Operación de prueba     | `GET /bpm/user-tasks` [propuesto] | Operación posterior al login, exige `BPMCSRFToken` |
| Cabecera `BPMCSRFToken` | Ausente                           | Escenario bajo prueba                              |
| Cookie de sesión        | Vigente                           | Emitida por `POST /bpm/system/login`               |

## Pasos de ejecución

| #   | Actor       | Acción                                                                                                        | Resultado esperado del paso                                                      |
| --- | ----------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Sistema     | Inicia sesión contra BAW y conserva la cookie de sesión                                                       | La cookie de sesión queda disponible para peticiones posteriores                 |
| 2   | Verificador | Emite `GET /bpm/user-tasks` con la cookie de sesión pero omitiendo deliberadamente la cabecera `BPMCSRFToken` | La petición llega a BAW sin el token anti-CSRF                                   |
| 3   | Sistema     | Recibe la respuesta de BAW                                                                                    | BAW responde `403` con un cuerpo `exception` cuyo `error_number` es `CWTBG0651E` |

## Resultado esperado final

BAW responde `403` con `error_number: CWTBG0651E` y el mensaje de bloqueo por cabecera `BPMCSRFToken` no verificable, sin datos de tareas. Queda demostrado que la cabecera anti-CSRF es obligatoria y que la cookie de sesión por sí sola no basta para operar.

## Observaciones

Confirmado en vivo contra el ambiente de referencia: el token ausente o caducado se manifiesta como `403`, no como `401`. La clasificación de esta respuesta como sesión inválida por parte del portal y la redirección al login se verifican en [TC-008](./TC-008-acceso-directo-url-sesion-invalida-error.md).
