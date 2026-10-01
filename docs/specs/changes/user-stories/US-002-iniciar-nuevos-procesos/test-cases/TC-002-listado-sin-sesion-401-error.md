# TC-002 — Dado que no hay sesión válida, Cuando se consulta el listado de procesos iniciables, Entonces la API responde 401 y no se exponen procesos

**Perspectiva:** Error
**Tipo de prueba:** API Test
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado de procesos iniciables
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=API Test · criterion=AC-001 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Ambiente de referencia: BAW de desarrollo `https://192.168.120.100:9443`.
- La petición se envía sin cookies de sesión.

## Datos de prueba

N/A

## Pasos de ejecución

| #   | Actor   | Acción                                                             | Resultado esperado del paso                                              |
| --- | ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 1   | Sistema | Envía `GET /rest/bpm/wle/v1/exposed/process` sin cookies de sesión | Responde `401` con cabecera `WWW-Authenticate: Basic realm="BPMRESTAPI"` |
| 2   | Sistema | Revisa el cuerpo de la respuesta                                   | No contiene `exposedItemsList` ni datos de procesos                      |

## Resultado esperado final

El catálogo no se entrega sin sesión: código `401` y ningún proceso expuesto.

## Observaciones

- Contrato documentado en API-03 (`API-016-procesos.md`).
