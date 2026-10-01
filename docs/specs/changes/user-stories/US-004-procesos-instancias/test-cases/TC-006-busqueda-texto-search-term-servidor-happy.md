# TC-006 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- Existen instancias cuyo nombre de modelo o de instancia contiene el texto a buscar.

**Perspectiva:** Happy Path
**Tipo de prueba:** API Test, E2E
**Prioridad:** Alta
**Criterio de aceptación:** AC-002 (Interacción de usuario) — Búsqueda y filtros de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-002 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo             | Valor                                                  | Notas                                                               |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Usuario           | variable de entorno `TEST_USER_NAME`                   | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña        | variable de entorno `TEST_USER_PASSWORD`               | Nunca se escribe en el TC ni en los reportes                        |
| Texto de búsqueda | fragmento de un nombre de modelo existente [propuesto] | BAW aplica comodines implícitos a ambos lados                       |

## Datos de prueba

| 1 | Usuario | Escribe el texto en el campo de búsqueda | El sistema invoca `GET /bpm/processes` con `search_term=<texto>` |
| 2 | Sistema | Recibe `200` | Se muestran solo instancias cuyo modelo o nombre coincide |
| 3 | Usuario | Borra el texto | Se invoca de nuevo sin `search_term` y reaparece el listado completo |

## Pasos de ejecución

| #                                                                                    | Actor | Acción | Resultado esperado del paso |
| ------------------------------------------------------------------------------------ | ----- | ------ | --------------------------- |
| La búsqueda se resuelve en servidor mediante `search_term`, no filtrando en cliente. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
