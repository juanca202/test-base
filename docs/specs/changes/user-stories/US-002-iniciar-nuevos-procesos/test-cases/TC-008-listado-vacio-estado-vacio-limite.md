# TC-008 — Dado que el listado de procesos iniciables viene vacío, Cuando el usuario abre «Iniciar», Entonces ve un estado vacío explícito

**Perspectiva:** Límite
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-004 (Interacción de usuario) — Estados vacío y de error
**Artefacto padre:** US-002

<!-- tc:status=Ready · testType=E2E · criterion=AC-004 · parent=US-002 -->

**Estado:** Ready
**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

- Usuario autenticado en el portal.
- `GET /rest/bpm/wle/v1/exposed/process` está interceptado y responde `200` con `data.exposedItemsList: null` (caso documentado en API-03); se repite con `[]`.

## Datos de prueba

| Campo                | Valor                                                              | Notas                            |
| -------------------- | ------------------------------------------------------------------ | -------------------------------- |
| Usuario / Contraseña | `TEST_USER_NAME` / `TEST_USER_PASSWORD`                            | Variables de entorno             |
| Respuesta simulada   | `{ "status": "200", "data": { "exposedItemsList": null } }` y `[]` | Ambos representan «sin procesos» |

## Pasos de ejecución

| #   | Actor   | Acción                                                                  | Resultado esperado del paso                                       |
| --- | ------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | Usuario | Abre «Iniciar» con `exposedItemsList: null`                             | Se muestra un estado vacío con mensaje explícito; no hay tarjetas |
| 2   | Usuario | Repite con `exposedItemsList: []`                                       | Se muestra el mismo estado vacío                                  |
| 3   | Usuario | Verifica que la vista no está en blanco y no muestra el estado de error | No aparece el mensaje ni el estilo del estado de error            |

## Resultado esperado final

Ante una lista vacía (`null` o `[]`) se muestra un estado vacío explícito, distinto del de error.

## Observaciones

- **Supuesto:** el texto exacto del estado vacío se define en el wireframe de «Iniciar»; se valida presencia y diferenciación, no el literal.
- Se distingue de TC-009 para verificar que ambos estados no son intercambiables.
