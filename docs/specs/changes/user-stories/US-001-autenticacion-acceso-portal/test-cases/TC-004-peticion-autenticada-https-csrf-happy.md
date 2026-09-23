# TC-004 — Dado un usuario autenticado en el portal, Cuando el sistema emite cualquier petición posterior al login hacia BAW, Entonces la petición viaja sobre HTTPS e incluye la cabecera `BPMCSRFToken`

**Perspectiva:** Happy Path
**Tipo de prueba:** Unit, Integration
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Seguridad) — Comunicación con BAW sobre HTTPS/TLS con token anti-CSRF
**Artefacto padre:** US-001
**Estado:** Ready

<!-- tc:status=Ready · testType=Unit, Integration · criterion=AC-002 · parent=US-001 -->

**Creado por:** juanca202
**Fecha:** 2026-09-11

## Precondiciones

- El usuario completó el login correctamente (ver [TC-001](./TC-001-login-credenciales-validas-happy.md)) y el portal conserva `csrf_token` y `username` en almacenamiento efímero.
- El portal está configurado contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`), cuya URL base usa esquema `https`.
- El interceptor de autenticación del portal está activo.

## Datos de prueba

| Campo               | Valor                             | Notas                                                                       |
| ------------------- | --------------------------------- | --------------------------------------------------------------------------- |
| `csrf_token`        | `tok-csrf-valido` [propuesto]     | Valor opaco devuelto por `POST /bpm/system/login`; no se parsea             |
| Operación de prueba | `GET /bpm/user-tasks` [propuesto] | Cualquier operación posterior al login sirve; esta es la más representativa |
| URL base de BAW     | `https://192.168.120.100:9443`    | Debe usar esquema `https`                                                   |

## Pasos de ejecución

| #   | Actor       | Acción                                                                                | Resultado esperado del paso                                                                                                   |
| --- | ----------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sistema     | Construye una petición hacia una operación de BAW posterior al login                  | La petición se dirige a la URL base configurada de BAW                                                                        |
| 2   | Sistema     | El interceptor de autenticación procesa la petición saliente                          | El interceptor añade la cabecera `BPMCSRFToken` con el `csrf_token` guardado                                                  |
| 3   | Sistema     | El interceptor marca la petición para enviar credenciales                             | La petición viaja con `withCredentials: true`, de modo que el navegador adjunta la cookie de sesión de BAW                    |
| 4   | Verificador | Inspecciona la petición emitida (doble de red en unidad, tráfico real en integración) | La URL comienza por `https://`, la cabecera `BPMCSRFToken` está presente y su valor coincide con el `csrf_token` de la sesión |
| 5   | Sistema     | Recibe la respuesta de BAW                                                            | BAW responde `200` y no devuelve `403` con `error_number: CWTBG0651E`                                                         |

## Resultado esperado final

Toda petición emitida tras el login sale por `https://`, lleva la cabecera `BPMCSRFToken` con el token vigente y viaja con las credenciales de sesión; BAW la acepta y responde `200`. Ninguna petición autenticada se emite sobre `http://` ni sin la cabecera anti-CSRF.

## Observaciones

`POST /bpm/system/login` es la única operación exenta de `BPMCSRFToken` y queda fuera del alcance de este caso. En desarrollo las llamadas pasan por el proxy propio del frontend; la verificación de esquema `https` aplica sobre la URL configurada de BAW, no sobre la del proxy local. El caso negativo lo cubre [TC-005](./TC-005-peticion-sin-csrf-token-rechazada-error.md).
