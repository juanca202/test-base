# TC-005 — Dado un bpdId inexistente, Cuando se envía POST /rest/bpm/wle/v1/process?action=start, Entonces la API responde con un error controlado y no crea instancia

**Perspectiva:** Error
**Tipo de prueba:** API Test
**Prioridad:** Media
**Criterio de aceptación:** AC-002 (Casos de uso) — Inicio de instancia desde el listado
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=API Test · criterion=AC-002 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Ambiente de referencia: BAW de desarrollo `https://192.168.120.100:9443`.
- Sesión válida del usuario de prueba (con token CSRF si se exige).

## Datos de prueba

| Campo        | Valor                                                 | Notas                                          |
| ------------ | ----------------------------------------------------- | ---------------------------------------------- |
| bpdId        | `25.00000000-0000-0000-0000-000000000000` [propuesto] | Identificador con formato válido que no existe |
| processAppId | `processAppID` del primer proceso del listado         | Válido, para aislar el error al `bpdId`        |

## Pasos de ejecución

| #   | Actor   | Acción                                                                        | Resultado esperado del paso                                              |
| --- | ------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Sistema | Envía `POST /rest/bpm/wle/v1/process?action=start` con el `bpdId` inexistente | Responde con código de error `4xx` y cuerpo de error del estilo `CWTBG…` |
| 2   | Sistema | Consulta las instancias del usuario                                           | No aparece ninguna instancia nueva                                       |

## Resultado esperado final

BAW rechaza el inicio con un error controlado y no crea ninguna instancia.

## Observaciones

- **Supuesto:** el código exacto (`400` o `404`) no está confirmado en RS-002; el TC exige `4xx` con cuerpo de error, no un valor concreto.
