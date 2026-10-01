# TC-007 — Dado un error de red en el POST de inicio, Cuando el usuario decide reintentar manualmente, Entonces se envía una segunda petición solo por su acción

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
- El `POST` de inicio está interceptado: la primera llamada se aborta (fallo de red); la segunda responde `200` simulado.

## Datos de prueba

| Campo                | Valor                                   | Notas                |
| -------------------- | --------------------------------------- | -------------------- |
| Usuario / Contraseña | `TEST_USER_NAME` / `TEST_USER_PASSWORD` | Variables de entorno |
| Proceso              | primera tarjeta del listado             |                      |

## Pasos de ejecución

| #   | Actor   | Acción                                             | Resultado esperado del paso                                |
| --- | ------- | -------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Usuario | Activa el inicio del primer proceso                | El portal envía el `POST`, que falla por error de red      |
| 2   | Usuario | Observa la pantalla                                | Se muestra un mensaje de error explícito                   |
| 3   | Sistema | Espera unos segundos y cuenta los `POST` de inicio | Solo hay **una** petición; no hubo reintento automático    |
| 4   | Usuario | Activa manualmente la acción de reintentar         | El portal envía un segundo `POST` de inicio                |
| 5   | Usuario | Observa el resultado                               | El inicio se confirma sin error (respuesta simulada `200`) |

## Resultado esperado final

Solo se envía un nuevo `POST` cuando el usuario reintenta; en total, dos peticiones en la ejecución.

## Observaciones

- **Supuesto:** el reintento manual se ofrece como acción visible en el mensaje de error o junto a la tarjeta; la US no fija su ubicación.
