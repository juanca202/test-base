# TC-001 — Dado un usuario autenticado con procesos expuestos para iniciar, Cuando abre la pantalla «Iniciar», Entonces ve el listado de procesos obtenido de GET /rest/bpm/wle/v1/exposed/process

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado de procesos iniciables
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-001 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Ambiente de referencia: BAW de desarrollo `https://192.168.120.100:9443` (también accesible como `btq-srv-bawodm`).
- El usuario de prueba tiene sesión válida (cookies `JSESSIONID` y `LtpaToken2`) y al menos un proceso con autorización «Expose to start».

## Datos de prueba

| Campo      | Valor                                    | Notas                                        |
| ---------- | ---------------------------------------- | -------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia  |
| Contraseña | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes |

## Pasos de ejecución

| #   | Actor   | Acción                                                                       | Resultado esperado del paso                                                                                                                           |
| --- | ------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Usuario | Inicia sesión con `TEST_USER_NAME` / `TEST_USER_PASSWORD`                    | Accede al portal                                                                                                                                      |
| 2   | Sistema | (API) Envía `GET /rest/bpm/wle/v1/exposed/process` con las cookies de sesión | Responde `200` con `data.exposedItemsList` como arreglo con al menos un elemento; cada elemento trae `display`, `itemID`, `processAppID` y `startURL` |
| 3   | Usuario | (E2E) Navega a la pantalla «Iniciar»                                         | La pantalla lanza el `GET` anterior y muestra una tarjeta por cada elemento de `exposedItemsList`                                                     |
| 4   | Usuario | Compara el nombre de la primera tarjeta con el `display` del primer elemento | Coinciden; no se muestra estado vacío ni de error                                                                                                     |

## Resultado esperado final

La pantalla «Iniciar» muestra las tarjetas de los procesos que el usuario puede iniciar, con el mismo contenido que devuelve la API (`200`, `exposedItemsList` no vacío).

## Observaciones

- Sin dependencias con otros TC salvo una sesión válida (ver US-001).
- El «primer proceso de la lista» (`exposedItemsList[0]`) es el proceso de referencia para los demás TC de esta historia.
