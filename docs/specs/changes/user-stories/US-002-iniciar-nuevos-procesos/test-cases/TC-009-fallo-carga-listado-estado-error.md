# TC-009 — Dado que la carga del listado falla, Cuando el usuario abre «Iniciar», Entonces ve un estado de error explícito distinto del estado vacío

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-004 (Interacción de usuario) — Estados vacío y de error
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=E2E · criterion=AC-004 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Usuario autenticado en el portal.
- `GET /rest/bpm/wle/v1/exposed/process` está interceptado: se simula `500` y, en una segunda ejecución, un fallo de red (petición abortada).

## Datos de prueba

| Campo                | Valor                                   | Notas                |
| -------------------- | --------------------------------------- | -------------------- |
| Usuario / Contraseña | `TEST_USER_NAME` / `TEST_USER_PASSWORD` | Variables de entorno |
| Fallos simulados     | respuesta `500`; petición abortada      |                      |

## Pasos de ejecución

| #   | Actor   | Acción                                         | Resultado esperado del paso                                                  |
| --- | ------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Usuario | Abre «Iniciar» con el `GET` respondiendo `500` | Se muestra un estado de error explícito; la vista no queda en blanco         |
| 2   | Usuario | Repite con la petición abortada                | Se muestra el mismo estado de error                                          |
| 3   | Usuario | Compara con el estado de TC-008                | El mensaje y la presentación del error son distintos de los del estado vacío |

## Resultado esperado final

Un fallo de carga produce un estado de error explícito, distinguible del estado vacío, en vez de una vista en blanco o indefinida.

## Observaciones

- **Supuesto:** que la respuesta `401` por sesión expirada la gestiona US-001 (redirección al login) y no este criterio.
