# TC-005 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- La petición `GET /bpm/processes` responde `5xx` o falla por red (simulado interceptando la petición) [propuesto].

**Perspectiva:** Error
**Tipo de prueba:** E2E
**Prioridad:** Media
**Criterio de aceptación:** AC-001 (Interacción de usuario) — Listado con filtro Activo/Completado
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=E2E · criterion=AC-001 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo      | Valor                                    | Notas                                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |

## Datos de prueba

| 1 | Usuario | Abre «Procesos» | Se invoca `GET /bpm/processes?states=running` |
| 2 | Sistema | Recibe `5xx` o error de red | Se muestra un mensaje de error de carga, sin listado parcial |
| 3 | Usuario | Acciona el reintento | Se repite la petición; con respuesta `200` se pinta el listado |

## Pasos de ejecución

| #                                                                                | Actor | Acción | Resultado esperado del paso |
| -------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| El usuario recibe un error controlado y puede reintentar sin recargar el portal. |

## Resultado esperado final

Escenario derivado de la perspectiva de error; la US no lo detalla. Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
