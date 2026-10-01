# TC-004 — Dado el listado de procesos en pantalla, Cuando el usuario selecciona un proceso, Entonces el portal envía el POST de inicio con el bpdId y el processAppId de ese proceso

**Perspectiva:** Happy Path
**Tipo de prueba:** E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Casos de uso) — Inicio de instancia desde el listado
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=E2E · criterion=AC-002 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Ambiente de referencia: BAW de desarrollo `https://192.168.120.100:9443`.
- Usuario autenticado en el portal; el listado de «Iniciar» se carga con datos reales.
- El `POST /rest/bpm/wle/v1/process?action=start` está **interceptado** (mock) para no crear instancias reales; el mock responde `200` con una instancia simulada.

## Datos de prueba

| Campo      | Valor                                    | Notas                                              |
| ---------- | ---------------------------------------- | -------------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`     | Cuenta existente                                   |
| Contraseña | variable de entorno `TEST_USER_PASSWORD` | No se registra                                     |
| Proceso    | primera tarjeta del listado              | Su `startURL` real aporta `bpdId` y `processAppId` |

## Pasos de ejecución

| #   | Actor   | Acción                                               | Resultado esperado del paso                                                                    |
| --- | ------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | Usuario | Abre «Iniciar» y espera el listado                   | Se muestran las tarjetas de procesos                                                           |
| 2   | Usuario | Activa la acción de iniciar en la primera tarjeta    | El portal envía un único `POST /rest/bpm/wle/v1/process?action=start`                          |
| 3   | Sistema | Inspecciona la petición interceptada                 | Los parámetros `bpdId` y `processAppId` coinciden con los del `startURL` de la tarjeta elegida |
| 4   | Usuario | Observa la pantalla tras la respuesta simulada `200` | El portal confirma el inicio de la instancia sin mostrar error                                 |

## Resultado esperado final

Se realiza exactamente una petición de inicio con los identificadores del proceso seleccionado y la UI refleja el arranque correcto.

## Observaciones

- **Supuesto:** la forma de confirmar el inicio en la UI (mensaje, navegación) no está especificada en la US ni en el wireframe; se valida solo la ausencia de error y una señal de éxito visible.
- La llamada real se cubre en TC-003.
