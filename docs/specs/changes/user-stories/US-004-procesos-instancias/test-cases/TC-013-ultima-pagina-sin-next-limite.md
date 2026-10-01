# TC-013 — - El usuario está autenticado en el portal contra el ambiente de referencia de BAW (`https://192.168.120.100:9443`, también accesible como `btq-srv-bawodm`).

- El usuario es administrador en BAW (`tw_admins`), según la decisión de producto registrada en US-004.
- El total de instancias no es múltiplo del tamaño de página o la última página está incompleta [propuesto].

**Perspectiva:** Límite
**Tipo de prueba:** API Test, E2E
**Prioridad:** Baja
**Criterio de aceptación:** AC-003 (Eficiencia de rendimiento) — Carga en ≤ 3 s con paginación de servidor
**Artefacto padre:** US-004
**Estado:** Ready

<!-- tc:status=Ready · testType=API Test, E2E · criterion=AC-003 · parent=US-004 -->

**Creado por:** juanca202
**Fecha:** 2026-09-29

## Precondiciones

| Campo      | Valor                                    | Notas                                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Usuario    | variable de entorno `TEST_USER_NAME`     | Cuenta existente del ambiente de referencia, miembro de `tw_admins` |
| Contraseña | variable de entorno `TEST_USER_PASSWORD` | Nunca se escribe en el TC ni en los reportes                        |
| `size`     | `25` [propuesto]                         | Tamaño de página                                                    |

## Datos de prueba

| 1 | Usuario | Avanza hasta la última página | La respuesta `200` no incluye `next` |
| 2 | Sistema | Pinta la última página | Se muestran las instancias restantes (igual o menos que `size`) |
| 3 | Verificador | Revisa el control de paginación | La acción de avanzar está deshabilitada u oculta |

## Pasos de ejecución

| #                                                                                                  | Actor | Acción | Resultado esperado del paso |
| -------------------------------------------------------------------------------------------------- | ----- | ------ | --------------------------- |
| En la última página no se pueden pedir más datos y no se produce ninguna petición vacía adicional. |

## Resultado esperado final

Entorno y datos reutilizados de US-001 y US-002 (ambiente de referencia de BAW; credenciales por variables de entorno).

## Observaciones
