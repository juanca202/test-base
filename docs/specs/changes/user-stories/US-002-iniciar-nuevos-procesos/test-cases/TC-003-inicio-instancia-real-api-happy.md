# TC-003 — Dado un proceso iniciable del listado, Cuando se envía POST /rest/bpm/wle/v1/process?action=start con su bpdId y processAppId, Entonces se crea una nueva instancia

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Casos de uso) — Inicio de instancia desde el listado
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=API Test · criterion=AC-002 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Ambiente de referencia: BAW de desarrollo `https://192.168.120.100:9443`.
- Sesión válida del usuario de prueba, con el token CSRF requerido para escrituras (`x-xsrf-token`) si el ambiente lo exige (ver US-001, AC-002).
- Esta es la **única** llamada de escritura real de la historia: crea una instancia en el ambiente de desarrollo.

## Datos de prueba

| Campo          | Valor                                                            | Notas                                       |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| Usuario        | variable de entorno `TEST_USER_NAME`                             | Cuenta existente                            |
| Contraseña     | variable de entorno `TEST_USER_PASSWORD`                         | No se registra                              |
| Proceso        | primer elemento de `exposedItemsList` (`itemID`, `processAppID`) | Se obtiene en la misma ejecución con AC-001 |
| Ruta de inicio | campo `startURL` del elemento elegido                            | Contiene `bpdId` y `processAppId`           |

## Pasos de ejecución

| #   | Actor   | Acción                                                                                       | Resultado esperado del paso                                                      |
| --- | ------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Sistema | Consulta `GET /rest/bpm/wle/v1/exposed/process` y toma el primer elemento                    | `200`; se obtienen `startURL`, `itemID` (bpdId) y `processAppID`                 |
| 2   | Sistema | Envía `POST /rest/bpm/wle/v1/process?action=start&bpdId={bpdId}&processAppId={processAppId}` | Responde `200` con los datos de la instancia creada (identificador de instancia) |
| 3   | Sistema | Verifica que la URL usada coincide con el `startURL` del elemento                            | `bpdId` y `processAppId` de la petición son los del elemento elegido             |

## Resultado esperado final

BAW crea una nueva instancia del proceso elegido y devuelve su identificador con código `200`.

## Observaciones

- **Supuesto:** la forma exacta del cuerpo de respuesta no se detalla en la US; se valida código `200` e identificador de instancia según API-14 (`API-016-procesos.md`).
- La instancia creada queda en el ambiente de desarrollo; el proceso de prueba debe tolerarlo.
