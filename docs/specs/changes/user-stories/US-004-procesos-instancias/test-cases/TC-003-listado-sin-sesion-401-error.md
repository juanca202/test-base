# TC-003 — - No existe sesión activa, o la cookie de sesión expiró.

**Perspectiva:** Error
**Tipo de prueba:** API Test, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado con filtro Activo/Completado
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-001 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo           | Valor                                                    | Notas    |
| --------------- | -------------------------------------------------------- | -------- |
| Petición        | `GET /bpm/processes?states=running` sin cookie de sesión | Caso API |
| Ruta del portal | `/procesos`                                              | Caso E2E |

## Datos de prueba

| 1 | Verificador | Invoca `GET /bpm/processes?states=running` sin sesión | BAW responde `401` con `WWW-Authenticate: Basic realm="BPMRESTAPI"` |
| 2 | Usuario | Intenta abrir «Procesos» sin sesión | El portal no muestra el listado |
| 3 | Sistema | Detecta la falta de sesión | El usuario es redirigido a la pantalla de login |

## Pasos de ejecución

| #                                                                                 | Actor | Acción | Resultado esperado del paso |
| --------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| No se expone ninguna instancia sin autenticación; el usuario termina en el login. |

## Resultado esperado final

Consistente con US-001 (acceso sin sesión) y con US-002 TC-002. Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
